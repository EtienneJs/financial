import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';

interface IsUniqueArrayValueInterface {
  field: string[];
}

@ValidatorConstraint({ name:"UniqueFields",async: false })
 export class UniqueFields implements ValidatorConstraintInterface {
  validate(accounts: CreateBankAccountDto[], args: ValidationArguments) {
    const {field}: IsUniqueArrayValueInterface = args?.constraints[0];
    let isUnique = true;
    field.forEach(field => {
      const types = accounts.map(acc => acc[field]);
      const uniqueTypes = new Set(types);
      isUnique = uniqueTypes.size === types.length;
    });
    return isUnique;
  }

  defaultMessage(args: ValidationArguments) {
    const {field}: IsUniqueArrayValueInterface = args?.constraints[0];
    return `The fields (${field.join(', ')}) must be unique.`;
  }
}

export function UniqueTypeAccount(options: IsUniqueArrayValueInterface,validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: UniqueFields,
    });
  };
}
