import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bank } from "./entities/bank.entity";
import { BankAccount } from "./entities/bank-account.entity";
import { Not, Repository } from "typeorm";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto";
import { Transaction } from "./entities/transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { IResponse } from "./interfaces";

@Injectable()
export class BankAccountService {
    constructor(
        @InjectRepository(BankAccount)
        private readonly bankAccountRepository: Repository<BankAccount>,
        @InjectRepository(Bank)
        private readonly bankRepository: Repository<Bank>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) { }

    async createAccount(bankId: string, createBankAccountDto: CreateBankAccountDto, user?: any): Promise<IResponse | undefined> {
        try {
            const bank = await this.bankRepository.findOne({ 
                where: { id: bankId },
                relations: ['user']
            });
            if (!bank) {
                throw new NotFoundException('Banco no encontrado');
            }

            // Si tenemos usuario, validar que el banco pertenezca al usuario
            if (user && bank.user.id !== user.id) {
                throw new NotFoundException('Banco no encontrado');
            }

            // Validar que el número de cuenta sea único para este usuario
            if (user) {
                const existingAccount = await this.bankAccountRepository
                    .createQueryBuilder('account')
                    .innerJoin('account.bank', 'bank')
                    .innerJoin('bank.user', 'user')
                    .where('account.nro_account = :nroAccount', { nroAccount: createBankAccountDto.nro_account })
                    .andWhere('user.id = :userId', { userId: user.id })
                    .getOne();

                if (existingAccount) {
                    throw new BadRequestException({
                        message: ['nro_account is already exist'],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
                }
            } else {
                // Validación básica sin usuario (por si acaso)
                const existingAccount = await this.bankAccountRepository.findOne({
                    where: { nro_account: createBankAccountDto.nro_account }
                });

                if (existingAccount) {
                    throw new BadRequestException({
                        message: ['nro_account is already exist'],
                        error: 'Bad Request',
                        statusCode: 400,
                    });
                }
            }

            const newAccount = this.bankAccountRepository.create({
                ...createBankAccountDto,
                bank
            });
            await this.bankAccountRepository.save(newAccount);
            return {
                statusCode: 201,
                message: 'Cuenta creada exitosamente',
            };
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Error al crear la cuenta');
        }
    }
    async updateAccount(id: string, updateBankAccountDto: UpdateBankAccountDto, user?: any): Promise<BankAccount | undefined> {
        return this.bankAccountRepository.manager.transaction(async (transactionalEntityManager) => {
            // Verifica si la cuenta bancaria existe y carga las relaciones necesarias
            const existingAccount = await transactionalEntityManager.findOne(BankAccount, { 
                where: { id },
                relations: ['bank', 'bank.user']
            });

            if (!existingAccount) {
                throw new NotFoundException('Cuenta bancaria no encontrada');
            }

            // Si tenemos usuario, validar que la cuenta pertenezca al usuario
            if (user && existingAccount.bank.user.id !== user.id) {
                throw new NotFoundException('Cuenta bancaria no encontrada');
            }

            const validationErrors: string[] = [];

            // Validar que el número de cuenta sea único para este usuario (si se está actualizando)
            if (updateBankAccountDto.nro_account && updateBankAccountDto.nro_account !== existingAccount.nro_account) {
                let existingAccounts;
                
                if (user) {
                    // Filtrar por usuario
                    existingAccounts = await transactionalEntityManager
                        .createQueryBuilder(BankAccount, 'account')
                        .innerJoin('account.bank', 'bank')
                        .innerJoin('bank.user', 'user')
                        .where('account.nro_account = :nroAccount', { nroAccount: updateBankAccountDto.nro_account })
                        .andWhere('user.id = :userId', { userId: user.id })
                        .andWhere('account.id != :accountId', { accountId: id })
                        .getMany();
                } else {
                    // Validación básica sin usuario
                    existingAccounts = await transactionalEntityManager.find(BankAccount, { 
                        where: { id: Not(id), nro_account: updateBankAccountDto.nro_account } 
                    });
                }
                
                if (existingAccounts.length > 0) {
                    validationErrors.push('nro_account is already exist');
                }
            }

            // Validar tipo de cuenta único dentro del mismo banco (si se está actualizando)
            if (updateBankAccountDto.type_account && updateBankAccountDto.type_account !== existingAccount.type_account) {
                const findType = await transactionalEntityManager.find(BankAccount, { 
                    where: { 
                        id: Not(id), 
                        bank: existingAccount.bank, 
                        type_account: updateBankAccountDto.type_account 
                    } 
                });
                
                if (findType.length > 0) {
                    validationErrors.push(`type_account is already exist in this bank`);
                }
            }

            // Si hay errores de validación, lanzarlos
            if (validationErrors.length > 0) {
                throw new BadRequestException({
                    message: validationErrors,
                    error: 'Bad Request',
                    statusCode: 400,
                });
                }

            const updatedAccount = transactionalEntityManager.merge(BankAccount, existingAccount, updateBankAccountDto);
            return await transactionalEntityManager.save(BankAccount, updatedAccount);
        });
    }
    async removeAccount(id: string, user?: any): Promise<void> {
        // Verificar si la cuenta bancaria existe y carga las relaciones necesarias
        const account = await this.bankAccountRepository.findOne({ 
            where: { id },
            relations: ['bank', 'bank.user']
        });

        if (!account) {
            throw new NotFoundException('Cuenta bancaria no encontrada');
        }

        // Si tenemos usuario, validar que la cuenta pertenezca al usuario
        if (user && account.bank.user.id !== user.id) {
            throw new NotFoundException('Cuenta bancaria no encontrada');
        }

        await this.bankAccountRepository.remove(account);
    }

    async createTransaction(
        createTransactionDto: CreateTransactionDto
    ): Promise<Transaction | undefined> {
        try {
            return this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
                const accountOrigin = (await transactionalEntityManager.findOne(BankAccount, { where: { id: createTransactionDto.accountOrigin } }))!;
                const accountDestiny = (await transactionalEntityManager.findOne(BankAccount, { where: { id: createTransactionDto.accountDestiny } }))!;

                if (accountOrigin!.current_balance < createTransactionDto.amount) {
                    throw new BadRequestException('Saldo insuficiente en cuenta de origen');
                }

                // Crear transacción
                const newTransaction = transactionalEntityManager.create(Transaction, {
                    ...createTransactionDto,
                    date: new Date(),
                    accountOrigin,
                    accountDestiny
                });

                // Actualizar balances
                accountOrigin.current_balance -= createTransactionDto.amount;
                accountDestiny.current_balance += createTransactionDto.amount;

                // Guardar cambios
                const savedTransaction = await transactionalEntityManager.save(Transaction, newTransaction);
                await transactionalEntityManager.save(BankAccount, accountOrigin);
                await transactionalEntityManager.save(BankAccount, accountDestiny);

                // Adjuntar balances actualizados al resultado
                savedTransaction.accountOrigin.current_balance = accountOrigin.current_balance;
                savedTransaction.accountDestiny.current_balance = accountDestiny.current_balance;

                return savedTransaction;
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error; // Re-lanza el error de cuenta no encontrada o conflicto
            } else {
                throw new BadRequestException('Error al crear la transacción');
            }
        }

    }

    async findOne(id: string): Promise<BankAccount> {
        const findOneBankAcount = await this.bankAccountRepository.findOne({
            where: { id },
            relations: ['bank', 'bank.user']
        })

        if (!findOneBankAcount) {
            throw new NotFoundException("Bank Account not exist");
        }

        return findOneBankAcount;
    }
}