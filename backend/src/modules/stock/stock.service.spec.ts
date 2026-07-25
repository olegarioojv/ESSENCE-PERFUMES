import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { StockMovementType } from './entities/stock-movement-type.enum';
import { StockMovement } from './entities/stock-movement.entity';
import { Stock } from './entities/stock.entity';
import { StockService } from './stock.service';

function buildStock(overrides: Partial<Stock> = {}): Stock {
  return {
    id: 'stock-1',
    productId: 'product-1',
    quantity: 10,
    reservedQuantity: 0,
    minQuantity: 0,
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('StockService', () => {
  let service: StockService;
  let stockRepository: jest.Mocked<
    Pick<
      Repository<Stock>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'createQueryBuilder'
    >
  >;
  let movementsRepository: jest.Mocked<
    Pick<Repository<StockMovement>, 'create' | 'save' | 'findAndCount'>
  >;
  let productsService: jest.Mocked<Pick<ProductsService, 'findById'>>;

  beforeEach(async () => {
    stockRepository = {
      create: jest.fn((data) => data as Stock),
      save: jest.fn((entity) => Promise.resolve(entity as Stock)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    movementsRepository = {
      create: jest.fn((data) => data as StockMovement),
      save: jest.fn((entity) => Promise.resolve(entity as StockMovement)),
      findAndCount: jest.fn(),
    };
    productsService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: getRepositoryToken(Stock), useValue: stockRepository },
        {
          provide: getRepositoryToken(StockMovement),
          useValue: movementsRepository,
        },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get(StockService);
  });

  describe('stockIn', () => {
    it('increases quantity and records an ENTRADA movement', async () => {
      productsService.findById.mockResolvedValue({} as never);
      stockRepository.findOne
        .mockResolvedValueOnce(buildStock({ quantity: 10 }))
        .mockResolvedValueOnce(buildStock({ quantity: 15 }));

      const result = await service.stockIn(
        'product-1',
        { quantity: 5 },
        'actor-1',
      );

      expect(movementsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: StockMovementType.ENTRADA,
          previousQuantity: 10,
          newQuantity: 15,
        }),
      );
      expect(stockRepository.update).toHaveBeenCalledWith(
        { productId: 'product-1' },
        { quantity: 15 },
      );
      expect(result.quantity).toBe(15);
    });
  });

  describe('stockOut', () => {
    it('throws BadRequestException when quantity exceeds available stock', async () => {
      productsService.findById.mockResolvedValue({} as never);
      stockRepository.findOne.mockResolvedValue(
        buildStock({ quantity: 5, reservedQuantity: 3 }),
      );

      await expect(
        service.stockOut('product-1', { quantity: 3 }, 'actor-1'),
      ).rejects.toThrow(BadRequestException);
      expect(stockRepository.update).not.toHaveBeenCalled();
    });

    it('decreases quantity when enough stock is available', async () => {
      productsService.findById.mockResolvedValue({} as never);
      stockRepository.findOne
        .mockResolvedValueOnce(
          buildStock({ quantity: 10, reservedQuantity: 2 }),
        )
        .mockResolvedValueOnce(
          buildStock({ quantity: 6, reservedQuantity: 2 }),
        );

      const result = await service.stockOut(
        'product-1',
        { quantity: 4 },
        'actor-1',
      );

      expect(stockRepository.update).toHaveBeenCalledWith(
        { productId: 'product-1' },
        { quantity: 6 },
      );
      expect(result.quantity).toBe(6);
    });
  });

  describe('reserve', () => {
    it('throws BadRequestException when reserving more than available', async () => {
      productsService.findById.mockResolvedValue({} as never);
      stockRepository.findOne.mockResolvedValue(
        buildStock({ quantity: 5, reservedQuantity: 5 }),
      );

      await expect(
        service.reserve('product-1', { quantity: 1 }, 'actor-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('release', () => {
    it('throws BadRequestException when releasing more than reserved', async () => {
      productsService.findById.mockResolvedValue({} as never);
      stockRepository.findOne.mockResolvedValue(
        buildStock({ quantity: 10, reservedQuantity: 2 }),
      );

      await expect(
        service.release('product-1', { quantity: 3 }, 'actor-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
