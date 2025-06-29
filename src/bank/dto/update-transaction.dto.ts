import { ArrayMinSize, IsArray, IsDecimal, IsString, IsUUID, Min, MinLength, ValidateNested } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreateTransactionDto } from "./create-transaction.dto";

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
    @IsString()
    @IsUUID()
    account_id: string;
}