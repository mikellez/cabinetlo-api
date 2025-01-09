import { PartialType } from '@nestjs/mapped-types';
import { CreateCabinetInventoryDto } from './create-cabinet-inventory.dto';

export class UpdateCabinetInventoryDto extends PartialType(CreateCabinetInventoryDto) {}
