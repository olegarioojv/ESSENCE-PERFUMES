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
import { OrderItem } from './../src/modules/orders/entities/order-item.entity';
import { OrderStatusHistory } from './../src/modules/orders/entities/order-status-history.entity';
import { Order } from './../src/modules/orders/entities/order.entity';
import { Product } from './../src/modules/products/entities/product.entity';
import { StockMovement } from './../src/modules/stock/entities/stock-movement.entity';
import { Stock } from './../src/modules/stock/entities/stock.entity';
import { Role } from './../src/modules/users/entities/role.enum';
import { User } from './../src/modules/users/entities/user.entity';

describe('Cart & Checkout (e2e)', () => {
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

  const buyerEmail = `cart-e2e-buyer-${Date.now()}@example.com`;
  const adminEmail = `cart-e2e-admin-${Date.now()}@example.com`;
  const password = 'Senha123';

  let buyerId: string;
  let buyerToken: string;
  let adminId: string;
  let adminToken: string;

  let categoryId: string;
  let brandId: string;
  let productId: string; // healthy stock product used for main flow
  let lowStockProductId: string; // product with 0 stock to trigger insufficient stock error

  const productIds: string[] = [];
  const orderIds: string[] = [];

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

    // Buyer + admin users via /auth/register
    const buyerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Cart E2E Buyer', email: buyerEmail, password })
      .expect(201);
    buyerId = buyerRes.body.user.id;
    buyerToken = buyerRes.body.accessToken;

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Cart E2E Admin', email: adminEmail, password })
      .expect(201);
    adminId = adminRes.body.user.id;
    await usersRepository.update({ id: adminId }, { role: Role.ADMIN });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    // Category + Brand
    const category = categoriesRepository.create({
      name: `Cart E2E Category ${Date.now()}`,
      slug: `cart-e2e-category-${Date.now()}`,
    });
    await categoriesRepository.save(category);
    categoryId = category.id;

    const brand = brandsRepository.create({
      name: `Cart E2E Brand ${Date.now()}`,
    });
    await brandsRepository.save(brand);
    brandId = brand.id;

    // Main product with healthy stock
    const product = productsRepository.create({
      name: 'Cart E2E Product',
      sku: `CART-E2E-SKU-${Date.now()}`,
      slug: `cart-e2e-product-${Date.now()}`,
      price: '100.00',
      brandId,
      categoryId,
    });
    await productsRepository.save(product);
    productId = product.id;
    productIds.push(productId);

    const stock = stockRepository.create({
      productId,
      quantity: 50,
      reservedQuantity: 0,
      minQuantity: 0,
    });
    await stockRepository.save(stock);

    // Low-stock product (0 units) to trigger insufficient stock error
    const lowStockProduct = productsRepository.create({
      name: 'Cart E2E Low Stock Product',
      sku: `CART-E2E-LOW-SKU-${Date.now()}`,
      slug: `cart-e2e-low-stock-product-${Date.now()}`,
      price: '50.00',
      brandId,
      categoryId,
    });
    await productsRepository.save(lowStockProduct);
    lowStockProductId = lowStockProduct.id;
    productIds.push(lowStockProductId);

    const lowStock = stockRepository.create({
      productId: lowStockProductId,
      quantity: 0,
      reservedQuantity: 0,
      minQuantity: 0,
    });
    await stockRepository.save(lowStock);
  });

  afterAll(async () => {
    if (orderIds.length > 0) {
      await orderHistoryRepository.delete(
        orderIds.map((id) => ({ orderId: id })) as never,
      );
      for (const id of orderIds) {
        await orderHistoryRepository.delete({ orderId: id });
        await orderItemsRepository.delete({ orderId: id });
      }
      await ordersRepository.delete(orderIds as never);
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

    for (const pId of productIds) {
      await stockMovementsRepository.delete({ productId: pId });
      await stockRepository.delete({ productId: pId });
    }
    if (productIds.length > 0) {
      await productsRepository.delete(productIds as never);
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

  describe('Cart operations', () => {
    it('adds an item to the cart', async () => {
      const response = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId, quantity: 2 })
        .expect(201);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].productId).toBe(productId);
      expect(response.body.items[0].quantity).toBe(2);
      expect(response.body.items[0].unitPrice).toBe(100);
      expect(response.body.subtotal).toBe(200);
    });

    it('gets the cart summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.itemCount).toBe(2);
      expect(response.body.subtotal).toBe(200);
    });

    it('updates the quantity of an item', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/cart/items/${productId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.items[0].quantity).toBe(3);
      expect(response.body.subtotal).toBe(300);
    });

    it('removes an item from the cart', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/cart/items/${productId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.subtotal).toBe(0);
    });
  });

  describe('Checkout', () => {
    it('rejects checkout with insufficient stock', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: lowStockProductId, quantity: 1 })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Estoque insuficiente');

      // Clean up the cart item for the low stock product so it doesn't
      // interfere with the next tests.
      await request(app.getHttpServer())
        .delete(`/cart/items/${lowStockProductId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
    });

    let orderId: string;

    it('checks out successfully, creates an order and decrements stock', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId, quantity: 4 })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({})
        .expect(201);

      expect(response.body.subtotal).toBe('400.00');
      expect(response.body.total).toBe('400.00');
      expect(response.body.status).toBe('pendente');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(4);

      orderId = response.body.id;
      orderIds.push(orderId);

      const stock = await stockRepository.findOne({ where: { productId } });
      expect(stock?.quantity).toBe(46); // 50 - 4

      const cartResponse = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(cartResponse.body.items).toHaveLength(0);
    });

    it('lists the orders for the buyer', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.items.some((o: { id: string }) => o.id === orderId)).toBe(
        true,
      );
    });

    it('fetches a single order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
      expect(response.body.items).toHaveLength(1);
    });

    it('fetches the order timeline with the initial pendente entry', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}/timeline`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].status).toBe('pendente');
    });

    it('denies status update to a non-admin buyer', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'pago' })
        .expect(403);
    });

    it('allows an admin to update the order status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'pago', note: 'Pagamento confirmado' })
        .expect(200);

      expect(response.body.status).toBe('pago');
    });

    it('cancels the order and restores stock', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ reason: 'Mudei de ideia' })
        .expect(201);

      expect(response.body.status).toBe('cancelado');

      const stock = await stockRepository.findOne({ where: { productId } });
      expect(stock?.quantity).toBe(50); // restored back to original
    });
  });
});
