import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { PackageStatus } from '../teacher-package.entity';

export class CreateTeacherPackageDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // status optional, default will be applied by entity
  @IsOptional()
  @IsIn([PackageStatus.ACTIVE, PackageStatus.INACTIVE])
  status?: PackageStatus;
}
