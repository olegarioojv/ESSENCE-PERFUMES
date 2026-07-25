import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { slugify } from './utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = await this.buildUniqueSlug(dto.slug ?? dto.name);

    const category = this.categoriesRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      slug,
    });
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);

    const data: Partial<Category> = {};

    if (dto.name) {
      data.name = dto.name;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.slug) {
      data.slug = await this.buildUniqueSlug(dto.slug, id);
    } else if (dto.name) {
      data.slug = await this.buildUniqueSlug(dto.name, id);
    }

    await this.categoriesRepository.update({ id }, data);
    return this.findById(id);
  }

  async setActive(id: string, isActive: boolean): Promise<Category> {
    await this.findById(id);
    await this.categoriesRepository.update({ id }, { isActive });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.categoriesRepository.delete({ id });
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
    const existing = await this.categoriesRepository.findOne({
      where: { slug },
    });
    if (!existing) {
      return false;
    }
    return existing.id !== excludeId;
  }
}
