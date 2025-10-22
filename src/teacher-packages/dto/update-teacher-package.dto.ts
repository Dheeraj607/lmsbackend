import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherPackageDto } from './create-teacher-package.dto';

export class UpdateTeacherPackageDto extends PartialType(CreateTeacherPackageDto) {}
