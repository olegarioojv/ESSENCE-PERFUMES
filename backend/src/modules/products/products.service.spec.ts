import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../brands/entities/brand.entity';
import { BrandsService } from '../brands/brands.service';
import { Category } from '../categories/entities/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Chanel Nº 5',
    sku: 'CHN5-100',
    slug: 'chanel-no-5',
    barcode: null,
    ean: null,
    description: null,
    price: '899.90',
    promotionalPrice: null,
    costPrice: null,
    promotionStartsAt: null,
    promotionEndsAt: null,
    brandId: 'brand-1',
    categoryId: 'cat-1',
    volumeMl: null,
    weightGrams: null,
    olfactoryFamily: null,
    notes: null,
    metaTitle: null,
    metaDescription: null,
    isFeatured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function buildBrand(): Brand {
  return {
    id: 'brand-1',
    name: 'Chanel',
    description: null,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function buildCategory(): Category {
  return {
    id: 'cat-1',
    name: 'Perfumes Femininos',
    slug: 'perfumes-femininos',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<
    Pick<
      Repository<Product>,
      'create' | 'save' | 'findOne' | 'update' | 'delete' | 'createQueryBuilder'
    >
  >;
  let brandsService: jest.Mocked<Pick<BrandsService, 'findById'>>;
  let categoriesService: jest.Mocked<Pick<CategoriesService, 'findById'>>;
  let queryBuilder: {
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const baseDto = {
    name: 'Chanel Nº 5',
    sku: 'CHN5-100',
    price: 899.9,
    brandId: 'brand-1',
    categoryId: 'cat-1',
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    repository = {
      create: jest.fn((data) => data as Product),
      save: jest.fn((entity) => Promise.resolve(entity as Product)),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    brandsService = { findById: jest.fn().mockResolvedValue(buildBrand()) };
    categoriesService = {
      findById: jest.fn().mockResolvedValue(buildCategory()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repository },
        { provide: BrandsService, useValue: brandsService },
        { provide: CategoriesService, useValue: categoriesService },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('create', () => {
    it('creates a product when brand/category exist and sku is free', async () => {
      repository.findOne.mockResolvedValue(null);

      const product = await service.create(baseDto);

      expect(brandsService.findById).toHaveBeenCalledWith('brand-1');
      expect(categoriesService.findById).toHaveBeenCalledWith('cat-1');
      expect(product.slug).toBe('chanel-n-5');
      expect(repository.save).toHaveBeenCalled();
    });

    it('propagates NotFoundException when the brand does not exist', async () => {
      brandsService.findById.mockRejectedValue(new NotFoundException());

      await expect(service.create(baseDto)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the sku is already taken', async () => {
      repository.findOne.mockResolvedValue(buildProduct());

      await expect(service.create(baseDto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when promotionalPrice is not lower than price', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ ...baseDto, promotionalPrice: 900 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the promotion window is inverted', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          ...baseDto,
          promotionalPrice: 700,
          promotionStartsAt: '2026-08-31T00:00:00.000Z',
          promotionEndsAt: '2026-08-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('applies default pagination and ordering', async () => {
      const result = await service.findAll({});

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'product.createdAt',
        'DESC',
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });

    it('applies search, filters, and custom sort/pagination', async () => {
      await service.findAll({
        search: 'chanel',
        brandId: 'brand-1',
        minPrice: 100,
        maxPrice: 1000,
        sortBy: 'price',
        sortOrder: 'ASC',
        page: 2,
        limit: 5,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { search: '%chanel%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.brandId = :brandId',
        {
          brandId: 'brand-1',
        },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('product.price', 'ASC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(5);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when the product does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setActive / setFeatured', () => {
    it('toggles isActive', async () => {
      repository.findOne.mockResolvedValue(buildProduct());

      await service.setActive('prod-1', false);

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'prod-1' },
        { isActive: false },
      );
    });

    it('toggles isFeatured', async () => {
      repository.findOne.mockResolvedValue(buildProduct());

      await service.setFeatured('prod-1', true);

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'prod-1' },
        { isFeatured: true },
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException instead of deleting when missing', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
