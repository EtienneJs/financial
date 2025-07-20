import { IsNumber, IsString, Min, MinLength } from "class-validator";
import { isUnique } from "src/validatonsGlobals/validator-unique-nro-count";

export class CreateBankAccountDto {
    @IsString()
    @MinLength(6)
    @isUnique({
        column:"nro_account",
        tableName:"account"
    })
    nro_account: string;
    @IsString()
    @MinLength(3)
    type_account: string;
    @IsNumber()
    @Min(0)
    current_balance: number;
}