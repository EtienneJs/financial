import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TropyService } from './tropy.service';
import { CreateTropyDto } from './dto/create-tropy.dto';
import { UpdateTropyDto } from './dto/update-tropy.dto';

@Controller('tropy')
export class TropyController {
  constructor(private readonly tropyService: TropyService) {}

  @Post()
  create(@Body() createTropyDto: CreateTropyDto) {
    return this.tropyService.create(createTropyDto);
  }

  @Get()
  findAll() {
    return this.tropyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tropyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTropyDto: UpdateTropyDto) {
    return this.tropyService.update(+id, updateTropyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tropyService.remove(+id);
  }
}
