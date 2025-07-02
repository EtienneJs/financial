import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BuyHistoryService } from './buy-history.service';
import { CreateBuyHistoryDto } from './dto/create-buy-history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy-history.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('buy-history')
export class BuyHistoryController {
  constructor(private readonly buyHistoryService: BuyHistoryService) {}

  @Post("/category")
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.buyHistoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.buyHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buyHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBuyHistoryDto: UpdateBuyHistoryDto) {
    return this.buyHistoryService.update(+id, updateBuyHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buyHistoryService.remove(+id);
  }
}
