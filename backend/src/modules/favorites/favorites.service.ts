import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    private readonly productsService: ProductsService,
  ) {}

  async add(userId: string, productId: string): Promise<Favorite> {
    await this.productsService.findById(productId);

    const existing = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('Produto já está nos favoritos');
    }

    const favorite = this.favoritesRepository.create({ userId, productId });
    return this.favoritesRepository.save(favorite);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    if (!favorite) {
      throw new NotFoundException('Produto não está nos favoritos');
    }

    await this.favoritesRepository.delete({ id: favorite.id });
  }

  async findAll(userId: string): Promise<Product[]> {
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const products = await Promise.all(
      favorites.map((favorite) =>
        this.productsService.findById(favorite.productId),
      ),
    );

    return products;
  }
}
