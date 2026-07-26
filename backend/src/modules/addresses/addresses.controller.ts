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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar endereços do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de endereços', type: [Address] })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.addressesService.findAllByUser(user.sub);
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço do usuário pelo id' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado', type: Address })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.addressesService.findOneOwned(id, user.sub);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Cadastrar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado', type: Address })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço do usuário' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado', type: Address })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, user.sub, dto);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover endereço do usuário' })
  @ApiResponse({ status: 204, description: 'Endereço removido' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.addressesService.remove(id, user.sub);
  }
}
