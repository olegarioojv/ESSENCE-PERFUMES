import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Brand } from './../src/modules/brands/entities/brand.entity';
import { Cart } from './../src/modules/cart/entities/cart.entity';
import { CartItem } from './../src/modules/cart/entities/cart-item.entity';
import { Category } from './../src/modules/categories/entities/category.entity';
import { Coupon } from './../src/modules/coupons/entities/coupon.entity';
import { OrderItem } from './../src/modules/orders/entities/order-item.entity';
import { OrderStatusHistory } from './../src/modules/orders/entities/order-status-history.entity';
import { Order } from './../src/modules/orders/entities/order.entity';
import { Product } from './../src/modules/products/entities/product.entity';
import { StockMovement } from './../src/modules/stock/entities/stock-movement.entity';
import { Stock } from './../src/modules/stock/entities/stock.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Coupons (e2e)', () => {
  let app: INestApplication<App>;

  let usersRepository: Repository<User>;
  let categoriesRepository: Repository<Category>;
  let brandsRepository: Repository<Brand>;
  let productsRepository: Repository<Product>;
  let stockRepository: Repository<Stock>;
  let stockMovementsRepository: Repository<StockMovement>;
  let cartsRepository: Repository<Cart>;
  let cartItemsRepository: Repository<CartItem>;
  let ordersRepository: Repository<Order>;
  let orderItemsRepository: Repository<OrderItem>;
  let orderHistoryRepository: Repository<OrderStatusHistory>;
  let couponsRepository: Repository<Coupon>;

  const buyerEmail = `coupon-e2e-buyer-${Date.now()}@example.com`;
  const adminEmail = `coupon-e2e-admin-${Date.now()}@example.com`;
  const password = 'Senha123';

  let buyerId: string;
  let buyerToken: string;
  let adminId: string;
  let adminToken: string;

  let categoryId: string;
  let brandId: string;
  let productId: string;

  const orderIds: string[] = [];
  const couponIds: string[] = [];

  async function resetCartWithItem(quantity: number): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/cart/items/${productId}`)
      .set('Authorization', `Bearer ${buyerToken}`);
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, quantity })
      .expect(201);
  }

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
    brandsRepository = moduleFixture.get(getRepositoryToken(Brand));
    productsRepository = moduleFixture.get(getRepositoryToken(Product));
    stockRepository = moduleFixture.get(getRepositoryToken(Stock));
    stockMovementsRepository = moduleFixture.get(
      getRepositoryToken(StockMovement),
    );
    cartsRepository = moduleFixture.get(getRepositoryToken(Cart));
    cartItemsRepository = moduleFixture.get(getRepositoryToken(CartItem));
    ordersRepository = moduleFixture.get(getRepositoryToken(Order));
    orderItemsRepository = moduleFixture.get(getRepositoryToken(OrderItem));
    orderHistoryRepository = moduleFixture.get(
      getRepositoryToken(OrderStatusHistory),
    );
    couponsRepository = moduleFixture.get(getRepositoryToken(Coupon));

    const buyerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Coupon E2E Buyer', email: buyerEmail, password })
      .expect(201);
    buyerId = buyerRes.body.user.id;
    buyerToken = buyerRes.body.accessToken;

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Coupon E2E Admin', email: adminEmail, password })
      .expect(201);
    adminId = adminRes.body.user.id;
    await usersRepository.update({ id: adminId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    const category = categoriesRepository.create({
      name: `Coupon E2E Category ${Date.now()}`,
      slug: `coupon-e2e-category-${Date.now()}`,
    });
    await categoriesRepository.save(category);
    categoryId = category.id;

    const brand = brandsRepository.create({
      name: `Coupon E2E Brand ${Date.now()}`,
    });
    await brandsRepository.save(brand);
    brandId = brand.id;

    const product = productsRepository.create({
      name: 'Coupon E2E Product',
      sku: `COUPON-E2E-SKU-${Date.now()}`,
      slug: `coupon-e2e-product-${Date.now()}`,
      price: '100.00',
      brandId,
      categoryId,
    });
    await productsRepository.save(product);
    productId = product.id;

    const stock = stockRepository.create({
      productId,
      quantity: 1000,
      reservedQuantity: 0,
      minQuantity: 0,
    });
    await stockRepository.save(stock);
  });

  afterAll(async () => {
    if (orderIds.length > 0) {
      for (const id of orderIds) {
        await orderHistoryRepository.delete({ orderId: id });
        await orderItemsRepository.delete({ orderId: id });
      }
      await ordersRepository.delete(orderIds as never);
    }

    if (couponIds.length > 0) {
      await couponsRepository.delete(couponIds as never);
    }

    if (buyerId) {
      const cart = await cartsRepository.findOne({
        where: { userId: buyerId },
      });
      if (cart) {
        await cartItemsRepository.delete({ cartId: cart.id });
        await cartsRepository.delete({ id: cart.id });
      }
    }

    if (productId) {
      await stockMovementsRepository.delete({ productId });
      await stockRepository.delete({ productId });
      await productsRepository.delete({ id: productId });
    }
    if (categoryId) {
      await categoriesRepository.delete({ id: categoryId });
    }
    if (brandId) {
      await brandsRepository.delete({ id: brandId });
    }
    if (buyerId) {
      await usersRepository.delete({ id: buyerId });
    }
    if (adminId) {
      await usersRepository.delete({ id: adminId });
    }

    await app.close();
  });

  describe('Admin CRUD', () => {
    let percentualCouponId: string;
    let valorFixoCouponId: string;
    let crudCouponId: string;

    const percentualCode = `E2E-PCT-${Date.now()}`;
    const valorFixoCode = `E2E-FIX-${Date.now()}`;
    const crudCode = `E2E-CRUD-${Date.now()}`;

    it('denies coupon creation to a non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ code: `E2E-DENY-${Date.now()}`, type: 'percentual', value: 10 })
        .expect(403);
    });

    it('creates a percentual coupon as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: percentualCode, type: 'percentual', value: 10 })
        .expect(201);

      expect(response.body.code).toBe(percentualCode.toUpperCase());
      expect(response.body.type).toBe('percentual');
      expect(response.body.value).toBe('10.00');
      expect(response.body.isActive).toBe(true);

      percentualCouponId = response.body.id;
      couponIds.push(percentualCouponId);
    });

    it('creates a valor_fixo coupon as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: valorFixoCode, type: 'valor_fixo', value: 20 })
        .expect(201);

      expect(response.body.code).toBe(valorFixoCode.toUpperCase());
      expect(response.body.type).toBe('valor_fixo');
      expect(response.body.value).toBe('20.00');

      valorFixoCouponId = response.body.id;
      couponIds.push(valorFixoCouponId);
    });

    it('lists all coupons', async () => {
      const response = await request(app.getHttpServer())
        .get('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.some((c: { id: string }) => c.id === percentualCouponId),
      ).toBe(true);
    });

    it('creates a coupon for the CRUD lifecycle test', async () => {
      const response = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: crudCode, type: 'percentual', value: 5 })
        .expect(201);

      crudCouponId = response.body.id;
      couponIds.push(crudCouponId);
    });

    it('gets a single coupon by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/coupons/${crudCouponId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(crudCouponId);
    });

    it('updates a coupon', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/coupons/${crudCouponId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: 15 })
        .expect(200);

      expect(response.body.value).toBe('15.00');
    });

    it('deactivates and reactivates a coupon', async () => {
      const deactivated = await request(app.getHttpServer())
        .patch(`/coupons/${crudCouponId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(deactivated.body.isActive).toBe(false);

      const activated = await request(app.getHttpServer())
        .patch(`/coupons/${crudCouponId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(activated.body.isActive).toBe(true);
    });

    it('deletes a coupon', async () => {
      await request(app.getHttpServer())
        .delete(`/coupons/${crudCouponId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/coupons/${crudCouponId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      // Already deleted, remove from cleanup list.
      couponIds.splice(couponIds.indexOf(crudCouponId), 1);
    });
  });

  describe('Checkout integration', () => {
    it('applies a percentual coupon on checkout', async () => {
      const code = `E2E-CHK-PCT-${Date.now()}`;
      const couponRes = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code, type: 'percentual', value: 10 })
        .expect(201);
      couponIds.push(couponRes.body.id);

      await resetCartWithItem(1);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: code })
        .expect(201);

      expect(response.body.subtotal).toBe('100.00');
      expect(response.body.discountAmount).toBe('10.00');
      expect(response.body.total).toBe('90.00');
      expect(response.body.couponCode).toBe(code.toUpperCase());

      orderIds.push(response.body.id);
    });

    it('applies a valor_fixo coupon on checkout', async () => {
      const code = `E2E-CHK-FIX-${Date.now()}`;
      const couponRes = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code, type: 'valor_fixo', value: 20 })
        .expect(201);
      couponIds.push(couponRes.body.id);

      await resetCartWithItem(1);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: code })
        .expect(201);

      expect(response.body.subtotal).toBe('100.00');
      expect(response.body.discountAmount).toBe('20.00');
      expect(response.body.total).toBe('80.00');

      orderIds.push(response.body.id);
    });

    it('rejects checkout with an unknown coupon code', async () => {
      await resetCartWithItem(1);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: `NOT-A-REAL-CODE-${Date.now()}` })
        .expect(400);

      expect(response.body.message).toContain('Cupom inválido');
    });

    it('rejects checkout once a coupon reaches its maxUses limit', async () => {
      const code = `E2E-MAXUSE-${Date.now()}`;
      const couponRes = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code, type: 'percentual', value: 5, maxUses: 1 })
        .expect(201);
      couponIds.push(couponRes.body.id);

      await resetCartWithItem(1);
      const firstUse = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: code })
        .expect(201);
      orderIds.push(firstUse.body.id);

      await resetCartWithItem(1);
      const secondUse = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: code })
        .expect(400);

      expect(secondUse.body.message).toContain(
        'Cupom atingiu o limite de uso',
      );
    });

    it('rejects checkout with an expired coupon', async () => {
      const code = `E2E-EXPIRED-${Date.now()}`;
      const couponRes = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code,
          type: 'percentual',
          value: 5,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);
      couponIds.push(couponRes.body.id);

      await resetCartWithItem(1);
      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: code })
        .expect(400);

      expect(response.body.message).toContain('Cupom expirado');
    });

    it('rejects checkout with an inactive coupon', async () => {
      const code = `E2E-INACTIVE-${Date.now()}`;
      const couponRes = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code, type: 'percentual', value: 5, isActive: false })
        .expect(201);
      couponIds.push(couponRes.body.id);

      await resetCartWithItem(1);
      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ couponCode: code })
        .expect(400);

      expect(response.body.message).toContain('Cupom inativo');
    });
  });
});
