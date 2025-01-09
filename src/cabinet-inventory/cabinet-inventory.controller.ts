import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CabinetInventoryService } from './cabinet-inventory.service';
import { CreateCabinetInventoryDto } from './dto/create-cabinet-inventory.dto';
import { UpdateCabinetInventoryDto } from './dto/update-cabinet-inventory.dto';

@Controller('cabinet-inventory')
export class CabinetInventoryController {
  constructor(
    private readonly cabinetInventoryService: CabinetInventoryService,
  ) { }

  @Post()
  create(@Body() createCabinetInventoryDto: CreateCabinetInventoryDto) {
    return this.cabinetInventoryService.create(createCabinetInventoryDto);
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
    return this.cabinetInventoryService.updateInventory(cleanTags);

    return { tags: cleanTags }; // Return the cleaned tags as a response
  }

  @Get()
  findAll() {
    return this.cabinetInventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cabinetInventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCabinetInventoryDto: UpdateCabinetInventoryDto,
  ) {
    return this.cabinetInventoryService.update(+id, updateCabinetInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cabinetInventoryService.remove(+id);
  }
}
