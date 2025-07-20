import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateContadorDto } from './dto/create-contador.dto';
import { UpdateContadorDto } from './dto/update-contador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contador } from './entities/contador.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ContadorService {
  constructor(
    @InjectRepository(Contador)
    private readonly counterRepository: Repository<Contador>,
  ) { }


  create(createContadorDto: CreateContadorDto) {
    try {
      return this.counterRepository.save(createContadorDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Algo paso")
    }
  }

  findAll() {
    return `This action returns all contador`;
  }

  findOne(id: string) {
    return this.counterRepository.findOne({
      where: { id }
    });
  }

  async update(id: string, updateContadorDto: UpdateContadorDto) {
    const findCounterToUpdate = await this.findOne(id);
    if (!findCounterToUpdate) {
      throw new NotFoundException("COntador no encontrado")
    }
    if (updateContadorDto.name) {
      const findName = await this.counterRepository.find(
        {
          where: {
            name: updateContadorDto.name,
            id: Not(id) // Excluye la cuenta actual
          }
        }
      )
      if (findName.length > 0) {
        throw new ConflictException("El nombre ya esta ocupado")
      }
    }
    return this.counterRepository.save({
      ...findCounterToUpdate,
      ...updateContadorDto
    });
  }

  async remove(id: string) {
    const findCounterToUpdate = await this.findOne(id);
    if (!findCounterToUpdate) {
      throw new NotFoundException("Contador no encontrado")
    }
    return this.counterRepository.delete(id);
  }
}
