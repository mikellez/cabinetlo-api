import { PartialType } from '@nestjs/mapped-types';
import { CreateRfidReadingDto } from './create-rfid-reading.dto';

export class UpdateRfidReadingDto extends PartialType(CreateRfidReadingDto) {}
