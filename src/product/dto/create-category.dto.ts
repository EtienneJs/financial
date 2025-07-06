import { IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @MinLength(1)
    name: string;
    @IsOptional()
    @IsString()
    image?: string;
    @IsString()
    @MinLength(1)
    description: string;
}
