import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../users/entities/role.enum';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentStatus } from './entities/payment-status.enum';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

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

function buildPaymentLog(overrides: Partial<PaymentLog> = {}): PaymentLog {
  return {
    id: 'log-1',
    paymentId: 'payment-1',
    event: 'created',
    payload: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<
    Pick<
      PaymentsService,
      'createCharge' | 'findOne' | 'findLogs' | 'simulate' | 'cancel' | 'processWebhook'
    >
  >;

  const user = { sub: 'user-1', email: 'user@example.com', role: Role.CLIENTE };

  beforeEach(async () => {
    service = {
      createCharge: jest.fn(),
      findOne: jest.fn(),
      findLogs: jest.fn(),
      simulate: jest.fn(),
      cancel: jest.fn(),
      processWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: service }],
    }).compile();

    controller = module.get(PaymentsController);
  });

  it('createCharge delegates to the service with the order id and requesting user', async () => {
    const payment = buildPayment();
    service.createCharge.mockResolvedValue(payment);

    await expect(controller.createCharge(user, 'order-1')).resolves.toBe(
      payment,
    );
    expect(service.createCharge).toHaveBeenCalledWith('order-1', {
      sub: 'user-1',
      role: Role.CLIENTE,
    });
  });

  it('findOne delegates to the service with the id and requesting user', async () => {
    const payment = buildPayment();
    service.findOne.mockResolvedValue(payment);

    await expect(controller.findOne(user, 'payment-1')).resolves.toBe(payment);
    expect(service.findOne).toHaveBeenCalledWith('payment-1', {
      sub: 'user-1',
      role: Role.CLIENTE,
    });
  });

  it('findLogs delegates to the service with the id and requesting user', async () => {
    const logs = [buildPaymentLog()];
    service.findLogs.mockResolvedValue(logs);

    await expect(controller.findLogs(user, 'payment-1')).resolves.toBe(logs);
    expect(service.findLogs).toHaveBeenCalledWith('payment-1', {
      sub: 'user-1',
      role: Role.CLIENTE,
    });
  });

  it('simulate delegates to the service with the id', async () => {
    const payment = buildPayment({ status: PaymentStatus.PAGO });
    service.simulate.mockResolvedValue(payment);

    await expect(controller.simulate('payment-1')).resolves.toBe(payment);
    expect(service.simulate).toHaveBeenCalledWith('payment-1');
  });

  it('cancel delegates to the service with the id and requesting user', async () => {
    const payment = buildPayment({ status: PaymentStatus.CANCELADO });
    service.cancel.mockResolvedValue(payment);

    await expect(controller.cancel(user, 'payment-1')).resolves.toBe(payment);
    expect(service.cancel).toHaveBeenCalledWith('payment-1', {
      sub: 'user-1',
      role: Role.CLIENTE,
    });
  });

  it('webhook delegates to the service with the secret and payload', async () => {
    const result = { received: true };
    service.processWebhook.mockResolvedValue(result);
    const query = { webhookSecret: 'test-secret' };
    const payload = {
      id: 'log-1',
      event: 'transparent.completed',
      data: { transparent: { id: 'charge-1' } },
    };

    await expect(controller.webhook(query, payload)).resolves.toBe(result);
    expect(service.processWebhook).toHaveBeenCalledWith(
      'test-secret',
      payload,
    );
  });
});
