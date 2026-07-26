import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService, AuthTokens, SafeUser } from './auth.service';
import { LoginHistory } from './entities/login-history.entity';
import { Role } from '../users/entities/role.enum';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

function buildSafeUser(overrides: Partial<SafeUser> = {}): SafeUser {
  return {
    id: 'user-1',
    name: 'Maria Silva',
    email: 'maria@example.com',
    role: Role.CLIENTE,
    ...overrides,
  };
}

function buildAuthTokens(overrides: Partial<AuthTokens> = {}): AuthTokens {
  return {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    ...overrides,
  };
}

function buildLoginHistory(
  overrides: Partial<LoginHistory> = {},
): LoginHistory {
  return {
    id: 'login-1',
    userId: 'user-1',
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
    createdAt: new Date(),
    ...overrides,
  };
}

const currentUser: JwtPayload = {
  sub: 'user-1',
  email: 'maria@example.com',
  role: Role.CLIENTE,
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<
    Pick<
      AuthService,
      | 'register'
      | 'login'
      | 'getLoginHistory'
      | 'refresh'
      | 'logout'
      | 'forgotPassword'
      | 'resetPassword'
      | 'changePassword'
    >
  >;

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
      getLoginHistory: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      changePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('register delegates to the service with the dto', async () => {
    const dto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123',
    };
    const result = { user: buildSafeUser(), ...buildAuthTokens() };
    service.register.mockResolvedValue(result);

    await expect(controller.register(dto)).resolves.toBe(result);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('login delegates to the service with the dto and request context', async () => {
    const dto = { email: 'maria@example.com', password: 'Senha123' };
    const request = {
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest' },
    } as unknown as Request;
    const result = { user: buildSafeUser(), ...buildAuthTokens() };
    service.login.mockResolvedValue(result);

    await expect(controller.login(dto, request)).resolves.toBe(result);
    expect(service.login).toHaveBeenCalledWith(dto, {
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });
  });

  it('login falls back to null ip/user-agent when absent', async () => {
    const dto = { email: 'maria@example.com', password: 'Senha123' };
    const request = { ip: undefined, headers: {} } as unknown as Request;
    const result = { user: buildSafeUser(), ...buildAuthTokens() };
    service.login.mockResolvedValue(result);

    await expect(controller.login(dto, request)).resolves.toBe(result);
    expect(service.login).toHaveBeenCalledWith(dto, {
      ipAddress: null,
      userAgent: null,
    });
  });

  it('getLoginHistory delegates to the service with the user id and query', async () => {
    const query = { page: 1, limit: 20 };
    const history = [buildLoginHistory()];
    service.getLoginHistory.mockResolvedValue(history);

    await expect(
      controller.getLoginHistory(currentUser, query),
    ).resolves.toBe(history);
    expect(service.getLoginHistory).toHaveBeenCalledWith('user-1', query);
  });

  it('refresh delegates to the service with the refresh token', async () => {
    const dto = { refreshToken: 'refresh-token' };
    const tokens = buildAuthTokens();
    service.refresh.mockResolvedValue(tokens);

    await expect(controller.refresh(dto)).resolves.toBe(tokens);
    expect(service.refresh).toHaveBeenCalledWith('refresh-token');
  });

  it('logout delegates to the service with the user id and refresh token', async () => {
    const dto = { refreshToken: 'refresh-token' };
    service.logout.mockResolvedValue(undefined);

    await controller.logout(currentUser, dto);

    expect(service.logout).toHaveBeenCalledWith('user-1', 'refresh-token');
  });

  it('forgotPassword delegates to the service with the dto', async () => {
    const dto = { email: 'maria@example.com' };
    const result = { message: 'Se o email existir, enviaremos instruções.' };
    service.forgotPassword.mockResolvedValue(result);

    await expect(controller.forgotPassword(dto)).resolves.toBe(result);
    expect(service.forgotPassword).toHaveBeenCalledWith(dto);
  });

  it('resetPassword delegates to the service with the dto', async () => {
    const dto = { token: 'reset-token', newPassword: 'NovaSenha123' };
    const result = { message: 'Senha redefinida com sucesso.' };
    service.resetPassword.mockResolvedValue(result);

    await expect(controller.resetPassword(dto)).resolves.toBe(result);
    expect(service.resetPassword).toHaveBeenCalledWith(dto);
  });

  it('changePassword delegates to the service with the user id and dto', async () => {
    const dto = {
      currentPassword: 'Senha123',
      newPassword: 'NovaSenha123',
    };
    service.changePassword.mockResolvedValue(undefined);

    await controller.changePassword(currentUser, dto);

    expect(service.changePassword).toHaveBeenCalledWith('user-1', dto);
  });
});
