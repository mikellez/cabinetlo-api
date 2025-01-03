import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), ConfigModule],
  exports: [InventoryService],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule { }
