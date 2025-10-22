import { IsNotEmpty, IsString, IsInt, IsArray, ValidateIf } from 'class-validator';

export class CreatePackagePointDto {
  @IsInt()
  packageId: number;

  // If `point` is provided as a single string
  @ValidateIf((o) => o.point !== undefined)
  @IsNotEmpty()
  @IsString()
  point?: string;

  // If `points` is provided as an array of strings
  @ValidateIf((o) => o.points !== undefined)
  @IsArray()
  @IsString({ each: true })
  points?: string[];
}
