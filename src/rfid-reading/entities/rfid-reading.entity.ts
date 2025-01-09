import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RfidReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true })
  rfid_tags: string[];

  @Column({ type: 'timestamp' })
  timestamp: Date;
}
