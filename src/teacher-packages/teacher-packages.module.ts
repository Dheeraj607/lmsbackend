import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherPackage } from './teacher-package.entity';
import { TeacherPackagesService } from './teacher-packages.service';
import { TeacherPackagesController } from './teacher-packages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherPackage])],
  providers: [TeacherPackagesService],
  controllers: [TeacherPackagesController],
})
export class TeacherPackagesModule {}
