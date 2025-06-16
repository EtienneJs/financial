import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateBankAccountDto {
    @IsString()
    @MinLength(6)
    nro_account: string;
    @IsString()
    @MinLength(3)
    type_account: string;
    @IsNumber()
    @Min(0)
    current_balance: number;
}