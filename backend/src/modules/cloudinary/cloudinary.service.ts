import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(buffer: Buffer, publicId: string): Promise<string> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (error?: UploadApiErrorResponse, uploadResult?: UploadApiResponse) => {
          if (error || !uploadResult) {
            reject(new Error(error?.message ?? 'Falha ao enviar imagem'));
            return;
          }
          resolve(uploadResult);
        },
      );
      uploadStream.end(buffer);
    });

    return result.secure_url;
  }
}
