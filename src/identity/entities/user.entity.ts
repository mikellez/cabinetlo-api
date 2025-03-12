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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SyncConflict, (syncConflict) => syncConflict.user)
  sync_conflicts: SyncConflict[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.user)
  inventory_items: InventoryItem[];
}
