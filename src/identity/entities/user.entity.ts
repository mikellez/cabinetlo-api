import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SyncConflict } from '../../sync/entities/sync-conflict.entity';
import { InventoryItem } from '../../sync/entities/inventory-item.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SyncConflict, (syncConflict) => syncConflict.user)
  syncConflicts: SyncConflict[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.user)
  inventoryItems: InventoryItem[];
}
