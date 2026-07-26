import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: jest.Mocked<Pick<ConfigService, 'getOrThrow'>>;

  beforeEach(async () => {
    configService = {
      getOrThrow: jest.fn((key: string) => `value-${key}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(CloudinaryService);
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('configures the cloudinary SDK from env vars', () => {
      service.onModuleInit();

      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: 'value-CLOUDINARY_CLOUD_NAME',
        api_key: 'value-CLOUDINARY_API_KEY',
        api_secret: 'value-CLOUDINARY_API_SECRET',
      });
    });
  });

  describe('uploadImage', () => {
    it('resolves with the secure url and public id on success', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_options, callback) => {
          callback(undefined, {
            secure_url: 'https://cdn.test/image.png',
            public_id: 'products/prod-1',
          });
          return { end: jest.fn() };
        },
      );

      const result = await service.uploadImage(
        Buffer.from('fake'),
        'prod-1',
        'products',
      );

      expect(result).toEqual({
        url: 'https://cdn.test/image.png',
        publicId: 'products/prod-1',
      });
    });

    it('rejects when cloudinary returns an error', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_options, callback) => {
          callback({ message: 'upload failed' }, undefined);
          return { end: jest.fn() };
        },
      );

      await expect(
        service.uploadImage(Buffer.from('fake'), 'prod-1', 'products'),
      ).rejects.toThrow('upload failed');
    });
  });

  describe('deleteImage', () => {
    it('calls the cloudinary destroy API', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({});

      await service.deleteImage('products/prod-1');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'products/prod-1',
      );
    });
  });
});
