import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../users/entities/role.enum';
import { Product } from '../products/entities/product.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Chanel Nº 5',
    sku: 'CHN5-100',
    slug: 'chanel-no-5',
    barcode: null,
    ean: null,
    description: null,
    price: '500.00',
    promotionalPrice: null,
    costPrice: null,
    promotionStartsAt: null,
    promotionEndsAt: null,
    brandId: 'brand-1',
    categoryId: 'category-1',
    volumeMl: null,
    weightGrams: null,
    olfactoryFamily: null,
    notes: null,
    metaTitle: null,
    metaDescription: null,
    isFeatured: false,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: jest.Mocked<Pick<FavoritesService, 'findAll' | 'add' | 'remove'>>;
  const user = { sub: 'user-1', email: 'user@example.com', role: Role.CLIENTE };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      add: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: service }],
    }).compile();

    controller = module.get(FavoritesController);
  });

  describe('findAll', () => {
    it('returns favorite products for the current user', async () => {
      const result = [buildProduct()];
      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll(user)).resolves.toBe(result);
      expect(service.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('add', () => {
    it('adds a product to favorites', async () => {
      const dto: AddFavoriteDto = { productId: 'prod-1' };
      const result = {
        id: 'favorite-1',
        userId: 'user-1',
        productId: 'prod-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      service.add.mockResolvedValue(result);

      await expect(controller.add(user, dto)).resolves.toBe(result);
      expect(service.add).toHaveBeenCalledWith('user-1', 'prod-1');
    });
  });

  describe('remove', () => {
    it('removes a product from favorites', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(user, 'prod-1');

      expect(service.remove).toHaveBeenCalledWith('user-1', 'prod-1');
    });
  });
});
