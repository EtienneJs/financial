import { Module } from '@nestjs/common';
import { BuyHistoryService } from './buy-history.service';
import { BuyHistoryController } from './buy-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyHistory } from './entities/buy-history.entity';
import { BankModule } from 'src/bank/bank.module';

@Module({
  controllers: [BuyHistoryController],
  providers: [BuyHistoryService],
  imports:[
    TypeOrmModule.forFeature([
      BuyHistory,
    ]),
    BankModule,
  ],
  exports: [BuyHistoryService, TypeOrmModule.forFeature([BuyHistory])],
})
export class BuyHistoryModule {}
