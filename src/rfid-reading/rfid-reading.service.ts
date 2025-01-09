import { Injectable } from '@nestjs/common';
import { CreateRfidReadingDto } from './dto/create-rfid-reading.dto';
import { UpdateRfidReadingDto } from './dto/update-rfid-reading.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RfidReading } from './entities/rfid-reading.entity';

@Injectable()
export class RfidReadingService {
  constructor(
    @InjectRepository(RfidReading)
    private rfidReadingRepository: Repository<RfidReading>,
    private dataSource: DataSource,
  ) { }
  create(createRfidReadingDto: CreateRfidReadingDto) {
    return 'This action adds a new rfidReading';
  }

  findAll() {
    return `This action returns all rfidReading`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rfidReading`;
  }

  update(id: number, updateRfidReadingDto: UpdateRfidReadingDto) {
    return `This action updates a #${id} rfidReading`;
  }

  remove(id: number) {
    return `This action removes a #${id} rfidReading`;
  }

  async saveRfidReading(tags: string[]): Promise<RfidReading> {
    // If no record exists, create a new record with the provided tags
    const newReading = new RfidReading();
    newReading.rfid_tags = tags;
    newReading.timestamp = new Date();
    return await this.rfidReadingRepository.save(newReading);
  }
}
