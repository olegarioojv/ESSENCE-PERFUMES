import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { AbacatePayService } from './abacatepay.service';
import { PaymentLog } from './entities/payment-log.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentLog]),
    OrdersModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, AbacatePayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
