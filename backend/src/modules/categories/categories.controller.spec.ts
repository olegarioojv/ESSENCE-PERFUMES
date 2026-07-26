import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

function buildCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-1',
    name: 'Perfumes Femininos',
    slug: 'perfumes-femininos',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<
    Pick<
      CategoriesService,
      'findAll' | 'findBySlug' | 'findById' | 'create' | 'update' | 'setActive' | 'remove'
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
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: service }],
    }).compile();

    controller = module.get(CategoriesController);
  });

  it('findAll delegates to the service', async () => {
    const categories = [buildCategory()];
    service.findAll.mockResolvedValue(categories);

    await expect(controller.findAll()).resolves.toBe(categories);
    expect(service.findAll).toHaveBeenCalledWith();
  });

  it('findBySlug delegates to the service with the slug', async () => {
    const category = buildCategory();
    service.findBySlug.mockResolvedValue(category);

    await expect(controller.findBySlug('perfumes-femininos')).resolves.toBe(
      category,
    );
    expect(service.findBySlug).toHaveBeenCalledWith('perfumes-femininos');
  });

  it('findOne delegates to the service with the id', async () => {
    const category = buildCategory();
    service.findById.mockResolvedValue(category);

    await expect(controller.findOne('cat-1')).resolves.toBe(category);
    expect(service.findById).toHaveBeenCalledWith('cat-1');
  });

  it('create delegates to the service with the dto', async () => {
    const dto = { name: 'Perfumes Masculinos' };
    const category = buildCategory({ name: dto.name });
    service.create.mockResolvedValue(category);

    await expect(controller.create(dto)).resolves.toBe(category);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to the service with the id and dto', async () => {
    const dto = { name: 'Novo nome' };
    const category = buildCategory({ name: dto.name });
    service.update.mockResolvedValue(category);

    await expect(controller.update('cat-1', dto)).resolves.toBe(category);
    expect(service.update).toHaveBeenCalledWith('cat-1', dto);
  });

  it('activate delegates to the service with isActive true', async () => {
    const category = buildCategory({ isActive: true });
    service.setActive.mockResolvedValue(category);

    await expect(controller.activate('cat-1')).resolves.toBe(category);
    expect(service.setActive).toHaveBeenCalledWith('cat-1', true);
  });

  it('deactivate delegates to the service with isActive false', async () => {
    const category = buildCategory({ isActive: false });
    service.setActive.mockResolvedValue(category);

    await expect(controller.deactivate('cat-1')).resolves.toBe(category);
    expect(service.setActive).toHaveBeenCalledWith('cat-1', false);
  });

  it('remove delegates to the service with the id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('cat-1');

    expect(service.remove).toHaveBeenCalledWith('cat-1');
  });
});
