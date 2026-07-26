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
import { User } from './entities/user.entity';
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

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Buscar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário', type: User })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado', type: User })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @ApiBearerAuth()
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Enviar avatar do usuário autenticado' })
  @ApiResponse({ status: 201, description: 'Avatar atualizado', type: User })
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
    const { url } = await this.cloudinaryService.uploadImage(
      file.buffer,
      user.sub,
      'avatars',
    );
    return this.usersService.updateAvatar(user.sub, url);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remover avatar do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Avatar removido', type: User })
  removeAvatar(@CurrentUser() user: JwtPayload) {
    return this.usersService.updateAvatar(user.sub, null);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário pelo id (admin)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar usuário (admin)' })
  @ApiResponse({ status: 201, description: 'Usuário criado', type: User })
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

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário (admin)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
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

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário (admin)' })
  @ApiResponse({ status: 204, description: 'Usuário removido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
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
