import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<
    Pick<
      Repository<Category>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'delete'
    >
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data as Category),
      save: jest.fn((entity) => Promise.resolve(entity as Category)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: repository },
      ],
    }).compile();

    service = module.get(CategoriesService);
  });

  describe('create', () => {
    it('generates a slug from the name when none is provided', async () => {
      repository.findOne.mockResolvedValue(null);

      const category = await service.create({ name: 'Perfumes Femininos' });

      expect(category.slug).toBe('perfumes-femininos');
    });

    it('appends a numeric suffix when the slug is already taken', async () => {
      repository.findOne
        .mockResolvedValueOnce(buildCategory({ slug: 'perfumes-femininos' }))
        .mockResolvedValueOnce(null);

      const category = await service.create({ name: 'Perfumes Femininos' });

      expect(category.slug).toBe('perfumes-femininos-2');
    });

    it('slugifies accented characters', async () => {
      repository.findOne.mockResolvedValue(null);

      const category = await service.create({ name: 'Fragrâncias Árabes' });

      expect(category.slug).toBe('fragrancias-arabes');
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when the category does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('regenerates the slug when the name changes', async () => {
      repository.findOne
        .mockResolvedValueOnce(buildCategory())
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(buildCategory({ name: 'Perfumes Masculinos' }));

      await service.update('cat-1', { name: 'Perfumes Masculinos' });

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'cat-1' },
        expect.objectContaining({
          name: 'Perfumes Masculinos',
          slug: 'perfumes-masculinos',
        }),
      );
    });
  });

  describe('setActive', () => {
    it('toggles isActive', async () => {
      repository.findOne.mockResolvedValue(buildCategory({ isActive: false }));

      await service.setActive('cat-1', false);

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'cat-1' },
        { isActive: false },
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
