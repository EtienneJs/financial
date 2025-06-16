import { PartialType } from '@nestjs/mapped-types';
import { CreateBankDto } from './create-bank.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBankDto {
    @IsOptional()
    @IsString()
    @MinLength(6)
    name?: string;
    @IsOptional()
    @IsString()
    @MinLength(6)
    image?: string;
}
