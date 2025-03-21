import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CabinetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tag_id: string;

  @Column()
  tag_name: string;

  @Column()
  status: number;

  @Column('bigint', { nullable: true })
  last_seen: number;
}
