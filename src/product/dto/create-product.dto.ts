import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    name: string;
    @IsOptional()
    @IsString()
    @MinLength(1)
    image?: string;
    @IsString()
    description: string;
    @IsNumber()
    @Min(1)
    price: number;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    categoriesIds: string[];
    

}
