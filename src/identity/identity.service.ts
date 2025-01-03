import { Injectable } from '@nestjs/common';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import pgvector from 'pgvector';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private dataSource: DataSource,
  ) {}

  create(createIdentityDto: CreateIdentityDto) {
    return this.identityRepository.save(createIdentityDto);
  }

  async saveUserImage(
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer,
    size: number,
    embedding: any,
  ): Promise<Identity> {
    const identity = new Identity();
    identity.fieldname = fieldname;
    identity.originalname = originalname;
    identity.encoding = encoding;
    identity.mimetype = mimetype;
    identity.buffer = buffer;
    identity.size = size;
    identity.embedding = JSON.stringify(Object.values(embedding));

    console.log('formattedEmbedding: ', embedding);

    return await this.identityRepository.save(identity);
  }

  async verifyUserImage(embedding: string | number[]) {
    console.log('embedding: ', embedding);
    const threshold = 10;
    console.log(typeof embedding);
    const embeddingVector = JSON.stringify(Object.values(embedding));

    console.log('embeddingVector', embeddingVector);

    const query = `SELECT *
        FROM (
            SELECT i.*, embedding <-> $2::vector as distance
            FROM identity i
        ) a
        WHERE distance < $1
        ORDER BY distance asc
        LIMIT 100`;
    const result = await this.identityRepository.query(query, [
      threshold,
      embeddingVector,
    ]);

    return result;
  }

  findAll() {
    return this.identityRepository.find();
  }

  findOne(id: number) {
    return this.identityRepository.findOne({ where: { id } });
  }

  update(id: number, updateIdentityDto: UpdateIdentityDto) {
    return this.identityRepository.update(id, updateIdentityDto);
  }

  remove(id: number) {
    return this.identityRepository.delete(id);
  }
}
