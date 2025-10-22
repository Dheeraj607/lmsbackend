import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class RegisterTeacherDto {
  @IsNotEmpty() name: string;
  @IsOptional() username?: string; // we will auto-generate if not provided
  @IsEmail() email: string;
  @IsNotEmpty() phone: string;
  @IsOptional() dob?: string; // ISO date string
}