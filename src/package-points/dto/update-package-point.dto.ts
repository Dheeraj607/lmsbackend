import { PartialType } from '@nestjs/mapped-types';
import { CreatePackagePointDto } from './create-package-point.dto';

export class UpdatePackagePointDto extends PartialType(CreatePackagePointDto) {}
