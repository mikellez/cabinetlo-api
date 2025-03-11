import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserImageModule } from './user-image/user-image.module';
import { IdentityModule } from './identity/identity.module';
import { Identity } from './identity/entities/identity.entity';
import { ConfigModule } from '@nestjs/config';
import { InventoryModule } from './inventory/inventory.module';
import { Inventory } from './inventory/entities/inventory.entity';
import { RfidReadingModule } from './rfid-reading/rfid-reading.module';
import { RfidReading } from './rfid-reading/entities/rfid-reading.entity';
import { CabinetInventoryModule } from './cabinet-inventory/cabinet-inventory.module';
import { CabinetInventory } from './cabinet-inventory/entities/cabinet-inventory.entity';
import { InventoryGatewayModule } from './gateway/inventory.module';
//import { InventoryItem } from './sync/entities/inventory-item.entity';
import { SyncConflict } from './sync/entities/sync-conflict.entity';
import { InventoryItem } from './sync/entities/inventory-item.entity';
import { User } from './identity/entities/user.entity';
import { SyncModule } from './sync/sync.module';
import { InventoryRemovedModule } from './inventory-removed/inventory-removed.module';
import { InventoryRemoved } from './inventory-removed/entities/inventory-removed.entity';
import { CabinetItemModule } from './cabinet-item/cabinet-item.module';
import { ProductModule } from './product/product.module';
import { TagModule } from './tag/tag.module';
import { CabinetItem } from './cabinet-item/entities/cabinet-item.entity';
import { Product } from './product/entities/product.entity';
import { Tag } from './tag/entities/tag.entity';
import { join } from 'path';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'example_db',
      entities: [
        User,
        Identity,
        Inventory,
        RfidReading,
        CabinetInventory,
        InventoryItem,
        SyncConflict,
        CabinetItem,
        Product,
        Tag,
      ],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    UserImageModule,
    IdentityModule,
    InventoryModule,
    InventoryRemovedModule,
    RfidReadingModule,
    CabinetInventoryModule,
    InventoryGatewayModule,
    SyncModule,
    CabinetItemModule,
    ProductModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
