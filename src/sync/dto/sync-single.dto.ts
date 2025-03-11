export class SyncSingleItemDto {
  id: string;
  version: number;
  data: any;
  lastModified: Date;
  isDeleted?: boolean;
}

export class SyncSingleResponseDto {
  success: boolean;
  currentVersion?: number;
  conflictingData?: any;
  message?: string;
}
