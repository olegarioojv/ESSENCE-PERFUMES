import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/entities/role.enum';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { WebhookQueryDto } from './dto/webhook-query.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId')
  createCharge(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.createCharge(orderId, {
      sub: user.sub,
      role: user.role,
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findOne(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @Get(':id/logs')
  findLogs(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findLogs(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/simulate')
  simulate(@Param('id') id: string) {
    return this.paymentsService.simulate(id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.cancel(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @Public()
  @Post('webhook')
  webhook(@Query() query: WebhookQueryDto, @Body() payload: WebhookPayloadDto) {
    return this.paymentsService.processWebhook(query.webhookSecret, payload);
  }
}
