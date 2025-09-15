import { IsNumber, IsString, Min, MinLength } from "class-validator";
import { isUnique } from "src/validatonsGlobals/validator-unique-nro-count";

export class CreateBankAccountDto {
    @isUnique({
        column:"nro_account",
        tableName:"account",
        type:"number"
    })
    nro_account: number;
    @IsString()
    @MinLength(3)
    type_account: string;
    
    @IsNumber()
    @Min(0)
    current_balance: number;
}