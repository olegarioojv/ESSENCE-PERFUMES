import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Brand } from './../src/modules/brands/entities/brand.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

// NOTE: the multipart logo upload routes (POST/DELETE /brands/:id/logo) are
// intentionally out of scope for this e2e suite — exercising them meaningfully
// would require a real image fixture and a live Cloudinary round trip, which is
// disproportionate to the value for this pass. All other brand routes are covered.
describe('Brands (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let brandsRepository: Repository<Brand>;

  const suffix = Date.now();
  const adminEmail = `brands-admin-e2e-${suffix}@example.com`;
  const userEmail = `brands-user-e2e-${suffix}@example.com`;
  const password = 'Senha123';

  let adminUserId: string;
  let adminAccessToken: string;
  let userUserId: string;
  let userAccessToken: string;

  const brandIds: string[] = [];

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
    brandsRepository = moduleFixture.get(getRepositoryToken(Brand));

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Brands Admin E2E', email: adminEmail, password });
    adminUserId = adminRegister.body.user.id;
    await usersRepository.update({ id: adminUserId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password });
    adminAccessToken = adminLogin.body.accessToken;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Brands User E2E', email: userEmail, password });
    userUserId = userRegister.body.user.id;
    userAccessToken = userRegister.body.accessToken;
  });

  afterAll(async () => {
    if (brandIds.length) {
      await brandsRepository.delete(brandIds);
    }
    if (adminUserId) {
      await usersRepository.delete({ id: adminUserId });
    }
    if (userUserId) {
      await usersRepository.delete({ id: userUserId });
    }
    await app.close();
  });

  it('creates a brand as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/brands')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `Marca E2E ${suffix}`,
        description: 'Marca criada em teste e2e',
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.name).toBe(`Marca E2E ${suffix}`);
    brandIds.push(response.body.id);
  });

  it('rejects creation for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .post('/brands')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ name: `Marca Negada ${suffix}` })
      .expect(403);
  });

  it('lists brands publicly without auth', async () => {
    const response = await request(app.getHttpServer())
      .get('/brands')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((b: Brand) => b.id === brandIds[0])).toBe(true);
  });

  it('finds a brand by id publicly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/brands/${brandIds[0]}`)
      .expect(200);

    expect(response.body.name).toBe(`Marca E2E ${suffix}`);
  });

  it('returns 404 for an unknown brand id', async () => {
    await request(app.getHttpServer())
      .get('/brands/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('updates a brand as admin', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/brands/${brandIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ description: 'Descrição atualizada' })
      .expect(200);

    expect(response.body.description).toBe('Descrição atualizada');
  });

  it('rejects update for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .patch(`/brands/${brandIds[0]}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ description: 'Não deveria funcionar' })
      .expect(403);
  });

  it('returns 404 when updating an unknown brand', async () => {
    await request(app.getHttpServer())
      .patch('/brands/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ description: 'Não existe' })
      .expect(404);
  });

  it('deletes a brand as admin', async () => {
    await request(app.getHttpServer())
      .delete(`/brands/${brandIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/brands/${brandIds[0]}`)
      .expect(404);

    brandIds.pop();
  });

  it('rejects delete for a non-admin user with 403', async () => {
    const created = await request(app.getHttpServer())
      .post('/brands')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: `Marca Para Deletar ${suffix}` })
      .expect(201);
    brandIds.push(created.body.id);

    await request(app.getHttpServer())
      .delete(`/brands/${created.body.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });
});
