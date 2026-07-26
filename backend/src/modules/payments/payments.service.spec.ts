import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../orders/entities/order-status.enum';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { Role } from '../users/entities/role.enum';
import { AbacatePayService } from './abacatepay.service';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './entities/payment-status.enum';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    userId: 'user-1',
    status: OrderStatus.PENDENTE,
    subtotal: '100.00',
    couponCode: null,
    discountAmount: '0.00',
    total: '100.00',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'payment-1',
    orderId: 'order-1',
    provider: 'abacatepay',
    providerChargeId: 'charge-1',
    status: PaymentStatus.PENDENTE,
    amount: 10000,
    brCode: '000...',
    brCodeBase64: 'data:image/png;base64,xyz',
    expiresAt: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: jest.Mocked<
    Pick<Repository<Payment>, 'create' | 'save' | 'findOne' | 'update'>
  >;
  let paymentLogsRepository: jest.Mocked<
    Pick<Repository<PaymentLog>, 'create' | 'save' | 'find'>
  >;
  let abacatePayService: jest.Mocked<
    Pick<
      AbacatePayService,
      'createPixQrCode' | 'checkStatus' | 'simulatePayment'
    >
  >;
  let ordersService: jest.Mocked<
    Pick<OrdersService, 'getById' | 'updateStatus'>
  >;
  let configService: jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

  beforeEach(async () => {
    paymentsRepository = {
      create: jest.fn((data) => data as Payment),
      save: jest.fn((entity) => Promise.resolve(entity as Payment)),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    paymentLogsRepository = {
      create: jest.fn((data) => data as PaymentLog),
      save: jest.fn((entity) => Promise.resolve(entity as PaymentLog)),
      find: jest.fn(),
    };
    abacatePayService = {
      createPixQrCode: jest.fn(),
      checkStatus: jest.fn(),
      simulatePayment: jest.fn(),
    };
    ordersService = {
      getById: jest.fn(),
      updateStatus: jest.fn(),
    };
    configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentsRepository },
        {
          provide: getRepositoryToken(PaymentLog),
          useValue: paymentLogsRepository,
        },
        { provide: AbacatePayService, useValue: abacatePayService },
        { provide: OrdersService, useValue: ordersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  describe('createCharge', () => {
    it('throws BadRequestException when the order is not pending', async () => {
      ordersService.getById.mockResolvedValue(
        buildOrder({ status: OrderStatus.PAGO }),
      );

      await expect(
        service.createCharge('order-1', { sub: 'user-1', role: Role.CLIENTE }),
      ).rejects.toThrow(BadRequestException);
      expect(abacatePayService.createPixQrCode).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when a different customer requests the charge', async () => {
      ordersService.getById.mockResolvedValue(buildOrder());

      await expect(
        service.createCharge('order-1', { sub: 'user-2', role: Role.CLIENTE }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates the payment record from the provider response', async () => {
      ordersService.getById.mockResolvedValue(buildOrder());
      abacatePayService.createPixQrCode.mockResolvedValue({
        id: 'charge-1',
        amount: 10000,
        status: 'PENDING',
        devMode: true,
        brCode: '000...',
        brCodeBase64: 'data:image/png;base64,xyz',
        platformFee: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      });

      const payment = await service.createCharge('order-1', {
        sub: 'user-1',
        role: Role.CLIENTE,
      });

      expect(payment.providerChargeId).toBe('charge-1');
      expect(payment.status).toBe(PaymentStatus.PENDENTE);
      expect(paymentsRepository.save).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('throws BadRequestException when the payment is no longer pending', async () => {
      paymentsRepository.findOne.mockResolvedValue(
        buildPayment({ status: PaymentStatus.PAGO }),
      );
      ordersService.getById.mockResolvedValue(buildOrder());

      await expect(
        service.cancel('payment-1', { sub: 'user-1', role: Role.CLIENTE }),
      ).rejects.toThrow(BadRequestException);
      expect(paymentsRepository.update).not.toHaveBeenCalled();
    });

    it('cancels a pending payment locally', async () => {
      paymentsRepository.findOne
        .mockResolvedValueOnce(buildPayment())
        .mockResolvedValueOnce(
          buildPayment({ status: PaymentStatus.CANCELADO }),
        );
      ordersService.getById.mockResolvedValue(buildOrder());

      const payment = await service.cancel('payment-1', {
        sub: 'user-1',
        role: Role.CLIENTE,
      });

      expect(payment.status).toBe(PaymentStatus.CANCELADO);
    });
  });

  describe('processWebhook', () => {
    it('throws UnauthorizedException when the secret does not match', async () => {
      await expect(
        service.processWebhook('wrong-secret', {
          id: 'log-1',
          event: 'transparent.completed',
          data: { transparent: { id: 'charge-1' } },
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('marks the payment as paid and updates the order status', async () => {
      paymentsRepository.findOne
        .mockResolvedValueOnce(buildPayment())
        .mockResolvedValueOnce(buildPayment({ status: PaymentStatus.PAGO }));
      ordersService.getById.mockResolvedValue(buildOrder());

      await service.processWebhook('test-secret', {
        id: 'log-1',
        event: 'transparent.completed',
        data: { transparent: { id: 'charge-1', status: 'PAID' } },
      });

      expect(ordersService.updateStatus).toHaveBeenCalledWith(
        'order-1',
        { status: OrderStatus.PAGO },
        'system:payments',
      );
    });

    it('ignores events for unknown charges', async () => {
      paymentsRepository.findOne.mockResolvedValue(null);

      const result = await service.processWebhook('test-secret', {
        id: 'log-1',
        event: 'transparent.completed',
        data: { transparent: { id: 'unknown-charge' } },
      });

      expect(result).toEqual({ received: true });
      expect(ordersService.updateStatus).not.toHaveBeenCalled();
    });
  });
});
