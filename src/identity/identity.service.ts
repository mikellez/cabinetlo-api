import { Injectable } from '@nestjs/common';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private dataSource: DataSource,
  ) { }

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

  openLock() {
    const sshClient = new Client();
    const raspberryPiIp = '192.168.100.75'; // Replace with your Raspberry Pi's IP address
    const sshUsername = 'zuyao'; // The username for your Raspberry Pi (usually 'pi')

    // Path to your private key file (on your NestJS server)
    const privateKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa');

    return new Promise((resolve, reject) => {
      sshClient
        .on('ready', () => {
          const command = `gpioset gpiochip0 12=0`;

          // Execute the Python script remotely via SSH
          sshClient.exec(command, (err, stream) => {
            if (err) {
              reject(`SSH Command Error: ${err.message}`);
              return;
            }

            let output = '';
            let error = '';

            stream.on('data', (data) => {
              output += data.toString();
            });

            stream.on('stderr', (data) => {
              error += data.toString();
            });

            stream.on('close', (code) => {
              sshClient.end();
              if (code === 0) {
                resolve(output.trim());
              } else {
                reject(`Error: ${error}`);
              }
            });
          });
        })
        .connect({
          host: raspberryPiIp,
          port: 22,
          username: sshUsername,
          privateKey: fs.readFileSync(privateKeyPath), // Use the private key file
        });
    });
  }

  closeLock() {
    const sshClient = new Client();
    const raspberryPiIp = '192.168.100.75'; // Replace with your Raspberry Pi's IP address
    const sshUsername = 'zuyao'; // The username for your Raspberry Pi (usually 'pi')

    // Path to your private key file (on your NestJS server)
    const privateKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa');

    return new Promise((resolve, reject) => {
      sshClient
        .on('ready', () => {
          const command = `gpioset gpiochip0 12=1`;

          // Execute the Python script remotely via SSH
          sshClient.exec(command, (err, stream) => {
            if (err) {
              reject(`SSH Command Error: ${err.message}`);
              return;
            }

            let output = '';
            let error = '';

            stream.on('data', (data) => {
              output += data.toString();
            });

            stream.on('stderr', (data) => {
              error += data.toString();
            });

            stream.on('close', (code) => {
              sshClient.end();
              if (code === 0) {
                resolve(output.trim());
              } else {
                reject(`Error: ${error}`);
              }
            });
          });
        })
        .connect({
          host: raspberryPiIp,
          port: 22,
          username: sshUsername,
          privateKey: fs.readFileSync(privateKeyPath), // Use the private key file
        });
    });
  }
}
