import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductImage } from './entities/product-image.entity';
import { ProductsService } from './products.service';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async upload(
    productId: string,
    file: Express.Multer.File,
  ): Promise<ProductImage> {
    await this.productsService.findById(productId);

    const existingCount = await this.productImagesRepository.count({
      where: { productId },
    });

    const { url, publicId } = await this.cloudinaryService.uploadImage(
      file.buffer,
      randomUUID(),
      `products/${productId}`,
    );

    const image = this.productImagesRepository.create({
      productId,
      url,
      publicId,
      isPrimary: existingCount === 0,
    });
    return this.productImagesRepository.save(image);
  }

  async findAllByProduct(productId: string): Promise<ProductImage[]> {
    return this.productImagesRepository.find({
      where: { productId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async setPrimary(productId: string, imageId: string): Promise<ProductImage> {
    await this.findOwned(productId, imageId);

    await this.productImagesRepository.update(
      { productId, isPrimary: true },
      { isPrimary: false },
    );
    await this.productImagesRepository.update(
      { id: imageId },
      { isPrimary: true },
    );

    return this.findOwned(productId, imageId);
  }

  async remove(productId: string, imageId: string): Promise<void> {
    const image = await this.findOwned(productId, imageId);

    await this.cloudinaryService.deleteImage(image.publicId);
    await this.productImagesRepository.delete({ id: imageId });

    if (image.isPrimary) {
      const [nextPrimary] = await this.productImagesRepository.find({
        where: { productId },
        order: { createdAt: 'ASC' },
        take: 1,
      });
      if (nextPrimary) {
        await this.productImagesRepository.update(
          { id: nextPrimary.id },
          { isPrimary: true },
        );
      }
    }
  }

  private async findOwned(
    productId: string,
    imageId: string,
  ): Promise<ProductImage> {
    const image = await this.productImagesRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    return image;
  }
}
