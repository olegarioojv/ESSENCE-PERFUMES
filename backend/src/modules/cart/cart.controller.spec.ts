import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService, CartSummary } from './cart.service';
import { Role } from '../users/entities/role.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

function buildCartSummary(overrides: Partial<CartSummary> = {}): CartSummary {
  return {
    cartId: 'cart-1',
    items: [],
    itemCount: 0,
    subtotal: 0,
    ...overrides,
  };
}

const currentUser: JwtPayload = {
  sub: 'user-1',
  email: 'maria@example.com',
  role: Role.CLIENTE,
};

describe('CartController', () => {
  let controller: CartController;
  let service: jest.Mocked<
    Pick<CartService, 'getSummary' | 'addItem' | 'updateItem' | 'removeItem'>
  >;

  beforeEach(async () => {
    service = {
      getSummary: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: service }],
    }).compile();

    controller = module.get(CartController);
  });

  it('getSummary delegates to the service with the user id', async () => {
    const summary = buildCartSummary();
    service.getSummary.mockResolvedValue(summary);

    await expect(controller.getSummary(currentUser)).resolves.toBe(summary);
    expect(service.getSummary).toHaveBeenCalledWith('user-1');
  });

  it('addItem delegates to the service with the user id and dto', async () => {
    const dto = { productId: 'product-1', quantity: 2 };
    const summary = buildCartSummary({ itemCount: 2 });
    service.addItem.mockResolvedValue(summary);

    await expect(controller.addItem(currentUser, dto)).resolves.toBe(summary);
    expect(service.addItem).toHaveBeenCalledWith('user-1', dto);
  });

  it('updateItem delegates to the service with the user id, product id and dto', async () => {
    const dto = { quantity: 5 };
    const summary = buildCartSummary({ itemCount: 5 });
    service.updateItem.mockResolvedValue(summary);

    await expect(
      controller.updateItem(currentUser, 'product-1', dto),
    ).resolves.toBe(summary);
    expect(service.updateItem).toHaveBeenCalledWith(
      'user-1',
      'product-1',
      dto,
    );
  });

  it('removeItem delegates to the service with the user id and product id', async () => {
    const summary = buildCartSummary();
    service.removeItem.mockResolvedValue(summary);

    await expect(
      controller.removeItem(currentUser, 'product-1'),
    ).resolves.toBe(summary);
    expect(service.removeItem).toHaveBeenCalledWith('user-1', 'product-1');
  });
});
