import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { SyncConflict } from './entities/sync-conflict.entity';
import {
  SyncSingleItemDto,
  SyncSingleResponseDto,
} from './dto/sync-single.dto';
import {
  FullSyncRequestDto,
  FullSyncResponseDto,
  SyncItem,
} from './dto/sync-full.dto';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(SyncConflict)
    private conflictRepository: Repository<SyncConflict>,
  ) {}

  private mapDtoToEntity(
    dto: SyncSingleItemDto | SyncItem,
    user_id: string,
    incrementVersion = true,
  ): Partial<InventoryItem> {
    return {
      id: dto.id,
      user_id: user_id,
      name: dto.data.name,
      description: dto.data.description,
      quantity: dto.data.quantity,
      price: dto.data.price,
      category: dto.data.category,
      metadata: dto.data.metadata,
      version: incrementVersion ? dto.version + 1 : dto.version,
      lastModified: Date.now(),
      isDeleted: dto.isDeleted || false,
    };
  }

  private mapEntityToSyncItem(entity: InventoryItem): SyncItem {
    return {
      id: entity.id,
      version: entity.version,
      data: {
        name: entity.name,
        description: entity.description,
        quantity: entity.quantity,
        price: entity.price,
        category: entity.category,
        metadata: entity.metadata,
      },
      lastModified: new Date(entity.lastModified),
      isDeleted: entity.isDeleted,
    };
  }

  async syncSingleItem(
    user_id: string,
    dto: SyncSingleItemDto,
  ): Promise<SyncSingleResponseDto> {
    // Find existing item
    const existingItem = await this.inventoryRepository.findOne({
      where: { id: dto.id, user_id: user_id },
    });

    // If item doesn't exist, create it
    if (!existingItem) {
      const newItem = await this.inventoryRepository.save(
        this.mapDtoToEntity(dto, user_id, false),
      );

      return {
        success: true,
        currentVersion: newItem.version,
      };
    }

    // Check for version conflict
    if (existingItem.version !== dto.version) {
      // Create conflict record
      await this.conflictRepository.save({
        itemId: dto.id,
        user_id: user_id,
        clientVersion: dto.data,
        serverVersion: {
          name: existingItem.name,
          description: existingItem.description,
          quantity: existingItem.quantity,
          price: existingItem.price,
          category: existingItem.category,
          metadata: existingItem.metadata,
        },
        clientVersionNumber: dto.version,
        serverVersionNumber: existingItem.version,
        timestamp: Date.now(),
        resolved: false,
      });

      return {
        success: false,
        currentVersion: existingItem.version,
        conflictingData: {
          name: existingItem.name,
          description: existingItem.description,
          quantity: existingItem.quantity,
          price: existingItem.price,
          category: existingItem.category,
          metadata: existingItem.metadata,
        },
        message: 'Version conflict detected',
      };
    }

    // Update the item
    const updatedItem = await this.inventoryRepository.save(
      this.mapDtoToEntity(dto, user_id),
    );

    return {
      success: true,
      currentVersion: updatedItem.version,
    };
  }

  async fullSync(
    user_id: string,
    dto: FullSyncRequestDto,
  ): Promise<FullSyncResponseDto> {
    // Get all server changes since last sync
    const serverChanges = await this.inventoryRepository.find({
      where: {
        user_id: user_id,
        lastModified: MoreThanOrEqual(dto.lastSyncTimestamp.getTime()),
      },
    });

    const updatedItems: SyncItem[] = [];
    const deletedItemIds: string[] = [];
    const conflicts: SyncConflict[] = [];

    // Process incoming items
    for (const item of dto.items) {
      const serverItem = serverChanges.find((i) => i.id === item.id);

      if (!serverItem || serverItem.version === item.version) {
        // No conflict, update or create the item
        const savedItem = await this.inventoryRepository.save(
          this.mapDtoToEntity(item, user_id),
        );

        if (savedItem.isDeleted) {
          deletedItemIds.push(savedItem.id);
        } else {
          updatedItems.push(this.mapEntityToSyncItem(savedItem));
        }
      } else {
        // Create conflict record
        const conflict = await this.conflictRepository.save({
          itemId: item.id,
          user_id: user_id,
          clientVersion: item.data,
          serverVersion: {
            name: serverItem.name,
            description: serverItem.description,
            quantity: serverItem.quantity,
            price: serverItem.price,
            category: serverItem.category,
            metadata: serverItem.metadata,
          },
          clientVersionNumber: item.version,
          serverVersionNumber: serverItem.version,
          timestamp: Date.now(),
          resolved: false,
        });
        conflicts.push(conflict);
      }
    }

    // Get any server items that were modified but not in client's list
    const serverOnlyChanges = serverChanges.filter(
      (serverItem) => !dto.items.some((item) => item.id === serverItem.id),
    );

    // Add server-only changes to the response
    serverOnlyChanges.forEach((item) => {
      if (item.isDeleted) {
        deletedItemIds.push(item.id);
      } else {
        updatedItems.push(this.mapEntityToSyncItem(item));
      }
    });

    return {
      success: true,
      updatedItems,
      deletedItemIds,
      timestamp: new Date(),
      message:
        conflicts.length > 0
          ? `Sync completed with ${conflicts.length} conflicts`
          : 'Sync completed successfully',
    };
  }

  private async handleResolvedConflicts(
    user_id: string,
    resolvedConflicts: SyncConflict[],
  ) {
    for (const conflict of resolvedConflicts) {
      const existingConflict = await this.conflictRepository.findOne({
        where: { id: conflict.id, user_id: user_id },
      });

      if (existingConflict && !existingConflict.resolved) {
        // Update the item with the resolved version
        const resolvedItem = {
          id: conflict.itemId,
          user_id: user_id,
          ...conflict.clientVersion,
          version:
            Math.max(
              conflict.clientVersionNumber,
              conflict.serverVersionNumber,
            ) + 1,
          lastModified: Date.now(),
        };

        await this.inventoryRepository.save(resolvedItem);

        // Mark conflict as resolved
        await this.conflictRepository.update(
          { id: conflict.id },
          { resolved: true },
        );
      }
    }
  }
}
