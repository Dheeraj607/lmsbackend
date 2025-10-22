import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { SmsService } from './sms.service';

@Module({
    
  providers: [TwilioService,SmsService],
   exports: [TwilioService,SmsService],
  controllers: [TwilioController]
})
export class TwilioModule {}