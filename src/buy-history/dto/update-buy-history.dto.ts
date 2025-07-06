import { PartialType } from '@nestjs/mapped-types';
import { CreateBuyHistoryDto } from './create-buy-history.dto';

export class UpdateBuyHistoryDto extends PartialType(CreateBuyHistoryDto) {}
