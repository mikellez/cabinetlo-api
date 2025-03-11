import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryRemovedDto } from './create-inventory-removed.dto';

export class UpdateInventoryRemovedDto extends PartialType(
  CreateInventoryRemovedDto,
) {}
