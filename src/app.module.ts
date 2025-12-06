import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BankModule } from './bank/bank.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyHistoryModule } from './buy-history/buy-history.module';
import { ProductModule } from './product/product.module';
import { ContadorModule } from './contador/contador.module';
import { TropyModule } from './tropy/tropy.module';
import { AuthModule } from './auth/auth.module';
import { UniqueTypeAccount, UniqueFields } from './bank/validadorCustom/validador-type-accounts';
import { IsUniqueConstraint } from './validatonsGlobals/validator-unique-nro-count';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
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
    AuthModule,
    BankModule,
    BuyHistoryModule,
    ProductModule,
    ContadorModule,
    TropyModule,
  ],
  controllers: [],
  providers: [
    IsUniqueConstraint,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
