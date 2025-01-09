import { Module } from '@nestjs/common';
import { CabinetInventoryService } from './cabinet-inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CabinetInventoryController } from './cabinet-inventory.controller';
import { CabinetInventory } from './entities/cabinet-inventory.entity';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryGatewayModule } from '../gateway/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CabinetInventory]),
    InventoryGatewayModule,
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  exports: [CabinetInventoryService],
  controllers: [CabinetInventoryController],
  providers: [CabinetInventoryService],
})
export class CabinetInventoryModule { }
