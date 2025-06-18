import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Bank } from "./entities/bank.entity";
import { BankAccount } from "./entities/bank-account.entity";
import { Not, Repository } from "typeorm";
import { CreateBankAccountDto } from "./dto/create-bank-account.dto";
import { UpdateBankAccountDto } from "./dto/update-bank-account.dto";

@Injectable()
export class BankAccountService {
      constructor(
        @InjectRepository(BankAccount)
        private readonly bankAccountRepository: Repository<BankAccount>,
        @InjectRepository(Bank)
        private readonly bankRepository: Repository<Bank>,
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
}