import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Category } from './../src/modules/categories/entities/category.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let categoriesRepository: Repository<Category>;

  const suffix = Date.now();
  const adminEmail = `categories-admin-e2e-${suffix}@example.com`;
  const userEmail = `categories-user-e2e-${suffix}@example.com`;
  const password = 'Senha123';

  let adminUserId: string;
  let adminAccessToken: string;
  let userUserId: string;
  let userAccessToken: string;

  const categoryIds: string[] = [];

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
    categoriesRepository = moduleFixture.get(getRepositoryToken(Category));

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Categories Admin E2E', email: adminEmail, password });
    adminUserId = adminRegister.body.user.id;
    await usersRepository.update({ id: adminUserId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password });
    adminAccessToken = adminLogin.body.accessToken;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Categories User E2E', email: userEmail, password });
    userUserId = userRegister.body.user.id;
    userAccessToken = userRegister.body.accessToken;
  });

  afterAll(async () => {
    if (categoryIds.length) {
      await categoriesRepository.delete(categoryIds);
    }
    if (adminUserId) {
      await usersRepository.delete({ id: adminUserId });
    }
    if (userUserId) {
      await usersRepository.delete({ id: userUserId });
    }
    await app.close();
  });

  it('creates a category as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `Categoria E2E ${suffix}`,
        slug: `categoria-e2e-${suffix}`,
        description: 'Categoria criada em teste e2e',
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.slug).toBe(`categoria-e2e-${suffix}`);
    expect(response.body.isActive).toBe(true);
    categoryIds.push(response.body.id);
  });

  it('rejects creation for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ name: `Categoria Negada ${suffix}` })
      .expect(403);
  });

  it('auto-suffixes a duplicate slug instead of throwing', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `Categoria Duplicada ${suffix}`,
        slug: `categoria-e2e-${suffix}`,
      })
      .expect(201);

    expect(response.body.slug).toBe(`categoria-e2e-${suffix}-2`);
    categoryIds.push(response.body.id);
  });

  it('lists categories publicly without auth', async () => {
    const response = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(
      response.body.some((c: Category) => c.id === categoryIds[0]),
    ).toBe(true);
  });

  it('finds a category by slug publicly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/slug/categoria-e2e-${suffix}`)
      .expect(200);

    expect(response.body.id).toBe(categoryIds[0]);
  });

  it('finds a category by id publicly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/${categoryIds[0]}`)
      .expect(200);

    expect(response.body.slug).toBe(`categoria-e2e-${suffix}`);
  });

  it('returns 404 for an unknown category id', async () => {
    await request(app.getHttpServer())
      .get('/categories/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('updates a category as admin', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/categories/${categoryIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ description: 'Descrição atualizada' })
      .expect(200);

    expect(response.body.description).toBe('Descrição atualizada');
  });

  it('rejects update for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .patch(`/categories/${categoryIds[0]}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ description: 'Não deveria funcionar' })
      .expect(403);
  });

  it('deactivates and reactivates a category as admin', async () => {
    const deactivated = await request(app.getHttpServer())
      .patch(`/categories/${categoryIds[0]}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(deactivated.body.isActive).toBe(false);

    const activated = await request(app.getHttpServer())
      .patch(`/categories/${categoryIds[0]}/activate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(activated.body.isActive).toBe(true);
  });

  it('rejects deactivate for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .patch(`/categories/${categoryIds[0]}/deactivate`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('deletes a category as admin', async () => {
    await request(app.getHttpServer())
      .delete(`/categories/${categoryIds[1]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/categories/${categoryIds[1]}`)
      .expect(404);

    categoryIds.splice(1, 1);
  });

  it('rejects delete for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .delete(`/categories/${categoryIds[0]}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });
});
