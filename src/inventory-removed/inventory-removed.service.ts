import { Injectable } from '@nestjs/common';
import { CreateInventoryRemovedDto } from './dto/create-inventory-removed.dto';
import { UpdateInventoryRemovedDto } from './dto/update-inventory-removed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryRemoved } from './entities/inventory-removed.entity';
import { Repository } from 'typeorm';
@Injectable()
export class InventoryRemovedService {
  constructor(
    @InjectRepository(InventoryRemoved)
    private inventoryRemovedRepository: Repository<InventoryRemoved>,
  ) {}

  create(createInventoryRemovedDto: CreateInventoryRemovedDto) {
    return 'This action adds a new inventory';
  }

  findAll() {
    return `This action returns all inventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryRemovedDto: UpdateInventoryRemovedDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }

  updateInventory(tags: string[]) {}

  async addOrUpdateItem(item: any) {
    const { name, quantity, lastSeen } = item;

    // Check if item exists
    let inventoryItem = await this.inventoryRemovedRepository.findOne({
      where: { name },
    });

    if (inventoryItem) {
      // Update existing item
      inventoryItem.quantity = quantity;
      inventoryItem.lastSeen = lastSeen;
    } else {
      // Create new item
      inventoryItem = new InventoryRemoved();
      inventoryItem.name = name;
      inventoryItem.quantity = quantity;
      inventoryItem.lastSeen = lastSeen;
    }

    return await this.inventoryRemovedRepository.save(inventoryItem);
  }

  async deleteItem(item: any) {
    return await this.inventoryRemovedRepository.delete({
      name: item,
    });
  }
}
