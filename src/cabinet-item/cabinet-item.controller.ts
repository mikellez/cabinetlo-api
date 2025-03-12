import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CabinetItemService } from './cabinet-item.service';
import { CreateCabinetItemDto } from './dto/create-cabinet-item.dto';
import { UpdateCabinetItemDto } from './dto/update-cabinet-item.dto';

@Controller('cabinet-item')
export class CabinetItemController {
  constructor(private readonly cabinetItemService: CabinetItemService) {}

  @Post()
  create(@Body() createCabinetItemDto: CreateCabinetItemDto) {
    return this.cabinetItemService.create(createCabinetItemDto);
  }

  @Get()
  findAll() {
    return this.cabinetItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cabinetItemService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCabinetItemDto: UpdateCabinetItemDto,
  ) {
    return this.cabinetItemService.update(id, updateCabinetItemDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cabinetItemService.remove(+id);
  }
}
