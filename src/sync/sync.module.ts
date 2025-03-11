import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { SyncConflict } from './entities/sync-conflict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, SyncConflict])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
