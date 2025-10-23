import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentRequestsService } from './payment-requests.service';
import { PaymentRequestsController } from './payment-requests.controller';
import { PaymentRequests } from './entities/payment-request.entity';
import { InvoiceGenerator } from './invoice.generator';


@Module({
  imports: [TypeOrmModule.forFeature([PaymentRequests])],
  controllers: [PaymentRequestsController],
  providers: [PaymentRequestsService, InvoiceGenerator],
  exports: [PaymentRequestsService, InvoiceGenerator], // Exporting for use in other modules
})
export class PaymentRequestsModule {}
