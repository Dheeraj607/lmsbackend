import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagePoint } from './package-point.entity';
import { TeacherPackage } from '../teacher-packages/teacher-package.entity';
import { PackagePointsService } from './package-points.service';
import { PackagePointsController } from './package-points.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PackagePoint, TeacherPackage])],
  providers: [PackagePointsService],
  controllers: [PackagePointsController],
})
export class PackagePointsModule {}
