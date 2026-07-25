import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from '../brands/brands.module';
import { CategoriesModule } from '../categories/categories.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    BrandsModule,
    CategoriesModule,
    CloudinaryModule,
  ],
  controllers: [ProductsController, ProductImagesController],
  providers: [ProductsService, ProductImagesService],
  exports: [ProductsService],
})
export class ProductsModule {}
