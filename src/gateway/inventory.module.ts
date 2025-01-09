import { Module } from '@nestjs/common';
import { InventoryGateway } from './inventory.gateway';

@Module({
  exports: [InventoryGateway],
  providers: [InventoryGateway],
})
export class InventoryGatewayModule { }
