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
import { StockMovement } from './../src/modules/stock/entities/stock-movement.entity';
import { Stock } from './../src/modules/stock/entities/stock.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Stock (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let productsRepository: Repository<Product>;
  let categoriesRepository: Repository<Category>;
  let brandsRepository: Repository<Brand>;
  let stockRepository: Repository<Stock>;
  let stockMovementsRepository: Repository<StockMovement>;

  const suffix = Date.now();
  const adminEmail = `stock-admin-e2e-${suffix}@example.com`;
  const userEmail = `stock-user-e2e-${suffix}@example.com`;
  const password = 'Senha123';

  let adminUserId: string;
  let adminAccessToken: string;
  let userUserId: string;
  let userAccessToken: string;

  let categoryId: string;
  let brandId: string;
  let productId: string;

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
    stockRepository = moduleFixture.get(getRepositoryToken(Stock));
    stockMovementsRepository = moduleFixture.get(
      getRepositoryToken(StockMovement),
    );

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Stock Admin E2E', email: adminEmail, password });
    adminUserId = adminRegister.body.user.id;
    await usersRepository.update({ id: adminUserId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password });
    adminAccessToken = adminLogin.body.accessToken;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Stock User E2E', email: userEmail, password });
    userUserId = userRegister.body.user.id;
    userAccessToken = userRegister.body.accessToken;

    const category = await categoriesRepository.save(
      categoriesRepository.create({
        name: `Categoria Stock E2E ${suffix}`,
        slug: `categoria-stock-e2e-${suffix}`,
      }),
    );
    categoryId = category.id;

    const brand = await brandsRepository.save(
      brandsRepository.create({ name: `Marca Stock E2E ${suffix}` }),
    );
    brandId = brand.id;

    const product = await productsRepository.save(
      productsRepository.create({
        name: `Produto Stock E2E ${suffix}`,
        sku: `SKU-STOCK-${suffix}`,
        slug: `produto-stock-e2e-${suffix}`,
        price: '100.00',
        brandId,
        categoryId,
      }),
    );
    productId = product.id;
  });

  afterAll(async () => {
    if (productId) {
      await stockMovementsRepository.delete({ productId });
      await stockRepository.delete({ productId });
      await productsRepository.delete({ id: productId });
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

  it('rejects any stock access for a non-admin user with 403', async () => {
    await request(app.getHttpServer())
      .get('/stock')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/stock/${productId}/in`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ quantity: 10 })
      .expect(403);
  });

  it('rejects unauthenticated access with 401', async () => {
    await request(app.getHttpServer()).get('/stock').expect(401);
  });

  it('gets (and lazily creates) stock for a product as admin', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stock/${productId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(response.body.productId).toBe(productId);
    expect(response.body.quantity).toBe(0);
    expect(response.body.reservedQuantity).toBe(0);
  });

  it('registers a stock-in movement', async () => {
    const response = await request(app.getHttpServer())
      .post(`/stock/${productId}/in`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 50, reason: 'Compra do fornecedor' })
      .expect(201);

    expect(response.body.quantity).toBe(50);
  });

  it('rejects a stock-out larger than the available quantity with 400', async () => {
    await request(app.getHttpServer())
      .post(`/stock/${productId}/out`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 1000 })
      .expect(400);
  });

  it('registers a stock-out movement', async () => {
    const response = await request(app.getHttpServer())
      .post(`/stock/${productId}/out`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 20, reason: 'Venda' })
      .expect(201);

    expect(response.body.quantity).toBe(30);
  });

  it('reserves stock', async () => {
    const response = await request(app.getHttpServer())
      .post(`/stock/${productId}/reserve`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 10, reason: 'Pedido em processamento' })
      .expect(201);

    expect(response.body.reservedQuantity).toBe(10);
  });

  it('rejects reserving more than available with 400', async () => {
    await request(app.getHttpServer())
      .post(`/stock/${productId}/reserve`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 1000 })
      .expect(400);
  });

  it('releases reserved stock', async () => {
    const response = await request(app.getHttpServer())
      .post(`/stock/${productId}/release`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 4 })
      .expect(201);

    expect(response.body.reservedQuantity).toBe(6);
  });

  it('rejects releasing more than reserved with 400', async () => {
    await request(app.getHttpServer())
      .post(`/stock/${productId}/release`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 1000 })
      .expect(400);
  });

  it('adjusts stock to an absolute quantity', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/stock/${productId}/adjust`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ quantity: 100, reason: 'Correção após divergência' })
      .expect(200);

    expect(response.body.quantity).toBe(100);
  });

  it('records a physical count', async () => {
    const response = await request(app.getHttpServer())
      .post(`/stock/${productId}/count`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ countedQuantity: 95, reason: 'Inventário mensal' })
      .expect(201);

    expect(response.body.quantity).toBe(95);
  });

  it('updates stock settings (minQuantity)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/stock/${productId}/settings`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ minQuantity: 200 })
      .expect(200);

    expect(response.body.minQuantity).toBe(200);
  });

  it('lists low-stock products including this one after raising minQuantity', async () => {
    const response = await request(app.getHttpServer())
      .get('/stock/low-stock')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(
      response.body.some((s: Stock) => s.productId === productId),
    ).toBe(true);
  });

  it('lists all stock entries as admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/stock')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((s: Stock) => s.productId === productId)).toBe(
      true,
    );
  });

  it('lists movement history for the product', async () => {
    const response = await request(app.getHttpServer())
      .get(`/stock/${productId}/history`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(
      response.body.items.every(
        (m: StockMovement) => m.productId === productId,
      ),
    ).toBe(true);
  });

  it('filters movements by productId and type via /stock/movements', async () => {
    const response = await request(app.getHttpServer())
      .get('/stock/movements')
      .query({ productId, type: 'entrada' })
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    expect(
      response.body.items.every(
        (m: StockMovement) => m.type === 'entrada' && m.productId === productId,
      ),
    ).toBe(true);
  });

  it('returns 404 for stock operations on an unknown product', async () => {
    await request(app.getHttpServer())
      .get('/stock/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(404);
  });
});
