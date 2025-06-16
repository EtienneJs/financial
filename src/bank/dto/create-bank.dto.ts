import { ArrayMinSize, IsArray, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { CreateBankAccountDto } from "./create-bank-account.dto";
import { Type } from "class-transformer";

export class CreateBankDto {
    @IsString()
    @MinLength(6)
    name: string;
    image?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true }) // Valida cada elemento del array
    @Type(() => CreateBankAccountDto) // Transforma objetos a instancias de la clase
    account: CreateBankAccountDto[];
}