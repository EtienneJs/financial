import { ArrayMinSize, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { CreateBankAccountDto } from "./create-bank-account.dto";
import { Type } from "class-transformer";
import { UniqueTypeAccount } from "../validadorCustom/validador-type-accounts";
import { isUnique } from "../../validatonsGlobals/validator-unique-nro-count";

export class CreateBankDto {
    @IsString()
    @MinLength(6)
    @isUnique({
    column:"name",
    tableName:"banco"
    })
    name: string;

    @IsOptional()
    @IsString()
    image?: string;
    
    @UniqueTypeAccount()
    @ArrayMinSize(1, { message: 'account must have at least one element' })
    @ValidateNested({ each: true })
    @Type(() => CreateBankAccountDto)
    account: CreateBankAccountDto[];
}