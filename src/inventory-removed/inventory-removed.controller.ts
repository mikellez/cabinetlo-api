import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InventoryRemovedService } from './inventory-removed.service';
import { CreateInventoryRemovedDto } from './dto/create-inventory-removed.dto';
import { UpdateInventoryRemovedDto } from './dto/update-inventory-removed.dto';

@Controller('inventory')
export class InventoryRemovedController {
  constructor(private readonly inventoryService: InventoryRemovedService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryRemovedDto) {
    return this.inventoryService.create(createInventoryDto);
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
    return this.inventoryService.updateInventory(cleanTags);

    return { tags: cleanTags }; // Return the cleaned tags as a response
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryRemovedDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
