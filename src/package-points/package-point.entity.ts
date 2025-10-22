import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TeacherPackage } from '../teacher-packages/teacher-package.entity';

@Entity('package_points')
export class PackagePoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  point: string; // description of the point

  @Column({ name: 'package_id' })
  packageId: number; // store only the foreign key

  // Optional: still link to TeacherPackage entity for relational queries
  @ManyToOne(() => TeacherPackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package?: TeacherPackage;
}
