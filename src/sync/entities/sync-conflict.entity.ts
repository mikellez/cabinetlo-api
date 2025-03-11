import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../identity/entities/user.entity';

@Entity()
export class SyncConflict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  itemId: string;

  @Column('jsonb')
  clientVersion: any;

  @Column('jsonb')
  serverVersion: any;

  @Column('int')
  clientVersionNumber: number;

  @Column('int')
  serverVersionNumber: number;

  @Column('bigint')
  timestamp: number;

  @Column({ default: false })
  resolved: boolean;

  @ManyToOne(() => User, (user) => user.syncConflicts)
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
