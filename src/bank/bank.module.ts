import { Module, ValidationPipe } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { BankAccount } from './entities/bank-account.entity';
import { BankAccountService } from './bank-account.service';
import { Transaction } from './entities/transaction.entity';
import { UniqueTypeAccountConstraint } from './validadorCustom/validador-type-accounts';
import { IsUniqueConstraint } from 'src/validatonsGlobals/validator-unique-nro-count';
import { IsExistConstraint } from 'src/validatonsGlobals/validator-exist';
import { ExistsBankPipe } from './pipes/validation-exist-bank';
import { ExistsBankAccountPipe } from './pipes/validation-exist-account';


@Module({
  controllers: [BankController],
  providers: [BankService, BankAccountService,UniqueTypeAccountConstraint,IsUniqueConstraint,IsExistConstraint,ExistsBankPipe, ExistsBankAccountPipe
  
  ],
  imports:[
        TypeOrmModule.forFeature([
      Bank,
      BankAccount,
      Transaction,
      
    ])
  ], 
  exports: [TypeOrmModule, BankService, BankAccountService]
})
export class BankModule {}
