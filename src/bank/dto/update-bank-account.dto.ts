import { PartialType } from '@nestjs/mapped-types';
import { CreateBankAccountDto } from './create-bank-account.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { isUnique } from 'src/validatonsGlobals/validator-unique-nro-count';

export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {
    @IsOptional()
    @IsString()
    @MinLength(6)
    nro_account?: string;
}
