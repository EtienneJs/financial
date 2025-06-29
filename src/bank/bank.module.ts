import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankAccountService } from './bank-account.service';
import { Transaction } from './entities/transaction.entity';


@Module({
  controllers: [BankController],
  providers: [BankService, BankAccountService],
  imports:[
        TypeOrmModule.forFeature([
      Bank,
      BankAccount,
      Transaction
    ])
  ]
})
export class BankModule {}
