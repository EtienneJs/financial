import { Module } from '@nestjs/common';
import { ContadorService } from './contador.service';
import { ContadorController } from './contador.controller';
import { Contador } from './entities/contador.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ContadorController],
  providers: [ContadorService],
  imports:[
        TypeOrmModule.forFeature([
          Contador
    ])
  ], 
})
export class ContadorModule {}
