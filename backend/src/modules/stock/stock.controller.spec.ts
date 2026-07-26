import { Test, TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/entities/role.enum';
import { StockMovementType } from './entities/stock-movement-type.enum';
import { StockMovement } from './entities/stock-movement.entity';
import { Stock } from './entities/stock.entity';
import { PaginatedStockMovements, StockService } from './stock.service';
import { StockController } from './stock.controller';

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

function buildMovement(overrides: Partial<StockMovement> = {}): StockMovement {
  return {
    id: 'movement-1',
    productId: 'product-1',
    type: StockMovementType.ENTRADA,
    quantity: 5,
    previousQuantity: 10,
    newQuantity: 15,
    reason: null,
    actorId: 'user-1',
    createdAt: new Date(),
    ...overrides,
  };
}

function buildPaginatedMovements(
  overrides: Partial<PaginatedStockMovements> = {},
): PaginatedStockMovements {
  return {
    items: [buildMovement()],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    ...overrides,
  };
}

const currentUser: JwtPayload = {
  sub: 'user-1',
  email: 'admin@example.com',
  role: Role.ADMIN,
};

describe('StockController', () => {
  let controller: StockController;
  let service: jest.Mocked<
    Pick<
      StockService,
      | 'findAll'
      | 'findLowStock'
      | 'findMovements'
      | 'findByProduct'
      | 'stockIn'
      | 'stockOut'
      | 'adjust'
      | 'count'
      | 'reserve'
      | 'release'
      | 'updateSettings'
    >
  >;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findLowStock: jest.fn(),
      findMovements: jest.fn(),
      findByProduct: jest.fn(),
      stockIn: jest.fn(),
      stockOut: jest.fn(),
      adjust: jest.fn(),
      count: jest.fn(),
      reserve: jest.fn(),
      release: jest.fn(),
      updateSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: service }],
    }).compile();

    controller = module.get(StockController);
  });

  it('findAll returns all stock records', async () => {
    const result = [buildStock()];
    service.findAll.mockResolvedValue(result);

    await expect(controller.findAll()).resolves.toBe(result);
    expect(service.findAll).toHaveBeenCalledWith();
  });

  it('findLowStock returns low stock records', async () => {
    const result = [buildStock({ quantity: 1, minQuantity: 5 })];
    service.findLowStock.mockResolvedValue(result);

    await expect(controller.findLowStock()).resolves.toBe(result);
    expect(service.findLowStock).toHaveBeenCalledWith();
  });

  it('findMovements returns paginated movements for the given query', async () => {
    const query = { productId: 'product-1', page: 2, limit: 10 };
    const result = buildPaginatedMovements();
    service.findMovements.mockResolvedValue(result);

    await expect(controller.findMovements(query)).resolves.toBe(result);
    expect(service.findMovements).toHaveBeenCalledWith(query);
  });

  it('findByProduct returns the stock for the given product', async () => {
    const result = buildStock();
    service.findByProduct.mockResolvedValue(result);

    await expect(controller.findByProduct('product-1')).resolves.toBe(result);
    expect(service.findByProduct).toHaveBeenCalledWith('product-1');
  });

  it('findProductHistory returns movements merged with the productId param', async () => {
    const query = { page: 1, limit: 20 };
    const result = buildPaginatedMovements();
    service.findMovements.mockResolvedValue(result);

    await expect(
      controller.findProductHistory('product-1', query),
    ).resolves.toBe(result);
    expect(service.findMovements).toHaveBeenCalledWith({
      ...query,
      productId: 'product-1',
    });
  });

  it('stockIn calls the service with productId, dto and actor id', async () => {
    const dto = { quantity: 5, reason: 'Compra' };
    const result = buildStock({ quantity: 15 });
    service.stockIn.mockResolvedValue(result);

    await expect(
      controller.stockIn('product-1', dto, currentUser),
    ).resolves.toBe(result);
    expect(service.stockIn).toHaveBeenCalledWith(
      'product-1',
      dto,
      currentUser.sub,
    );
  });

  it('stockOut calls the service with productId, dto and actor id', async () => {
    const dto = { quantity: 3, reason: 'Venda' };
    const result = buildStock({ quantity: 7 });
    service.stockOut.mockResolvedValue(result);

    await expect(
      controller.stockOut('product-1', dto, currentUser),
    ).resolves.toBe(result);
    expect(service.stockOut).toHaveBeenCalledWith(
      'product-1',
      dto,
      currentUser.sub,
    );
  });

  it('adjust calls the service with productId, dto and actor id', async () => {
    const dto = { quantity: 25, reason: 'Correção' };
    const result = buildStock({ quantity: 25 });
    service.adjust.mockResolvedValue(result);

    await expect(
      controller.adjust('product-1', dto, currentUser),
    ).resolves.toBe(result);
    expect(service.adjust).toHaveBeenCalledWith(
      'product-1',
      dto,
      currentUser.sub,
    );
  });

  it('count calls the service with productId, dto and actor id', async () => {
    const dto = { countedQuantity: 48, reason: 'Inventário' };
    const result = buildStock({ quantity: 48 });
    service.count.mockResolvedValue(result);

    await expect(
      controller.count('product-1', dto, currentUser),
    ).resolves.toBe(result);
    expect(service.count).toHaveBeenCalledWith(
      'product-1',
      dto,
      currentUser.sub,
    );
  });

  it('reserve calls the service with productId, dto and actor id', async () => {
    const dto = { quantity: 2, reason: 'Reserva de pedido' };
    const result = buildStock({ reservedQuantity: 2 });
    service.reserve.mockResolvedValue(result);

    await expect(
      controller.reserve('product-1', dto, currentUser),
    ).resolves.toBe(result);
    expect(service.reserve).toHaveBeenCalledWith(
      'product-1',
      dto,
      currentUser.sub,
    );
  });

  it('release calls the service with productId, dto and actor id', async () => {
    const dto = { quantity: 2, reason: 'Cancelamento de pedido' };
    const result = buildStock({ reservedQuantity: 0 });
    service.release.mockResolvedValue(result);

    await expect(
      controller.release('product-1', dto, currentUser),
    ).resolves.toBe(result);
    expect(service.release).toHaveBeenCalledWith(
      'product-1',
      dto,
      currentUser.sub,
    );
  });

  it('updateSettings calls the service with productId and dto', async () => {
    const dto = { minQuantity: 5 };
    const result = buildStock({ minQuantity: 5 });
    service.updateSettings.mockResolvedValue(result);

    await expect(
      controller.updateSettings('product-1', dto),
    ).resolves.toBe(result);
    expect(service.updateSettings).toHaveBeenCalledWith('product-1', dto);
  });
});
