import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { DashboardService } from './dashboard.service';
import { BestSellersQueryDto } from './dto/best-sellers-query.dto';
import { SalesChartQueryDto } from './dto/sales-chart-query.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo geral do dashboard (admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna total de vendas, pedidos, clientes, produtos, ticket médio e lucro',
  })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Listar produtos mais vendidos (admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna lista de produtos mais vendidos com quantidade vendida e receita',
  })
  getBestSellers(@Query() query: BestSellersQueryDto) {
    return this.dashboardService.getBestSellers(query);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Listar produtos sem estoque disponível (admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna lista de produtos com estoque esgotado, incluindo quantidade e quantidade reservada',
  })
  getOutOfStock() {
    return this.dashboardService.getOutOfStock();
  }

  @Get('sales-chart')
  @ApiOperation({ summary: 'Obter dados do gráfico de vendas por período (admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Retorna série de pontos com data, quantidade de pedidos e receita por dia',
  })
  getSalesChart(@Query() query: SalesChartQueryDto) {
    return this.dashboardService.getSalesChart(query);
  }
}
