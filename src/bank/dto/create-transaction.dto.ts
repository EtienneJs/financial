import { ArrayMinSize, IsArray, IsDecimal, IsNumber, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { CreateBankAccountDto } from "./create-bank-account.dto";
import { Type } from "class-transformer";

export class CreateTransactionDto {
    @IsString()
    @MinLength(6)
    description: string;

    @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'Debe ser un número válido' })
    amount: number;

    @IsString()
    @MinLength(3)
    currency: string;
}