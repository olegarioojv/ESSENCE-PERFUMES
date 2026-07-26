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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias', type: [Category] })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar categoria pelo slug' })
  @ApiParam({ name: 'slug', example: 'perfumes-femininos' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada', type: Category })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria pelo id' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada', type: Category })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar categoria (admin)' })
  @ApiResponse({ status: 201, description: 'Categoria criada', type: Category })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria (admin)' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada', type: Category })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar categoria (admin)' })
  @ApiResponse({ status: 200, description: 'Categoria ativada', type: Category })
  activate(@Param('id') id: string) {
    return this.categoriesService.setActive(id, true);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desativar categoria (admin)' })
  @ApiResponse({ status: 200, description: 'Categoria desativada', type: Category })
  deactivate(@Param('id') id: string) {
    return this.categoriesService.setActive(id, false);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria (admin)' })
  @ApiResponse({ status: 204, description: 'Categoria removida' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
  }
}
