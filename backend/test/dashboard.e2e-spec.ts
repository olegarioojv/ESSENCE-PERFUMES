import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { AuditLog } from './../src/modules/audit-logs/entities/audit-log.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Dashboard + Audit Logs (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let auditLogsRepository: Repository<AuditLog>;

  const suffix = Date.now();
  const adminEmail = `dashboard-e2e-admin-${suffix}@example.com`;
  const clientEmail = `dashboard-e2e-client-${suffix}@example.com`;
  const createdByAdminEmail = `dashboard-e2e-created-${suffix}@example.com`;
  const password = 'Senha123';

  let adminUserId: string;
  let adminAccessToken: string;
  let clientUserId: string;
  let clientAccessToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    auditLogsRepository = moduleFixture.get(getRepositoryToken(AuditLog));

    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Dashboard E2E Admin', email: adminEmail, password })
      .expect(201);
    adminUserId = adminRegisterResponse.body.user.id;

    await usersRepository.update({ id: adminUserId }, { role: Role.ADMIN });

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminAccessToken = adminLoginResponse.body.accessToken;

    const clientRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Dashboard E2E Client', email: clientEmail, password })
      .expect(201);
    clientUserId = clientRegisterResponse.body.user.id;
    clientAccessToken = clientRegisterResponse.body.accessToken;
  });

  afterAll(async () => {
    if (createdUserId) {
      await auditLogsRepository.delete({ targetId: createdUserId });
      await usersRepository.delete({ id: createdUserId });
    }
    if (adminUserId) {
      await auditLogsRepository.delete({ actorId: adminUserId });
      await usersRepository.delete({ id: adminUserId });
    }
    if (clientUserId) {
      await usersRepository.delete({ id: clientUserId });
    }
    await app.close();
  });

  describe('access control', () => {
    it('denies GET /dashboard/summary to a non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${clientAccessToken}`)
        .expect(403);
    });

    it('denies GET /dashboard/summary without authentication', async () => {
      await request(app.getHttpServer()).get('/dashboard/summary').expect(401);
    });

    it('denies GET /audit-logs to a non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${clientAccessToken}`)
        .expect(403);
    });
  });

  describe('admin endpoints', () => {
    it('returns the summary with numeric fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(typeof response.body.totalSales).toBe('number');
      expect(typeof response.body.ordersCount).toBe('number');
      expect(typeof response.body.customersCount).toBe('number');
      expect(typeof response.body.productsCount).toBe('number');
      expect(typeof response.body.averageTicket).toBe('number');
      expect(typeof response.body.profit).toBe('number');
    });

    it('returns the best sellers list', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/best-sellers')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns the out-of-stock list', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/out-of-stock')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns the sales chart series', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/sales-chart')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns 200 with audit logs for an admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('audit logging side effect', () => {
    it('records an audit log entry when an admin creates a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Created By Admin',
          email: createdByAdminEmail,
          password,
          role: Role.CLIENTE,
        })
        .expect(201);

      createdUserId = createResponse.body.id;
      expect(createResponse.body.email).toBe(createdByAdminEmail);

      const auditLog = await auditLogsRepository.findOne({
        where: { targetId: createdUserId, action: 'user.created' },
      });

      expect(auditLog).not.toBeNull();
      expect(auditLog?.actorId).toBe(adminUserId);
      expect(auditLog?.targetType).toBe('User');
      expect(auditLog?.changes).toMatchObject({
        name: 'Created By Admin',
        email: createdByAdminEmail,
        role: Role.CLIENTE,
      });

      const listResponse = await request(app.getHttpServer())
        .get('/audit-logs')
        .query({ targetType: 'User', targetId: createdUserId })
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(
        listResponse.body.some(
          (log: { id: string; action: string }) =>
            log.id === auditLog?.id && log.action === 'user.created',
        ),
      ).toBe(true);
    });
  });
});
