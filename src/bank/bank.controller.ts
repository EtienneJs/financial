import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UsePipes, Inject, Query } from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountService } from './bank-account.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DataSource } from 'typeorm';
import { ExistsBankPipe } from './pipes/validation-exist-bank';
import { ExistsBankAccountPipe } from './pipes/validation-exist-account';

@Controller('bank')
export class BankController {
  constructor(
    private readonly bankService: BankService,
    private readonly bankAccountService: BankAccountService,
  ) {}

  // Bank Endpoints
  @Post()
  create(@Body() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @Get()
  findAll(@Query('name') name: string) {
    return this.bankService.findAll(name);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.bankService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.bankService.update(id, updateBankDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.bankService.remove(id);
  }
  @Post('/create-account/:bankId')
  async createAccount(
    @Param('bankId', ParseUUIDPipe,ExistsBankPipe) bankId: string,
    @Body() createBankDto: CreateBankAccountDto
  ) {
    return this.bankAccountService.createAccount(bankId, createBankDto);
  }

  @Patch('/update-account/:id')
  updateAccount(
    @Param('id', ParseUUIDPipe,ExistsBankAccountPipe) id: string,
    @Body() updateBankDto: UpdateBankAccountDto
  ) {
    return this.bankAccountService.updateAccount(id, updateBankDto);
  }
  @Delete('/delete-account/:id')
  removeAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.bankAccountService.removeAccount(id);
  }
  @Post("/account/transaction")
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto
  ) {
    return this.bankAccountService.createTransaction(createTransactionDto);
  }

}
