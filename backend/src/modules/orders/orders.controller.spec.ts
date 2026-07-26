import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../users/entities/role.enum';
import { OrderStatus } from './entities/order-status.enum';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrdersController } from './orders.controller';
import type { OrderWithItems } from './orders.service';
import { OrdersService } from './orders.service';

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

function buildOrderWithItems(
  overrides: Partial<OrderWithItems> = {},
): OrderWithItems {
  return { ...buildOrder(), items: [], ...overrides };
}

function buildHistory(
  overrides: Partial<OrderStatusHistory> = {},
): OrderStatusHistory {
  return {
    id: 'history-1',
    orderId: 'order-1',
    status: OrderStatus.PENDENTE,
    note: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<
    Pick<
      OrdersService,
      | 'findAllForUser'
      | 'findOne'
      | 'findTimeline'
      | 'checkout'
      | 'cancel'
      | 'updateStatus'
    >
  >;

  const user = { sub: 'user-1', email: 'user@example.com', role: Role.CLIENTE };

  beforeEach(async () => {
    service = {
      findAllForUser: jest.fn(),
      findOne: jest.fn(),
      findTimeline: jest.fn(),
      checkout: jest.fn(),
      cancel: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: service }],
    }).compile();

    controller = module.get(OrdersController);
  });

  it('findAll delegates to the service with the user id and query', async () => {
    const result = {
      items: [buildOrder()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    service.findAllForUser.mockResolvedValue(result);
    const query = { page: 1, limit: 20 };

    await expect(controller.findAll(user, query)).resolves.toBe(result);
    expect(service.findAllForUser).toHaveBeenCalledWith('user-1', query);
  });

  it('findOne delegates to the service with the id and requesting user', async () => {
    const order = buildOrderWithItems();
    service.findOne.mockResolvedValue(order);

    await expect(controller.findOne(user, 'order-1')).resolves.toBe(order);
    expect(service.findOne).toHaveBeenCalledWith('order-1', {
      sub: 'user-1',
      role: Role.CLIENTE,
    });
  });

  it('findTimeline delegates to the service with the id and requesting user', async () => {
    const history = [buildHistory()];
    service.findTimeline.mockResolvedValue(history);

    await expect(controller.findTimeline(user, 'order-1')).resolves.toBe(
      history,
    );
    expect(service.findTimeline).toHaveBeenCalledWith('order-1', {
      sub: 'user-1',
      role: Role.CLIENTE,
    });
  });

  it('checkout delegates to the service with the user id and dto', async () => {
    const order = buildOrderWithItems();
    service.checkout.mockResolvedValue(order);
    const dto = { couponCode: 'BEMVINDO10' };

    await expect(controller.checkout(user, dto)).resolves.toBe(order);
    expect(service.checkout).toHaveBeenCalledWith('user-1', dto);
  });

  it('cancel delegates to the service with the id, requesting user, and dto', async () => {
    const order = buildOrderWithItems({ status: OrderStatus.CANCELADO });
    service.cancel.mockResolvedValue(order);
    const dto = { reason: 'Cliente desistiu' };

    await expect(controller.cancel(user, 'order-1', dto)).resolves.toBe(order);
    expect(service.cancel).toHaveBeenCalledWith(
      'order-1',
      { sub: 'user-1', role: Role.CLIENTE },
      dto,
    );
  });

  it('updateStatus delegates to the service with the id, dto, and actor id', async () => {
    const order = buildOrderWithItems({ status: OrderStatus.PAGO });
    service.updateStatus.mockResolvedValue(order);
    const admin = { sub: 'admin-1', email: 'admin@example.com', role: Role.ADMIN };
    const dto = { status: OrderStatus.PAGO };

    await expect(controller.updateStatus(admin, 'order-1', dto)).resolves.toBe(
      order,
    );
    expect(service.updateStatus).toHaveBeenCalledWith(
      'order-1',
      dto,
      'admin-1',
    );
  });
});
