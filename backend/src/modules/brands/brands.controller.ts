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
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '../users/entities/role.enum';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

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
  findAll() {
    return this.brandsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
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
    const logoUrl = await this.cloudinaryService.uploadImage(
      file.buffer,
      id,
      'brands',
    );
    return this.brandsService.updateLogo(id, logoUrl);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id/logo')
  removeLogo(@Param('id') id: string) {
    return this.brandsService.updateLogo(id, null);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandsService.remove(id);
  }
}
