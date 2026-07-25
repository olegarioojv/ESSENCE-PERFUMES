import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatus } from '../orders/entities/order-status.enum';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Stock } from '../stock/entities/stock.entity';
import { Role } from '../users/entities/role.enum';
import { User } from '../users/entities/user.entity';
import { BestSellersQueryDto } from './dto/best-sellers-query.dto';
import { SalesChartQueryDto } from './dto/sales-chart-query.dto';

const SALE_STATUSES = [
  OrderStatus.PAGO,
  OrderStatus.EM_PREPARACAO,
  OrderStatus.ENVIADO,
  OrderStatus.ENTREGUE,
];

export interface DashboardSummary {
  totalSales: number;
  ordersCount: number;
  customersCount: number;
  productsCount: number;
  averageTicket: number;
  profit: number;
}

export interface BestSellerItem {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface OutOfStockItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
}

export interface SalesChartPoint {
  date: string;
  ordersCount: number;
  revenue: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const salesRow = await this.ordersRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'totalSales')
      .addSelect('COUNT(*)', 'ordersCount')
      .where('order.status IN (:...statuses)', { statuses: SALE_STATUSES })
      .getRawOne<{ totalSales: string; ordersCount: string }>();

    const totalSales = Number(salesRow?.totalSales ?? 0);
    const ordersCount = Number(salesRow?.ordersCount ?? 0);
    const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0;

    const [customersCount, productsCount, profitRow] = await Promise.all([
      this.usersRepository.count({ where: { role: Role.CLIENTE } }),
      this.productsRepository.count({ where: { isActive: true } }),
      this.orderItemsRepository
        .createQueryBuilder('item')
        .innerJoin('orders', 'ord', 'ord.id::text = item.orderId')
        .innerJoin('products', 'product', 'product.id::text = item.productId')
        .select(
          'COALESCE(SUM((item.unitPrice - COALESCE(product.costPrice, 0)) * item.quantity), 0)',
          'profit',
        )
        .where('ord.status IN (:...statuses)', { statuses: SALE_STATUSES })
        .getRawOne<{ profit: string }>(),
    ]);

    return {
      totalSales: round2(totalSales),
      ordersCount,
      customersCount,
      productsCount,
      averageTicket: round2(averageTicket),
      profit: round2(Number(profitRow?.profit ?? 0)),
    };
  }

  async getBestSellers(query: BestSellersQueryDto): Promise<BestSellerItem[]> {
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const rows = await this.orderItemsRepository
      .createQueryBuilder('item')
      .innerJoin('orders', 'ord', 'ord.id::text = item.orderId')
      .select('item.productId', 'productId')
      .addSelect('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('SUM(item.lineTotal)', 'revenue')
      .where('ord.status IN (:...statuses)', { statuses: SALE_STATUSES })
      .groupBy('item.productId')
      .addGroupBy('item.productName')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany<{
        productId: string;
        productName: string;
        quantitySold: string;
        revenue: string;
      }>();

    return rows.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      quantitySold: Number(row.quantitySold),
      revenue: round2(Number(row.revenue)),
    }));
  }

  async getOutOfStock(): Promise<OutOfStockItem[]> {
    return this.stockRepository
      .createQueryBuilder('stock')
      .innerJoin('products', 'product', 'product.id::text = stock.productId')
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('product.sku', 'sku')
      .addSelect('stock.quantity', 'quantity')
      .addSelect('stock.reservedQuantity', 'reservedQuantity')
      .where('stock.quantity - stock.reservedQuantity <= 0')
      .andWhere('product.isActive = true')
      .orderBy('product.name', 'ASC')
      .getRawMany<OutOfStockItem>();
  }

  async getSalesChart(query: SalesChartQueryDto): Promise<SalesChartPoint[]> {
    const days = query.days && query.days > 0 ? query.days : 30;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const rows = await this.ordersRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'ordersCount')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.status IN (:...statuses)', { statuses: SALE_STATUSES })
      .andWhere('order.createdAt >= :since', { since })
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany<{ date: string; ordersCount: string; revenue: string }>();

    return rows.map((row) => ({
      date: row.date,
      ordersCount: Number(row.ordersCount),
      revenue: round2(Number(row.revenue)),
    }));
  }
}
