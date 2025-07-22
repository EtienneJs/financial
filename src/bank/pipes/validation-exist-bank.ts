// pipes/exists-bank.pipe.ts
import {
  Injectable,
  PipeTransform,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Bank } from '../entities/bank.entity';

@Injectable()
export class ExistsBankPipe implements PipeTransform {
  constructor(private readonly dataSource: DataSource) {}

  async transform(value: string) {
    const repo = this.dataSource.getRepository(Bank);
    const bank = await repo.findOne({ where: { id: value } });

    if (!bank) {
      throw new NotFoundException(`Banco con ID ${value} no existe`);
    }

    return value;
  }
}