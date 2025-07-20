import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { In, Not, Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';

@Injectable()
export class BankService {
  private readonly logger = new Logger(BankService.name);

  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) { }
  async create(createBankDto: CreateBankDto) {
    // Inicia transacción
    return this.bankRepository.manager.transaction(async (transactionalEntityManager) => {
        // 1. Crea y guarda primero el banco principal
        const bank = transactionalEntityManager.create(Bank, {
          name: createBankDto.name,
          image: createBankDto.image
        });
        await transactionalEntityManager.save(Bank, bank);

        // 2. Si hay cuentas bancarias, procesarlas
        const accounts = createBankDto.account.map(accountDto => {
          return transactionalEntityManager.create(BankAccount, {
            ...accountDto,
            bank: { id: bank.id } // Asigna la relación con el banco
          });
        });          
        // 4. Guardar las cuentas
        bank.account = await transactionalEntityManager.save(BankAccount, accounts);

        return bank;
    });
  }

  findAll() {
    return `This action returns all bank`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bank`;
  }

  async update(id: string, updateBankDto: UpdateBankDto) {
    try {
      const bankExist = await this.bankRepository.findOneBy({ id });
      if (!bankExist) {
        throw new BadRequestException(`Bank with id ${id} not found`);
      }
      const nameExist = await this.bankRepository.findOne({
        where: { name:updateBankDto.name, id: Not(id) } // Exclude the current bank by id,
      });
      if (nameExist) {
        throw new ConflictException(`Bank with name ${nameExist.name} already exists`); 
      }
      return this.bankRepository.update(id, updateBankDto);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    try {
      const bank = await this.bankRepository.findOneBy({ id });
      if (!bank) {
        throw new BadRequestException(`Bank with id ${id} not found`);
      }
      await this.bankRepository.delete(id);
      return `This action removes a #${id} bank`;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.handleDBErrors(error);
    }
  }


  private handleDBErrors(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error('Bank already exists', error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
