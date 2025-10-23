import * as common from '@nestjs/common';
import { Request } from 'express';
import { PaymentRequestsService } from './payment-requests.service';
// import { Response as ExpressResponse } from 'express';
import type { Response } from 'express';
import * as crypto from 'crypto';



@common.Controller('payment-requests')
export class PaymentRequestsController {
  constructor(
    private readonly paymentRequestsService: PaymentRequestsService,
  ) {}
  @common.Post('order')
  async createOrder(
    @common.Body()
    body: {
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
    },
  ) {
    return this.paymentRequestsService.createOrder({
      amount: body.amount,
      externalId: body.externalId,
      successUrl: body.successUrl,
      failureUrl: body.failureUrl,
      gst: body.gst,
      basicamount: body.basicamount,
      purpose: body.purpose,
      vendor_name: body.vendor_name,
      vendor_address: body.vendor_address,
      vendor_email: body.vendor_email,
      vendor_contact_no: body.vendor_contact_no,
      vendor_gst_no: body.vendor_gst_no,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      customer_address: body.customer_address,
    });
  }
  //
  @common.Get('order/:transactionId')
  async getOrder(@common.Param('transactionId') transactionId: string) {
    return this.paymentRequestsService.getOrder(transactionId);
  }

  @common.Patch('order/:transactionId')
  async updateCustomerDetails(
    @common.Param('transactionId') transactionId: string,
    @common.Body()
    body: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      customer_address: string;
    },
  ) {
    return this.paymentRequestsService.updateCustomerDetails(
      transactionId,
      body,
    );
  }

  // //Razorpay Webhook
  // @common.Post('webhook')
  // async handleWebhook(
  //   @common.Req() request: common.RawBodyRequest<Request>,
  //   @common.Headers('x-razorpay-signature') signature: string,
  //   @common.Body() webhookPayload: any,
  // ) {
  //   console.log('Webhook received from Razorpay');

  //   if (!signature) {
  //     throw new common.HttpException(
  //       'Missing Razorpay signature header',
  //       common.HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   try {
  //     const result = await this.paymentRequestsService.handleWebhook(
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //       webhookPayload,
  //       signature,
  //     );
  //     return result;
  //   } catch (error) {
  //     console.error('Error processing webhook:', error);
  //     throw new common.HttpException(
  //       error instanceof Error ? error.message : 'Failed to process webhook',
  //       common.HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }



    @common.Post('webhook')
  async handleWebhook(
    @common.Req() request: common.RawBodyRequest<Request>,
    @common.Headers('x-razorpay-signature') signature: string,
    @common.Body() webhookPayload: any,
  ) {
    console.log('Webhook received from Razorpay');

    if (!signature) {
      throw new common.HttpException(
        'Missing Razorpay signature header',
        common.HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Prefer rawBody (Buffer) captured in main.ts; fallback to JSON string
      const rawBody = (request as any).rawBody;
      const rawBodyForHmac =
        rawBody !== undefined && rawBody !== null
          ? rawBody
          : // fallback (less ideal): compute signature from exact stringified body
            Buffer.from(JSON.stringify(webhookPayload), 'utf8');

      // Ensure secret exists
      const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpaySecret) {
        throw new Error('RAZORPAY_KEY_SECRET is not set in environment variables');
      }

      // Generate signature for logging (HMAC over Buffer or string)
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(rawBodyForHmac)
        .digest('hex');

      console.log('Received signature:', signature);
      console.log('Generated signature:', generatedSignature);

      // Call service with raw body (Buffer) and received signature
      const result = await this.paymentRequestsService.handleWebhook(
        rawBodyForHmac,
        signature,
      );
      return result;
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new common.HttpException(
        error instanceof Error ? error.message : 'Failed to process webhook',
        common.HttpStatus.BAD_REQUEST,
      );
    }
  }


  @common.Get('order/:transaction_id')
  async getOrderByTransactionId(
    @common.Param('transaction_id') transaction_id: string,
  ) {
    try {
      const order =
        await this.paymentRequestsService.findByTransactionId(transaction_id);
      return order;
    } catch (error) {
      console.error(error);
      throw new common.HttpException(
        error instanceof Error ? error.message : 'Error fetching order',
        common.HttpStatus.NOT_FOUND,
      );
    }
  }


  //5/03/25
  // @Get('details/:transaction_id')
  // async getPaymentDetails(@Param('transaction_id') transaction_id: string) {
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     const details =
  //       await this.paymentRequestsService.getPaymentDetails(transaction_id);
  //     return {
  //       success: true,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //       data: details,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       error instanceof Error
  //         ? error.message
  //         : 'Error fetching payment details',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  // }
  //invoice
  //5/3/25
  // @Get('invoice/:transaction_id')
  // async getInvoice(@Param('transaction_id') transaction_id: string) {
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     const details =
  //       await this.paymentRequestsService.getInvoice(transaction_id);
  //     return {
  //       success: true,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //       data: details,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       error instanceof Error
  //         ? error.message
  //         : 'Error fetching invoice details',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  // }
  //newc
  // @Get('invoice/:transaction_id/pdf')
  // async downloadInvoicePDF(
  //   @Param('transaction_id') transaction_id: string,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const invoice =
  //       await this.paymentRequestsService.generateInvoicePDF(transaction_id);

  //     // Get payment request details for filename
  //     const paymentRequest =
  //       await this.paymentRequestsService.getOrder(transaction_id);

  //     // Set the appropriate headers
  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.setHeader(
  //       'Content-Disposition',
  //       `attachment; filename="invoice_${paymentRequest.invoice_no.replace('/', '-')}.pdf"`,
  //     );

  //     // Send the PDF as the response
  //     res.send(invoice);
  //   } catch (error) {
  //     throw new HttpException(
  //       error instanceof Error ? error.message : 'Error generating PDF invoice',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  // }
  //generate pdf and send
  // @Get('invoice/:transaction_id/pdf')
  // async downloadInvoicePDF(
  //   @Param('transaction_id') transaction_id: string,
  //   @Res() res: ExpressResponse,
  // ) {
  //   try {
  //     const invoice =
  //       await this.paymentRequestsService.generateInvoicePDF(transaction_id);

  //     // Get payment request details for filename
  //     const paymentRequest =
  //       await this.paymentRequestsService.getOrder(transaction_id);

  //     // Set the appropriate headers
  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.setHeader(
  //       'Content-Disposition',
  //       `attachment; filename="invoice_${paymentRequest.invoice_no.replace('/', '-')}.pdf"`,
  //     );

  //     // Send the PDF as the response
  //     res.send(invoice);
  //   } catch (error) {
  //     console.error('Error generating PDF invoice:', error);
  //     throw new HttpException(
  //       error instanceof Error ? error.message : 'Error generating PDF invoice',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  // }
  //get saved pdf
  @common.Get('pdfinvoice/:transaction_id')
  async getpdfInvoice(
    @common.Param('transaction_id') transactionId: string,
    @common.Res() res: Response,
  ) {
    const invoicePDF =
      await this.paymentRequestsService.sendInvoicePDF(transactionId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(invoicePDF);
  }
}
