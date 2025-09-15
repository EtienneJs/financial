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
            // catch options from decorator
            const {tableName, column, type}: IsUniqeInterface = args?.constraints[0];
            try {
                // database query check data is exists
                const result = await this.dataSource.query(
                `SELECT 1 FROM ${tableName} WHERE ${column} = $1 LIMIT 1`,
                [value]
                );
                return result.length === 0;
            } catch (error) {
                return false;
            }
        }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const {type}: IsUniqeInterface = validationArguments?.constraints[0];
        const value = validationArguments?.value;
        console.log(type, typeof value);
        if(type && typeof value !== type){
            return `${validationArguments?.property} is not a valid ${type}`
        }
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
