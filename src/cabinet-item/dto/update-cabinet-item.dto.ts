import { PartialType } from '@nestjs/mapped-types';
import { CreateCabinetItemDto } from './create-cabinet-item.dto';

export class UpdateCabinetItemDto extends PartialType(CreateCabinetItemDto) {}
