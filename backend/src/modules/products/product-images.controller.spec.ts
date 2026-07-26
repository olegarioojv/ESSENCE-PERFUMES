import { Test, TestingModule } from '@nestjs/testing';
import { ProductImage } from './entities/product-image.entity';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';

function buildProductImage(
  overrides: Partial<ProductImage> = {},
): ProductImage {
  return {
    id: 'image-1',
    productId: 'prod-1',
    url: 'https://res.cloudinary.com/demo/image/upload/v1/products/prod-1/image-1.jpg',
    publicId: 'products/prod-1/image-1',
    isPrimary: false,
    createdAt: new Date(),
    ...overrides,
  };
}

function buildFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image'),
    destination: '',
    filename: '',
    path: '',
    stream: undefined as never,
    ...overrides,
  };
}

describe('ProductImagesController', () => {
  let controller: ProductImagesController;
  let service: jest.Mocked<
    Pick<
      ProductImagesService,
      'findAllByProduct' | 'upload' | 'setPrimary' | 'remove'
    >
  >;

  beforeEach(async () => {
    service = {
      findAllByProduct: jest.fn(),
      upload: jest.fn(),
      setPrimary: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductImagesController],
      providers: [{ provide: ProductImagesService, useValue: service }],
    }).compile();

    controller = module.get(ProductImagesController);
  });

  it('findAll delegates to the service with the product id', async () => {
    const images = [buildProductImage()];
    service.findAllByProduct.mockResolvedValue(images);

    await expect(controller.findAll('prod-1')).resolves.toBe(images);
    expect(service.findAllByProduct).toHaveBeenCalledWith('prod-1');
  });

  it('upload delegates to the service with the product id and file', async () => {
    const image = buildProductImage({ isPrimary: true });
    service.upload.mockResolvedValue(image);
    const file = buildFile();

    await expect(controller.upload('prod-1', file)).resolves.toBe(image);
    expect(service.upload).toHaveBeenCalledWith('prod-1', file);
  });

  it('setPrimary delegates to the service with the product id and image id', async () => {
    const image = buildProductImage({ isPrimary: true });
    service.setPrimary.mockResolvedValue(image);

    await expect(controller.setPrimary('prod-1', 'image-1')).resolves.toBe(
      image,
    );
    expect(service.setPrimary).toHaveBeenCalledWith('prod-1', 'image-1');
  });

  it('remove delegates to the service with the product id and image id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('prod-1', 'image-1');

    expect(service.remove).toHaveBeenCalledWith('prod-1', 'image-1');
  });
});
