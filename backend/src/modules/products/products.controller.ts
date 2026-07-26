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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos', type: [Product] })
  findAll(@Query() query: FindProductsDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar produto pelo slug' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto pelo id' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar produto (admin)' })
  @ApiResponse({ status: 201, description: 'Produto criado', type: Product })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto (admin)' })
  @ApiResponse({ status: 200, description: 'Produto atualizado', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar produto (admin)' })
  @ApiResponse({ status: 200, description: 'Produto ativado', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  activate(@Param('id') id: string) {
    return this.productsService.setActive(id, true);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desativar produto (admin)' })
  @ApiResponse({ status: 200, description: 'Produto desativado', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  deactivate(@Param('id') id: string) {
    return this.productsService.setActive(id, false);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/feature')
  @ApiOperation({ summary: 'Marcar produto como destaque (admin)' })
  @ApiResponse({ status: 200, description: 'Produto marcado como destaque', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  feature(@Param('id') id: string) {
    return this.productsService.setFeatured(id, true);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/unfeature')
  @ApiOperation({ summary: 'Remover produto do destaque (admin)' })
  @ApiResponse({ status: 200, description: 'Produto removido do destaque', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  unfeature(@Param('id') id: string) {
    return this.productsService.setFeatured(id, false);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto (admin)' })
  @ApiResponse({ status: 204, description: 'Produto removido' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
