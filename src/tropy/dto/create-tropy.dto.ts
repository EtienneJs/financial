import { IsString, IsUUID, MinLength } from "class-validator";

export class CreateTropyDto {
    @IsString()
    @MinLength(5)
    metodo_description:string;
    @IsString()
    @IsUUID()
    contador_id:string;
}
