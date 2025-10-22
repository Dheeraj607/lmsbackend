import { IsNotEmpty, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty() userId: number;
  @IsNotEmpty() @MinLength(6) password: string;
}