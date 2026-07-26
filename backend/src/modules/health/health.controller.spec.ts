import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<Pick<HealthCheckService, 'check'>>;
  let db: jest.Mocked<Pick<TypeOrmHealthIndicator, 'pingCheck'>>;

  beforeEach(async () => {
    health = { check: jest.fn() };
    db = { pingCheck: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: health },
        { provide: TypeOrmHealthIndicator, useValue: db },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  describe('check', () => {
    it('runs a database ping check', async () => {
      health.check.mockImplementation(async (indicators) => {
        for (const indicator of indicators) {
          await indicator();
        }
        return { status: 'ok', info: {}, error: {}, details: {} };
      });
      db.pingCheck.mockResolvedValue({ database: { status: 'up' } });

      const result = await controller.check();

      expect(health.check).toHaveBeenCalledWith([expect.any(Function)]);
      expect(db.pingCheck).toHaveBeenCalledWith('database');
      expect(result.status).toBe('ok');
    });
  });
});
