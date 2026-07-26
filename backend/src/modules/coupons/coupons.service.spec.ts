import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponsService } from './coupons.service';
import { CouponType } from './entities/coupon-type.enum';
import { Coupon } from './entities/coupon.entity';

function buildCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 'coupon-1',
    code: 'BEMVINDO10',
    type: CouponType.PERCENTUAL,
    value: '10.00',
    maxUses: null,
    usedCount: 0,
    startsAt: null,
    expiresAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CouponsService', () => {
  let service: CouponsService;
  let couponsRepository: jest.Mocked<
    Pick<
      Repository<Coupon>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'delete' | 'increment'
    >
  >;

  beforeEach(async () => {
    couponsRepository = {
      create: jest.fn((data) => data as Coupon),
      save: jest.fn((entity) => Promise.resolve(entity as Coupon)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      increment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getRepositoryToken(Coupon), useValue: couponsRepository },
      ],
    }).compile();

    service = module.get(CouponsService);
  });

  describe('create', () => {
    it('rejects a duplicate code', async () => {
      couponsRepository.findOne.mockResolvedValue(buildCoupon());

      await expect(
        service.create({
          code: 'bemvindo10',
          type: CouponType.PERCENTUAL,
          value: 10,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects a percentual coupon above 100', async () => {
      couponsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          code: 'MEGA200',
          type: CouponType.PERCENTUAL,
          value: 200,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('normalizes the code to uppercase', async () => {
      couponsRepository.findOne.mockResolvedValue(null);

      const coupon = await service.create({
        code: 'bemvindo10',
        type: CouponType.PERCENTUAL,
        value: 10,
      });

      expect(coupon.code).toBe('BEMVINDO10');
    });
  });

  describe('validateForOrder', () => {
    it('throws when the coupon does not exist', async () => {
      couponsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateForOrder('INVALID', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when the coupon is inactive', async () => {
      couponsRepository.findOne.mockResolvedValue(
        buildCoupon({ isActive: false }),
      );

      await expect(
        service.validateForOrder('BEMVINDO10', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when the coupon has expired', async () => {
      couponsRepository.findOne.mockResolvedValue(
        buildCoupon({ expiresAt: new Date('2020-01-01') }),
      );

      await expect(
        service.validateForOrder('BEMVINDO10', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when the usage limit was reached', async () => {
      couponsRepository.findOne.mockResolvedValue(
        buildCoupon({ maxUses: 1, usedCount: 1 }),
      );

      await expect(
        service.validateForOrder('BEMVINDO10', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('computes a percentual discount', async () => {
      couponsRepository.findOne.mockResolvedValue(
        buildCoupon({ type: CouponType.PERCENTUAL, value: '10.00' }),
      );

      const result = await service.validateForOrder('BEMVINDO10', 200);

      expect(result.discountAmount).toBe(20);
    });

    it('computes a fixed-value discount capped at the subtotal', async () => {
      couponsRepository.findOne.mockResolvedValue(
        buildCoupon({ type: CouponType.VALOR_FIXO, value: '500.00' }),
      );

      const result = await service.validateForOrder('BEMVINDO10', 200);

      expect(result.discountAmount).toBe(200);
    });
  });

  describe('registerUsage', () => {
    it('increments the used count', async () => {
      await service.registerUsage('coupon-1');

      expect(couponsRepository.increment).toHaveBeenCalledWith(
        { id: 'coupon-1' },
        'usedCount',
        1,
      );
    });
  });
});
