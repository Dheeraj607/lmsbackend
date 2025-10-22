import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagePricingSettings } from './package-pricing-settings.entity';
import { PackagePricingSettingsService } from './package-pricing-settings.service';
import { PackagePricingSettingsController } from './package-pricing-settings.controller';
import { PackagePricing } from '../package_pricing/package-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PackagePricingSettings, PackagePricing])],
  providers: [PackagePricingSettingsService],
  controllers: [PackagePricingSettingsController],
})
export class PackagePricingSettingsModule {}
