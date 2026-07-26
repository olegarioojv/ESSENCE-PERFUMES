import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '../users/entities/role.enum';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

const LOGO_ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;
const LOGO_MAX_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas as marcas' })
  @ApiResponse({ status: 200, description: 'Lista de marcas', type: [Brand] })
  findAll() {
    return this.brandsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar marca pelo id' })
  @ApiResponse({ status: 200, description: 'Marca encontrada', type: Brand })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar marca (admin)' })
  @ApiResponse({ status: 201, description: 'Marca criada', type: Brand })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar marca (admin)' })
  @ApiResponse({ status: 200, description: 'Marca atualizada', type: Brand })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Enviar logo da marca (admin)' })
  @ApiResponse({ status: 201, description: 'Logo atualizado', type: Brand })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: LOGO_ALLOWED_MIME_TYPES }),
          new MaxFileSizeValidator({ maxSize: LOGO_MAX_SIZE_BYTES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.brandsService.findById(id);
    const { url } = await this.cloudinaryService.uploadImage(
      file.buffer,
      id,
      'brands',
    );
    return this.brandsService.updateLogo(id, url);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id/logo')
  @ApiOperation({ summary: 'Remover logo da marca (admin)' })
  @ApiResponse({ status: 200, description: 'Logo removido', type: Brand })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  removeLogo(@Param('id') id: string) {
    return this.brandsService.updateLogo(id, null);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover marca (admin)' })
  @ApiResponse({ status: 204, description: 'Marca removida' })
  @ApiResponse({ status: 404, description: 'Marca não encontrada' })
  async remove(@Param('id') id: string) {
    await this.brandsService.remove(id);
  }
}
