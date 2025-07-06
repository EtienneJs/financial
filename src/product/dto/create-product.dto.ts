import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { CreateCategoryDto } from "./create-category.dto";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    name: string;
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
    categories: string[];
    

}
