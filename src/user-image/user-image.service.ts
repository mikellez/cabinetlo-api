import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserImageDto } from './dto/create-user-image.dto';
import { UpdateUserImageDto } from './dto/update-user-image.dto';
import { Repository } from 'typeorm';
import { UserImage } from './entities/user-image.entity';

@Injectable()
export class UserImageService {
  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
  ) {}
  create(createUserImageDto: CreateUserImageDto) {
    return this.userImageRepository.save(createUserImageDto);
  }

  async saveUserImage(
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer,
    size: number,
  ): Promise<UserImage> {
    const userImage = new UserImage();
    userImage.fieldname = fieldname;
    userImage.originalname = originalname;
    userImage.encoding = encoding;
    userImage.mimetype = mimetype;
    userImage.buffer = buffer;
    userImage.size = size;

    return await this.userImageRepository.save(userImage);
  }

  findAll() {
    return this.userImageRepository.find();
  }

  findOne(id: number) {
    return this.userImageRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserImageDto: UpdateUserImageDto) {
    return this.userImageRepository.update(id, updateUserImageDto);
  }

  remove(id: number) {
    return this.userImageRepository.delete(id);
  }
}
