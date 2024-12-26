import { PartialType } from '@nestjs/mapped-types';
import { CreateUserImageDto } from './create-user-image.dto';

export class UpdateUserImageDto extends PartialType(CreateUserImageDto) {}
