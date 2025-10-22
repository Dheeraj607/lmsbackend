import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagePricing } from './package-pricing.entity';
import { TeacherPackage } from '../teacher-packages/teacher-package.entity';
import { PackagePricingService } from './package-pricing.service';
import { PackagePricingController } from './package-pricing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PackagePricing, TeacherPackage])],
  providers: [PackagePricingService],
  controllers: [PackagePricingController],
})
export class PackagePricingModule {}
