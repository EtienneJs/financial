import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

// decorator options interface
export type IsUniqeInterface = {
    tableName: string,
    column: string,
    type?: string
}

@ValidatorConstraint({ name:"IsUniqueConstraint",async: true })
@Injectable()
 export class IsUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly dataSource: DataSource) {}
    async validate(
        value: any,
        args?: ValidationArguments
        ): Promise<boolean> {
            const {tableName, column, type}: IsUniqeInterface = args?.constraints[0];
            try {
                const casted = type === 'number' ? Number(value) : value;
                const table = `"${tableName}"`;
                const col = `"${column}"`;
                const result = await this.dataSource.query(
                    `SELECT 1 FROM ${table} WHERE ${col} = $1 LIMIT 1`,
                    [casted]
                );
                console.log({result});
                return result.length === 0;
            } catch (error) {
                console.log({error});
                return false;
            }
        }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const field: string = validationArguments?.property ?? "sadas"
        return `${field} is already exist`
    }
}

export function isUnique(options: IsUniqeInterface, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isUnique',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [options],
            validator: IsUniqueConstraint,
        })
    }
}
