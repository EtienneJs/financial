import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsString, IsUUID, MinLength, ValidateNested } from "class-validator";
import { CreateBuyHistoryDetalleDto } from "./create-buy-history-detalle.dto";

export class CreateBuyHistoryDto {
    @IsString()
    @MinLength(5)
    description:string;

    @IsString()
    @IsUUID()
    bankAcount:string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true }) // Valida cada elemento del array
    @Type(() => CreateBuyHistoryDetalleDto) // Transforma objetos a instancias de la clase
    detailBuy: CreateBuyHistoryDetalleDto[];
}
