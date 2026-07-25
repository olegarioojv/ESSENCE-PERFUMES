import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';

function buildBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: 'brand-1',
    name: 'Chanel',
    description: null,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: jest.Mocked<
    Pick<
      Repository<Brand>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'delete'
    >
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data as Brand),
      save: jest.fn((entity) => Promise.resolve(entity as Brand)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: getRepositoryToken(Brand), useValue: repository },
      ],
    }).compile();

    service = module.get(BrandsService);
  });

  describe('create', () => {
    it('creates a brand when the name is not taken', async () => {
      repository.findOne.mockResolvedValue(null);

      const brand = await service.create({ name: 'Chanel' });

      expect(brand.name).toBe('Chanel');
      expect(repository.save).toHaveBeenCalled();
    });

    it('throws ConflictException when the name is already registered', async () => {
      repository.findOne.mockResolvedValue(buildBrand());

      await expect(service.create({ name: 'Chanel' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when the brand does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws ConflictException when the new name belongs to another brand', async () => {
      repository.findOne
        .mockResolvedValueOnce(buildBrand())
        .mockResolvedValueOnce(buildBrand({ id: 'brand-2', name: 'Dior' }));

      await expect(service.update('brand-1', { name: 'Dior' })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateLogo', () => {
    it('sets the logoUrl and returns the refreshed brand', async () => {
      repository.findOne.mockResolvedValue(
        buildBrand({ logoUrl: 'https://cdn/chanel.png' }),
      );

      const updated = await service.updateLogo(
        'brand-1',
        'https://cdn/chanel.png',
      );

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'brand-1' },
        { logoUrl: 'https://cdn/chanel.png' },
      );
      expect(updated.logoUrl).toBe('https://cdn/chanel.png');
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
