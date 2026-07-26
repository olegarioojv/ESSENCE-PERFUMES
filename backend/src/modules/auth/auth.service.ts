import { randomBytes, createHash } from 'crypto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { MoreThan, IsNull, Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../users/entities/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginHistory } from './entities/login-history.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface LoginContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

function toSafeUser(user: User): SafeUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokensRepository: Repository<PasswordResetToken>,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async register(dto: RegisterDto): Promise<{ user: SafeUser } & AuthTokens> {
    const saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const tokens = await this.issueTokens(user);
    return { user: toSafeUser(user), ...tokens };
  }

  async login(
    dto: LoginDto,
    context: LoginContext = {},
  ): Promise<{ user: SafeUser } & AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email, true);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const loginHistory = this.loginHistoryRepository.create({
      userId: user.id,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    });
    await this.loginHistoryRepository.save(loginHistory);

    const tokens = await this.issueTokens(user);
    return { user: toSafeUser(user), ...tokens };
  }

  async getLoginHistory(
    userId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  ): Promise<LoginHistory[]> {
    return this.loginHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.refreshTokensRepository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    await this.refreshTokensRepository.update(stored.id, {
      revokedAt: new Date(),
    });

    const user = await this.usersService.findById(stored.userId);
    return this.issueTokens(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.refreshTokensRepository.update(
      { userId, tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const message = 'Se o email existir, enviaremos instruções.';
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const expiresInSeconds = this.configService.getOrThrow<number>(
        'RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS',
      );

      const resetToken = this.passwordResetTokensRepository.create({
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      });
      await this.passwordResetTokensRepository.save(resetToken);

      this.logger.info(
        { email: user.email, resetToken: rawToken },
        'password reset token issued',
      );

      await this.notificationsService.notifyPasswordRecovery(user.id);
    }

    return { message };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = hashToken(dto.token);
    const stored = await this.passwordResetTokensRepository.findOne({
      where: { tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });

    if (!stored) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.usersService.updatePassword(stored.userId, passwordHash);
    await this.passwordResetTokensRepository.update(stored.id, {
      usedAt: new Date(),
    });
    await this.revokeAllRefreshTokens(stored.userId);

    return { message: 'Senha redefinida com sucesso.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);

    if (
      !user ||
      !(await bcrypt.compare(dto.currentPassword, user.passwordHash))
    ) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.usersService.updatePassword(userId, passwordHash);
    await this.revokeAllRefreshTokens(userId);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const rawRefreshToken = randomBytes(64).toString('hex');
    const expiresInSeconds = this.configService.getOrThrow<number>(
      'REFRESH_TOKEN_EXPIRES_IN_SECONDS',
    );

    const refreshToken = this.refreshTokensRepository.create({
      userId: user.id,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });
    await this.refreshTokensRepository.save(refreshToken);

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}
