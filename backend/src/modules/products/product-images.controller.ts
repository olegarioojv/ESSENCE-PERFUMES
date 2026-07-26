import {
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
import { Role } from '../users/entities/role.enum';
import { ProductImage } from './entities/product-image.entity';
import { ProductImagesService } from './product-images.service';

const IMAGE_ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;
const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('products')
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar imagens do produto' })
  @ApiResponse({ status: 200, description: 'Lista de imagens do produto', type: [ProductImage] })
  findAll(@Param('productId') productId: string) {
    return this.productImagesService.findAllByProduct(productId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Enviar imagem do produto (admin)' })
  @ApiResponse({ status: 201, description: 'Imagem enviada', type: ProductImage })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  upload(
    @Param('productId') productId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: IMAGE_ALLOWED_MIME_TYPES }),
          new MaxFileSizeValidator({ maxSize: IMAGE_MAX_SIZE_BYTES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productImagesService.upload(productId, file);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':imageId/primary')
  @ApiOperation({ summary: 'Definir imagem principal do produto (admin)' })
  @ApiResponse({ status: 200, description: 'Imagem principal definida', type: ProductImage })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  setPrimary(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productImagesService.setPrimary(productId, imageId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':imageId')
  @ApiOperation({ summary: 'Remover imagem do produto (admin)' })
  @ApiResponse({ status: 204, description: 'Imagem removida' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async remove(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    await this.productImagesService.remove(productId, imageId);
  }
}
