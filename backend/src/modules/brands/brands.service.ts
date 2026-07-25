import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandsRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Marca já cadastrada');
    }

    const brand = this.brandsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    return this.brandsRepository.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandsRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException('Marca não encontrada');
    }

    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    await this.findById(id);

    if (dto.name) {
      const existing = await this.brandsRepository.findOne({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Marca já cadastrada');
      }
    }

    await this.brandsRepository.update({ id }, dto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.brandsRepository.delete({ id });
  }

  async updateLogo(id: string, logoUrl: string | null): Promise<Brand> {
    await this.findById(id);
    await this.brandsRepository.update({ id }, { logoUrl });
    return this.findById(id);
  }
}
