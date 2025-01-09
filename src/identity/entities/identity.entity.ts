import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

//@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  embedding: string;

  @Column()
  fieldname: string;

  @Column()
  originalname: string;

  @Column()
  encoding: string;

  @Column()
  mimetype: string;

  @Column('bytea')
  buffer: Buffer;

  @Column()
  size: number;
}
