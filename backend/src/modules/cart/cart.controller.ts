import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Obter resumo do carrinho do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Resumo do carrinho' })
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.cartService.getSummary(user.sub);
  }

  @ApiBearerAuth()
  @Post('items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({ status: 201, description: 'Item adicionado, resumo atualizado do carrinho' })
  addItem(@CurrentUser() user: JwtPayload, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @ApiBearerAuth()
  @Patch('items/:productId')
  @ApiOperation({ summary: 'Atualizar quantidade de um item do carrinho' })
  @ApiResponse({ status: 200, description: 'Resumo atualizado do carrinho' })
  @ApiResponse({ status: 404, description: 'Item não encontrado no carrinho' })
  updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.sub, productId, dto);
  }

  @ApiBearerAuth()
  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiResponse({ status: 200, description: 'Resumo atualizado do carrinho' })
  @ApiResponse({ status: 404, description: 'Item não encontrado no carrinho' })
  removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.sub, productId);
  }
}
