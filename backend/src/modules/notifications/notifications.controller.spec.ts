import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../users/entities/role.enum';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './entities/notification-type.enum';
import { Notification } from './entities/notification.entity';

function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.PEDIDO_CRIADO,
    title: 'Pedido criado',
    message: 'Seu pedido foi criado.',
    metadata: null,
    read: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<
    Pick<NotificationsService, 'findAllForUser' | 'markAsRead' | 'findAll'>
  >;

  beforeEach(async () => {
    service = {
      findAllForUser: jest.fn(),
      markAsRead: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: service }],
    }).compile();

    controller = module.get(NotificationsController);
  });

  it('findMine delegates to the service with the user id and query', async () => {
    const result = {
      items: [buildNotification()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    service.findAllForUser.mockResolvedValue(result);
    const user = { sub: 'user-1', email: 'user@example.com', role: Role.CLIENTE };
    const query = { page: 1, limit: 20 };

    await expect(controller.findMine(user, query)).resolves.toBe(result);
    expect(service.findAllForUser).toHaveBeenCalledWith('user-1', query);
  });

  it('markAsRead delegates to the service with the id and user id', async () => {
    const notification = buildNotification({ read: true });
    service.markAsRead.mockResolvedValue(notification);
    const user = { sub: 'user-1', email: 'user@example.com', role: Role.CLIENTE };

    await expect(controller.markAsRead(user, 'notif-1')).resolves.toBe(
      notification,
    );
    expect(service.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1');
  });

  it('findAll delegates to the service with the query', async () => {
    const result = {
      items: [buildNotification()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    service.findAll.mockResolvedValue(result);
    const query = { read: false };

    await expect(controller.findAll(query)).resolves.toBe(result);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });
});
