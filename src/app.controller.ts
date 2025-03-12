import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { InventoryRemovedService } from './inventory-removed/inventory-removed.service';
import { InventoryService } from './inventory/inventory.service';
import { CabinetItemService } from './cabinet-item/cabinet-item.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly inventoryRemovedService: InventoryRemovedService,
    private readonly inventoryService: InventoryService,
    private readonly cabinetItemService: CabinetItemService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Post('change')
  change(@Body() body: any) {
    console.log(body);
    const { type, item } = body;

    try {
      if (type === 'addOrUpdateItemInRemove') {
        console.log('here addOrUpdateItemInRemove');
        return this.inventoryRemovedService.addOrUpdateItem(item);
      } else if (type === 'deleteItemInRemove') {
        console.log('here deleteItemInRemove');
        return this.inventoryRemovedService.deleteItem(item);
      } else if (type === 'addOrUpdateItem') {
        console.log('here addOrUpdateItem');
        return this.cabinetItemService.addOrUpdateItem(item);
      } else if (type === 'deleteItem') {
        console.log('here deleteItem');
        return this.inventoryService.deleteItem(item);
      }
      return body;
    } catch (error) {
      throw error;
    }
    /*if (body.type === 'inventory') {
      return this.appService.changeInventory(body);
    } else if (body.type === 'inventoryItem') {
      return this.appService.changeInventoryItem(body);
    } else if (body.type === 'syncConflict') {
      return this.appService.changeSyncConflict(body);
    }*/
  }
}
