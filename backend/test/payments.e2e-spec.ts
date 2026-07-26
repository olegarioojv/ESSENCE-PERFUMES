import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { AbacatePayService } from './../src/modules/payments/abacatepay.service';
import { PaymentLog } from './../src/modules/payments/entities/payment-log.entity';
import { Payment } from './../src/modules/payments/entities/payment.entity';
import { Brand } from './../src/modules/brands/entities/brand.entity';
import { Category } from './../src/modules/categories/entities/category.entity';
import { Product } from './../src/modules/products/entities/product.entity';
import { Stock } from './../src/modules/stock/entities/stock.entity';
import { StockMovement } from './../src/modules/stock/entities/stock-movement.entity';
import { Order } from './../src/modules/orders/entities/order.entity';
import { OrderItem } from './../src/modules/orders/entities/order-item.entity';
import { OrderStatusHistory } from './../src/modules/orders/entities/order-status-history.entity';
import { Cart } from './../src/modules/cart/entities/cart.entity';
import { CartItem } from './../src/modules/cart/entities/cart-item.entity';
import { User } from './../src/modules/users/entities/user.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { RefreshToken } from './../src/modules/auth/entities/refresh-token.entity';
import { PasswordResetToken } from './../src/modules/auth/entities/password-reset-token.entity';

