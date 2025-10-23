import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import Razorpay from 'razorpay';

import * as crypto from 'crypto';
import { randomBytes } from 'crypto';
import { PaymentRequests } from './entities/payment-request.entity';
import { InvoiceGenerator } from './invoice.generator';


//webhook payload interface
interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        description?: string;
        card?: {
          last4: string;
          network: string;
          type: string;
        };
        bank?: string | null;
        wallet?: string | null;
        vpa?: string | null;
        error_code?: string;
        error_description?: string;
        error_source?: string;
        error_step?: string;
        error_reason?: string;
      };
    };
    order?: {
      entity: {
        id: string;
      };
    };
  };
  created_at: number;
}

@Injectable()
export class PaymentRequestsService {
  private razorpay: Razorpay;
  paymentRepository: any;

  constructor(
    @InjectRepository(PaymentRequests)
    private paymentRequestsRepository: Repository<PaymentRequests>,
    private readonly invoiceGenerator: InvoiceGenerator,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }

  private async generateUniqueTransactionId(): Promise<string> {
    let transactionId: string = '';
    let isUnique = false;

    while (!isUnique) {
      transactionId = `TXN-${Date.now()}-${randomBytes(4).toString('hex')}`;

      // Check transaction_id already exists
      const existing = await this.paymentRequestsRepository.findOne({
        where: { transaction_id: transactionId },
      });

      //doesn't exist,then  unique
      if (!existing) {
        isUnique = true;
      }
    }

    return transactionId;
  }

  async createPaymentRequest(
    data: Partial<PaymentRequests>,
  ): Promise<PaymentRequests> {
    const newPaymentRequest = this.paymentRequestsRepository.create(data);
    return this.paymentRequestsRepository.save(newPaymentRequest);
  }

