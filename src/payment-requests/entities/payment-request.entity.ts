import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class PaymentRequests {
  @PrimaryColumn()
  transaction_id: string;

  @Column()
  external_id: string;

  @Column({ type: 'decimal', nullable: true })
  amount: number; // base_amount + gst

  @Column({ type: 'decimal', nullable: true })
  gst: number;

  @Column({ type: 'decimal', nullable: true })
  base_amount: number;

  @Column()
  success_url: string;

  @Column()
  failure_url: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  razorpay_order_id: string;

  @Column({ nullable: true })
  razorpay_payment_id: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  card_last4: string;

  @Column({ nullable: true })
  card_network: string;

  @Column({ nullable: true })
  bank: string;

  @Column({ nullable: true })
  card_type: string;

  @Column({ nullable: true })
  wallet: string;

  @Column({ nullable: true })
  upi_vpa: string;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ nullable: true })
  vendor_name: string;

  @Column({ nullable: true })
  vendor_address: string;

  @Column({ nullable: true })
  vendor_email: string;

  @Column({ nullable: true })
  vendor_contact_no: string;

  @Column({ nullable: true })
  vendor_gst_no: string;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column({ nullable: true })
  customer_phone: string;

  @Column({ nullable: true })
  customer_address: string;
  @Column({ nullable: true })
  purpose: string;

  @Column({ nullable: true })
  invoice_no: string;

  @Column({ type: 'timestamp', nullable: true })
  payment_date: Date;
  @Column({ type: 'bytea', nullable: true }) //bytea for PostgreSQL binary data
  invoice_pdf: Buffer;
}
