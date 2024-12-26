import { Module } from '@nestjs/common';
import { UserImageService } from './user-image.service';
import { UserImageController } from './user-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserImage } from './entities/user-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserImage])],
  exports: [UserImageService],
  controllers: [UserImageController],
  providers: [UserImageService],
})
export class UserImageModule {}
