import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { Role } from '../users/entities/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';

const CONFIG_VALUES: Record<string, number> = {
  BCRYPT_SALT_ROUNDS: 4,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS: 2592000,
  RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS: 900,
};

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: 'hashed-password',
    role: Role.CLIENTE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      'create' | 'findByEmail' | 'findById' | 'findByIdWithPassword' | 'updatePassword'
    >
  >;
  let refreshTokensRepository: jest.Mocked<
    Pick<Repository<RefreshToken>, 'create' | 'save' | 'findOne' | 'update'>
  >;
  let passwordResetTokensRepository: jest.Mocked<
    Pick<Repository<PasswordResetToken>, 'create' | 'save' | 'findOne' | 'update'>
  >;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByIdWithPassword: jest.fn(),
      updatePassword: jest.fn(),
    };

    refreshTokensRepository = {
      create: jest.fn((data) => data as RefreshToken),
      save: jest.fn((entity) => Promise.resolve(entity as RefreshToken)),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    passwordResetTokensRepository = {
      create: jest.fn((data) => data as PasswordResetToken),
      save: jest.fn((entity) => Promise.resolve(entity as PasswordResetToken)),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('access-token') } },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn((key: string) => CONFIG_VALUES[key]) },
        },
        { provide: PinoLogger, useValue: { setContext: jest.fn(), info: jest.fn() } },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokensRepository },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: passwordResetTokensRepository,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      const user = buildUser();
      usersService.create.mockResolvedValue(user);

      const result = await service.register({
        name: user.name,
        email: user.email,
        password: 'Senha123',
      });

      expect(result.user).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(refreshTokensRepository.save).toHaveBeenCalled();
    });

    it('propagates ConflictException on duplicate email', async () => {
      usersService.create.mockRejectedValue(new ConflictException('Email já cadastrado'));

      await expect(
        service.register({ name: 'X', email: 'dup@example.com', password: 'Senha123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Senha123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password with the same message as unknown email', async () => {
      const user = buildUser({ passwordHash: await bcrypt.hash('CorrectPass1', 4) });
      usersService.findByEmail.mockResolvedValue(user);

      try {
        await service.login({ email: user.email, password: 'WrongPass1' });
        fail('expected UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe('Credenciais inválidas');
      }

      usersService.findByEmail.mockResolvedValue(null);
      try {
        await service.login({ email: 'ghost@example.com', password: 'WrongPass1' });
        fail('expected UnauthorizedException');
      } catch (error) {
        expect((error as UnauthorizedException).message).toBe('Credenciais inválidas');
      }
    });

    it('returns tokens on success', async () => {
      const passwordHash = await bcrypt.hash('Senha123', 4);
      const user = buildUser({ passwordHash });
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: user.email, password: 'Senha123' });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toEqual(expect.any(String));
    });
  });

  describe('refresh', () => {
    it('rotates the refresh token: revokes the old one and issues a new pair', async () => {
      const user = buildUser();
      refreshTokensRepository.findOne.mockResolvedValue({
        id: 'rt-1',
        userId: user.id,
        tokenHash: 'irrelevant',
        expiresAt: new Date(Date.now() + 1000 * 60),
        revokedAt: null,
        createdAt: new Date(),
      });
      usersService.findById.mockResolvedValue(user);

      const result = await service.refresh('raw-refresh-token');

      expect(refreshTokensRepository.update).toHaveBeenCalledWith(
        'rt-1',
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      expect(result.accessToken).toBe('access-token');
    });

    it('throws UnauthorizedException when the token is not found (expired/revoked/unknown)', async () => {
      refreshTokensRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('returns the generic message and persists a token when the email exists', async () => {
      const user = buildUser();
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.forgotPassword({ email: user.email });

      expect(result.message).toBe('Se o email existir, enviaremos instruções.');
      expect(passwordResetTokensRepository.save).toHaveBeenCalled();
    });

    it('returns the same generic message when the email does not exist, without persisting anything', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'ghost@example.com' });

      expect(result.message).toBe('Se o email existir, enviaremos instruções.');
      expect(passwordResetTokensRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException for an invalid/expired token', async () => {
      passwordResetTokensRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad-token', newPassword: 'NovaSenha123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates the password and revokes all refresh tokens on success', async () => {
      passwordResetTokensRepository.findOne.mockResolvedValue({
        id: 'prt-1',
        userId: 'user-1',
        tokenHash: 'irrelevant',
        expiresAt: new Date(Date.now() + 1000 * 60),
        usedAt: null,
        createdAt: new Date(),
      });

      await service.resetPassword({ token: 'good-token', newPassword: 'NovaSenha123' });

      expect(usersService.updatePassword).toHaveBeenCalledWith('user-1', expect.any(String));
      expect(passwordResetTokensRepository.update).toHaveBeenCalledWith(
        'prt-1',
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
      expect(refreshTokensRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1', revokedAt: expect.anything() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('changePassword', () => {
    it('throws UnauthorizedException when the current password is wrong', async () => {
      const user = buildUser({ passwordHash: await bcrypt.hash('CorrectPass1', 4) });
      usersService.findByIdWithPassword.mockResolvedValue(user);

      await expect(
        service.changePassword(user.id, {
          currentPassword: 'WrongPass1',
          newPassword: 'NovaSenha123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('updates the password and revokes all refresh tokens on success', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass1', 4);
      const user = buildUser({ passwordHash });
      usersService.findByIdWithPassword.mockResolvedValue(user);

      await service.changePassword(user.id, {
        currentPassword: 'CorrectPass1',
        newPassword: 'NovaSenha123',
      });

      expect(usersService.updatePassword).toHaveBeenCalledWith(user.id, expect.any(String));
      expect(refreshTokensRepository.update).toHaveBeenCalledWith(
        { userId: user.id, revokedAt: expect.anything() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
