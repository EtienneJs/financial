import { Module } from '@nestjs/common';
import { BuyHistoryService } from './buy-history.service';
import { BuyHistoryController } from './buy-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyHistory } from './entities/buy-history.entity';
import { BankModule } from 'src/bank/bank.module';
import { Category } from './entities/category';

@Module({
  controllers: [BuyHistoryController],
  providers: [BuyHistoryService],
  imports:[
    TypeOrmModule.forFeature([
      BuyHistory,
      Category,
    ]),
    BankModule,
  ],
  exports: [BuyHistoryService, TypeOrmModule.forFeature([BuyHistory, Category])],
})
export class BuyHistoryModule {}
