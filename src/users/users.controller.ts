// src/users/users.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
   

  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user; // contains {userId, email, role}
  }

  
  @Post('create')
  async createUser(
    @Body()
    body: {
      name: string;
      username: string;
      email: string;
      password: string;
      phone: string;
      dob: string;
    },
  ) {
    return this.usersService.createUser(
      body.name,
      body.username,
      body.email,
      body.password,
      body.phone,
      new Date(body.dob),
    );
  }
   @Post('register-teacher')
  async registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.usersService.registerTeacher(dto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { userId: number }) {
    return this.usersService.resendOtp(body.userId);
  }

@Post('verify-otp')
async verifyOtp(@Body() body: { email: string; otp: string }) {
  return this.usersService.verifyOtp(body.email, body.otp);
}


  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.usersService.setPassword(dto.userId, dto.password);
  }
}