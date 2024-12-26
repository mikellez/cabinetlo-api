import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { UserImageService } from './user-image.service';
import { CreateUserImageDto } from './dto/create-user-image.dto';
import { UpdateUserImageDto } from './dto/update-user-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Response } from 'express';

@Controller('user-image')
export class UserImageController {
  constructor(private readonly userImageService: UserImageService) {}

  @Post()
  create(@Body() createUserImageDto: CreateUserImageDto) {
    return this.userImageService.create(createUserImageDto);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // You can also store additional metadata in your database, if required
    const savedImage = await this.userImageService.saveUserImage(
      file.fieldname,
      file.originalname,
      file.encoding,
      file.mimetype,
      file.buffer, // If you want to save the file as a buffer in DB
      file.size,
    );

    return savedImage;
  }

  @Get()
  findAll() {
    return this.userImageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userImageService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserImageDto: UpdateUserImageDto,
  ) {
    return this.userImageService.update(+id, updateUserImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userImageService.remove(+id);
  }

  @Get('download/:id')
  async downloadImage(@Param('id') id: string, @Res() res: Response) {
    const upload = await this.userImageService.findOne(+id);

    res.set('Content-Type', upload.mimetype);
    res.set('Content-Length', upload.buffer.length.toString()); // Optional: set the Content-Length if you know the size
    res.send(upload.buffer); // Send the image buffer as a response
  }
}
