import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBuyHistoryDto } from './dto/create-buy-history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy-history.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from 'src/bank/entities/bank-account.entity';
import { Repository } from 'typeorm';
import { Category } from './entities/category';

@Injectable()
export class BuyHistoryService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }
  async create(createCategoryDto: CreateCategoryDto) {
    const findCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name,
      },
    });
    if (findCategory) {
      throw new ConflictException( "Categoria ya existe debe ser unica" );
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }

  findAll() {
    return `This action returns all buyHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} buyHistory`;
  }

  update(id: number, updateBuyHistoryDto: UpdateBuyHistoryDto) {
    return `This action updates a #${id} buyHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} buyHistory`;
  }
}
