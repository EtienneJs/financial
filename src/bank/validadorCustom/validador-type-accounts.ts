import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';

@ValidatorConstraint({ name:"uniqueTypeAccountConstraint",async: false })
 export class UniqueTypeAccountConstraint implements ValidatorConstraintInterface {
  validate(accounts: CreateBankAccountDto[], args: ValidationArguments) {
    if (typeof accounts !== 'object') {
      return false;
    }

    const types = accounts.map(acc => acc.type_account);
    const unique = new Set(types);
    return unique.size === types.length;
  }

  defaultMessage(args: ValidationArguments) {
    if(typeof args.value !== 'object') {
      return 'account must be an array';
    }
    return 'Los nombres de tipo de cuenta (type_account) deben ser únicos.';
  }
}

export function UniqueTypeAccount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueTypeAccountConstraint,
    });
  };
}
