import { Module } from '@nestjs/common';
import { RfidReadingService } from './rfid-reading.service';
import { RfidReadingController } from './rfid-reading.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidReading } from './entities/rfid-reading.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([RfidReading]), ConfigModule],
  exports: [RfidReadingService],
  controllers: [RfidReadingController],
  providers: [RfidReadingService],
})
export class RfidReadingModule {}
