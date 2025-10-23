import PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';

import { format } from 'date-fns';
import { PaymentRequests } from './entities/payment-request.entity';

@Injectable()
export class InvoiceGenerator {
  async generateInvoicePDF(paymentRequest: PaymentRequests): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        // Create the PDF document
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Collect data chunks
        doc.on('data', (chunk: Buffer) => {
          buffers.push(chunk);
        });

        // Concatenate chunks when document is complete
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Handle errors
        doc.on('error', (error: Error) => {
          reject(error);
        });

        // Format the payment_date from the entity
        const formattedDate = format(paymentRequest.payment_date, 'M/d/yyyy'); // Use payment_date from the entity

        // Set up document
        this.generateHeader(doc, paymentRequest);
        this.generateDivider(doc, 190);
        this.generateCustomerInformation(doc, paymentRequest, formattedDate);
        this.generateInvoiceTable(doc, paymentRequest);

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(
          error instanceof Error ? error : new Error('PDF generation failed'),
        );
      }
    });
  }

  private generateHeader(
    doc: PDFDocument,
    paymentRequest: PaymentRequests,
  ): void {
    const vendorName = paymentRequest.vendor_name || 'N/A';
    const vendorAddress = paymentRequest.vendor_address || 'N/A';
    const vendorEmail = paymentRequest.vendor_email || 'N/A';
    const vendorContact = paymentRequest.vendor_contact_no || 'N/A';
    const vendorGst = paymentRequest.vendor_gst_no || 'N/A';

    // Invoice title at left
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 50, { align: 'left' });

    // Vendor information at right
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(vendorName, 350, 50)
      .text(vendorAddress, 350, 65)
      .text(vendorEmail, 350, 80)
      .text(vendorContact, 350, 95)
      .text(`GST NO: ${vendorGst}`, 350, 110);
  }

  private generateDivider(doc: PDFDocument, y: number): void {
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  private generateCustomerInformation(
    doc: PDFDocument,
    paymentRequest: PaymentRequests,
    formattedDate: string,
  ): void {
    const customerName = paymentRequest.customer_name || 'N/A';
    const customerAddress = paymentRequest.customer_address || 'N/A';
    const customerEmail = paymentRequest.customer_email || 'N/A';
    const customerPhone = paymentRequest.customer_phone || 'N/A';
    const invoiceNo = paymentRequest.invoice_no || 'N/A';

    doc.fontSize(12).font('Helvetica-Bold').text('Billed To,', 50, 210);

    doc
      .font('Helvetica')
      .text(customerName, 50, 225)
      .text(customerAddress, 50, 240)
      .text(customerEmail, 50, 255)
      .text(customerPhone, 50, 270);

    // Right side info
    doc
      .font('Helvetica-Bold')
      .text('Date:', 350, 210)
      .text('Invoice No:', 350, 235);

    doc
      .font('Helvetica')
      .text(formattedDate, 420, 210)
      .text(invoiceNo, 420, 235);
  }

  private generateInvoiceTable(
    doc: PDFDocument,
    paymentRequest: PaymentRequests,
  ): void {
    const invoiceTableTop = 320;
    const tableWidth = 500;
    const cellPadding = 10;
    const purpose = paymentRequest.purpose || 'Service';
    const baseAmount = paymentRequest.base_amount || 0;
    const gst = paymentRequest.gst || 0;
    const totalAmount = paymentRequest.amount || 0;

    // Table headers
    this.generateTableRow(
      doc,
      invoiceTableTop,
      'Purpose',
      'Amount',
      '',
      '',
      true,
    );

    // Draw the table headers background
    doc
      .rect(50, invoiceTableTop - 5, tableWidth / 2, 30)
      .fillAndStroke('#F0F0F0', '#000000');

    doc
      .rect(50 + tableWidth / 2, invoiceTableTop - 5, tableWidth / 2, 30)
      .fillAndStroke('#F0F0F0', '#000000');

    // Add header text
    doc
      .fillColor('#000000')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Purpose', 50 + cellPadding, invoiceTableTop + 5)
      .text('Amount', 50 + tableWidth / 2 + cellPadding, invoiceTableTop + 5);

    // Item row
    doc.rect(50, invoiceTableTop + 25, tableWidth / 2, 30).stroke();

    doc
      .rect(50 + tableWidth / 2, invoiceTableTop + 25, tableWidth / 2, 30)
      .stroke();

    doc
      .font('Helvetica')
      .text(purpose, 50 + cellPadding, invoiceTableTop + 35)
      .text(
        baseAmount.toString(),
        50 + tableWidth / 2 + cellPadding,
        invoiceTableTop + 35,
      );

    // GST and Total
    const gstY = invoiceTableTop + 65;
    const totalY = gstY + 25;

    doc
      .font('Helvetica-Bold')
      .text('GST', 400, gstY)
      .text('Total Amount', 400, totalY);

    doc
      .font('Helvetica')
      .text(':', 480, gstY)
      .text(':', 480, totalY)
      .text(gst.toString(), 490, gstY)
      .text(totalAmount.toString(), 490, totalY);

    // Add total in words
    const totalInWordsY = totalY + 50;
    const totalInWords = this.convertAmountToWords(totalAmount);

    doc.font('Helvetica-Bold').text('Total In Words', 50, totalInWordsY);

    doc.font('Helvetica').text(totalInWords, 50, totalInWordsY + 20);
  }

  private generateTableRow(
    doc: PDFDocument,
    y: number,
    item: string,
    quantity: string,
    unitPrice: string,
    total: string,
    isHeader = false,
  ): void {
    const positions = [50, 300, 400, 480];
    const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';

    doc.font(font);
    doc.text(item, positions[0], y);
    doc.text(quantity, positions[1], y);
    doc.text(unitPrice, positions[2], y);
    doc.text(total, positions[3], y);
  }

  private convertAmountToWords(amount: number): string {
    if (isNaN(amount)) {
      return '';
    }

    // Round to nearest integer
    amount = Math.round(amount);

    const units: string[] = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ];
    const teens: string[] = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens: string[] = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    if (amount === 0) return 'Zero Rupees Only';

    let words = '';

    // Handle thousands
    if (amount >= 1000) {
      words +=
        this.convertAmountToWords(Math.floor(amount / 1000)) + ' Thousand ';
      amount %= 1000;
    }

    // Handle hundreds
    if (amount >= 100) {
      words += units[Math.floor(amount / 100)] + ' Hundred ';
      amount %= 100;
    }

    // Handle tens and units
    if (amount > 0) {
      if (words !== '') words += 'and ';

      if (amount < 10) {
        words += units[amount];
      } else if (amount < 20) {
        words += teens[amount - 10];
      } else {
        words += tens[Math.floor(amount / 10)];
        if (amount % 10 > 0) {
          words += ' ' + units[amount % 10];
        }
      }
    }

    return words + ' Rupees Only';
  }
}
