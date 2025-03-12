import { Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { last } from 'rxjs';
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  create(createInventoryDto: CreateInventoryDto) {
    return 'This action adds a new inventory';
  }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }

  updateInventory(tags: string[]) {}

  async addOrUpdateItem(item: any) {
    const { name, quantity, last_seen } = item;

    // Check if item exists
    let inventoryItem = await this.inventoryRepository.findOne({
      where: { name },
    });

    if (inventoryItem) {
      // Update existing item
      inventoryItem.quantity = quantity;
      inventoryItem.last_seen = last_seen;
    } else {
      // Create new item
      inventoryItem = new Inventory();
      inventoryItem.name = name;
      inventoryItem.quantity = quantity;
      inventoryItem.last_seen = last_seen;
    }

    return await this.inventoryRepository.save(inventoryItem);
  }

  async deleteItem(item: any) {
    return await this.inventoryRepository.delete({
      name: item,
    });
  }
}
