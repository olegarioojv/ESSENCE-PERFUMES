import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderStatus } from '../orders/entities/order-status.enum';
import type { RequestingUser } from '../orders/orders.service';
import { OrdersService } from '../orders/orders.service';
import { Role } from '../users/entities/role.enum';
import { AbacatePayService } from './abacatepay.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './entities/payment-status.enum';
import { Payment } from './entities/payment.entity';

const ABACATEPAY_STATUS_MAP: Record<string, PaymentStatus> = {
  PENDING: PaymentStatus.PENDENTE,
  PAID: PaymentStatus.PAGO,
  EXPIRED: PaymentStatus.EXPIRADO,
  CANCELLED: PaymentStatus.CANCELADO,
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogsRepository: Repository<PaymentLog>,
    private readonly abacatePayService: AbacatePayService,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createCharge(
    orderId: string,
    requester: RequestingUser,
  ): Promise<Payment> {
    const order = await this.ordersService.getById(orderId);
    this.assertAccess(order.userId, requester);

    if (order.status !== OrderStatus.PENDENTE) {
      throw new BadRequestException('Pedido não está pendente de pagamento');
    }

    const amount = Math.round(Number(order.total) * 100);
    const charge = await this.abacatePayService.createPixQrCode({
      amount,
      description: `Pedido ${order.id}`.slice(0, 37),
      metadata: { orderId: order.id },
    });

    const payment = this.paymentsRepository.create({
      orderId: order.id,
      providerChargeId: charge.id,
      status: ABACATEPAY_STATUS_MAP[charge.status] ?? PaymentStatus.PENDENTE,
      amount: charge.amount,
      brCode: charge.brCode,
      brCodeBase64: charge.brCodeBase64,
      expiresAt: charge.expiresAt ? new Date(charge.expiresAt) : null,
    });
    await this.paymentsRepository.save(payment);
    await this.recordLog(
      payment.id,
      'created',
      charge as unknown as Record<string, unknown>,
    );

    return payment;
  }

  async findOne(
    paymentId: string,
    requester: RequestingUser,
  ): Promise<Payment> {
    const payment = await this.findPaymentOrThrow(paymentId);
    await this.assertAccessToPayment(payment, requester);

    const charge = await this.abacatePayService.checkStatus(
      payment.providerChargeId,
    );
    const mappedStatus = ABACATEPAY_STATUS_MAP[charge.status];
    if (mappedStatus && mappedStatus !== payment.status) {
      await this.applyStatus(payment, mappedStatus);
    }
    await this.recordLog(
      payment.id,
      'checked',
      charge as unknown as Record<string, unknown>,
    );

    return this.findPaymentOrThrow(paymentId);
  }

  async findLogs(
    paymentId: string,
    requester: RequestingUser,
  ): Promise<PaymentLog[]> {
    const payment = await this.findPaymentOrThrow(paymentId);
    await this.assertAccessToPayment(payment, requester);

    return this.paymentLogsRepository.find({
      where: { paymentId },
      order: { createdAt: 'ASC' },
    });
  }

  async simulate(paymentId: string): Promise<Payment> {
    const payment = await this.findPaymentOrThrow(paymentId);

    if (payment.status !== PaymentStatus.PENDENTE) {
      throw new BadRequestException('Cobrança não está mais pendente');
    }

    const charge = await this.abacatePayService.simulatePayment(
      payment.providerChargeId,
    );
    await this.recordLog(
      payment.id,
      'simulated',
      charge as unknown as Record<string, unknown>,
    );

    return this.applyStatus(payment, PaymentStatus.PAGO);
  }

  async cancel(paymentId: string, requester: RequestingUser): Promise<Payment> {
    const payment = await this.findPaymentOrThrow(paymentId);
    await this.assertAccessToPayment(payment, requester);

    if (payment.status !== PaymentStatus.PENDENTE) {
      throw new BadRequestException('Cobrança não pode mais ser cancelada');
    }

    await this.recordLog(payment.id, 'cancelled', null);
    // AbacatePay não expõe endpoint de cancelamento para cobranças PIX avulsas
    // (elas apenas expiram pelo expiresIn configurado); o cancelamento aqui é
    // apenas do registro local.
    return this.applyStatus(payment, PaymentStatus.CANCELADO);
  }

  async processWebhook(
    webhookSecret: string,
    payload: WebhookPayloadDto,
  ): Promise<{ received: boolean }> {
    const expectedSecret = this.configService.getOrThrow<string>(
      'ABACATEPAY_WEBHOOK_SECRET',
    );
    if (webhookSecret !== expectedSecret) {
      throw new UnauthorizedException('Webhook secret inválido');
    }

    const transparent = payload.data.transparent as
      | Record<string, unknown>
      | undefined;
    const chargeId = transparent?.id as string | undefined;
    if (!chargeId) {
      return { received: true };
    }

    const payment = await this.paymentsRepository.findOne({
      where: { providerChargeId: chargeId },
    });
    if (!payment) {
      return { received: true };
    }

    await this.recordLog(payment.id, `webhook:${payload.event}`, payload.data);

    const rawStatus = transparent?.status as string | undefined;
    const mappedStatus = rawStatus
      ? ABACATEPAY_STATUS_MAP[rawStatus]
      : undefined;

    if (mappedStatus && mappedStatus !== payment.status) {
      await this.applyStatus(payment, mappedStatus);
    }

    return { received: true };
  }

  private async applyStatus(
    payment: Payment,
    status: PaymentStatus,
  ): Promise<Payment> {
    const paidAt = status === PaymentStatus.PAGO ? new Date() : payment.paidAt;

    await this.paymentsRepository.update(
      { id: payment.id },
      { status, paidAt },
    );

    if (status === PaymentStatus.PAGO) {
      const order = await this.ordersService.updateStatus(
        payment.orderId,
        { status: OrderStatus.PAGO },
        'system:payments',
      );
      await this.notificationsService.notifyPaymentApproved(
        order.userId,
        order.id,
      );
    }

    return this.findPaymentOrThrow(payment.id);
  }

  private async recordLog(
    paymentId: string,
    event: string,
    payload: Record<string, unknown> | null,
  ): Promise<void> {
    const log = this.paymentLogsRepository.create({
      paymentId,
      event,
      payload,
    });
    await this.paymentLogsRepository.save(log);
  }

  private assertAccess(orderUserId: string, requester: RequestingUser): void {
    if (orderUserId !== requester.sub && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Acesso negado a este pedido');
    }
  }

  private async assertAccessToPayment(
    payment: Payment,
    requester: RequestingUser,
  ): Promise<void> {
    const order = await this.ordersService.getById(payment.orderId);
    this.assertAccess(order.userId, requester);
  }

  private async findPaymentOrThrow(paymentId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Cobrança não encontrada');
    }
    return payment;
  }
}
