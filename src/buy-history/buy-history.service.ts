import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBuyHistoryDto } from './dto/create-buy-history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from 'src/bank/entities/bank-account.entity';
import { Repository } from 'typeorm';
@Injectable()
export class BuyHistoryService {
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
