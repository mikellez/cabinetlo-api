import { Injectable } from '@nestjs/common';
import { CreateCabinetItemDto } from './dto/create-cabinet-item.dto';
import { UpdateCabinetItemDto } from './dto/update-cabinet-item.dto';
import { CabinetItem } from './entities/cabinet-item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CabinetItemService {
  constructor(
    @InjectRepository(CabinetItem)
    private cabinetRepository: Repository<CabinetItem>,
  ) {}

  create(createCabinetItemDto: CreateCabinetItemDto) {
    return this.cabinetRepository.save(createCabinetItemDto);
  }

  findAll() {
    return this.cabinetRepository.find();
  }

  findOne(id: string) {
    return this.cabinetRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCabinetItemDto: UpdateCabinetItemDto) {
    const item = await this.cabinetRepository.findOne({ where: { id } });
    if (!item) {
      return this.cabinetRepository.save({ id, ...updateCabinetItemDto });
    }
    return this.cabinetRepository.update(id, updateCabinetItemDto);
  }

  remove(id: number) {
    return `This action removes a #${id} cabinetItem`;
  }

  async addOrUpdateItem(item: any) {
    const { id, tag_id, tag_name, status, last_seen } = item;

    // Check if item exists
    let cabinetItem = await this.cabinetRepository.findOne({
      where: { tag_id },
    });

    if (cabinetItem) {
      // Update existing item
      cabinetItem.status = status;
      cabinetItem.last_seen = last_seen;
    } else {
      // Create new item
      cabinetItem = new CabinetItem();
      cabinetItem.tag_id = tag_id;
      cabinetItem.tag_name = tag_name;
      cabinetItem.status = status;
      cabinetItem.last_seen = last_seen;
    }

    return await this.cabinetRepository.save(cabinetItem);
  }
}
