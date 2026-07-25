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
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.enum';
import { UsersService } from './users.service';

const AVATAR_ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;
const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: AVATAR_ALLOWED_MIME_TYPES }),
          new MaxFileSizeValidator({ maxSize: AVATAR_MAX_SIZE_BYTES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const avatarUrl = await this.cloudinaryService.uploadImage(
      file.buffer,
      user.sub,
    );
    return this.usersService.updateAvatar(user.sub, avatarUrl);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('me/avatar')
  removeAvatar(@CurrentUser() user: JwtPayload) {
    return this.usersService.updateAvatar(user.sub, null);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@CurrentUser() actor: JwtPayload, @Body() dto: CreateUserDto) {
    const user = await this.usersService.createByAdmin(dto);
    await this.auditLogsService.record({
      actorId: actor.sub,
      action: 'user.created',
      targetType: 'User',
      targetId: user.id,
      changes: { name: user.name, email: user.email, role: user.role },
    });
    return user;
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @CurrentUser() actor: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    await this.auditLogsService.record({
      actorId: actor.sub,
      action: 'user.updated',
      targetType: 'User',
      targetId: id,
      changes: { ...dto },
    });
    return user;
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@CurrentUser() actor: JwtPayload, @Param('id') id: string) {
    await this.usersService.softDelete(id);
    await this.auditLogsService.record({
      actorId: actor.sub,
      action: 'user.deleted',
      targetType: 'User',
      targetId: id,
    });
  }
}
