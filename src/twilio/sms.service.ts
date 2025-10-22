import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private client: Twilio;

constructor(private configService: ConfigService) {
  const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
  const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
  const phoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !phoneNumber) {
    throw new Error('❌ Missing Twilio credentials in .env file');
  }

  this.client = new Twilio(accountSid, authToken);
}

  async sendOtp(phone: string, otp: string) {
    const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    return this.client.messages.create({
      body: `Your OTP is: ${otp}`,
      from,
      to: phone.startsWith('+') ? phone : `+91${phone}`,
    });
  }
}