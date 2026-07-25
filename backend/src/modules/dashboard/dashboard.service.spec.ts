import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Stock } from '../stock/entities/stock.entity';
import { User } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';

function buildQueryBuilder(rawOneResult: unknown, rawManyResult: unknown[]) {
  const qb: Record<string, jest.Mock> = {};
  const chainable = [
    'select',
    'addSelect',
    'where',
    'andWhere',
    'innerJoin',
    'groupBy',
    'addGroupBy',
    'orderBy',
    'limit',
  ];
  for (const method of chainable) {
    qb[method] = jest.fn().mockReturnValue(qb);
  }
  qb.getRawOne = jest.fn().mockResolvedValue(rawOneResult);
  qb.getRawMany = jest.fn().mockResolvedValue(rawManyResult);
  return qb;
}

describe('DashboardService', () => {
  let service: DashboardService;
  let ordersRepository: jest.Mocked<Pick<Repository<Order>, 'createQueryBuilder'>>;
  let orderItemsRepository: jest.Mocked<
    Pick<Repository<OrderItem>, 'createQueryBuilder'>
  >;
  let productsRepository: jest.Mocked<Pick<Repository<Product>, 'count'>>;
  let stockRepository: jest.Mocked<Pick<Repository<Stock>, 'createQueryBuilder'>>;
  let usersRepository: jest.Mocked<Pick<Repository<User>, 'count'>>;

  beforeEach(async () => {
    ordersRepository = { createQueryBuilder: jest.fn() };
    orderItemsRepository = { createQueryBuilder: jest.fn() };
    productsRepository = { count: jest.fn() };
    stockRepository = { createQueryBuilder: jest.fn() };
    usersRepository = { count: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: orderItemsRepository,
        },
        { provide: getRepositoryToken(Product), useValue: productsRepository },
        { provide: getRepositoryToken(Stock), useValue: stockRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  describe('getSummary', () => {
    it('computes totals, average ticket and profit', async () => {
      (
        ordersRepository.createQueryBuilder as jest.Mock
      ).mockReturnValueOnce(
        buildQueryBuilder({ totalSales: '200.00', ordersCount: '2' }, []),
      );
      (
        orderItemsRepository.createQueryBuilder as jest.Mock
      ).mockReturnValueOnce(buildQueryBuilder({ profit: '100.00' }, []));
      usersRepository.count.mockResolvedValue(5);
      productsRepository.count.mockResolvedValue(3);

      const result = await service.getSummary();

      expect(result).toEqual({
        totalSales: 200,
        ordersCount: 2,
        customersCount: 5,
        productsCount: 3,
        averageTicket: 100,
        profit: 100,
      });
    });

    it('returns zero average ticket when there are no orders', async () => {
      (
        ordersRepository.createQueryBuilder as jest.Mock
      ).mockReturnValueOnce(
        buildQueryBuilder({ totalSales: '0', ordersCount: '0' }, []),
      );
      (
        orderItemsRepository.createQueryBuilder as jest.Mock
      ).mockReturnValueOnce(buildQueryBuilder({ profit: '0' }, []));
      usersRepository.count.mockResolvedValue(0);
      productsRepository.count.mockResolvedValue(0);

      const result = await service.getSummary();

      expect(result.averageTicket).toBe(0);
      expect(result.totalSales).toBe(0);
    });
  });

  describe('getBestSellers', () => {
    it('maps raw rows into typed best sellers', async () => {
      (
        orderItemsRepository.createQueryBuilder as jest.Mock
      ).mockReturnValueOnce(
        buildQueryBuilder(undefined, [
          {
            productId: 'prod-1',
            productName: 'Chanel Nº 5',
            quantitySold: '10',
            revenue: '1000.00',
          },
        ]),
      );

      const result = await service.getBestSellers({});

      expect(result).toEqual([
        {
          productId: 'prod-1',
          productName: 'Chanel Nº 5',
          quantitySold: 10,
          revenue: 1000,
        },
      ]);
    });
  });

  describe('getOutOfStock', () => {
    it('returns raw out-of-stock rows', async () => {
      const rows = [
        {
          productId: 'prod-1',
          name: 'Chanel Nº 5',
          sku: 'CHN5-100',
          quantity: 0,
          reservedQuantity: 0,
        },
      ];
      (stockRepository.createQueryBuilder as jest.Mock).mockReturnValueOnce(
        buildQueryBuilder(undefined, rows),
      );

      const result = await service.getOutOfStock();

      expect(result).toEqual(rows);
    });
  });

  describe('getSalesChart', () => {
    it('maps raw rows into typed chart points', async () => {
      (ordersRepository.createQueryBuilder as jest.Mock).mockReturnValueOnce(
        buildQueryBuilder(undefined, [
          { date: '2026-07-25', ordersCount: '2', revenue: '200.00' },
        ]),
      );

      const result = await service.getSalesChart({ days: 7 });

      expect(result).toEqual([
        { date: '2026-07-25', ordersCount: 2, revenue: 200 },
      ]);
    });
  });
});
