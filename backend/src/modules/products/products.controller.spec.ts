import { Test, TestingModule } from '@nestjs/testing';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
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

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<
    Pick<
      ProductsService,
      | 'findAll'
      | 'findBySlug'
      | 'findById'
      | 'create'
      | 'update'
      | 'setActive'
      | 'setFeatured'
      | 'remove'
    >
  >;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
      setFeatured: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = module.get(ProductsController);
  });

  it('findAll delegates to the service with the query', async () => {
    const result = {
      items: [buildProduct()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    service.findAll.mockResolvedValue(result);
    const query = { search: 'chanel' };

    await expect(controller.findAll(query)).resolves.toBe(result);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findBySlug delegates to the service with the slug', async () => {
    const product = buildProduct();
    service.findBySlug.mockResolvedValue(product);

    await expect(controller.findBySlug('chanel-no-5')).resolves.toBe(product);
    expect(service.findBySlug).toHaveBeenCalledWith('chanel-no-5');
  });

  it('findOne delegates to the service with the id', async () => {
    const product = buildProduct();
    service.findById.mockResolvedValue(product);

    await expect(controller.findOne('prod-1')).resolves.toBe(product);
    expect(service.findById).toHaveBeenCalledWith('prod-1');
  });

  it('create delegates to the service with the dto', async () => {
    const dto = {
      name: 'Chanel Nº 5',
      sku: 'CHN5-100',
      price: 899.9,
      brandId: 'brand-1',
      categoryId: 'cat-1',
    };
    const product = buildProduct();
    service.create.mockResolvedValue(product);

    await expect(controller.create(dto)).resolves.toBe(product);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to the service with the id and dto', async () => {
    const dto = { name: 'Novo nome' };
    const product = buildProduct({ name: dto.name });
    service.update.mockResolvedValue(product);

    await expect(controller.update('prod-1', dto)).resolves.toBe(product);
    expect(service.update).toHaveBeenCalledWith('prod-1', dto);
  });

  it('activate delegates to the service with isActive true', async () => {
    const product = buildProduct({ isActive: true });
    service.setActive.mockResolvedValue(product);

    await expect(controller.activate('prod-1')).resolves.toBe(product);
    expect(service.setActive).toHaveBeenCalledWith('prod-1', true);
  });

  it('deactivate delegates to the service with isActive false', async () => {
    const product = buildProduct({ isActive: false });
    service.setActive.mockResolvedValue(product);

    await expect(controller.deactivate('prod-1')).resolves.toBe(product);
    expect(service.setActive).toHaveBeenCalledWith('prod-1', false);
  });

  it('feature delegates to the service with isFeatured true', async () => {
    const product = buildProduct({ isFeatured: true });
    service.setFeatured.mockResolvedValue(product);

    await expect(controller.feature('prod-1')).resolves.toBe(product);
    expect(service.setFeatured).toHaveBeenCalledWith('prod-1', true);
  });

  it('unfeature delegates to the service with isFeatured false', async () => {
    const product = buildProduct({ isFeatured: false });
    service.setFeatured.mockResolvedValue(product);

    await expect(controller.unfeature('prod-1')).resolves.toBe(product);
    expect(service.setFeatured).toHaveBeenCalledWith('prod-1', false);
  });

  it('remove delegates to the service with the id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('prod-1');

    expect(service.remove).toHaveBeenCalledWith('prod-1');
  });
});
