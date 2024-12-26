import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserImageModule } from './user-image/user-image.module';
import { IdentityModule } from './identity/identity.module';
import { Identity } from './identity/entities/identity.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'example_db',
      entities: [Identity],
      synchronize: false,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    UserImageModule,
    IdentityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
