import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Brand } from './../src/modules/brands/entities/brand.entity';
import { Category } from './../src/modules/categories/entities/category.entity';
import { CartItem } from './../src/modules/cart/entities/cart-item.entity';
import { Cart } from './../src/modules/cart/entities/cart.entity';
import { Notification } from './../src/modules/notifications/entities/notification.entity';
import { OrderItem } from './../src/modules/orders/entities/order-item.entity';
import { OrderStatusHistory } from './../src/modules/orders/entities/order-status-history.entity';
import { Order } from './../src/modules/orders/entities/order.entity';
import { Product } from './../src/modules/products/entities/product.entity';
import { StockMovement } from './../src/modules/stock/entities/stock-movement.entity';
import { Stock } from './../src/modules/stock/entities/stock.entity';
import { PasswordResetToken } from './../src/modules/auth/entities/password-reset-token.entity';
import { RefreshToken } from './../src/modules/auth/entities/refresh-token.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Notifications (e2e)', () => {
  let app: INestApplication<App>;

  let usersRepository: Repository<User>;
  let refreshTokensRepository: Repository<RefreshToken>;
  let passwordResetTokensRepository: Repository<PasswordResetToken>;
  let categoriesRepository: Repository<Category>;
  let brandsRepository: Repository<Brand>;
  let productsRepository: Repository<Product>;
  let stockRepository: Repository<Stock>;
  let stockMovementsRepository: Repository<StockMovement>;
  let cartRepository: Repository<Cart>;
  let cartItemsRepository: Repository<CartItem>;
  let ordersRepository: Repository<Order>;
  let orderItemsRepository: Repository<OrderItem>;
  let orderHistoryRepository: Repository<OrderStatusHistory>;
  let notificationsRepository: Repository<Notification>;

  const suffix = Date.now();
  const buyerEmail = `notifications-e2e-buyer-${suffix}@example.com`;
  const otherEmail = `notifications-e2e-other-${suffix}@example.com`;
  const adminEmail = `notifications-e2e-admin-${suffix}@example.com`;
  const password = 'Senha123';

  let buyerId: string;
  let otherId: string;
  let adminId: string;
  let buyerToken: string;
  let otherToken: string;
  let adminToken: string;

  let categoryId: string;
  let brandId: string;
  let productId: string;
  let orderId: string;

  async function registerAndLogin(email: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Notifications E2E', email, password })
      .expect(201);
    return {
      id: response.body.user.id as string,
      token: response.body.accessToken as string,
    };
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
    refreshTokensRepository = moduleFixture.get(
      getRepositoryToken(RefreshToken),
    );
    passwordResetTokensRepository = moduleFixture.get(
      getRepositoryToken(PasswordResetToken),
    );
    categoriesRepository = moduleFixture.get(getRepositoryToken(Category));
    brandsRepository = moduleFixture.get(getRepositoryToken(Brand));
    productsRepository = moduleFixture.get(getRepositoryToken(Product));
    stockRepository = moduleFixture.get(getRepositoryToken(Stock));
    stockMovementsRepository = moduleFixture.get(
      getRepositoryToken(StockMovement),
    );
    cartRepository = moduleFixture.get(getRepositoryToken(Cart));
    cartItemsRepository = moduleFixture.get(getRepositoryToken(CartItem));
    ordersRepository = moduleFixture.get(getRepositoryToken(Order));
    orderItemsRepository = moduleFixture.get(getRepositoryToken(OrderItem));
    orderHistoryRepository = moduleFixture.get(
      getRepositoryToken(OrderStatusHistory),
    );
    notificationsRepository = moduleFixture.get(
      getRepositoryToken(Notification),
    );

    const category = categoriesRepository.create({
      name: `Categoria Notifications E2E ${suffix}`,
      slug: `categoria-notifications-e2e-${suffix}`,
      isActive: true,
    });
    await categoriesRepository.save(category);
    categoryId = category.id;

    const brand = brandsRepository.create({
      name: `Marca Notifications E2E ${suffix}`,
    });
    await brandsRepository.save(brand);
    brandId = brand.id;

    const product = productsRepository.create({
      name: `Perfume Notifications E2E ${suffix}`,
      sku: `SKU-NOTIF-E2E-${suffix}`,
      slug: `perfume-notifications-e2e-${suffix}`,
      price: '30.00',
      brandId,
      categoryId,
      isActive: true,
    });
    await productsRepository.save(product);
    productId = product.id;

    const stock = stockRepository.create({
      productId,
      quantity: 50,
      reservedQuantity: 0,
      minQuantity: 0,
    });
    await stockRepository.save(stock);

    const buyer = await registerAndLogin(buyerEmail);
    buyerId = buyer.id;
    buyerToken = buyer.token;

    const other = await registerAndLogin(otherEmail);
    otherId = other.id;
    otherToken = other.token;

    const admin = await registerAndLogin(adminEmail);
    adminId = admin.id;
    await usersRepository.update({ id: adminId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId, quantity: 1 })
      .expect(201);

    const checkoutResponse = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({})
      .expect(201);
    orderId = checkoutResponse.body.id;
  });

  afterAll(async () => {
    await notificationsRepository.delete({ userId: buyerId });
    await notificationsRepository.delete({ userId: otherId });
    await notificationsRepository.delete({ userId: adminId });

    if (orderId) {
      await orderHistoryRepository.delete({ orderId });
      await orderItemsRepository.delete({ orderId });
      await ordersRepository.delete({ id: orderId });
    }
    if (productId) {
      await stockMovementsRepository.delete({ productId });
      await stockRepository.delete({ productId });
      await cartItemsRepository.delete({ productId });
    }
    for (const userId of [buyerId, otherId, adminId]) {
      if (userId) {
        await cartRepository.delete({ userId });
        await refreshTokensRepository.delete({ userId });
        await passwordResetTokensRepository.delete({ userId });
        await usersRepository.delete({ id: userId });
      }
    }
    if (productId) {
      await productsRepository.delete({ id: productId });
    }
    if (brandId) {
      await brandsRepository.delete({ id: brandId });
    }
    if (categoryId) {
      await categoriesRepository.delete({ id: categoryId });
    }
    await app.close();
  });

  let orderCreatedNotificationId: string;

  it('shows a pedido_criado notification for the buyer after checkout', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications/me')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    const items = response.body.items as Array<{
      id: string;
      type: string;
      read: boolean;
      metadata: { orderId?: string };
    }>;
    const orderCreatedNotification = items.find(
      (item) => item.type === 'pedido_criado' && item.metadata?.orderId === orderId,
    );
    expect(orderCreatedNotification).toBeDefined();
    expect(orderCreatedNotification?.read).toBe(false);

    orderCreatedNotificationId = orderCreatedNotification!.id;
  });

  it('marks the notification as read', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/notifications/${orderCreatedNotificationId}/read`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(response.body.read).toBe(true);
  });

  it('returns 404 when a different user tries to mark the notification as read', async () => {
    await request(app.getHttpServer())
      .patch(`/notifications/${orderCreatedNotificationId}/read`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });

  it('denies GET /notifications to a non-admin user', async () => {
    await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(403);
  });

  it('allows an admin to list all notifications', async () => {
    const response = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body.items)).toBe(true);
    const items = response.body.items as Array<{ userId: string }>;
    expect(items.some((item) => item.userId === buyerId)).toBe(true);
  });

  it('records a recuperacao_senha notification on forgot-password', async () => {
    const loggerSpy = jest.spyOn(PinoLogger.prototype, 'info');

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: buyerEmail })
      .expect(200);

    loggerSpy.mockRestore();

    const response = await request(app.getHttpServer())
      .get('/notifications/me')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    const items = response.body.items as Array<{ type: string }>;
    expect(items.some((item) => item.type === 'recuperacao_senha')).toBe(true);

    const notificationInDb = await notificationsRepository.findOne({
      where: { userId: buyerId, type: 'recuperacao_senha' as never },
    });
    expect(notificationInDb).not.toBeNull();
  });
});
