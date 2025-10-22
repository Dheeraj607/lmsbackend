import { PartialType } from '@nestjs/mapped-types';
import { CreatePackagePricingSettingsDto } from './create-package-pricing-settings.dto';

export class UpdatePackagePricingSettingsDto extends PartialType(CreatePackagePricingSettingsDto) {}