function fakeCharge(overrides: Partial<Record<string, unknown>> = {}) {
  const now = new Date().toISOString();
  return {
    id: `pix_char_fake_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    amount: 5000,
    status: 'PENDING',
    devMode: true,
    brCode: '00020126580014BR.GOV.BCB.PIX0136fake-pix-code-e2e5204000053039865802BR',
    brCodeBase64: 'data:image/png;base64,ZmFrZUJhc2U2NERhdGE=',
    platformFee: 0,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    ...overrides,
  };
}

describe('Payments (e2e)', () => {
  let app: INestApplication<App>;
  let webhookSecret: string;

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
  let paymentsRepository: Repository<Payment>;
  let paymentLogsRepository: Repository<PaymentLog>;

  const mockAbacatePayService = {
    createPixQrCode: jest.fn(async (params: { amount: number }) =>
      fakeCharge({ amount: params.amount, status: 'PENDING' }),
    ),
    checkStatus: jest.fn(async () => fakeCharge({ status: 'PENDING' })),
    simulatePayment: jest.fn(async () => fakeCharge({ status: 'PAID' })),
  };

  const suffix = Date.now();
  const buyerEmail = `payments-e2e-buyer-${suffix}@example.com`;
  const otherEmail = `payments-e2e-other-${suffix}@example.com`;
  const adminEmail = `payments-e2e-admin-${suffix}@example.com`;
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

  const orderIds: string[] = [];
  const paymentIds: string[] = [];

  async function registerAndLogin(email: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Payments E2E', email, password })
      .expect(201);
    return {
      id: response.body.user.id as string,
      token: response.body.accessToken as string,
    };
  }

  async function createOrder(): Promise<string> {
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

    const orderId = checkoutResponse.body.id as string;
    orderIds.push(orderId);
    return orderId;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AbacatePayService)
      .useValue(mockAbacatePayService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    webhookSecret = moduleFixture
      .get(ConfigService)
      .getOrThrow<string>('ABACATEPAY_WEBHOOK_SECRET');

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
    paymentsRepository = moduleFixture.get(getRepositoryToken(Payment));
    paymentLogsRepository = moduleFixture.get(getRepositoryToken(PaymentLog));

    const category = categoriesRepository.create({
      name: `Categoria Payments E2E ${suffix}`,
      slug: `categoria-payments-e2e-${suffix}`,
      isActive: true,
    });
    await categoriesRepository.save(category);
    categoryId = category.id;

    const brand = brandsRepository.create({
      name: `Marca Payments E2E ${suffix}`,
    });
    await brandsRepository.save(brand);
    brandId = brand.id;

    const product = productsRepository.create({
      name: `Perfume Payments E2E ${suffix}`,
      sku: `SKU-PAY-E2E-${suffix}`,
      slug: `perfume-payments-e2e-${suffix}`,
      price: '50.00',
      brandId,
      categoryId,
      isActive: true,
    });
    await productsRepository.save(product);
    productId = product.id;

    const stock = stockRepository.create({
      productId,
      quantity: 100,
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
  });

  afterAll(async () => {
    if (paymentIds.length > 0) {
      await paymentLogsRepository
        .createQueryBuilder()
        .delete()
        .where('paymentId IN (:...ids)', { ids: paymentIds })
        .execute();
      await paymentsRepository
        .createQueryBuilder()
        .delete()
        .where('id IN (:...ids)', { ids: paymentIds })
        .execute();
    }
    if (orderIds.length > 0) {
      await orderHistoryRepository
        .createQueryBuilder()
        .delete()
        .where('orderId IN (:...ids)', { ids: orderIds })
        .execute();
      await orderItemsRepository
        .createQueryBuilder()
        .delete()
        .where('orderId IN (:...ids)', { ids: orderIds })
        .execute();
      await ordersRepository
        .createQueryBuilder()
        .delete()
        .where('id IN (:...ids)', { ids: orderIds })
        .execute();
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

  let firstOrderId: string;
  let firstPaymentId: string;

  it('creates a pix charge for a pending order', async () => {
    firstOrderId = await createOrder();

    const response = await request(app.getHttpServer())
      .post(`/payments/orders/${firstOrderId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send()
      .expect(201);

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.orderId).toBe(firstOrderId);
    expect(response.body.status).toBe('pendente');
    expect(mockAbacatePayService.createPixQrCode).toHaveBeenCalled();

    firstPaymentId = response.body.id;
    paymentIds.push(firstPaymentId);
  });

  it('denies access to another user payment with 403', async () => {
    await request(app.getHttpServer())
      .get(`/payments/${firstPaymentId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  it('re-checks status via provider and syncs the payment', async () => {
    const response = await request(app.getHttpServer())
      .get(`/payments/${firstPaymentId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(mockAbacatePayService.checkStatus).toHaveBeenCalledWith(
      expect.any(String),
    );
    expect(response.body.id).toBe(firstPaymentId);
    expect(response.body.status).toBe('pendente');
  });

  it('returns the payment logs', async () => {
    const response = await request(app.getHttpServer())
      .get(`/payments/${firstPaymentId}/logs`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const events = response.body.map((log: { event: string }) => log.event);
    expect(events).toEqual(expect.arrayContaining(['created', 'checked']));
  });

  it('rejects simulate for non-admin users', async () => {
    await request(app.getHttpServer())
      .post(`/payments/${firstPaymentId}/simulate`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(403);
  });

  it('allows an admin to simulate approval and updates the order status', async () => {
    const response = await request(app.getHttpServer())
      .post(`/payments/${firstPaymentId}/simulate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(response.body.status).toBe('pago');
    expect(mockAbacatePayService.simulatePayment).toHaveBeenCalled();

    const order = await ordersRepository.findOne({
      where: { id: firstOrderId },
    });
    expect(order?.status).toBe('pago');
  });

  it('cancels a fresh pending payment and rejects cancelling it twice', async () => {
    const orderId = await createOrder();

    const createResponse = await request(app.getHttpServer())
      .post(`/payments/orders/${orderId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send()
      .expect(201);

    const paymentId = createResponse.body.id as string;
    paymentIds.push(paymentId);

    const cancelResponse = await request(app.getHttpServer())
      .post(`/payments/${paymentId}/cancel`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(201);

    expect(cancelResponse.body.status).toBe('cancelado');

    await request(app.getHttpServer())
      .post(`/payments/${paymentId}/cancel`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(400);
  });

  it('processes a webhook with the correct secret and updates the payment', async () => {
    const orderId = await createOrder();

    const createResponse = await request(app.getHttpServer())
      .post(`/payments/orders/${orderId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send()
      .expect(201);

    const paymentId = createResponse.body.id as string;
    const providerChargeId = createResponse.body.providerChargeId as string;
    paymentIds.push(paymentId);

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .query({ webhookSecret })
      .send({
        id: `evt_${Date.now()}`,
        event: 'transparent.completed',
        data: {
          transparent: {
            id: providerChargeId,
            status: 'PAID',
          },
        },
      })
      .expect(201);

    expect(response.body).toEqual({ received: true });

    const payment = await paymentsRepository.findOne({
      where: { id: paymentId },
    });
    expect(payment?.status).toBe('pago');
  });

  it('rejects webhook calls with a wrong secret', async () => {
    await request(app.getHttpServer())
      .post('/payments/webhook')
      .query({ webhookSecret: 'wrong-secret' })
      .send({
        id: `evt_${Date.now()}`,
        event: 'transparent.completed',
        data: { transparent: { id: 'whatever', status: 'PAID' } },
      })
      .expect(401);
  });
});
