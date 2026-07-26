import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Brand } from './../src/modules/brands/entities/brand.entity';
import { Category } from './../src/modules/categories/entities/category.entity';
import { Favorite } from './../src/modules/favorites/entities/favorite.entity';
import { Product } from './../src/modules/products/entities/product.entity';
import { User } from './../src/modules/users/entities/user.entity';

describe('Favorites (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let favoritesRepository: Repository<Favorite>;
  let productsRepository: Repository<Product>;
  let categoriesRepository: Repository<Category>;
  let brandsRepository: Repository<Brand>;

  const suffix = Date.now();
  const email = `favorites-e2e-${suffix}@example.com`;
  const password = 'Senha123';
  let userId: string;
  let accessToken: string;
  let productId: string;
  let categoryId: string;
  let brandId: string;

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
    favoritesRepository = moduleFixture.get(getRepositoryToken(Favorite));
    productsRepository = moduleFixture.get(getRepositoryToken(Product));
    categoriesRepository = moduleFixture.get(getRepositoryToken(Category));
    brandsRepository = moduleFixture.get(getRepositoryToken(Brand));

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Favorites E2E', email, password })
      .expect(201);

    userId = registerResponse.body.user.id;
    accessToken = registerResponse.body.accessToken;

    const category = await categoriesRepository.save(
      categoriesRepository.create({
        name: `Categoria Favoritos ${suffix}`,
        slug: `categoria-favoritos-${suffix}`,
      }),
    );
    categoryId = category.id;

    const brand = await brandsRepository.save(
      brandsRepository.create({
        name: `Marca Favoritos ${suffix}`,
      }),
    );
    brandId = brand.id;

    const product = await productsRepository.save(
      productsRepository.create({
        name: `Perfume Favoritos ${suffix}`,
        sku: `SKU-FAV-${suffix}`,
        slug: `perfume-favoritos-${suffix}`,
        price: '199.90',
        brandId,
        categoryId,
      }),
    );
    productId = product.id;
  });

  afterAll(async () => {
    if (productId) {
      await favoritesRepository.delete({ productId });
      await productsRepository.delete({ id: productId });
    }
    if (categoryId) {
      await categoriesRepository.delete({ id: categoryId });
    }
    if (brandId) {
      await brandsRepository.delete({ id: brandId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    await app.close();
  });

  it('rejects unauthenticated requests with 401', async () => {
    await request(app.getHttpServer()).get('/favorites').expect(401);
    await request(app.getHttpServer())
      .post('/favorites')
      .send({ productId })
      .expect(401);
    await request(app.getHttpServer())
      .delete(`/favorites/${productId}`)
      .expect(401);
  });

  it('adds a product to favorites', async () => {
    const response = await request(app.getHttpServer())
      .post('/favorites')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId })
      .expect(201);

    expect(response.body.userId).toBe(userId);
    expect(response.body.productId).toBe(productId);
  });

  it('lists the favorited product', async () => {
    const response = await request(app.getHttpServer())
      .get('/favorites')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(
      response.body.some((product: { id: string }) => product.id === productId),
    ).toBe(true);
  });

  it('rejects adding the same product twice with 409', async () => {
    // FavoritesService.add throws ConflictException when the (userId, productId)
    // pair already exists — it is not idempotent.
    await request(app.getHttpServer())
      .post('/favorites')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId })
      .expect(409);
  });

  it('removes the product from favorites', async () => {
    await request(app.getHttpServer())
      .delete(`/favorites/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/favorites')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(
      response.body.some((product: { id: string }) => product.id === productId),
    ).toBe(false);
  });

  it('returns 404 when removing a product that is not favorited', async () => {
    // FavoritesService.remove throws NotFoundException when there is no
    // matching favorite row — it is not a silent no-op.
    await request(app.getHttpServer())
      .delete(`/favorites/${productId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
