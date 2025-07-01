import { ArrayMinSize, IsArray, IsDecimal, IsNumber, IsString, IsUUID, Min, MinLength, ValidateNested } from "class-validator";

export class CreateTransactionDto {
    @IsString()
    @MinLength(6)
    description: string;

    @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'Debe ser un número válido' })
    amount: number;

    @IsString()
    @MinLength(3)
    currency: string;

    @IsString()
    @IsUUID()
    accountDestiny: string;
}