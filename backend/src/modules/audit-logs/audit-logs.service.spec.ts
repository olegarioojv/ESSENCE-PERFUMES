import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let repository: jest.Mocked<
    Pick<Repository<AuditLog>, 'create' | 'save' | 'find'>
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data as AuditLog),
      save: jest.fn((entity) => Promise.resolve(entity as AuditLog)),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: getRepositoryToken(AuditLog), useValue: repository },
      ],
    }).compile();

    service = module.get(AuditLogsService);
  });

  describe('record', () => {
    it('persists an audit log entry with a null changes fallback', async () => {
      await service.record({
        actorId: 'admin-1',
        action: 'user.deleted',
        targetType: 'User',
        targetId: 'user-1',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ changes: null }),
      );
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('defaults to page 1 and limit 20', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('filters by targetType and targetId when provided', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll({
        targetType: 'User',
        targetId: 'user-1',
        page: 2,
        limit: 10,
      });

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { targetType: 'User', targetId: 'user-1' },
          skip: 10,
          take: 10,
        }),
      );
    });
  });
});
