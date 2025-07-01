import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountService } from './bank-account.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

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
  findAll() {
    return this.bankService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.bankService.update(id, updateBankDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.bankService.remove(id);
  }

  // Bank Account Endpoints
  @Post('/create-account/:bankId')
  createAccount(
    @Param('bankId', ParseUUIDPipe) bankId: string,
    @Body() createBankDto: CreateBankAccountDto
  ) {
    return this.bankAccountService.createAccount(bankId, createBankDto);
  }

  @Patch('/update-account/:id')
  updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBankDto: UpdateBankAccountDto
  ) {
    return this.bankAccountService.updateAccount(id, updateBankDto);
  }
  @Delete('/delete-account/:id')
  removeAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.bankAccountService.removeAccount(id);
  }
  @Post("/account/:id/transaction")
  createTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTransactionDto: CreateTransactionDto
  ) {
    return this.bankAccountService.createTransaction(id, createTransactionDto);
  }

}
