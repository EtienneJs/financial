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
export type isExistInterface = {
    tableName: string,
    column: string
}

@ValidatorConstraint({ name:"IsExistConstraint",async: true })
@Injectable()
 export class IsExistConstraint implements ValidatorConstraintInterface {
    constructor(private readonly dataSource: DataSource) {}
    async validate(
        value: any,
        args?: ValidationArguments
        ): Promise<boolean> {
            // catch options from decorator
            const {tableName, column}: isExistInterface = args?.constraints[0];

            // database query check data is exists
            const result = await this.dataSource.query(
            `SELECT 1 FROM ${tableName} WHERE ${column} = $1 LIMIT 1`,
            [value]
            );
            return result.length > 0;
        }

    defaultMessage(validationArguments?: ValidationArguments): string {
        // return custom field message
        const field: string = validationArguments?.property ?? "sadas"
        return `${field} is not exist`
    }
}

export function isExist(options: isExistInterface, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isExist',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [options],
            validator: IsExistConstraint,
        })
    }
}
