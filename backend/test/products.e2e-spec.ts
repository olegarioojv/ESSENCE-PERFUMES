import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Brand } from './../src/modules/brands/entities/brand.entity';
import { Category } from './../src/modules/categories/entities/category.entity';
import { Product } from './../src/modules/products/entities/product.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let productsRepository: Repository<Product>;
  let categoriesRepository: Repository<Category>;
  let brandsRepository: Repository<Brand>;

  const suffix = Date.now();
  const adminEmail = `products-admin-e2e-${suffix}@example.com`;
  const userEmail = `products-user-e2e-${suffix}@example.com`;
  const password = 'Senha123';

  let adminUserId: string;
  let adminAccessToken: string;
  let userUserId: string;
  let userAccessToken: string;

  let categoryId: string;
  let brandId: string;
  const productIds: string[] = [];

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
    productsRepository = moduleFixture.get(getRepositoryToken(Product));
    categoriesRepository = moduleFixture.get(getRepositoryToken(Category));
    brandsRepository = moduleFixture.get(getRepositoryToken(Brand));

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Products Admin E2E', email: adminEmail, password });
    adminUserId = adminRegister.body.user.id;
    await usersRepository.update({ id: adminUserId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password });
    adminAccessToken = adminLogin.body.accessToken;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Products User E2E', email: userEmail, password });
    userUserId = userRegister.body.user.id;
    userAccessToken = userRegister.body.accessToken;

    const category = await categoriesRepository.save(
      categoriesRepository.create({
        name: `Categoria Produtos E2E ${suffix}`,
        slug: `categoria-produtos-e2e-${suffix}`,
      }),
    );
    categoryId = category.id;

    const brand = await brandsRepository.save(
      brandsRepository.create({ name: `Marca Produtos E2E ${suffix}` }),
    );
    brandId = brand.id;
  });

  afterAll(async () => {
    if (productIds.length) {
      await productsRepository.delete(productIds);
    }
    if (brandId) {
      await brandsRepository.delete({ id: brandId });
    }
    if (categoryId) {
      await categoriesRepository.delete({ id: categoryId });
    }
    if (adminUserId) {
      await usersRepository.delete({ id: adminUserId });
    }
    if (userUserId) {
      await usersRepository.delete({ id: userUserId });
    }
    await app.close();
  });

  it('creates a product as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `Produto E2E ${suffix}`,
        sku: `SKU-E2E-${suffix}`,
        slug: `produto-e2e-${suffix}`,
        price: 199.9,
        costPrice: 99.9,
        brandId,
        categoryId,
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.sku).toBe(`SKU-E2E-${suffix}`);
    expect(response.body.costPrice).toBe('99.90');
    expect(response.body.isActive).toBe(true);
    expect(response.body.isFeatured).toBe(false);
    productIds.push(response.body.id);
  });

  it('rejects creation for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: `Produto Negado ${suffix}`,
        sku: `SKU-NEGADO-${suffix}`,
        price: 50,
        brandId,
        categoryId,
      })
      .expect(403);
  });

  it('lists products publicly without auth', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(
      response.body.items.some((p: Product) => p.id === productIds[0]),
    ).toBe(true);
  });

  it('finds a product by slug publicly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products/slug/produto-e2e-${suffix}`)
      .expect(200);

    expect(response.body.id).toBe(productIds[0]);
  });

  it('finds a product by id publicly', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products/${productIds[0]}`)
      .expect(200);

    expect(response.body.sku).toBe(`SKU-E2E-${suffix}`);
  });

  it('returns 404 for an unknown product id', async () => {
    await request(app.getHttpServer())
      .get('/products/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('updates a product as admin', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ price: 249.9 })
      .expect(200);

    expect(response.body.price).toBe('249.90');
  });

  it('rejects update for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ price: 1 })
      .expect(403);
  });

  it('deactivates and reactivates a product as admin', async () => {
    const deactivated = await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}/deactivate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(deactivated.body.isActive).toBe(false);

    const activated = await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}/activate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(activated.body.isActive).toBe(true);
  });

  it('features and unfeatures a product as admin', async () => {
    const featured = await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}/feature`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(featured.body.isFeatured).toBe(true);

    const unfeatured = await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}/unfeature`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
    expect(unfeatured.body.isFeatured).toBe(false);
  });

  it('rejects feature/deactivate for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}/feature`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/products/${productIds[0]}/deactivate`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });

  it('deletes a product as admin', async () => {
    const created = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `Produto Para Deletar ${suffix}`,
        sku: `SKU-DEL-${suffix}`,
        price: 10,
        brandId,
        categoryId,
      })
      .expect(201);
    productIds.push(created.body.id);

    await request(app.getHttpServer())
      .delete(`/products/${created.body.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/products/${created.body.id}`)
      .expect(404);

    productIds.splice(productIds.indexOf(created.body.id), 1);
  });

  it('rejects delete for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${productIds[0]}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);
  });
});
