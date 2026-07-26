import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from './order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDENTE })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: string;

  @Column({ type: 'varchar', nullable: true })
  couponCode: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  discountAmount: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
