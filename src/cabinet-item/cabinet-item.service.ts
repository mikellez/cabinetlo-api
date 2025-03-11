import { Injectable } from '@nestjs/common';
import { CreateCabinetItemDto } from './dto/create-cabinet-item.dto';
import { UpdateCabinetItemDto } from './dto/update-cabinet-item.dto';

@Injectable()
export class CabinetItemService {
  create(createCabinetItemDto: CreateCabinetItemDto) {
    return 'This action adds a new cabinetItem';
  }

  findAll() {
    return `This action returns all cabinetItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cabinetItem`;
  }

  update(id: number, updateCabinetItemDto: UpdateCabinetItemDto) {
    return `This action updates a #${id} cabinetItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} cabinetItem`;
  }
}
