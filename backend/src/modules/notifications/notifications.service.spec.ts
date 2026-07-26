import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from './entities/notification-type.enum';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

function buildNotification(
  overrides: Partial<Notification> = {},
): Notification {
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

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepository: jest.Mocked<
    Pick<
      Repository<Notification>,
      'create' | 'save' | 'findOne' | 'update' | 'findAndCount'
    >
  >;

  beforeEach(async () => {
    notificationsRepository = {
      create: jest.fn((data) => data as Notification),
      save: jest.fn((entity) => Promise.resolve(entity as Notification)),
      findOne: jest.fn(),
      update: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: notificationsRepository,
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  describe('notifyOrderCreated', () => {
    it('records a pedido_criado notification', async () => {
      await service.notifyOrderCreated('user-1', 'order-1');

      expect(notificationsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.PEDIDO_CRIADO,
          metadata: { orderId: 'order-1' },
        }) as unknown,
      );
    });
  });

  describe('notifyPasswordRecovery', () => {
    it('records a recuperacao_senha notification', async () => {
      await service.notifyPasswordRecovery('user-1');

      expect(notificationsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.RECUPERACAO_SENHA,
        }) as unknown,
      );
    });
  });

  describe('findAllForUser', () => {
    it('paginates results scoped to the user', async () => {
      notificationsRepository.findAndCount.mockResolvedValue([
        [buildNotification()],
        1,
      ]);

      const result = await service.findAllForUser('user-1', {});

      expect(notificationsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }) as unknown,
      );
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('throws NotFoundException when the notification does not belong to the user', async () => {
      notificationsRepository.findOne.mockResolvedValue(
        buildNotification({ userId: 'other-user' }),
      );

      await expect(
        service.markAsRead('notif-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('marks the notification as read', async () => {
      notificationsRepository.findOne.mockResolvedValue(buildNotification());

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(notificationsRepository.update).toHaveBeenCalledWith(
        { id: 'notif-1' },
        { read: true },
      );
      expect(result.read).toBe(true);
    });
  });
});