  async getOrder(transactionId: string): Promise<PaymentRequests> {
    const order = await this.paymentRequestsRepository.findOne({
      where: { transaction_id: transactionId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
  //create order
  async createOrder({
    amount,
    externalId,
    successUrl,
    failureUrl,
    gst,
    basicamount,
    purpose,
    vendor_name,
    vendor_address,
    vendor_email,
    vendor_contact_no,
    vendor_gst_no,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
  }: {
    amount: number;
    externalId: string;
    successUrl: string;
    failureUrl: string;
    gst: number;
    basicamount: number;
    purpose: string;
    vendor_name: string;
    vendor_address: string;
    vendor_email: string;
    vendor_contact_no: string;
    vendor_gst_no: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
  }) {
    const options = {
      amount: amount * 100,
      currency: 'INR',
      // receipt: externalId,
      payment_capture: 1,
    };

    try {
      console.log('Creating Razorpay order with options:', options);
      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay order created successfully:', order);
      const transactionId = await this.generateUniqueTransactionId();

      const paymentRequest = await this.createPaymentRequest({
        external_id: externalId,
        amount,
        gst,
        base_amount: basicamount,
        success_url: successUrl,
        failure_url: failureUrl,
        status: 'pending',
        razorpay_order_id: order.id,
        transaction_id: transactionId,
        purpose,
        vendor_name,
        vendor_address,
        vendor_email,
        vendor_contact_no,
        vendor_gst_no,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
      });

      return { order, paymentRequest };
    } catch (error: unknown) {
      console.error('Error creating Razorpay order:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error creating Razorpay order';
      throw new Error(`Error creating Razorpay order: ${errorMessage}`);
    }
  }

  //update user
  async updateCustomerDetails(
    transactionId: string,
    data: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      customer_address: string;
    },
  ): Promise<PaymentRequests> {
    const order = await this.getOrder(transactionId);
    Object.assign(order, data);
    return this.paymentRequestsRepository.save(order);
  }

  // New method to handle Razorpay webhook events
  // async handleWebhook(
  //   payload: RazorpayWebhookPayload,
  //   signature: string,
  // ): Promise<{ status: string; message: string }> {
  //   console.log('Webhook received with event:', payload.event);

  //   // Verify webhook signature
  //   const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  //   if (!webhookSecret) {
  //     throw new Error('RAZORPAY_WEBHOOK_SECRET is missing');
  //   }

  //   // Convert payload to string for verification
  //   const payloadString = JSON.stringify(payload);
  //   const expectedSignature = crypto
  //     .createHmac('sha256', webhookSecret)
  //     .update(payloadString)
  //     .digest('hex');

  //   if (expectedSignature !== signature) {
  //     console.error('Invalid webhook signature');
  //     throw new Error('Invalid webhook signature');
  //   }

  //   // Handle webhook events
  //   switch (payload.event) {
  //     case 'payment.failed':
  //       return await this.handlePaymentFailed(payload);
  //     case 'payment.captured':
  //       return await this.handlePaymentSuccessful(payload);
  //     default:
  //       console.log('Unhandled webhook event:', payload.event);
  //       return { status: 'ignored', message: 'Event type not handled' };
  //   }
  // }

async handleWebhook(
    rawBody: Buffer | string,
    signature: string,
  ): Promise<{ status: string; message: string }> {
    console.log('Webhook received (service)');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is missing');
    }

    // Ensure we have a Buffer for HMAC computation
    const bodyBuffer = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(String(rawBody), 'utf8');

    // Compute expected signature (hex)
    const generatedHex = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyBuffer)
      .digest('hex');

    // Clean header signature: trim & remove optional "sha256=" prefix
    const headerSig = String(signature || '').trim().replace(/^sha256=/i, '');

    // Debug logs (remove in production)
    console.log('Service: generatedHex:', generatedHex);
    console.log('Service: headerSig:', headerSig);
    console.log('Service: bodyBuffer.length:', bodyBuffer.length);

    // Convert hex -> raw bytes for timingSafeEqual
    let a: Buffer;
    let b: Buffer;
    try {
      a = Buffer.from(generatedHex, 'hex');
      b = Buffer.from(headerSig, 'hex');
    } catch (err) {
      console.error('Failed to convert signature hex -> Buffer', err);
      throw new Error('Invalid signature format');
    }

    if (a.length !== b.length) {
      console.error(
        `Signature byte-length mismatch: generated=${a.length} received=${b.length}`,
      );
      throw new Error('Invalid webhook signature');
    }

    const match = crypto.timingSafeEqual(a, b);
    if (!match) {
      console.error('Signatures did not match (timingSafeEqual)');
      throw new Error('Invalid webhook signature');
    }

    // Verified — parse payload now
    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(bodyBuffer.toString('utf8'));
    } catch (err) {
      console.error('Failed to parse webhook JSON payload', err);
      throw new Error('Invalid webhook payload');
    }

    console.log('Webhook received with event:', payload.event);

    // Existing handling logic (keeps your previous behavior)
    switch (payload.event) {
      case 'payment.failed':
        return await this.handlePaymentFailed(payload);
      case 'payment.captured':
      case 'payment.authorized': // if you handle other events, include them
        return await this.handlePaymentSuccessful(payload);
      default:
        console.log('Unhandled webhook event:', payload.event);
        return { status: 'ignored', message: 'Event type not handled' };
    }
  }

  private async handlePaymentSuccessful(
    payload: RazorpayWebhookPayload,
  ): Promise<{ status: string; message: string }> {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;

    const paymentRequest = await this.paymentRequestsRepository.findOne({
      where: { razorpay_order_id: orderId },
    });

    if (!paymentRequest) {
      console.error('Payment request not found for order ID:', orderId);
      return { status: 'error', message: 'Payment request not found' };
    }

    // Update payment request with successful payment details
    paymentRequest.status = 'successful';
    paymentRequest.razorpay_payment_id = payment.id;
    paymentRequest.payment_method = payment.method;
    paymentRequest.failure_reason = '';

    if (payment.card) {
      paymentRequest.card_last4 = payment.card.last4;
      paymentRequest.card_network = payment.card.network;
      paymentRequest.card_type = payment.card.type;
    }
    //nll
    // if (payment.bank) {
    //   paymentRequest.bank = payment.bank;
    // }
    // if (payment.wallet) {
    //   paymentRequest.wallet = payment.wallet;
    // }
    // if (payment.vpa) {
    //   paymentRequest.upi_vpa = payment.vpa;
    // }

    paymentRequest.bank = payment.bank ?? '';
    paymentRequest.wallet = payment.wallet ?? '';
    paymentRequest.upi_vpa = payment.vpa ?? '';
    paymentRequest.payment_date = new Date(payload.created_at * 1000);
    // Generate unique invoice no.
    const invoiceNo = await this.generateUniqueInvoiceNo();

    paymentRequest.invoice_no = invoiceNo;
    //save pdf
    const invoicePDF =
      await this.invoiceGenerator.generateInvoicePDF(paymentRequest);
    paymentRequest.invoice_pdf = invoicePDF;
    await this.paymentRequestsRepository.save(paymentRequest);

    await this.paymentRequestsRepository.save(paymentRequest);

    return {
      status: 'success',
      message: 'Payment successful status and invoice number updated',
    };
  }
  private getFiscalYearBase(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYearShort = (currentYear + 1).toString().slice(-2);
    return `${currentYear.toString().slice(-2)}${nextYearShort}`; // example: "2526"
  }

  private async generateUniqueInvoiceNo(): Promise<string> {
    const base = this.getFiscalYearBase(); // Example: "2526"

    const latestInvoice = await this.paymentRequestsRepository.findOne({
      where: { invoice_no: Like(`${base}/%`) },
      order: { invoice_no: 'DESC' },
    });

    let nextSuffix = 'a';
    let nextSerial = 1;

    if (latestInvoice) {
      const latest = latestInvoice.invoice_no; // "2526/a045"
      const parts = latest.split('/');
      const code = parts[1]; // "a045"

      const match = code.match(/^([a-z]+)(\d{3})$/);
      if (match) {
        const [, suffix, serialStr] = match;
        const serial = parseInt(serialStr);

        if (serial < 999) {
          nextSuffix = suffix;
          nextSerial = serial + 1;
        } else {
          nextSuffix = this.incrementSuffix(suffix);
          nextSerial = 1;
        }
      }
    }

    // Verify uniqueness and increment if needed
    while (true) {
      const serialFormatted = nextSerial.toString().padStart(3, '0');
      const invoiceNo = `${base}/${nextSuffix}${serialFormatted}`;

      const exists = await this.paymentRequestsRepository.findOne({
        where: { invoice_no: invoiceNo },
      });

      if (!exists) {
        return invoiceNo;
      }

      if (nextSerial < 999) {
        nextSerial++;
      } else {
        nextSerial = 1;
        nextSuffix = this.incrementSuffix(nextSuffix);
      }
    }
  }

  private incrementSuffix(suffix: string): string {
    const chars = suffix.split('');
    let i = chars.length - 1;

    while (i >= 0) {
      if (chars[i] !== 'z') {
        chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
        return chars.join('');
      } else {
        chars[i] = 'a';
        i--;
      }
    }

    return 'a' + chars.join('');
  }

  private async handlePaymentFailed(
    payload: RazorpayWebhookPayload,
  ): Promise<{ status: string; message: string }> {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;

    const paymentRequest = await this.paymentRequestsRepository.findOne({
      where: { razorpay_order_id: orderId },
    });

    if (!paymentRequest) {
      console.error('Payment request not found for order ID:', orderId);
      return { status: 'error', message: 'Payment request not found' };
    }

    // Update payment request with failure details
    paymentRequest.status = 'failed';
    paymentRequest.razorpay_payment_id = payment.id;

    // Compile failure reason from available error information
    const failureReason =
      payment.error_description ||
      payment.error_reason ||
      payment.description ||
      'Payment failed';
    paymentRequest.payment_date = new Date(payload.created_at * 1000);

    paymentRequest.failure_reason = failureReason;

    await this.paymentRequestsRepository.save(paymentRequest);

    return {
      status: 'success',
      message: 'Payment failed status updated',
    };
  }

  async findByTransactionId(transaction_id: string): Promise<PaymentRequests> {
    const paymentRequest = await this.paymentRequestsRepository.findOne({
      where: { transaction_id: transaction_id, status: 'pending' },
    });

    if (!paymentRequest) {
      throw new Error(
        `Payment request with transaction ID ${transaction_id} not found.`,
      );
    }
    if (!paymentRequest.razorpay_order_id) {
      throw new Error('Razorpay Order ID is missing.');
    }

    return paymentRequest;
  }


  //5/03/25
  // async getPaymentDetails(transaction_id: string): Promise<any> {
  //   const paymentRequest = await this.paymentRequestsRepository.findOne({
  //     where: { transaction_id: transaction_id },
  //   });

  //   if (!paymentRequest) {
  //     throw new Error(
  //       `Payment request with transaction ID ${transaction_id} not found`,
  //     );
  //   }

  //   if (paymentRequest.status === 'successful') {
  //     return {
  //       transaction_id: paymentRequest.transaction_id,
  //       external_id: paymentRequest.external_id,
  //       status: paymentRequest.status,
  //       amount: paymentRequest.amount,
  //       payment_method: paymentRequest.payment_method || null,
  //       card_last4: paymentRequest.card_last4 || null,
  //       card_network: paymentRequest.card_network || null,
  //       bank: paymentRequest.bank || null,
  //       wallet: paymentRequest.wallet || null,
  //       upi_vpa: paymentRequest.upi_vpa || null,
  //     };
  //   } else if (paymentRequest.status === 'failed') {
  //     return {
  //       transaction_id: paymentRequest.transaction_id,
  //       external_id: paymentRequest.external_id,
  //       status: paymentRequest.status,
  //       failure_reason:
  //         paymentRequest.failure_reason || 'Unknown failure reason',
  //     };
  //   } else {
  //     return {
  //       external_id: paymentRequest.external_id,
  //       status: paymentRequest.status,
  //     };
  //   }
  // }
  //5/3/25
  //invoice
  // async getInvoice(transaction_id: string): Promise<any> {
  //   const paymentRequest = await this.paymentRequestsRepository.findOne({
  //     where: { transaction_id: transaction_id },
  //   });

  //   if (!paymentRequest) {
  //     throw new Error(
  //       `Payment request with transaction ID ${transaction_id} not found`,
  //     );
  //   }
  //   if (paymentRequest.status === 'successful') {
  //     return {
  //       amount: paymentRequest.amount || null,
  //       base_amount: paymentRequest.base_amount || null,
  //       customer_address: paymentRequest.customer_address || null,
  //       customer_email: paymentRequest.customer_email || null,
  //       customer_name: paymentRequest.customer_name || null,
  //       customer_phone: paymentRequest.customer_phone || null,
  //       external_id: paymentRequest.external_id || null,
  //       gst: paymentRequest.gst || null,
  //       invoice_no: paymentRequest.invoice_no || null,
  //       purpose: paymentRequest.purpose || null,
  //       razorpay_order_id: paymentRequest.razorpay_order_id || null,
  //       status: paymentRequest.status || null,
  //       transaction_id: paymentRequest.transaction_id || null,
  //       vendor_address: paymentRequest.vendor_address || null,
  //       vendor_contact_no: paymentRequest.vendor_contact_no || null,
  //       vendor_email: paymentRequest.vendor_email || null,
  //       vendor_gst_no: paymentRequest.vendor_gst_no || null,
  //       vendor_name: paymentRequest.vendor_name || null,
  //       payment_date: paymentRequest.payment_date,
  //     };
  //   } else {
  //     return 'error to get invoice details';
  //   }
  // }
  //newc
  async generateInvoicePDF(transaction_id: string): Promise<Buffer> {
    const paymentRequest = await this.paymentRequestsRepository.findOne({
      where: { transaction_id: transaction_id },
    });

    if (!paymentRequest) {
      throw new Error(
        `Payment request with transaction ID ${transaction_id} not found`,
      );
    }

    if (paymentRequest.status !== 'successful') {
      throw new Error(
        `Cannot generate invoice for payment that is not successful.`,
      );
    }

    return this.invoiceGenerator.generateInvoicePDF(paymentRequest);
  }
  //get saved pdf
  async sendInvoicePDF(transaction_id: string): Promise<Buffer> {
    const paymentRequest = await this.paymentRequestsRepository.findOne({
      where: { transaction_id },
    });

    if (!paymentRequest) {
      throw new Error(
        `Payment request with transaction ID ${transaction_id} not found`,
      );
    }

    if (!paymentRequest.invoice_pdf) {
      throw new Error(`Invoice PDF not found for this payment.`);
    }

    return paymentRequest.invoice_pdf;
  }
}
