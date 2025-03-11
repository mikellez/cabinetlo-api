import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityDto } from './dto/update-identity.dto';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
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

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async createRefreshToken(userId: number): Promise<string> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const token = uuidv4();
    await this.refreshTokenRepository.save({
      token,
      userId,
      expiresAt,
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!token || token.expiresAt < new Date() || !token.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { sub: token.user.id, email: token.user.email };
    const newAccessToken = await this.jwtService.signAsync(payload);

    return {
      token: newAccessToken,
      user: {
        id: token.user.id,
        email: token.user.email,
        firstName: token.user.firstName,
        lastName: token.user.lastName,
      },
    };
  }

  async revokeRefreshToken(token: string) {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    await this.passwordResetRepository.save({
      token,
      userId: user.id,
      expiresAt,
    });

    // TODO: Send email with reset link
    return { message: 'Password reset instructions sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.passwordResetRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!resetToken || resetToken.expiresAt < new Date() || !resetToken.user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(resetToken.userId, {
      password: hashedPassword,
    });

    await this.passwordResetRepository.update(resetToken.id, { isUsed: true });

    return { message: 'Password successfully reset' };
  }

  async updateProfile(userId: number, updateData: Partial<User>) {
    const { password, ...safeUpdateData } = updateData;
    await this.userRepository.update(userId, safeUpdateData);
    return this.findUserById(userId);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Password successfully changed' };
  }
}
