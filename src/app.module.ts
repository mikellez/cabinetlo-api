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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'example_db',
      entities: [Identity, Inventory, RfidReading, CabinetInventory],
      synchronize: false,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    UserImageModule,
    IdentityModule,
    InventoryModule,
    RfidReadingModule,
    CabinetInventoryModule,
    InventoryGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
