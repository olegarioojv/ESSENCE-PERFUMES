import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    await this.brandsService.findById(dto.brandId);
    await this.categoriesService.findById(dto.categoryId);
    await this.assertSkuAvailable(dto.sku);
    this.assertPromotionValid(dto);

    const slug = await this.buildUniqueSlug(dto.slug ?? dto.name);

    const product = this.productsRepository.create({
      name: dto.name,
      sku: dto.sku,
      slug,
      barcode: dto.barcode ?? null,
      ean: dto.ean ?? null,
      description: dto.description ?? null,
      price: dto.price.toFixed(2),
      promotionalPrice: dto.promotionalPrice?.toFixed(2) ?? null,
      costPrice: dto.costPrice?.toFixed(2) ?? null,
      promotionStartsAt: dto.promotionStartsAt
        ? new Date(dto.promotionStartsAt)
        : null,
      promotionEndsAt: dto.promotionEndsAt
        ? new Date(dto.promotionEndsAt)
        : null,
      brandId: dto.brandId,
      categoryId: dto.categoryId,
      volumeMl: dto.volumeMl?.toString() ?? null,
      weightGrams: dto.weightGrams?.toString() ?? null,
      olfactoryFamily: dto.olfactoryFamily ?? null,
      notes: dto.notes ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      isFeatured: dto.isFeatured ?? false,
      isActive: dto.isActive ?? true,
    });
    return this.productsRepository.save(product);
  }

  async findAll(query: FindProductsDto): Promise<PaginatedProducts> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.productsRepository.createQueryBuilder('product');

    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId: query.brandId });
    }
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.olfactoryFamily) {
      qb.andWhere('product.olfactoryFamily = :olfactoryFamily', {
        olfactoryFamily: query.olfactoryFamily,
      });
    }
    if (query.isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured,
      });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    qb.orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { slug } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const current = await this.findById(id);

    if (dto.brandId) {
      await this.brandsService.findById(dto.brandId);
    }
    if (dto.categoryId) {
      await this.categoriesService.findById(dto.categoryId);
    }
    if (dto.sku && dto.sku !== current.sku) {
      await this.assertSkuAvailable(dto.sku);
    }
    this.assertPromotionValid({
      price: dto.price ?? Number(current.price),
      promotionalPrice:
        dto.promotionalPrice ??
        (current.promotionalPrice
          ? Number(current.promotionalPrice)
          : undefined),
      promotionStartsAt:
        dto.promotionStartsAt ?? current.promotionStartsAt?.toISOString(),
      promotionEndsAt:
        dto.promotionEndsAt ?? current.promotionEndsAt?.toISOString(),
    });

    const data: Partial<Product> = {};

    if (dto.name) {
      data.name = dto.name;
    }
    if (dto.sku) {
      data.sku = dto.sku;
    }
    if (dto.slug) {
      data.slug = await this.buildUniqueSlug(dto.slug, id);
    } else if (dto.name) {
      data.slug = await this.buildUniqueSlug(dto.name, id);
    }
    if (dto.barcode !== undefined) {
      data.barcode = dto.barcode ?? null;
    }
    if (dto.ean !== undefined) {
      data.ean = dto.ean ?? null;
    }
    if (dto.description !== undefined) {
      data.description = dto.description ?? null;
    }
    if (dto.price !== undefined) {
      data.price = dto.price.toFixed(2);
    }
    if (dto.promotionalPrice !== undefined) {
      data.promotionalPrice = dto.promotionalPrice.toFixed(2);
    }
    if (dto.costPrice !== undefined) {
      data.costPrice = dto.costPrice.toFixed(2);
    }
    if (dto.promotionStartsAt !== undefined) {
      data.promotionStartsAt = new Date(dto.promotionStartsAt);
    }
    if (dto.promotionEndsAt !== undefined) {
      data.promotionEndsAt = new Date(dto.promotionEndsAt);
    }
    if (dto.brandId) {
      data.brandId = dto.brandId;
    }
    if (dto.categoryId) {
      data.categoryId = dto.categoryId;
    }
    if (dto.volumeMl !== undefined) {
      data.volumeMl = dto.volumeMl?.toString() ?? null;
    }
    if (dto.weightGrams !== undefined) {
      data.weightGrams = dto.weightGrams?.toString() ?? null;
    }
    if (dto.olfactoryFamily !== undefined) {
      data.olfactoryFamily = dto.olfactoryFamily ?? null;
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes ?? null;
    }
    if (dto.metaTitle !== undefined) {
      data.metaTitle = dto.metaTitle ?? null;
    }
    if (dto.metaDescription !== undefined) {
      data.metaDescription = dto.metaDescription ?? null;
    }
    if (dto.isFeatured !== undefined) {
      data.isFeatured = dto.isFeatured;
    }
    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    await this.productsRepository.update({ id }, data);
    return this.findById(id);
  }

  async setActive(id: string, isActive: boolean): Promise<Product> {
    await this.findById(id);
    await this.productsRepository.update({ id }, { isActive });
    return this.findById(id);
  }

  async setFeatured(id: string, isFeatured: boolean): Promise<Product> {
    await this.findById(id);
    await this.productsRepository.update({ id }, { isFeatured });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.productsRepository.delete({ id });
  }

  private async assertSkuAvailable(sku: string): Promise<void> {
    const existing = await this.productsRepository.findOne({ where: { sku } });
    if (existing) {
      throw new ConflictException('SKU já cadastrado');
    }
  }

  private assertPromotionValid(data: {
    price: number;
    promotionalPrice?: number;
    promotionStartsAt?: string;
    promotionEndsAt?: string;
  }): void {
    if (
      data.promotionalPrice !== undefined &&
      data.promotionalPrice >= data.price
    ) {
      throw new BadRequestException(
        'O preço promocional deve ser menor que o preço original',
      );
    }
    if (
      data.promotionStartsAt &&
      data.promotionEndsAt &&
      new Date(data.promotionStartsAt) >= new Date(data.promotionEndsAt)
    ) {
      throw new BadRequestException(
        'A data de início da promoção deve ser anterior à data de término',
      );
    }
  }

  private async buildUniqueSlug(
    source: string,
    excludeId?: string,
  ): Promise<string> {
    const base = slugify(source);
    let candidate = base;
    let suffix = 1;

    while (await this.slugTaken(candidate, excludeId)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }

  private async slugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.productsRepository.findOne({ where: { slug } });
    if (!existing) {
      return false;
    }
    return existing.id !== excludeId;
  }
}
