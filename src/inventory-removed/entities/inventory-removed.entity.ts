import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InventoryStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}

@Entity()
export class InventoryRemoved {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'bigint', nullable: true })
  lastSeen: number;

  /*@Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ length: 255, unique: true })
  rfid_tag: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 255 })
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.AVAILABLE,
  })
  status: InventoryStatus;
  */
}
