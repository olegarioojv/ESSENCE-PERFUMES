import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { Favorite } from './entities/favorite.entity';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar favoritos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos', type: [Favorite] })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar produto aos favoritos' })
  @ApiResponse({ status: 201, description: 'Favorito adicionado', type: Favorite })
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(user.sub, dto.productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remover produto dos favoritos' })
  @ApiResponse({ status: 200, description: 'Favorito removido' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.remove(user.sub, productId);
  }
}
