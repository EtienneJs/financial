import { ArrayMinSize, IsOptional, IsString, MinLength, ValidateNested } from "class-validator";
import { CreateBankAccountDto } from "./create-bank-account.dto";
import { Type } from "class-transformer";
import { UniqueTypeAccount } from "../validadorCustom/validador-type-accounts";
import { isUnique } from "../../validatonsGlobals/validator-unique-nro-count";

export class CreateBankDto {
    @IsString({ groups: ['base'] })
    @MinLength(6, { groups: ['base'] })
    @isUnique({
    column:"name",
    tableName:"banco"
    }, { groups: ['db'] })
    name: string;

    @IsOptional({ groups: ['base'] })
    @IsString({ groups: ['base'] })
    image?: string;
    
    @UniqueTypeAccount({ field: ['type_account', 'nro_account'] }, { groups: ['base'] })
    @ArrayMinSize(1, { message: 'account must have at least one element', groups: ['base'] })
    @ValidateNested({ each: true, groups: ['base'] })
    @Type(() => CreateBankAccountDto)
    account: CreateBankAccountDto[];
}