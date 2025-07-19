import {IsNumber, IsString, IsUUID, Min} from "class-validator";

export class CreateBuyHistoryDetalleDto {
    @IsNumber()
    @Min(1)
    quantity:number;

    @IsString()
    @IsUUID()
    productId:string;
}
