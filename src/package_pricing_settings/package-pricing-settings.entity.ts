import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PackagePricing } from '../package_pricing/package-pricing.entity';

@Entity('package_pricing_settings')
export class PackagePricingSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_pricing_id' })
  packagePricingId: number;

  @ManyToOne(() => PackagePricing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_pricing_id' })
  packagePricing?: PackagePricing;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  specialPrice?: number;

  @Column({ type: 'date' })
  fromDate: string;

  @Column({ type: 'date' })
  toDate: string;
}
