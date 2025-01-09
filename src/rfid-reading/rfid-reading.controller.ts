import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RfidReadingService } from './rfid-reading.service';
import { CreateRfidReadingDto } from './dto/create-rfid-reading.dto';
import { UpdateRfidReadingDto } from './dto/update-rfid-reading.dto';

@Controller('rfid-reading')
export class RfidReadingController {
  constructor(private readonly rfidReadingService: RfidReadingService) { }

  @Post()
  create(@Body() createRfidReadingDto: CreateRfidReadingDto) {
    return this.rfidReadingService.create(createRfidReadingDto);
  }

  @Post('rfid')
  updateInventory(@Body('tag') rawData: string) {
    // Split the data by line breaks
    const lines = rawData.split('\n');

    // Filter and clean valid tags
    const cleanTags = lines
      .map((line) => line.trim()) // Remove extra spaces and line breaks
      .filter((tag) => tag.startsWith('U3000')); // Keep only valid tags

    console.log('Cleaned RFID Tags:', cleanTags);

    // Example: Call the service to process the cleaned tags
    return this.rfidReadingService.saveRfidReading(cleanTags);

    return { tags: cleanTags }; // Return the cleaned tags as a response
  }

  @Get()
  findAll() {
    return this.rfidReadingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rfidReadingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRfidReadingDto: UpdateRfidReadingDto,
  ) {
    return this.rfidReadingService.update(+id, updateRfidReadingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rfidReadingService.remove(+id);
  }
}
