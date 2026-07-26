import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../users/entities/role.enum';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar pedidos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos', type: [Order] })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: FindOrdersDto) {
    return this.ordersService.findAllForUser(user.sub, query);
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido pelo id' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.ordersService.findOne(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @ApiBearerAuth()
  @Get(':id/timeline')
  @ApiOperation({ summary: 'Buscar histórico de status do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Histórico de status do pedido',
    type: [OrderStatusHistory],
  })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findTimeline(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.ordersService.findTimeline(id, {
      sub: user.sub,
      role: user.role,
    });
  }

  @ApiBearerAuth()
  @Post('checkout')
  @ApiOperation({ summary: 'Finalizar checkout e criar pedido a partir do carrinho' })
  @ApiResponse({ status: 201, description: 'Pedido criado', type: Order })
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(user.sub, dto);
  }

  @ApiBearerAuth()
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(
      id,
      { sub: user.sub, role: user.role },
      dto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Status atualizado', type: Order })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto, user.sub);
  }
}
