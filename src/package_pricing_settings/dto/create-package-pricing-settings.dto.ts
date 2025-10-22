import { IsInt, IsOptional, IsNumber, Min, IsDateString, ValidateIf } from 'class-validator';

export class CreatePackagePricingSettingsDto {
  @IsInt()
  packagePricingId: number;

  @ValidateIf(o => o.discount !== undefined)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ValidateIf(o => o.specialPrice !== undefined)
  @IsNumber()
  @Min(0)
  @IsOptional()
  specialPrice?: number;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;
}
