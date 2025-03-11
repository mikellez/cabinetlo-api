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
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdentityService } from './identity.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createIdentityDto: CreateIdentityDto) {
    return this.identityService.create(createIdentityDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.identityService.register(registerDto);
  }

  @Post('register_legacy')
  @UseInterceptors(FileInterceptor('image'))
  async registerLegacy(@UploadedFile() file: Express.Multer.File) {
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
          anti_spoofing: true,
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
      if (error.response && error.response.data && error.response.data.error) {
        // If the error is from Python with a spoof detection message
        throw new HttpException(
          `Spoof detected in the given image.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Handle generic errors
      throw new HttpException(
        `Error occurred: ${error.response ? error.response.data : error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.identityService.login(loginDto);
    const refreshToken = await this.identityService.createRefreshToken(user.id);
    return { token, refreshToken, user };
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
          anti_spoofing: true,
        },
      );
      console.log('response: ', response.data.results[0].embedding);

      const identity = await this.identityService.verifyUserImage(
        response.data.results[0].embedding,
      );

      console.log('identity', identity.length);

      if (identity.length <= 0) throw new NotFoundException();

      //this.identityService.openLock();

      //TODO: open magnetic lock

      return identity;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        // If the error is from Python with a spoof detection message
        throw new HttpException(
          `Spoof detected in the given image.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Handle generic errors
      throw new HttpException(
        `Error occurred: ${error.response ? error.response.data : error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.identityService.findAll();
  }

  @Get('open-lock')
  openLock() {
    return this.identityService.openLock();
  }

  @Get('close-lock')
  closeLock() {
    return this.identityService.closeLock();
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

  @Get('download/:id')
  async downloadImage(@Param('id') id: string, @Res() res: Response) {
    const upload = await this.identityService.findOne(+id);
    console.log('upload', upload);

    res.set('Content-Type', upload.mimetype);
    res.set('Content-Length', upload.buffer.length.toString()); // Optional: set the Content-Length if you know the size
    res.send(upload.buffer); // Send the image buffer as a response
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.identityService.refreshAccessToken(refreshToken);
  }

  @Post('revoke-token')
  @UseGuards(JwtAuthGuard)
  async revokeToken(@Body('refreshToken') refreshToken: string) {
    await this.identityService.revokeRefreshToken(refreshToken);
    return { message: 'Token revoked successfully' };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.identityService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.identityService.resetPassword(token, newPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.identityService.findUserById(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.identityService.updateProfile(req.user.id, updateData);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.identityService.changePassword(
      req.user.id,
      oldPassword,
      newPassword,
    );
  }
}
