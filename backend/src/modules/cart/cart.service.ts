import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

export interface CartItemSummary {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartSummary {
  cartId: string;
  items: CartItemSummary[];
  itemCount: number;
  subtotal: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getSummary(userId: string): Promise<CartSummary> {
    const cart = await this.getOrCreate(userId);
    const items = await this.cartItemsRepository.find({
      where: { cartId: cart.id },
      order: { createdAt: 'ASC' },
    });

    const itemSummaries = await Promise.all(
      items.map(async (item) => {
        const product = await this.productsService.findById(item.productId);
        const unitPrice = Number(item.unitPrice);
        return {
          productId: item.productId,
          name: product.name,
          quantity: item.quantity,
          unitPrice,
          lineTotal: Number((unitPrice * item.quantity).toFixed(2)),
        };
      }),
    );

    return {
      cartId: cart.id,
      items: itemSummaries,
      itemCount: itemSummaries.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: Number(
        itemSummaries.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2),
      ),
    };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartSummary> {
    const product = await this.productsService.findById(dto.productId);
    if (!product.isActive) {
      throw new BadRequestException(
        'Produto indisponível para adicionar ao carrinho',
      );
    }

    const cart = await this.getOrCreate(userId);
    const existing = await this.cartItemsRepository.findOne({
      where: { cartId: cart.id, productId: dto.productId },
    });

    if (existing) {
      await this.cartItemsRepository.update(
        { id: existing.id },
        {
          quantity: existing.quantity + dto.quantity,
          unitPrice: product.price,
        },
      );
    } else {
      const item = this.cartItemsRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: product.price,
      });
      await this.cartItemsRepository.save(item);
    }

    return this.getSummary(userId);
  }

  async updateItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartSummary> {
    const cart = await this.getOrCreate(userId);
    const item = await this.findItemOrThrow(cart.id, productId);

    await this.cartItemsRepository.update(
      { id: item.id },
      { quantity: dto.quantity },
    );

    return this.getSummary(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartSummary> {
    const cart = await this.getOrCreate(userId);
    const item = await this.findItemOrThrow(cart.id, productId);

    await this.cartItemsRepository.delete({ id: item.id });

    return this.getSummary(userId);
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.getOrCreate(userId);
    await this.cartItemsRepository.delete({ cartId: cart.id });
  }

  private async findItemOrThrow(
    cartId: string,
    productId: string,
  ): Promise<CartItem> {
    const item = await this.cartItemsRepository.findOne({
      where: { cartId, productId },
    });
    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }
    return item;
  }

  private async getOrCreate(userId: string): Promise<Cart> {
    const existing = await this.cartsRepository.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }

    const cart = this.cartsRepository.create({ userId });
    return this.cartsRepository.save(cart);
  }
}
