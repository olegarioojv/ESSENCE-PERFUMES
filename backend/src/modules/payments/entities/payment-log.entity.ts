import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payment_logs')
export class PaymentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  paymentId: string;

  @Column()
  event: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
