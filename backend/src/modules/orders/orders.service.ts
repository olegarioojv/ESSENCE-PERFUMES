import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StockService } from '../stock/stock.service';
import { Role } from '../users/entities/role.enum';
import { User } from '../users/entities/user.entity';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderStatus } from './entities/order-status.enum';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

const CANCELABLE_STATUSES = [
  OrderStatus.PENDENTE,
  OrderStatus.PAGO,
  OrderStatus.EM_PREPARACAO,
];

const TERMINAL_STATUSES = [OrderStatus.CANCELADO, OrderStatus.ENTREGUE];

export interface RequestingUser {
  sub: string;
  role: Role;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrder extends Order {
  customerName: string | null;
  customerEmail: string | null;
}

export interface PaginatedAdminOrders {
  items: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly cartService: CartService,
    private readonly stockService: StockService,
    private readonly couponsService: CouponsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async checkout(
    userId: string,
    dto: CheckoutDto = {},
  ): Promise<OrderWithItems> {
    const cart = await this.cartService.getSummary(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    for (const item of cart.items) {
      const stock = await this.stockService.findByProduct(item.productId);
      const available = stock.quantity - stock.reservedQuantity;
      if (item.quantity > available) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${item.name}`,
        );
      }
    }

    let discountAmount = 0;
    let couponCode: string | null = null;
    let couponId: string | null = null;
    if (dto.couponCode) {
      const result = await this.couponsService.validateForOrder(
        dto.couponCode,
        cart.subtotal,
      );
      discountAmount = result.discountAmount;
      couponCode = result.coupon.code;
      couponId = result.coupon.id;
    }

    const total = Math.round((cart.subtotal - discountAmount) * 100) / 100;

    const order = this.ordersRepository.create({
      userId,
      status: OrderStatus.PENDENTE,
      subtotal: cart.subtotal.toFixed(2),
      couponCode,
      discountAmount: discountAmount.toFixed(2),
      total: total.toFixed(2),
    });
    await this.ordersRepository.save(order);

    for (const item of cart.items) {
      const orderItem = this.orderItemsRepository.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        lineTotal: item.lineTotal.toFixed(2),
      });
      await this.orderItemsRepository.save(orderItem);

      await this.stockService.stockOut(
        item.productId,
        { quantity: item.quantity, reason: `Pedido ${order.id}` },
        userId,
      );
    }

    await this.recordHistory(order.id, OrderStatus.PENDENTE, null);
    await this.cartService.clear(userId);

    if (couponId) {
      await this.couponsService.registerUsage(couponId);
    }

    await this.notificationsService.notifyOrderCreated(userId, order.id);

    return this.getOrderWithItems(order.id);
  }

  async findAllForUser(
    userId: string,
    query: FindOrdersDto = {},
  ): Promise<PaginatedOrders> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;

    const [items, total] = await this.ordersRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllAdmin(query: FindOrdersDto = {}): Promise<PaginatedAdminOrders> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;

    const where: FindOptionsWhere<Order> = {};
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;

    const [items, total] = await this.ordersRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const userIds = [...new Set(items.map((order) => order.userId))];
    const users = userIds.length
      ? await this.usersRepository.find({ where: { id: In(userIds) } })
      : [];
    const usersById = new Map(users.map((user) => [user.id, user]));

    const enriched: AdminOrder[] = items.map((order) => ({
      ...order,
      customerName: usersById.get(order.userId)?.name ?? null,
      customerEmail: usersById.get(order.userId)?.email ?? null,
    }));

    return { items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(orderId: string): Promise<Order> {
    return this.findOrderOrThrow(orderId);
  }

  async findOne(
    orderId: string,
    requester: RequestingUser,
  ): Promise<OrderWithItems> {
    const result = await this.getOrderWithItems(orderId);
    this.assertAccess(result, requester);
    return result;
  }

  async findTimeline(
    orderId: string,
    requester: RequestingUser,
  ): Promise<OrderStatusHistory[]> {
    const order = await this.findOrderOrThrow(orderId);
    this.assertAccess(order, requester);

    return this.orderHistoryRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    actorId: string,
  ): Promise<OrderWithItems> {
    const order = await this.findOrderOrThrow(orderId);

    if (TERMINAL_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        'Pedido está em um status final e não pode ser alterado',
      );
    }

    return this.applyStatus(order, dto.status, dto.note ?? null, actorId);
  }

  async cancel(
    orderId: string,
    requester: RequestingUser,
    dto: CancelOrderDto,
  ): Promise<OrderWithItems> {
    const order = await this.findOrderOrThrow(orderId);
    this.assertAccess(order, requester);

    if (!CANCELABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException('Pedido não pode mais ser cancelado');
    }

    return this.applyStatus(
      order,
      OrderStatus.CANCELADO,
      dto.reason ?? null,
      requester.sub,
    );
  }

  private async applyStatus(
    order: Order,
    status: OrderStatus,
    note: string | null,
    actorId: string,
  ): Promise<OrderWithItems> {
    await this.ordersRepository.update({ id: order.id }, { status });
    await this.recordHistory(order.id, status, note);

    if (status === OrderStatus.CANCELADO) {
      await this.restoreStock(order.id, actorId);
    }

    if (status === OrderStatus.ENVIADO) {
      await this.notificationsService.notifyOrderShipped(
        order.userId,
        order.id,
      );
    }

    return this.getOrderWithItems(order.id);
  }

  private async restoreStock(orderId: string, actorId: string): Promise<void> {
    const items = await this.orderItemsRepository.find({ where: { orderId } });
    for (const item of items) {
      await this.stockService.stockIn(
        item.productId,
        {
          quantity: item.quantity,
          reason: `Cancelamento do pedido ${orderId}`,
        },
        actorId,
      );
    }
  }

  private async recordHistory(
    orderId: string,
    status: OrderStatus,
    note: string | null,
  ): Promise<void> {
    const history = this.orderHistoryRepository.create({
      orderId,
      status,
      note,
    });
    await this.orderHistoryRepository.save(history);
  }

  private assertAccess(order: Order, requester: RequestingUser): void {
    if (order.userId !== requester.sub && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Acesso negado a este pedido');
    }
  }

  private async findOrderOrThrow(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  private async getOrderWithItems(orderId: string): Promise<OrderWithItems> {
    const order = await this.findOrderOrThrow(orderId);
    const items = await this.orderItemsRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
    return { ...order, items };
  }
}
