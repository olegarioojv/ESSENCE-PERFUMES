import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/entities/role.enum';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { WebhookQueryDto } from './dto/webhook-query.dto';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @Post('orders/:orderId')
  @ApiOperation({ summary: 'Criar cobrança de pagamento para um pedido' })
  @ApiResponse({ status: 201, description: 'Cobrança criada', type: Payment })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  createCharge(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.createCharge(orderId, {
      sub: user.sub,
      role: user.role,
    });
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento pelo id' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado', type: Payment })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findOne(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @ApiBearerAuth()
  @Get(':id/logs')
  @ApiOperation({ summary: 'Listar logs de eventos do pagamento' })
  @ApiResponse({ status: 200, description: 'Lista de logs do pagamento', type: [PaymentLog] })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  findLogs(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findLogs(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/simulate')
  @ApiOperation({ summary: 'Simular aprovação do pagamento (admin)' })
  @ApiResponse({ status: 200, description: 'Pagamento simulado', type: Payment })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  simulate(@Param('id') id: string) {
    return this.paymentsService.simulate(id);
  }

  @ApiBearerAuth()
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento cancelado', type: Payment })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.cancel(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Receber notificações de webhook do provedor de pagamento' })
  @ApiResponse({ status: 200, description: 'Webhook processado' })
  webhook(@Query() query: WebhookQueryDto, @Body() payload: WebhookPayloadDto) {
    return this.paymentsService.processWebhook(query.webhookSecret, payload);
  }
}
