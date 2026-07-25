import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OlfactoryFamily } from './olfactory-family.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  sku: string;

  @Index({ unique: true })
  @Column()
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', nullable: true })
  ean: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  promotionalPrice: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  costPrice: string | null;

  @Column({ type: 'timestamp', nullable: true })
  promotionStartsAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  promotionEndsAt: Date | null;

  @Index()
  @Column()
  brandId: string;

  @Index()
  @Column()
  categoryId: string;

  @Column({ type: 'numeric', nullable: true })
  volumeMl: string | null;

  @Column({ type: 'numeric', nullable: true })
  weightGrams: string | null;

  @Index()
  @Column({ type: 'enum', enum: OlfactoryFamily, nullable: true })
  olfactoryFamily: OlfactoryFamily | null;

  @Column({ type: 'text', array: true, nullable: true })
  notes: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  metaTitle: string | null;

  @Column({ type: 'text', nullable: true })
  metaDescription: string | null;

  @Index()
  @Column({ default: false })
  isFeatured: boolean;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
