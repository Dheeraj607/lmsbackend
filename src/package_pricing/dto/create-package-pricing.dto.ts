import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePackagePricingDto {
  @IsInt()
  packageId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;
}
