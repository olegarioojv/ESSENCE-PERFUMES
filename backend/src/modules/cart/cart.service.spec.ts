import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

function buildCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 'cart-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function buildProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    name: 'Chanel N°5',
    price: '100.00',
    isActive: true,
    ...overrides,
  };
}

function buildCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'item-1',
    cartId: 'cart-1',
    productId: 'product-1',
    quantity: 1,
    unitPrice: '100.00',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CartService', () => {
  let service: CartService;
  let cartsRepository: jest.Mocked<
    Pick<Repository<Cart>, 'create' | 'save' | 'findOne'>
  >;
  let cartItemsRepository: jest.Mocked<
    Pick<
      Repository<CartItem>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'delete'
    >
  >;
  let productsService: jest.Mocked<Pick<ProductsService, 'findById'>>;

  beforeEach(async () => {
    cartsRepository = {
      create: jest.fn((data) => data as Cart),
      save: jest.fn((entity) => Promise.resolve(entity as Cart)),
      findOne: jest.fn(),
    };
    cartItemsRepository = {
      create: jest.fn((data) => data as CartItem),
      save: jest.fn((entity) => Promise.resolve(entity as CartItem)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    productsService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: cartsRepository },
        {
          provide: getRepositoryToken(CartItem),
          useValue: cartItemsRepository,
        },
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    service = module.get(CartService);
  });

  describe('addItem', () => {
    it('throws BadRequestException when the product is inactive', async () => {
      productsService.findById.mockResolvedValue(
        buildProduct({ isActive: false }) as never,
      );

      await expect(
        service.addItem('user-1', { productId: 'product-1', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
      expect(cartItemsRepository.save).not.toHaveBeenCalled();
    });

    it('creates a new item when the product is not already in the cart', async () => {
      productsService.findById.mockResolvedValue(buildProduct() as never);
      cartsRepository.findOne.mockResolvedValue(buildCart());
      cartItemsRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue(buildCartItem());
      cartItemsRepository.find.mockResolvedValue([buildCartItem()]);

      const summary = await service.addItem('user-1', {
        productId: 'product-1',
        quantity: 1,
      });

      expect(cartItemsRepository.save).toHaveBeenCalled();
      expect(summary.itemCount).toBe(1);
      expect(summary.subtotal).toBe(100);
    });

    it('increments quantity when the product is already in the cart', async () => {
      productsService.findById.mockResolvedValue(buildProduct() as never);
      cartsRepository.findOne.mockResolvedValue(buildCart());
      cartItemsRepository.findOne
        .mockResolvedValueOnce(buildCartItem({ quantity: 2 }))
        .mockResolvedValue(buildCartItem({ quantity: 2 }));
      cartItemsRepository.find.mockResolvedValue([
        buildCartItem({ quantity: 3 }),
      ]);

      await service.addItem('user-1', { productId: 'product-1', quantity: 1 });

      expect(cartItemsRepository.update).toHaveBeenCalledWith(
        { id: 'item-1' },
        { quantity: 3, unitPrice: '100.00' },
      );
    });
  });

  describe('updateItem', () => {
    it('throws NotFoundException when the item is not in the cart', async () => {
      cartsRepository.findOne.mockResolvedValue(buildCart());
      cartItemsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateItem('user-1', 'missing-product', { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
      expect(cartItemsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('throws NotFoundException when the item is not in the cart', async () => {
      cartsRepository.findOne.mockResolvedValue(buildCart());
      cartItemsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeItem('user-1', 'missing-product'),
      ).rejects.toThrow(NotFoundException);
      expect(cartItemsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
