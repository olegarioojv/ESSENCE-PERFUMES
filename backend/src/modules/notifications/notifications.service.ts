import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from './entities/notification-type.enum';
import { Notification } from './entities/notification.entity';

export interface RecordNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export interface FindNotificationsFilters {
  userId?: string;
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async record(data: RecordNotificationData): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...data,
      metadata: data.metadata ?? null,
    });
    return this.notificationsRepository.save(notification);
  }

  async notifyOrderCreated(userId: string, orderId: string): Promise<void> {
    await this.record({
      userId,
      type: NotificationType.PEDIDO_CRIADO,
      title: 'Pedido criado',
      message: `Seu pedido ${orderId} foi criado e está aguardando pagamento.`,
      metadata: { orderId },
    });
  }

  async notifyPaymentApproved(userId: string, orderId: string): Promise<void> {
    await this.record({
      userId,
      type: NotificationType.PAGAMENTO_APROVADO,
      title: 'Pagamento aprovado',
      message: `O pagamento do pedido ${orderId} foi aprovado.`,
      metadata: { orderId },
    });
  }

  async notifyOrderShipped(userId: string, orderId: string): Promise<void> {
    await this.record({
      userId,
      type: NotificationType.PEDIDO_ENVIADO,
      title: 'Pedido enviado',
      message: `Seu pedido ${orderId} foi enviado.`,
      metadata: { orderId },
    });
  }

  async notifyPasswordRecovery(userId: string): Promise<void> {
    await this.record({
      userId,
      type: NotificationType.RECUPERACAO_SENHA,
      title: 'Recuperação de senha solicitada',
      message: 'Foi solicitada uma recuperação de senha para sua conta.',
    });
  }

  async findAllForUser(
    userId: string,
    filters: Omit<FindNotificationsFilters, 'userId'> = {},
  ): Promise<PaginatedNotifications> {
    return this.findAll({ ...filters, userId });
  }

  async findAll(
    filters: FindNotificationsFilters = {},
  ): Promise<PaginatedNotifications> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    const where: Partial<Pick<Notification, 'userId' | 'read'>> = {};
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    const [items, total] = await this.notificationsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notificação não encontrada');
    }

    await this.notificationsRepository.update({ id }, { read: true });
    return { ...notification, read: true };
  }
}
