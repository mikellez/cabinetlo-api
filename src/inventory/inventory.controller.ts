import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
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
    // return this.inventoryService.updateInventory(cleanTags);

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
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
