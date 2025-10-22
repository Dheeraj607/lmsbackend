import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TeacherPackage } from '../teacher-packages/teacher-package.entity';

@Entity('package_pricing')
export class PackagePricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate: number;

  @Column({ name: 'package_id' })
  packageId: number;

  @ManyToOne(() => TeacherPackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package?: TeacherPackage;
}
