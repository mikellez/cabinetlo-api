import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  product_id: string;

  @Column()
  epc_number: string;

  @Column()
  expiry_date: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updated_at: number;
}
