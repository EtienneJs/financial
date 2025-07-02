import { Module } from '@nestjs/common';
import { BankModule } from './bank/bank.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyHistoryModule } from './buy-history/buy-history.module';


@Module({
  imports: [
    BankModule
  , ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env', '.env.local'],
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    BuyHistoryModule,],
  controllers: [],
  providers: [],
})
export class AppModule {}
