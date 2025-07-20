import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTropyDto } from './dto/create-tropy.dto';
import { UpdateTropyDto } from './dto/update-tropy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contador } from 'src/contador/entities/contador.entity';
import { Repository } from 'typeorm';
import { Tropy } from './entities/tropy.entity';
import { ProductService } from 'src/product/product.service';
import { ContadorService } from 'src/contador/contador.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class TropyService {
    constructor(
      private readonly contadorService: ContadorService,
      @InjectRepository(Tropy)
      private readonly tropyRepository: Repository<Tropy>,
    ) { }
  async create(createTropyDto: CreateTropyDto) {
    try {
      const findCounter = await this.contadorService.findOne(createTropyDto.contador_id);
      if(!findCounter){
        throw new NotFoundException("Contador no encontrado con el id:" + createTropyDto.contador_id);
      }
      return this.tropyRepository.save({
        contador:findCounter,
        metodo_description:createTropyDto.metodo_description
      });
    } catch (error) {
      
    }
    return 'This action adds a new tropy';
  }

  findAll() {
    return `This action returns all tropy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tropy`;
  }

  update(id: number, updateTropyDto: UpdateTropyDto) {
    return `This action updates a #${id} tropy`;
  }

  remove(id: number) {
    return `This action removes a #${id} tropy`;
  }
}
