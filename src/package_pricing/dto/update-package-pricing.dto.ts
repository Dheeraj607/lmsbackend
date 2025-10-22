import { PartialType } from '@nestjs/mapped-types';
import { CreatePackagePricingDto } from './create-package-pricing.dto';

export class UpdatePackagePricingDto extends PartialType(CreatePackagePricingDto) {}
