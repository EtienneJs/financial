import { IsOptional, IsString, MinLength } from 'class-validator';
import { isUnique } from 'src/validatonsGlobals/validator-unique-nro-count';

export class UpdateBankDto {
    @IsOptional( { groups: ['base'] } )
    @IsString( { groups: ['base'] } )
    @MinLength(6, { groups: ['base'] } )
    @isUnique({
        column:"name",
        tableName:"banco",
        query:"UPDATE"
        }, { groups: ['db'] })
    name?: string;
    @IsOptional( { groups: ['base'] } )
    @IsString( { groups: ['base'] } )
    @MinLength(6, { groups: ['base'] } )
    image?: string;
}
