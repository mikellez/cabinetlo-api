import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ConfigService } from '@nestjs/config';

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly configService: ConfigService,
  ) { }

  @Post()
  create(@Body() createIdentityDto: CreateIdentityDto) {
    return this.identityService.create(createIdentityDto);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Define the folder path where the image will be saved
    const uploadPath = path.join(__dirname, '..', '..', 'uploads'); // Adjust the path as needed
    const fileName = `${Date.now()}_${file.originalname}`; // Generate a unique file name based on timestamp

    // Create the folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Save the file to the specified folder
    const filePath = path.join(uploadPath, fileName);
    fs.writeFileSync(filePath, file.buffer);

    console.log('File saved to:', filePath);

    try {
      const response = await axios.post(
        `${this.configService.get('DEEPFACE_API_URL')}/represent`,
        {
          model_name: 'Facenet',
          img: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          //img: `${filePath}`,
        },
      );

      console.log('response: ', response.data.results[0].embedding[0]);

      //console.log('response: ', response.data.results[0].embedding.join(' '));

      // You can also store additional metadata in your database, if required
      const savedImage = await this.identityService.saveUserImage(
        file.fieldname,
        file.originalname,
        file.encoding,
        file.mimetype,
        file.buffer,
        file.size,
        response.data.results[0].embedding,
      );
      return savedImage;
    } catch (error) {
      console.log(error);
    }
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('image'))
  async verify(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    try {
      const response = await axios.post(
        `${this.configService.get('DEEPFACE_API_URL')}/represent`,
        {
          model_name: 'Facenet',
          img: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        },
      );
      console.log('response: ', response.data.results[0].embedding);

      const identity = await this.identityService.verifyUserImage(
        response.data.results[0].embedding,
      );

      console.log('identity', identity.length);

      if (identity.length <= 0) throw new NotFoundException();

      return identity;
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  findAll() {
    return this.identityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.identityService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIdentityDto: UpdateIdentityDto,
  ) {
    return this.identityService.update(+id, updateIdentityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.identityService.remove(+id);
  }
}
