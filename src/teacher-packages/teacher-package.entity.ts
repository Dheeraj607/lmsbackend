import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('teacher_packages')
export class TeacherPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // store just the filename in DB
  @Column({ name: 'image_name', nullable: true })
  imageName: string;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.ACTIVE,
  })
  status: PackageStatus;
}
