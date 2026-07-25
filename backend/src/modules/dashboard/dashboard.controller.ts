import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { DashboardService } from './dashboard.service';
import { BestSellersQueryDto } from './dto/best-sellers-query.dto';
import { SalesChartQueryDto } from './dto/sales-chart-query.dto';

@ApiTags('dashboard')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('best-sellers')
  getBestSellers(@Query() query: BestSellersQueryDto) {
    return this.dashboardService.getBestSellers(query);
  }

  @Get('out-of-stock')
  getOutOfStock() {
    return this.dashboardService.getOutOfStock();
  }

  @Get('sales-chart')
  getSalesChart(@Query() query: SalesChartQueryDto) {
    return this.dashboardService.getSalesChart(query);
  }
}
