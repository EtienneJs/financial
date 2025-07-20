import { ArrayMinSize, IsArray, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { CreateBankAccountDto } from "./create-bank-account.dto";
import { Type } from "class-transformer";
import { UniqueTypeAccount } from "../validadorCustom/validador-type-accounts";
import { IsUniqueConstraint, isUnique } from "../../validatonsGlobals/validator-unique-nro-count";

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
    
    @IsArray()
    @ArrayMinSize(1)
    @UniqueTypeAccount()
    @ValidateNested({ each: true })
    @Type(() => CreateBankAccountDto)
    account: CreateBankAccountDto[];
}