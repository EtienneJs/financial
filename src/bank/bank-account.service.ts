import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bank } from "./entities/bank.entity";
import { BankAccount } from "./entities/bank-account.entity";
import { Not, Repository } from "typeorm";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto";
import { Transaction } from "./entities/transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

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
            const bank = await this.bankRepository.findOne({ where: { id: bankId }})
            if(!bank){
                throw new NotFoundException('Banco no encontrado');
            }
            // Verifica si el número de cuenta ya existe
            const existingAccount = await this.bankAccountRepository.findOne({ where: { nro_account: createBankAccountDto.nro_account } });
            if (existingAccount) {
                throw new ConflictException('El número de cuenta ya existe');
            }
            // Crea una nueva cuenta bancaria
            const newAccount = this.bankAccountRepository.create({
                ...createBankAccountDto,
                bank: bank // Asocia la cuenta con el banco
            });
            // Guarda la nueva cuenta en la base de datos
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
            const existingAccount = await transactionalEntityManager.findOne(BankAccount, { where: { id } });
            if (!existingAccount) {
                throw new NotFoundException('Cuenta bancaria no encontrada');
            }
            // Verifica si el número de cuenta ya existe en otra cuenta
            const existingAccountWithSameNumber = await transactionalEntityManager.findOne(BankAccount, {
                where: {
                    nro_account: updateBankAccountDto.nro_account,
                    id: Not(id) // Excluye la cuenta actual
                }
            });
            if (existingAccountWithSameNumber) {
                throw new ConflictException('El número de cuenta ya existe en otra cuenta');
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
        id: string,
        createTransactionDto: CreateTransactionDto
    ): Promise<Transaction | undefined> {
        try {
            return this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
            // Verifica si la cuenta bancaria existe
            const account = await transactionalEntityManager.findOne(BankAccount, { where: { id } });
            if (!account) {
                throw new NotFoundException('Cuenta bancaria no encontrada');
            }

            const accountDestiny = await transactionalEntityManager.findOne(BankAccount, 
                { where: { id: createTransactionDto.accountDestiny } 
            });
            if (!accountDestiny) {
                throw new NotFoundException('Cuenta de destino no encontrada');
            }

            // Crea una nueva transacción
            const newTransaction = transactionalEntityManager.create(Transaction, {
                ...createTransactionDto,
                date: new Date(), // Asigna la fecha actual
                accountOrigin: account, // Asocia la cuenta de origen
                accountDestiny: accountDestiny // Asocia la cuenta de destino
            });

            transactionalEntityManager.merge(BankAccount, account, {
                current_balance: account.current_balance - createTransactionDto.amount // Actualiza el saldo de la cuenta
            });
            transactionalEntityManager.merge(BankAccount, accountDestiny, {
                current_balance: accountDestiny.current_balance + createTransactionDto.amount // Actualiza el saldo de la cuenta
            });
            // Guarda la transacción y actualiza el saldo de la cuenta
            return await transactionalEntityManager.transaction(async (transactionalEntityManager) => {
                const savedTransaction = await transactionalEntityManager.save(Transaction, newTransaction);
                await transactionalEntityManager.save(BankAccount, account);
                await transactionalEntityManager.save(BankAccount, accountDestiny);
                savedTransaction.accountOrigin.current_balance = account.current_balance; 
                savedTransaction.accountDestiny.current_balance = accountDestiny.current_balance; /// Asocia la cuenta a la transacción guardada
                return savedTransaction;    
            })
        });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error; // Re-lanza el error de cuenta no encontrada o conflicto
            } else {
                throw new BadRequestException('Error al crear la transacción');
            }
        }

    }
}