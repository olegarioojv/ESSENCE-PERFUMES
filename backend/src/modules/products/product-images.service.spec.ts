import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductImage } from './entities/product-image.entity';
import { ProductImagesService } from './product-images.service';
import { ProductsService } from './products.service';

function buildImage(overrides: Partial<ProductImage> = {}): ProductImage {
  return {
    id: 'img-1',
    productId: 'prod-1',
    url: 'https://cdn/img-1.png',
    publicId: 'products/prod-1/img-1',
    isPrimary: false,
    createdAt: new Date(),
    ...overrides,
  };
}

function buildFile(): Express.Multer.File {
  return { buffer: Buffer.from('fake') } as Express.Multer.File;
}

describe('ProductImagesService', () => {
  let service: ProductImagesService;
  let repository: jest.Mocked<
    Pick<
      Repository<ProductImage>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'delete' | 'count'
    >
  >;
  let productsService: jest.Mocked<Pick<ProductsService, 'findById'>>;
  let cloudinaryService: jest.Mocked<
    Pick<CloudinaryService, 'uploadImage' | 'deleteImage'>
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data as ProductImage),
      save: jest.fn((entity) => Promise.resolve(entity as ProductImage)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    productsService = { findById: jest.fn() };
    cloudinaryService = {
      uploadImage: jest.fn().mockResolvedValue({
        url: 'https://cdn/img.png',
        publicId: 'products/prod-1/uuid',
      }),
      deleteImage: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductImagesService,
        { provide: getRepositoryToken(ProductImage), useValue: repository },
        { provide: ProductsService, useValue: productsService },
        { provide: CloudinaryService, useValue: cloudinaryService },
      ],
    }).compile();

    service = module.get(ProductImagesService);
  });

  describe('upload', () => {
    it('marks the first image of a product as primary', async () => {
      repository.count.mockResolvedValue(0);

      const image = await service.upload('prod-1', buildFile());

      expect(image.isPrimary).toBe(true);
    });

    it('does not mark subsequent images as primary', async () => {
      repository.count.mockResolvedValue(1);

      const image = await service.upload('prod-1', buildFile());

      expect(image.isPrimary).toBe(false);
    });

    it('propagates NotFoundException when the product does not exist', async () => {
      productsService.findById.mockRejectedValue(new NotFoundException());

      await expect(service.upload('missing', buildFile())).rejects.toThrow(
        NotFoundException,
      );
      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
    });
  });

  describe('setPrimary', () => {
    it('throws NotFoundException when the image does not belong to the product', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.setPrimary('prod-1', 'img-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('unsets the previous primary before setting the new one', async () => {
      repository.findOne.mockResolvedValue(buildImage());

      await service.setPrimary('prod-1', 'img-1');

      expect(repository.update).toHaveBeenCalledWith(
        { productId: 'prod-1', isPrimary: true },
        { isPrimary: false },
      );
      expect(repository.update).toHaveBeenCalledWith(
        { id: 'img-1' },
        { isPrimary: true },
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException instead of deleting when not owned', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('prod-1', 'img-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('deletes from cloudinary and the database using the stored publicId', async () => {
      repository.findOne.mockResolvedValue(
        buildImage({ isPrimary: false, publicId: 'products/prod-1/img-1' }),
      );
      repository.find.mockResolvedValue([]);

      await service.remove('prod-1', 'img-1');

      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        'products/prod-1/img-1',
      );
      expect(repository.delete).toHaveBeenCalledWith({ id: 'img-1' });
    });

    it('promotes the oldest remaining image to primary when the primary image is removed', async () => {
      repository.findOne.mockResolvedValue(buildImage({ isPrimary: true }));
      const remaining = buildImage({ id: 'img-2', isPrimary: false });
      repository.find.mockResolvedValue([remaining]);

      await service.remove('prod-1', 'img-1');

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'img-2' },
        { isPrimary: true },
      );
    });

    it('does not promote anything when no images remain', async () => {
      repository.findOne.mockResolvedValue(buildImage({ isPrimary: true }));
      repository.find.mockResolvedValue([]);

      await service.remove('prod-1', 'img-1');

      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
