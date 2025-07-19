import { PartialType } from '@nestjs/mapped-types';
import { CreateContadorDto } from './create-contador.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateContadorDto extends PartialType(CreateContadorDto) {
    @IsOptional()
    @IsNumber()
    @Min(0)
    counts?:number;
}
