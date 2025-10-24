import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { UserRole } from './user-role.entity';
import { Role } from './role.entity';
// import { Course } from 'src/course/entities/course.entity';
// import { Package } from 'src/packages/entities/package.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

 @Column()
name: string;


  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // password will be set after verification
  password: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true, length: 255 })
  verificationToken: string;

  

  // 🔹 OTP handling
  @Column({ type: 'varchar', nullable: true })
  otpHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @ManyToOne(() => Role, { eager: true })
  role: Role;

//   @OneToMany(() => Course, (course) => course.user)
//   courses: Course[];

//   @OneToMany(() => Package, (pkg) => pkg.user)
//   packages: Package[];
//   webinars: any;
}