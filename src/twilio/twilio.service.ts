import { Injectable, Logger } from "@nestjs/common";
import twilio from "twilio";

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private readonly logger = new Logger(TwilioService.name);

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSms(to: string, body: string) {
    try {
      // ✅ Ensure number is in E.164 format
      if (!to.startsWith("+")) {
        to = `+91${to}`; // 👈 default India country code
      }

      const message = await this.client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER, // must be a verified Twilio number
        to,
      });

      this.logger.log('SMS sent to ${to}, SID: ${message.sid}');
      return message;
    } catch (error) {
      this.logger.error("Twilio sendSms error", error);
      throw error;
    }
  }
}