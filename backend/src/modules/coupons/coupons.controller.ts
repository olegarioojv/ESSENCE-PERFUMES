import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';

@ApiTags('coupons')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os cupons (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de cupons', type: [Coupon] })
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cupom pelo id (admin)' })
  @ApiResponse({ status: 200, description: 'Cupom encontrado', type: Coupon })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar cupom (admin)' })
  @ApiResponse({ status: 201, description: 'Cupom criado', type: Coupon })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cupom (admin)' })
  @ApiResponse({ status: 200, description: 'Cupom atualizado', type: Coupon })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar cupom (admin)' })
  @ApiResponse({ status: 200, description: 'Cupom ativado', type: Coupon })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  activate(@Param('id') id: string) {
    return this.couponsService.setActive(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desativar cupom (admin)' })
  @ApiResponse({ status: 200, description: 'Cupom desativado', type: Coupon })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  deactivate(@Param('id') id: string) {
    return this.couponsService.setActive(id, false);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover cupom (admin)' })
  @ApiResponse({ status: 204, description: 'Cupom removido' })
  @ApiResponse({ status: 404, description: 'Cupom não encontrado' })
  async remove(@Param('id') id: string) {
    await this.couponsService.remove(id);
  }
}
