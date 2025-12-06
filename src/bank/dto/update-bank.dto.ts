import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBankDto {
    @IsOptional( { groups: ['base'] } )
    @IsString( { groups: ['base'] } )
    @MinLength(6, { groups: ['base'] } )
    name?: string;
    @IsOptional( { groups: ['base'] } )
    @IsString( { groups: ['base'] } )
    @MinLength(6, { groups: ['base'] } )
    image?: string;
}
