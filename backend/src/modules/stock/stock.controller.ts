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
import { ApiTags } from '@nestjs/swagger';
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
import { StockService } from './stock.service';

@ApiTags('stock')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get('low-stock')
  findLowStock() {
    return this.stockService.findLowStock();
  }

  @Get('movements')
  findMovements(@Query() query: FindStockMovementsDto) {
    return this.stockService.findMovements(query);
  }

  @Get(':productId')
  findByProduct(@Param('productId') productId: string) {
    return this.stockService.findByProduct(productId);
  }

  @Get(':productId/history')
  findProductHistory(
    @Param('productId') productId: string,
    @Query() query: FindStockMovementsDto,
  ) {
    return this.stockService.findMovements({ ...query, productId });
  }

  @Post(':productId/in')
  stockIn(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.stockIn(productId, dto, user.sub);
  }

  @Post(':productId/out')
  stockOut(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.stockOut(productId, dto, user.sub);
  }

  @Patch(':productId/adjust')
  adjust(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.adjust(productId, dto, user.sub);
  }

  @Post(':productId/count')
  count(
    @Param('productId') productId: string,
    @Body() dto: CountStockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.count(productId, dto, user.sub);
  }

  @Post(':productId/reserve')
  reserve(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.reserve(productId, dto, user.sub);
  }

  @Post(':productId/release')
  release(
    @Param('productId') productId: string,
    @Body() dto: StockQuantityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.stockService.release(productId, dto, user.sub);
  }

  @Patch(':productId/settings')
  updateSettings(
    @Param('productId') productId: string,
    @Body() dto: UpdateStockSettingsDto,
  ) {
    return this.stockService.updateSettings(productId, dto);
  }
}
