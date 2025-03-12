import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  entity_type: string;

  @Column()
  entity_id: string;

  @Column()
  detail: string;

  @Column()
  status: number;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('bigint', { nullable: true })
  created_at: number;
}
