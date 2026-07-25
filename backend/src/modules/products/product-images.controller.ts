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
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/entities/role.enum';
import { ProductImagesService } from './product-images.service';

const IMAGE_ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;
const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('products')
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Public()
  @Get()
  findAll(@Param('productId') productId: string) {
    return this.productImagesService.findAllByProduct(productId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
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

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':imageId/primary')
  setPrimary(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productImagesService.setPrimary(productId, imageId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':imageId')
  async remove(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    await this.productImagesService.remove(productId, imageId);
  }
}
