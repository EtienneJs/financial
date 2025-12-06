import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { BuyHistoryService } from './buy-history.service';
import { CreateBuyHistoryDto } from './dto/create-buy-history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy-history.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('buy-history')
export class BuyHistoryController {
  constructor(private readonly buyHistoryService: BuyHistoryService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.buyHistoryService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.buyHistoryService.findOne(id, user);
  }

  @Post("")
  createBuyHistory(@Body() createBuyHistoryDto: CreateBuyHistoryDto, @CurrentUser() user: User) {
    return this.buyHistoryService.createNewHistoryBuy(createBuyHistoryDto, user);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBuyHistoryDto: UpdateBuyHistoryDto, @CurrentUser() user: User) {
    return this.buyHistoryService.update(id, updateBuyHistoryDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buyHistoryService.remove(+id);
  }
}
