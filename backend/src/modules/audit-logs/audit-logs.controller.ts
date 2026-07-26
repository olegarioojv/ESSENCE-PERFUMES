import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { AuditLogsService } from './audit-logs.service';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoria', type: [AuditLog] })
  findAll(@Query() query: FindAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }
}
