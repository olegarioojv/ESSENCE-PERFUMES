import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { PasswordResetToken } from './../src/modules/auth/entities/password-reset-token.entity';
import { RefreshToken } from './../src/modules/auth/entities/refresh-token.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let refreshTokensRepository: Repository<RefreshToken>;
  let passwordResetTokensRepository: Repository<PasswordResetToken>;

  const email = `auth-e2e-${Date.now()}@example.com`;
  const password = 'Senha123';
  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    refreshTokensRepository = moduleFixture.get(getRepositoryToken(RefreshToken));
    passwordResetTokensRepository = moduleFixture.get(getRepositoryToken(PasswordResetToken));
  });

  afterAll(async () => {
    if (userId) {
      await refreshTokensRepository.delete({ userId });
      await passwordResetTokensRepository.delete({ userId });
      await usersRepository.delete({ id: userId });
    }
    await app.close();
  });

  it('registers a new user and returns tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Auth E2E', email, password })
      .expect(201);

    expect(response.body.user.email).toBe(email);
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));

    userId = response.body.user.id;
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('rejects duplicate registration with 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Auth E2E', email, password })
      .expect(409);
  });

  it('rejects GET /users/me without a token', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('returns the profile for an authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(email);
  });

  it('updates the profile', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Novo Nome' })
      .expect(200);

    expect(response.body.name).toBe('Novo Nome');
  });

  it('rotates the refresh token and revokes the previous one', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).not.toBe(refreshToken);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('invalidates the refresh token on logout', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(204);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('runs the forgot-password / reset-password flow', async () => {
    const loggerSpy = jest.spyOn(PinoLogger.prototype, 'info');

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Se o email existir, enviaremos instruções.');
      });

    const call = loggerSpy.mock.calls.find(
      ([payload]) => (payload as { email?: string })?.email === email,
    );
    expect(call).toBeDefined();
    const rawResetToken = (call?.[0] as { resetToken: string }).resetToken;
    loggerSpy.mockRestore();

    const newPassword = 'NovaSenha123';
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: rawResetToken, newPassword })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(401);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: newPassword })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
  });

  it('changes the password and revokes existing refresh tokens', async () => {
    const finalPassword = 'SenhaFinal123';

    await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'NovaSenha123', newPassword: finalPassword })
      .expect(204);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: finalPassword })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
  });

  it('denies GET /users to a non-admin user', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('allows GET /users to an admin user', async () => {
    await usersRepository.update({ id: userId }, { role: Role.ADMIN });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'SenhaFinal123' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
