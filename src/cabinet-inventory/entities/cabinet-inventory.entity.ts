import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CabinetInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rfid_tag: string;

  @Column()
  quantity: number;
}
