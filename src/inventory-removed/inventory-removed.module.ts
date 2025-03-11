import { Module } from '@nestjs/common';
import { InventoryRemovedService } from './inventory-removed.service';
import { InventoryRemovedController } from './inventory-removed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryRemoved } from './entities/inventory-removed.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryRemoved]), ConfigModule],
  exports: [InventoryRemovedService],
  controllers: [InventoryRemovedController],
  providers: [InventoryRemovedService],
})
export class InventoryRemovedModule {}
