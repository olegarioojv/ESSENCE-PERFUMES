import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { StockService } from '../stock/stock.service';
import { Role } from '../users/entities/role.enum';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderStatus } from './entities/order-status.enum';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    userId: 'user-1',
    status: OrderStatus.PENDENTE,
    subtotal: '100.00',
    total: '100.00',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<
    Pick<
      Repository<Order>,
      'create' | 'save' | 'findOne' | 'update' | 'findAndCount'
    >
  >;
  let orderItemsRepository: jest.Mocked<
    Pick<Repository<OrderItem>, 'create' | 'save' | 'find'>
  >;
  let orderHistoryRepository: jest.Mocked<
    Pick<Repository<OrderStatusHistory>, 'create' | 'save' | 'find'>
  >;
  let cartService: jest.Mocked<Pick<CartService, 'getSummary' | 'clear'>>;
  let stockService: jest.Mocked<
    Pick<StockService, 'findByProduct' | 'stockOut' | 'stockIn'>
  >;

  beforeEach(async () => {
    ordersRepository = {
      create: jest.fn((data) => data as Order),
      save: jest.fn((entity) => Promise.resolve(entity as Order)),
      findOne: jest.fn(),
      update: jest.fn(),
      findAndCount: jest.fn(),
    };
    orderItemsRepository = {
      create: jest.fn((data) => data as OrderItem),
      save: jest.fn((entity) => Promise.resolve(entity as OrderItem)),
      find: jest.fn(),
    };
    orderHistoryRepository = {
      create: jest.fn((data) => data as OrderStatusHistory),
      save: jest.fn((entity) => Promise.resolve(entity as OrderStatusHistory)),
      find: jest.fn(),
    };
    cartService = {
      getSummary: jest.fn(),
      clear: jest.fn(),
    };
    stockService = {
      findByProduct: jest.fn(),
      stockOut: jest.fn(),
      stockIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: orderItemsRepository,
        },
        {
          provide: getRepositoryToken(OrderStatusHistory),
          useValue: orderHistoryRepository,
        },
        { provide: CartService, useValue: cartService },
        { provide: StockService, useValue: stockService },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('checkout', () => {
    it('throws BadRequestException when the cart is empty', async () => {
      cartService.getSummary.mockResolvedValue({
        cartId: 'cart-1',
        items: [],
        itemCount: 0,
        subtotal: 0,
      });

      await expect(service.checkout('user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      cartService.getSummary.mockResolvedValue({
        cartId: 'cart-1',
        items: [
          {
            productId: 'product-1',
            name: 'Chanel N°5',
            quantity: 5,
            unitPrice: 100,
            lineTotal: 500,
          },
        ],
        itemCount: 5,
        subtotal: 500,
      });
      stockService.findByProduct.mockResolvedValue({
        id: 'stock-1',
        productId: 'product-1',
        quantity: 3,
        reservedQuantity: 0,
        minQuantity: 0,
        updatedAt: new Date(),
      });

      await expect(service.checkout('user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(ordersRepository.save).not.toHaveBeenCalled();
    });

    it('creates the order, debits stock and clears the cart', async () => {
      cartService.getSummary.mockResolvedValue({
        cartId: 'cart-1',
        items: [
          {
            productId: 'product-1',
            name: 'Chanel N°5',
            quantity: 2,
            unitPrice: 100,
            lineTotal: 200,
          },
        ],
        itemCount: 2,
        subtotal: 200,
      });
      stockService.findByProduct.mockResolvedValue({
        id: 'stock-1',
        productId: 'product-1',
        quantity: 10,
        reservedQuantity: 0,
        minQuantity: 0,
        updatedAt: new Date(),
      });
      ordersRepository.findOne.mockResolvedValue(buildOrder());
      orderItemsRepository.find.mockResolvedValue([]);

      const order = await service.checkout('user-1');

      expect(stockService.stockOut).toHaveBeenCalledWith(
        'product-1',
        { quantity: 2, reason: expect.stringContaining('Pedido') as string },
        'user-1',
      );
      expect(cartService.clear).toHaveBeenCalledWith('user-1');
      expect(order.status).toBe(OrderStatus.PENDENTE);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('missing', { sub: 'user-1', role: Role.CLIENTE }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when a different customer requests the order', async () => {
      ordersRepository.findOne.mockResolvedValue(buildOrder());
      orderItemsRepository.find.mockResolvedValue([]);

      await expect(
        service.findOne('order-1', { sub: 'user-2', role: Role.CLIENTE }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows an admin to access another customer order', async () => {
      ordersRepository.findOne.mockResolvedValue(buildOrder());
      orderItemsRepository.find.mockResolvedValue([]);

      const order = await service.findOne('order-1', {
        sub: 'admin-1',
        role: Role.ADMIN,
      });

      expect(order.id).toBe('order-1');
    });
  });

  describe('cancel', () => {
    it('throws BadRequestException when the order can no longer be cancelled', async () => {
      ordersRepository.findOne.mockResolvedValue(
        buildOrder({ status: OrderStatus.ENTREGUE }),
      );

      await expect(
        service.cancel('order-1', { sub: 'user-1', role: Role.CLIENTE }, {}),
      ).rejects.toThrow(BadRequestException);
      expect(ordersRepository.update).not.toHaveBeenCalled();
    });

    it('restores stock for each item when cancelling', async () => {
      ordersRepository.findOne
        .mockResolvedValueOnce(buildOrder({ status: OrderStatus.PENDENTE }))
        .mockResolvedValueOnce(buildOrder({ status: OrderStatus.CANCELADO }));
      orderItemsRepository.find.mockResolvedValue([
        {
          id: 'item-1',
          orderId: 'order-1',
          productId: 'product-1',
          productName: 'Chanel N°5',
          quantity: 2,
          unitPrice: '100.00',
          lineTotal: '200.00',
          createdAt: new Date(),
        },
      ]);

      const order = await service.cancel(
        'order-1',
        { sub: 'user-1', role: Role.CLIENTE },
        {},
      );

      expect(stockService.stockIn).toHaveBeenCalledWith(
        'product-1',
        {
          quantity: 2,
          reason: expect.stringContaining('Cancelamento') as string,
        },
        'user-1',
      );
      expect(order.status).toBe(OrderStatus.CANCELADO);
    });
  });

  describe('updateStatus', () => {
    it('throws BadRequestException when the order is in a terminal status', async () => {
      ordersRepository.findOne.mockResolvedValue(
        buildOrder({ status: OrderStatus.CANCELADO }),
      );

      await expect(
        service.updateStatus(
          'order-1',
          { status: OrderStatus.PAGO },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
