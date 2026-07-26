import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';

function buildAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: 'log-1',
    actorId: 'user-1',
    action: 'update',
    targetType: 'User',
    targetId: 'user-2',
    changes: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let service: jest.Mocked<Pick<AuditLogsService, 'findAll'>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [{ provide: AuditLogsService, useValue: service }],
    }).compile();

    controller = module.get(AuditLogsController);
  });

  it('findAll delegates to the service with the query', async () => {
    const query: FindAuditLogsDto = { targetType: 'User', page: 1, limit: 20 };
    const logs = [buildAuditLog()];
    service.findAll.mockResolvedValue(logs);

    await expect(controller.findAll(query)).resolves.toBe(logs);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });
});
