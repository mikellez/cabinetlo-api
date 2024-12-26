import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fieldname: string;

  @Column()
  originalname: string;

  @Column()
  encoding: string;

  @Column()
  mimetype: string;

  @Column('longblob')
  buffer: Buffer;

  @Column()
  size: number;
}
