// pipes/exists-bank.pipe.ts
import {
  Injectable,
  PipeTransform,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BankAccount } from '../entities/bank-account.entity';

@Injectable()
export class ExistsBankAccountPipe implements PipeTransform {
  constructor(private readonly dataSource: DataSource) {}

  async transform(value: string) {
    const repo = this.dataSource.getRepository(BankAccount);
    const bank = await repo.findOne({ where: { id: value } });

    if (!bank) {
      throw new NotFoundException(`Banco Account con ID ${value} no existe`);
    }

    return value;
  }
}