import { PartialType } from '@nestjs/mapped-types';
import { CreateTropyDto } from './create-tropy.dto';

export class UpdateTropyDto extends PartialType(CreateTropyDto) {}
