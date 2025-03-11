import { Injectable } from '@nestjs/common';
import { CreateCabinetInventoryDto } from './dto/create-cabinet-inventory.dto';
import { UpdateCabinetInventoryDto } from './dto/update-cabinet-inventory.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CabinetInventory } from './entities/cabinet-inventory.entity';
import { RfidReading } from 'src/rfid-reading/entities/rfid-reading.entity';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { InventoryGateway } from '../gateway/inventory.gateway';

@Injectable()
export class CabinetInventoryService {
  constructor(
    @InjectRepository(CabinetInventory)
    private cabinetInventoryRepository: Repository<CabinetInventory>,
    private readonly inventoryGateway: InventoryGateway,
    private dataSource: DataSource,
  ) {}
  create(createCabinetInventoryDto: CreateCabinetInventoryDto) {
    return 'This action adds a new cabinetInventory';
  }

  findAll() {
    return this.cabinetInventoryRepository.find();
  }

  findAllThatExist() {
    return this.cabinetInventoryRepository.find({
      where: {
        quantity: 1,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} cabinetInventory`;
  }

  update(id: number, updateCabinetInventoryDto: UpdateCabinetInventoryDto) {
    return `This action updates a #${id} cabinetInventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} cabinetInventory`;
  }

  async itemExistsInDatabase(tag: string) {
    console.log(`Checking for tag: ${tag}`);
    // Check if the item exists in the database
    const result = await this.dataSource.manager
      .createQueryBuilder(CabinetInventory, 'inventory')
      .where('inventory.rfid_tag = :tag', { tag })
      .getOne();

    console.log('result', result);

    return result !== null;
  }

  async incrementQuantity(tag: string) {
    // Increment the quantity of the item
    console.log(`Updated quantity for tag: ${tag}`);
    const result = await this.dataSource.manager
      .createQueryBuilder()
      .update(CabinetInventory)
      .set({ quantity: () => '1' }) // Increment quantity
      .where('rfid_tag = :tag and quantity = 0', { tag })
      .execute();

    // Check if the update affected any rows
    if (result.affected && result.affected > 0) {
      console.log(`Successfully updated quantity for tag: ${tag}`);
      return true; // Update successful
    }

    console.log(`No rows updated for tag: ${tag}`);
    return false; // No rows updated
  }

  async decrementQuantity(tag: string) {
    // Increment the quantity of the item
    console.log(`Remove quantity for tag: ${tag}`);
    const result = await this.dataSource.manager
      .createQueryBuilder()
      .update(CabinetInventory)
      .set({ quantity: () => '0' }) // Increment quantity
      .where('rfid_tag = :tag and quantity = 1', { tag })
      .execute();

    // Check if the update affected any rows
    if (result.affected && result.affected > 0) {
      console.log(`Successfully remove quantity for tag: ${tag}`);
      return true; // Update successful
    }

    console.log(`No rows updated for tag: ${tag}`);
    return false; // No rows updated
  }

  async insertNewItem(tag: string) {
    // Insert a new item with default quantity
    console.log(`Inserted new item for tag: ${tag}`);
    return await this.dataSource.manager
      .createQueryBuilder()
      .insert()
      .into(CabinetInventory)
      .values({
        rfid_tag: tag,
        quantity: 1,
      })
      .execute();
  }

  async updateInventory(tags: string[]) {
    // Ensure the database connection is established
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    for (const tag of tags) {
      if (await this.itemExistsInDatabase(tag)) {
        console.log(`Tag ${tag} exists`);
        const response = await this.incrementQuantity(tag); // or decrement based on the operation
        if (response) this.inventoryGateway.updateInventoryToClients(tag);
      } else {
        const response = this.insertNewItem(tag); // Add new item with default quantity
        if (response) this.inventoryGateway.insertInventoryToClients(tag);
      }
    }
  }

  async removeInventory(tags: string[]) {
    // Ensure the database connection is established
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    for (const tag of tags) {
      const response = await this.decrementQuantity(tag); // or decrement based on the operation
      if (response) this.inventoryGateway.removeInventoryToClients(tag);
    }
  }

  async getReadingsFromLast5Seconds() {
    // Get all tags from the last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000);

    return await this.dataSource.manager
      .createQueryBuilder(RfidReading, 'rfid_reading')
      .where('timestamp >= :timestamp', { timestamp: fiveSecondsAgo })
      .getMany();
  }

  //@Interval(1000)
  async handleUpdateCabinetInventory() {
    console.log('This runs every 1 seconds');

    // list all tags within 5 seconds
    const readings = await this.getReadingsFromLast5Seconds();

    const combinedTags = Array.from(
      new Set(readings.flatMap((reading) => reading.rfid_tags)),
    );

    const cabinetInventory = await this.findAllThatExist();
    const cabinetTags = cabinetInventory.map((item) => item.rfid_tag);

    // Find removed tags
    const removedTags = cabinetTags.filter(
      (tag) => !combinedTags.includes(tag),
    );

    this.updateInventory(combinedTags);
    this.removeInventory(removedTags);

    /*if (combinedTags.length > 0 || removedTags.length > 0) {
      if (combinedTags.length > 0)
        this.inventoryGateway.updateInventoryToClients(combinedTags);

      if (removedTags.length > 0)
        this.inventoryGateway.updateInventoryToClients(removedTags);
    }*/

    //console.log('readings', readings);
    console.log('cabinetTags', cabinetTags);
    console.log('combinedTags', combinedTags);
    console.log('removeTags', removedTags);
  }
}
