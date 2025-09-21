import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { isUnique } from "src/validatonsGlobals/validator-unique-nro-count";

export class CreateBankAccountDto {
    @IsNumber({}, { groups: ['base'] })
    @Min(100000, { message: 'El número de cuenta debe tener al menos 6 dígitos', groups: ['base'] })
    @Max(999999999, { message: 'El número de cuenta debe tener menos de 10 dígitos', groups: ['base'] })
    @Type(() => Number)
    @isUnique({
        column:"nro_account",
        tableName:"account",
        type:"number",
        query:"INSERT"
    }, { groups: ['db'] })
    nro_account: number;

    @IsString({ groups: ['base'] })
    @MinLength(3, { groups: ['base'] })
    type_account: string;
    
    @IsNumber({}, { groups: ['base'] })
    @Min(0, { groups: ['base'] })
    current_balance: number;
}