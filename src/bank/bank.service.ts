import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';

import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankResponse } from './mappers/bankAllresponse';
import { IResponse } from './interfaces';
import { User } from '../auth/entities/user.entity';

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
  async create(createBankDto: CreateBankDto, user: User): Promise<IResponse | undefined> {
    return this.bankRepository.manager.transaction(async (transactionalEntityManager) => {
      const validationErrors: string[] = [];

      // 1. Validar que el nombre del banco sea único para este usuario
      const existingBank = await transactionalEntityManager.findOne(Bank, {
        where: { name: createBankDto.name, user: { id: user.id } }
      });

      if (existingBank) {
        validationErrors.push('name is already exist');
      }

      // 2. Validar que los números de cuenta sean únicos para este usuario
      if (createBankDto.account && createBankDto.account.length > 0) {
        const accountNumbers = createBankDto.account.map(acc => acc.nro_account);
        
        // Buscar cuentas existentes con esos números que pertenezcan al usuario
        const existingAccounts = await transactionalEntityManager
          .createQueryBuilder(BankAccount, 'account')
          .innerJoin('account.bank', 'bank')
          .innerJoin('bank.user', 'user')
          .where('account.nro_account IN (:...accountNumbers)', { accountNumbers })
          .andWhere('user.id = :userId', { userId: user.id })
          .getMany();

        if (existingAccounts.length > 0) {
          const duplicateNumbers = existingAccounts.map(acc => acc.nro_account);
          accountNumbers.forEach((nro, index) => {
            if (duplicateNumbers.includes(nro)) {
              validationErrors.push(`account.${index}.nro_account is already exist`);
            }
          });
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

      // 3. Create and save the main bank
      const bank = transactionalEntityManager.create(Bank, {
        name: createBankDto.name,
        image: createBankDto.image,
        user: user
      });
      await transactionalEntityManager.save(Bank, bank);

      if (createBankDto.account && createBankDto.account.length > 0 && typeof createBankDto.account === 'object') {
        const accounts = createBankDto.account.map(accountDto => {
          return transactionalEntityManager.create(BankAccount, {
            ...accountDto,
            bank: { id: bank.id } // Assign relationship with bank
          });
        });
        
        // 4. Save the accounts
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
  async findAll( name: string, user: User ) {
    const banks = await this.bankRepository.find({
      where: name
        ? { name: Like(`%${name}%`), user: { id: user.id } }
        : { user: { id: user.id } },
    });
    return this.bankResponse.allbanks(banks);
  }

  /**
   * Retrieves a bank by ID
   */
  async findOne(id: string, user: User): Promise<IResponse | undefined> {
    try {
      const bank = await this.bankRepository.findOne({
        where: { id, user: { id: user.id } },
      });
      if (!bank) {
        throw new NotFoundException(`Banco no encontrado`);
      }
      return {
        statusCode: 200,
        message: 'Banco encontrado exitosamente',
        data: bank
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al encontrar el banco');
    }
  }

  /**
   * Updates a bank by ID
   */
  async update(id: string, updateBankDto: UpdateBankDto, user: User): Promise<IResponse | undefined>   {
    try {
      const bank = await this.bankRepository.findOne({
        where: { id, user: { id: user.id } },
      });
      if (!bank) {
        throw new NotFoundException(`Banco no encontrado`);
      }

      // Validar que el nombre sea único para este usuario (si se está actualizando)
      if (updateBankDto.name && updateBankDto.name !== bank.name) {
        const existingBank = await this.bankRepository.findOne({
          where: { name: updateBankDto.name, user: { id: user.id }, id: Not(id) }
        });

        if (existingBank) {
          throw new BadRequestException({
            message: ['name is already exist'],
            error: 'Bad Request',
            statusCode: 400,
          });
        }
      }

      await this.bankRepository.update(id, updateBankDto);
      return {
        statusCode: 200,
        message: 'Banco actualizado exitosamente',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.handleDBErrors(error);
    }
  }

  /**
   * Removes a bank by ID
   */
  async remove(id: string, user: User): Promise<IResponse | undefined> {
    try {
      // Validate bank exists and belongs to user
      const bank = await this.bankRepository.findOne({
        where: { id, user: { id: user.id } },
      });
      if (!bank) {
        throw new NotFoundException(`Banco no encontrado`);
      }

      await this.bankRepository.delete(id);
      return {
        statusCode: 200,
        message: 'Banco eliminado exitosamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
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
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    
    this.logger.error('Unexpected database error', error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
