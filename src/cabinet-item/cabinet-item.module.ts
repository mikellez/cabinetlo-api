import { Module } from '@nestjs/common';
import { CabinetItemService } from './cabinet-item.service';
import { CabinetItemController } from './cabinet-item.controller';
import { CabinetItem } from './entities/cabinet-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CabinetItem])],
  exports: [CabinetItemService],
  controllers: [CabinetItemController],
  providers: [CabinetItemService],
})
export class CabinetItemModule {}
