import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bank } from "./entities/bank.entity";
import { BankAccount } from "./entities/bank-account.entity";
import { Not, Repository } from "typeorm";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto";
import { Transaction } from "./entities/transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

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

    async createAccount(bankId: string, createBankAccountDto: CreateBankAccountDto): Promise<BankAccount | undefined> {
        // Verifica si el banco existe
        try {
            const bank = (await this.bankRepository.findOne({ where: { id: bankId } }))!
            const newAccount = this.bankAccountRepository.create({
                ...createBankAccountDto,
                bank: bank
            });
            return await this.bankAccountRepository.save(newAccount);
        } catch (error) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
        }
    }
    updateAccount(id: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccount | undefined> {
        return this.bankAccountRepository.manager.transaction(async (transactionalEntityManager) => {
            // Verifica si la cuenta bancaria existe
            const existingAccount = (await transactionalEntityManager.findOne(BankAccount, { where: { id } }))!;

            if(updateBankAccountDto.nro_account){
                const findType = await transactionalEntityManager.find(BankAccount, { where: { id: Not(id), nro_account: updateBankAccountDto.nro_account } });
                
                if (findType.length > 0) {
                    throw new ConflictException(`Ya existe un nro: ${updateBankAccountDto.type_account}`);
                }
            }
            if (updateBankAccountDto.type_account) {
                const findType = await transactionalEntityManager.find(BankAccount, { where: { id: Not(id), bank: existingAccount.bank, type_account: updateBankAccountDto.type_account } });
                if (findType.length > 0) {
                    throw new ConflictException(`Ya existe un nombre: ${updateBankAccountDto.type_account}`);
                }
            }
            const updatedAccount = transactionalEntityManager.merge(BankAccount, existingAccount, updateBankAccountDto);
            return await transactionalEntityManager.save(BankAccount, updatedAccount);
        });
    }
    async removeAccount(id: string): Promise<void> {
        const account = await this.bankAccountRepository.findOne({ where: { id } });
        if (!account) {
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
            where: { id }
        })

        if (!findOneBankAcount) {
            throw new NotFoundException("Bank Account not exist");
        }

        return findOneBankAcount;
    }
}