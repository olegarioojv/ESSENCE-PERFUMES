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
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CountStockDto } from './dto/count-stock.dto';
import { FindStockMovementsDto } from './dto/find-stock-movements.dto';
import { StockQuantityDto } from './dto/stock-quantity.dto';
import { UpdateStockSettingsDto } from './dto/update-stock-settings.dto';
import { Stock } from './entities/stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockService } from './stock.service';

@ApiTags('stock')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estoque de todos os produtos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de estoque', type: [Stock] })
  findAll() {
    return this.stockService.findAll();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Listar produtos com estoque baixo (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de produtos com estoque baixo', type: [Stock] })
  findLowStock() {
    return this.stockService.findLowStock();
  }

  @Get('movements')
  @ApiOperation({ summary: 'Listar movimentações de estoque (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações de estoque', type: [StockMovement] })
  findMovements(@Query() query: FindStockMovementsDto) {
    return this.stockService.findMovements(query);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Buscar estoque de um produto (admin)' })
  @ApiResponse({ status: 200, description: 'Estoque do produto', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findByProduct(@Param('productId') productId: string) {
    return this.stockService.findByProduct(productId);
  }

  @Get(':productId/history')
  @ApiOperation({ summary: 'Buscar histórico de movimentações do produto (admin)' })
  @ApiResponse({ status: 200, description: 'Histórico de movimentações do produto', type: [StockMovement] })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findProductHistory(
    @Param('productId') productId: string,
    @Query() query: FindStockMovementsDto,
  ) {
    return this.stockService.findMovements({ ...query, productId });
  }

  @Post(':productId/in')
  @ApiOperation({ summary: 'Registrar entrada de estoque (admin)' })
  @ApiResponse({ status: 201, description: 'Entrada de estoque registrada', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  stockIn(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.stockIn(productId, dto, user.sub);
  }

  @Post(':productId/out')
  @ApiOperation({ summary: 'Registrar saída de estoque (admin)' })
  @ApiResponse({ status: 201, description: 'Saída de estoque registrada', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  stockOut(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.stockOut(productId, dto, user.sub);
  }

  @Patch(':productId/adjust')
  @ApiOperation({ summary: 'Ajustar quantidade de estoque (admin)' })
  @ApiResponse({ status: 200, description: 'Estoque ajustado', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  adjust(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.adjust(productId, dto, user.sub);
  }

  @Post(':productId/count')
  @ApiOperation({ summary: 'Registrar contagem de estoque (admin)' })
  @ApiResponse({ status: 201, description: 'Contagem de estoque registrada', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  count(
    @Param('productId') productId: string,
    @Body() dto: CountStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.count(productId, dto, user.sub);
  }

  @Post(':productId/reserve')
  @ApiOperation({ summary: 'Reservar quantidade de estoque (admin)' })
  @ApiResponse({ status: 201, description: 'Estoque reservado', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  reserve(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.reserve(productId, dto, user.sub);
  }

  @Post(':productId/release')
  @ApiOperation({ summary: 'Liberar reserva de estoque (admin)' })
  @ApiResponse({ status: 201, description: 'Reserva de estoque liberada', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  release(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.release(productId, dto, user.sub);
  }

  @Patch(':productId/settings')
  @ApiOperation({ summary: 'Atualizar configurações de estoque do produto (admin)' })
  @ApiResponse({ status: 200, description: 'Configurações de estoque atualizadas', type: Stock })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  updateSettings(
    @Param('productId') productId: string,
    @Body() dto: UpdateStockSettingsDto,
  ) {
    return this.stockService.updateSettings(productId, dto);
  }
}
