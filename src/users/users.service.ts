// src/users/users.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { TwilioService } from 'src/twilio/twilio.service';
import { SmsService } from 'src/twilio/sms.service';

@Injectable()
export class UsersService {
  //smsService: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>, // optional
    private readonly twilioService: TwilioService,
       private readonly smsService: SmsService,
  ) {}

  // ✅ Create a new user with hashed password
async createUser(
  name: string,
  username: string,
  email: string,
  password: string,
  phone: string,
  dob: Date,
): Promise<User> {
  if (!password || password.trim().length === 0) {
    throw new BadRequestException('Password is required');
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const otpHash = await bcrypt.hash(otp, 10);

  const user = this.userRepo.create({
    name,
    username,
    email,
    password: hashedPassword,
    phone,
    dob,
    isVerified: false, // ❌ not verified until OTP check
    otpHash,
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
  });

  const savedUser = await this.userRepo.save(user);

  // send OTP to user’s phone (Step 2)
  await this.smsService.sendOtp(phone, otp);

  return savedUser;
}


  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  private generateOtp(length = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10).toString();
    return otp;
  }

  private generateUsername(name: string) {
    const base = name
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return '${base}.${suffix}';
  }

  async registerTeacher(dto: { name: string; username?: string; email: string; phone: string; dob?: string }) {
    const { name, username: maybeUsername, email, phone, dob } = dto;

    // check uniqueness
    const conflict = await this.userRepo.findOne({
      where: [{ email }, { phone }],
    });
    if (conflict) throw new BadRequestException('Email or phone already in use');

    // username: use provided or generate
    let username = maybeUsername || this.generateUsername(name);
    while (await this.userRepo.findOne({ where: { username } })) {
      username = this.generateUsername(name);
    }

    // create OTP
    const otp = this.generateOtp(6);
    const otpHash = await bcrypt.hash(otp, 10);
    const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 5);
    const otpExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // optional: set role if you have "teacher" role row
    const role = await this.roleRepo
      .findOne({ where: { role: 'teacher' } })
      .catch(() => null);

    // ✅ Correct usage of create
    const user = this.userRepo.create(<DeepPartial<User>>(<unknown>{
      name,
      username,
      email,
      password: null,
      phone,
      dob: dob ? new Date(dob) : null,
      isVerified: false,
      otpHash,
      otpExpiresAt,
      role,
    }));

    await this.userRepo.save(user);

    // send OTP
    await this.twilioService.sendSms(phone, 'Your verification code is ${otp}'

    );

    return { message: 'OTP sent', userId: user.id };
  }

  async resendOtp(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified) throw new BadRequestException('User already verified');

    const otp = this.generateOtp(6);
    user.otpHash = await bcrypt.hash(otp, 10);
    const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 5);
    user.otpExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await this.userRepo.save(user);

    await this.twilioService.sendSms(user.phone, 'Your verification code is ${otp}'

    );
    return { message: 'OTP resent' };
  }

async verifyOtp(email: string, otp: string) {
  const user = await this.userRepo.findOne({ where: { email} });
  if (!user || !user.otpHash) {
    throw new BadRequestException('Invalid request');
  }

  const isOtpValid = await bcrypt.compare(otp, user.otpHash);

  // ✅ Fix: Ensure otpExpiresAt is not null before comparing
  if (
    !isOtpValid ||
    !user.otpExpiresAt || // check for null
    user.otpExpiresAt.getTime() < Date.now()
  ) {
    throw new BadRequestException('OTP is invalid or expired');
  }

  user.isVerified = true;
  user.otpHash = null;
  user.otpExpiresAt = null;
  await this.userRepo.save(user);

  return { message: 'Account verified successfully' };
}


  async setPassword(userId: number, password: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.isVerified) {
      throw new BadRequestException('Phone not verified. Please verify phone before setting password.');
    }

    if (!password || password.trim().length === 0) {
      throw new BadRequestException('Password is required');
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await this.userRepo.save(user);

    return { message: 'Password set successfully' };
  }
}