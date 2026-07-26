import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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

describe('BrandsController', () => {
  let controller: BrandsController;
  let service: jest.Mocked<
    Pick<
      BrandsService,
      'findAll' | 'findById' | 'create' | 'update' | 'remove' | 'updateLogo'
    >
  >;
  let cloudinaryService: jest.Mocked<Pick<CloudinaryService, 'uploadImage'>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateLogo: jest.fn(),
    };
    cloudinaryService = {
      uploadImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        { provide: BrandsService, useValue: service },
        { provide: CloudinaryService, useValue: cloudinaryService },
      ],
    }).compile();

    controller = module.get(BrandsController);
  });

  it('findAll delegates to the service', async () => {
    const brands = [buildBrand()];
    service.findAll.mockResolvedValue(brands);

    await expect(controller.findAll()).resolves.toBe(brands);
    expect(service.findAll).toHaveBeenCalledWith();
  });

  it('findOne delegates to the service with the id', async () => {
    const brand = buildBrand();
    service.findById.mockResolvedValue(brand);

    await expect(controller.findOne('brand-1')).resolves.toBe(brand);
    expect(service.findById).toHaveBeenCalledWith('brand-1');
  });

  it('create delegates to the service with the dto', async () => {
    const dto = { name: 'Dior' };
    const brand = buildBrand({ name: dto.name });
    service.create.mockResolvedValue(brand);

    await expect(controller.create(dto)).resolves.toBe(brand);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delegates to the service with the id and dto', async () => {
    const dto = { name: 'Novo nome' };
    const brand = buildBrand({ name: dto.name });
    service.update.mockResolvedValue(brand);

    await expect(controller.update('brand-1', dto)).resolves.toBe(brand);
    expect(service.update).toHaveBeenCalledWith('brand-1', dto);
  });

  it('uploadLogo verifies the brand, uploads the file and updates the logo', async () => {
    const brand = buildBrand();
    const file = {
      buffer: Buffer.from('image-data'),
    } as Express.Multer.File;
    service.findById.mockResolvedValue(brand);
    cloudinaryService.uploadImage.mockResolvedValue({
      url: 'https://cdn.example.com/brands/brand-1.png',
      publicId: 'brands/brand-1',
    });
    const updatedBrand = buildBrand({
      logoUrl: 'https://cdn.example.com/brands/brand-1.png',
    });
    service.updateLogo.mockResolvedValue(updatedBrand);

    await expect(controller.uploadLogo('brand-1', file)).resolves.toBe(
      updatedBrand,
    );
    expect(service.findById).toHaveBeenCalledWith('brand-1');
    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
      file.buffer,
      'brand-1',
      'brands',
    );
    expect(service.updateLogo).toHaveBeenCalledWith(
      'brand-1',
      'https://cdn.example.com/brands/brand-1.png',
    );
  });

  it('removeLogo delegates to the service with a null logo url', async () => {
    const brand = buildBrand({ logoUrl: null });
    service.updateLogo.mockResolvedValue(brand);

    await expect(controller.removeLogo('brand-1')).resolves.toBe(brand);
    expect(service.updateLogo).toHaveBeenCalledWith('brand-1', null);
  });

  it('remove delegates to the service with the id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('brand-1');

    expect(service.remove).toHaveBeenCalledWith('brand-1');
  });
});
