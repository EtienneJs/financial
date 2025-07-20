import { Module } from '@nestjs/common';
import { TropyService } from './tropy.service';
import { TropyController } from './tropy.controller';
import { ContadorModule } from 'src/contador/contador.module';
import { Tropy } from './entities/tropy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [TropyController],
  providers: [TropyService],
  imports:[
    ContadorModule,
    TypeOrmModule.forFeature([
      Tropy
    ])
  ]
})
export class TropyModule {}
