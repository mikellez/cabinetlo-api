export class SyncItem {
  id: string;
  version: number;
  data: any;
  lastModified: Date;
  isDeleted?: boolean;
}

export class FullSyncRequestDto {
  items: SyncItem[];
  lastSyncTimestamp: Date;
}

export class FullSyncResponseDto {
  updatedItems: SyncItem[];
  deletedItemIds: string[];
  timestamp: Date;
  success: boolean;
  message?: string;
}
