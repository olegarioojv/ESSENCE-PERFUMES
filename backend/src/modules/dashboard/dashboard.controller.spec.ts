import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import {
  BestSellerItem,
  DashboardService,
  DashboardSummary,
  OutOfStockItem,
  SalesChartPoint,
} from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<
    Pick<
      DashboardService,
      'getSummary' | 'getBestSellers' | 'getOutOfStock' | 'getSalesChart'
    >
  >;

  beforeEach(async () => {
    service = {
      getSummary: jest.fn(),
      getBestSellers: jest.fn(),
      getOutOfStock: jest.fn(),
      getSalesChart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get(DashboardController);
  });

  describe('getSummary', () => {
    it('returns the dashboard summary', async () => {
      const result: DashboardSummary = {
        totalSales: 200,
        ordersCount: 2,
        customersCount: 5,
        productsCount: 3,
        averageTicket: 100,
        profit: 100,
      };
      service.getSummary.mockResolvedValue(result);

      await expect(controller.getSummary()).resolves.toBe(result);
      expect(service.getSummary).toHaveBeenCalledWith();
    });
  });

  describe('getBestSellers', () => {
    it('returns best sellers for the given query', async () => {
      const query = { limit: 5 };
      const result: BestSellerItem[] = [
        {
          productId: 'prod-1',
          productName: 'Chanel Nº 5',
          quantitySold: 10,
          revenue: 1000,
        },
      ];
      service.getBestSellers.mockResolvedValue(result);

      await expect(controller.getBestSellers(query)).resolves.toBe(result);
      expect(service.getBestSellers).toHaveBeenCalledWith(query);
    });
  });

  describe('getOutOfStock', () => {
    it('returns out-of-stock products', async () => {
      const result: OutOfStockItem[] = [
        {
          productId: 'prod-1',
          name: 'Chanel Nº 5',
          sku: 'CHN5-100',
          quantity: 0,
          reservedQuantity: 0,
        },
      ];
      service.getOutOfStock.mockResolvedValue(result);

      await expect(controller.getOutOfStock()).resolves.toBe(result);
      expect(service.getOutOfStock).toHaveBeenCalledWith();
    });
  });

  describe('getSalesChart', () => {
    it('returns sales chart points for the given query', async () => {
      const query = { days: 7 };
      const result: SalesChartPoint[] = [
        { date: '2026-07-25', ordersCount: 2, revenue: 200 },
      ];
      service.getSalesChart.mockResolvedValue(result);

      await expect(controller.getSalesChart(query)).resolves.toBe(result);
      expect(service.getSalesChart).toHaveBeenCalledWith(query);
    });
  });
});
