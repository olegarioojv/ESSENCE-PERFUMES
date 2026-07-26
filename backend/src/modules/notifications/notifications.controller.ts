import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/entities/role.enum';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações do usuário',
    type: [Notification],
  })
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: FindNotificationsDto,
  ) {
    return this.notificationsService.findAllForUser(user.sub, query);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({
    status: 200,
    description: 'Notificação marcada como lida',
    type: Notification,
  })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar todas as notificações (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações de todos os usuários',
    type: [Notification],
  })
  findAll(@Query() query: FindNotificationsDto) {
    return this.notificationsService.findAll(query);
  }
}
