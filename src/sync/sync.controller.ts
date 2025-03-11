import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { SyncService } from './sync.service';
import {
  SyncSingleItemDto,
  SyncSingleResponseDto,
} from './dto/sync-single.dto';
import { FullSyncRequestDto, FullSyncResponseDto } from './dto/sync-full.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('single')
  async syncSingleItem(
    @Request() req,
    @Body() dto: SyncSingleItemDto,
  ): Promise<SyncSingleResponseDto> {
    return this.syncService.syncSingleItem(req.user.id, dto);
  }

  @Post()
  async fullSync(
    @Request() req,
    @Body() dto: FullSyncRequestDto,
  ): Promise<FullSyncResponseDto> {
    return this.syncService.fullSync(req.user.id, dto);
  }
}
