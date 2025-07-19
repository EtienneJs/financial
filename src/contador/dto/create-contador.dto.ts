import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateContadorDto {
    @IsString()
    @MinLength(5)
    name:string;
    @IsString()
    @MinLength(5)
    description:string;
}
