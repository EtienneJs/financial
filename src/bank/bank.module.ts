import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { BankAccount } from './entities/bank-account.entity';

@Module({
  controllers: [BankController],
  providers: [BankService],
  imports:[
        TypeOrmModule.forFeature([
      Bank,
      BankAccount
    ])
  ]
})
export class BankModule {}
