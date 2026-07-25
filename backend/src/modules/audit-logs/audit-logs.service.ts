import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface RecordAuditLogData {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, unknown> | null;
}

export interface FindAuditLogsFilters {
  targetType?: string;
  targetId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
  ) {}

  async record(data: RecordAuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create({
      ...data,
      changes: data.changes ?? null,
    });
    return this.auditLogsRepository.save(auditLog);
  }

  async findAll(filters: FindAuditLogsFilters = {}): Promise<AuditLog[]> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    const where: Partial<Pick<AuditLog, 'targetType' | 'targetId'>> = {};
    if (filters.targetType) {
      where.targetType = filters.targetType;
    }
    if (filters.targetId) {
      where.targetId = filters.targetId;
    }

    return this.auditLogsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
