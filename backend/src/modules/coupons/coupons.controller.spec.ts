import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
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
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('CouponsController', () => {
  let controller: CouponsController;
  let service: jest.Mocked<
    Pick<
      CouponsService,
      'findAll' | 'findById' | 'create' | 'update' | 'setActive' | 'remove'
    >
  >;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      setActive: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [{ provide: CouponsService, useValue: service }],
    }).compile();

    controller = module.get(CouponsController);
  });

  describe('findAll', () => {
    it('returns all coupons from the service', async () => {
      const result = [buildCoupon()];
      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toBe(result);
      expect(service.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('returns a coupon by id', async () => {
      const result = buildCoupon();
      service.findById.mockResolvedValue(result);

      await expect(controller.findOne('coupon-1')).resolves.toBe(result);
      expect(service.findById).toHaveBeenCalledWith('coupon-1');
    });
  });

  describe('create', () => {
    it('creates a coupon', async () => {
      const dto: CreateCouponDto = {
        code: 'BEMVINDO10',
        type: CouponType.PERCENTUAL,
        value: 10,
      };
      const result = buildCoupon();
      service.create.mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('updates a coupon', async () => {
      const dto: UpdateCouponDto = { value: 20 };
      const result = buildCoupon({ value: '20.00' });
      service.update.mockResolvedValue(result);

      await expect(controller.update('coupon-1', dto)).resolves.toBe(result);
      expect(service.update).toHaveBeenCalledWith('coupon-1', dto);
    });
  });

  describe('activate', () => {
    it('activates a coupon', async () => {
      const result = buildCoupon({ isActive: true });
      service.setActive.mockResolvedValue(result);

      await expect(controller.activate('coupon-1')).resolves.toBe(result);
      expect(service.setActive).toHaveBeenCalledWith('coupon-1', true);
    });
  });

  describe('deactivate', () => {
    it('deactivates a coupon', async () => {
      const result = buildCoupon({ isActive: false });
      service.setActive.mockResolvedValue(result);

      await expect(controller.deactivate('coupon-1')).resolves.toBe(result);
      expect(service.setActive).toHaveBeenCalledWith('coupon-1', false);
    });
  });

  describe('remove', () => {
    it('removes a coupon', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('coupon-1');

      expect(service.remove).toHaveBeenCalledWith('coupon-1');
    });
  });
});
