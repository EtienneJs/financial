import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';

import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankResponse } from './mappers/bankAllresponse';

@Injectable()
export class BankService {
  private readonly logger = new Logger(BankService.name);

  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
    private readonly bankResponse: BankResponse,
  ) {}

  // ========================================
  // CRUD Operations
  // ========================================

  /**
   * Creates a new bank with associated accounts
   */
  async create(createBankDto: CreateBankDto) {
    return this.bankRepository.manager.transaction(async (transactionalEntityManager) => {
      // 1. Create and save the main bank
      const bank = transactionalEntityManager.create(Bank, {
        name: createBankDto.name,
        image: createBankDto.image
      });
      await transactionalEntityManager.save(Bank, bank);

      if (createBankDto.account && createBankDto.account.length > 0 && typeof createBankDto.account === 'object') {
        const accounts = createBankDto.account.map(accountDto => {
          return transactionalEntityManager.create(BankAccount, {
            ...accountDto,
            bank: { id: bank.id } // Assign relationship with bank
          });
        });
        
        // 3. Save the accounts
        bank.account = await transactionalEntityManager.save(BankAccount, accounts);
      }
      
      return {
        statusCode: 201,
        message: 'Bank created successfully'
      };
    });
  }

  /**
   * Retrieves all banks
   */
  async findAll( name: string ) {
    const banks = await this.bankRepository.find({
      where: name
        ? { name: Like(`%${name}%`) }
        : {},
    });
    return this.bankResponse.allbanks(banks);
  }

  /**
   * Retrieves a bank by ID
   */
  findOne(id: string) {
    return `This action returns a #${id} bank`;
  }

  /**
   * Updates a bank by ID
   */
  async update(id: string, updateBankDto: UpdateBankDto) {
    try {
      return this.bankRepository.update(id, updateBankDto);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.handleDBErrors(error);
    }
  }

  /**
   * Removes a bank by ID
   */
  async remove(id: string) {
    try {
      // Validate bank exists
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

  // ========================================
  // Private Helper Methods
  // ========================================

  /**
   * Handles database-specific errors
   */
  private handleDBErrors(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    
    this.logger.error('Bank already exists', error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
