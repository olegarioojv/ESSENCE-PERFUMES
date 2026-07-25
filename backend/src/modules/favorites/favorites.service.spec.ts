import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';

function buildFavorite(overrides: Partial<Favorite> = {}): Favorite {
  return {
    id: 'favorite-1',
    userId: 'user-1',
    productId: 'product-1',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoritesRepository: jest.Mocked<
    Pick<
      Repository<Favorite>,
      'create' | 'save' | 'find' | 'findOne' | 'delete'
    >
  >;
  let productsService: jest.Mocked<Pick<ProductsService, 'findById'>>;

  beforeEach(async () => {
    favoritesRepository = {
      create: jest.fn((data) => data as Favorite),
      save: jest.fn((entity) => Promise.resolve(entity as Favorite)),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    productsService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: favoritesRepository,
        },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get(FavoritesService);
  });

  describe('add', () => {
    it('throws ConflictException when the product is already favorited', async () => {
      productsService.findById.mockResolvedValue({} as never);
      favoritesRepository.findOne.mockResolvedValue(buildFavorite());

      await expect(service.add('user-1', 'product-1')).rejects.toThrow(
        ConflictException,
      );
      expect(favoritesRepository.save).not.toHaveBeenCalled();
    });

    it('creates a favorite when not already present', async () => {
      productsService.findById.mockResolvedValue({} as never);
      favoritesRepository.findOne.mockResolvedValue(null);

      const favorite = await service.add('user-1', 'product-1');

      expect(favorite.productId).toBe('product-1');
      expect(favoritesRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the favorite does not exist', async () => {
      favoritesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('user-1', 'product-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(favoritesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
