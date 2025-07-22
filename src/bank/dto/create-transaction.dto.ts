import { IsNumber, IsString, IsUUID, MinLength } from "class-validator";
import { isExist } from "src/validatonsGlobals/validator-exist";

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
    @isExist({
        column:"id",
        tableName:"account"
    })
    accountDestiny: string;

    @IsString()
    @IsUUID()
    @isExist({
        column:"id",
        tableName:"account"
    })
    accountOrigin: string;
}