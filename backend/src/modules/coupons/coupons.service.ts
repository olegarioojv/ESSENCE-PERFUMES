import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponType } from './entities/coupon-type.enum';
import { Coupon } from './entities/coupon.entity';

export interface CouponDiscount {
  coupon: Coupon;
  discountAmount: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const code = dto.code.toUpperCase();
    await this.assertCodeAvailable(code);
    this.assertValueValid(dto.type, dto.value);
    this.assertDatesValid(dto.startsAt, dto.expiresAt);

    const coupon = this.couponsRepository.create({
      code,
      type: dto.type,
      value: dto.value.toFixed(2),
      maxUses: dto.maxUses ?? null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: dto.isActive ?? true,
    });
    return this.couponsRepository.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const current = await this.findById(id);

    const code = dto.code ? dto.code.toUpperCase() : current.code;
    if (dto.code && code !== current.code) {
      await this.assertCodeAvailable(code);
    }
    this.assertValueValid(dto.type ?? current.type, dto.value ?? Number(current.value));
    this.assertDatesValid(
      dto.startsAt ?? current.startsAt?.toISOString(),
      dto.expiresAt ?? current.expiresAt?.toISOString(),
    );

    const data: Partial<Coupon> = {};

    if (dto.code) {
      data.code = code;
    }
    if (dto.type) {
      data.type = dto.type;
    }
    if (dto.value !== undefined) {
      data.value = dto.value.toFixed(2);
    }
    if (dto.maxUses !== undefined) {
      data.maxUses = dto.maxUses ?? null;
    }
    if (dto.startsAt !== undefined) {
      data.startsAt = new Date(dto.startsAt);
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = new Date(dto.expiresAt);
    }
    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    await this.couponsRepository.update({ id }, data);
    return this.findById(id);
  }

  async setActive(id: string, isActive: boolean): Promise<Coupon> {
    await this.findById(id);
    await this.couponsRepository.update({ id }, { isActive });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.couponsRepository.delete({ id });
  }

  async validateForOrder(
    code: string,
    subtotal: number,
  ): Promise<CouponDiscount> {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new BadRequestException('Cupom inválido');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('Cupom inativo');
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException('Cupom ainda não é válido');
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new BadRequestException('Cupom expirado');
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Cupom atingiu o limite de uso');
    }

    const rawDiscount =
      coupon.type === CouponType.PERCENTUAL
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    const discountAmount = Math.min(rawDiscount, subtotal);

    return { coupon, discountAmount: Math.round(discountAmount * 100) / 100 };
  }

  async registerUsage(id: string): Promise<void> {
    await this.couponsRepository.increment({ id }, 'usedCount', 1);
  }

  private assertValueValid(type: CouponType, value: number): void {
    if (type === CouponType.PERCENTUAL && value > 100) {
      throw new BadRequestException(
        'Cupom percentual não pode ser maior que 100',
      );
    }
  }

  private assertDatesValid(startsAt?: string, expiresAt?: string): void {
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      throw new BadRequestException(
        'Data de início deve ser anterior à data de expiração',
      );
    }
  }

  private async assertCodeAvailable(code: string): Promise<void> {
    const existing = await this.couponsRepository.findOne({
      where: { code },
    });
    if (existing) {
      throw new ConflictException('Já existe um cupom com esse código');
    }
  }
}
