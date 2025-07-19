import { Module } from '@nestjs/common';
import { BuyHistoryService } from './buy-history.service';
import { BuyHistoryController } from './buy-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyHistory } from './entities/buy-history.entity';
import { BankModule } from 'src/bank/bank.module';
import { ProductModule } from 'src/product/product.module';
import { BuyHistoryDetalle } from './entities/buy-history-detalle.entity';

@Module({
  controllers: [BuyHistoryController],
  providers: [BuyHistoryService],
  imports:[
    TypeOrmModule.forFeature([
      BuyHistory,
      BuyHistoryDetalle
    ]),
    ProductModule,
    BankModule,
  ],
  exports: [BuyHistoryService, TypeOrmModule.forFeature([BuyHistory])],
})
export class BuyHistoryModule {}
