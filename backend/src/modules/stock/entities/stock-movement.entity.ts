import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockMovementType } from './stock-movement-type.enum';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  productId: string;

  @Index()
  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  previousQuantity: number;

  @Column({ type: 'int' })
  newQuantity: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Index()
  @Column()
  actorId: string;

  @CreateDateColumn()
  createdAt: Date;
}
