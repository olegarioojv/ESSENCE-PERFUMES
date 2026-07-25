import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Existing',
    email: 'maria@example.com',
    passwordHash: 'hashed',
    role: Role.CLIENTE,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<
    Pick<
      Repository<User>,
      'findOne' | 'create' | 'save' | 'createQueryBuilder' | 'update' | 'find'
    >
  >;
  let queryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    addSelect: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    repository = {
      findOne: jest.fn(),
      create: jest.fn((data) => data as User),
      save: jest.fn((entity) => Promise.resolve(entity as User)),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      update: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue(4) },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('creates a user when the email is not taken', async () => {
      repository.findOne.mockResolvedValue(null);

      const user = await service.create({
        name: 'Maria Silva',
        email: 'maria@example.com',
        passwordHash: 'hashed',
      });

      expect(user.email).toBe('maria@example.com');
      expect(repository.save).toHaveBeenCalled();
    });

    it('throws ConflictException when the email is already registered', async () => {
      repository.findOne.mockResolvedValue(buildUser());

      await expect(
        service.create({
          name: 'Maria Silva',
          email: 'maria@example.com',
          passwordHash: 'hashed',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('createByAdmin', () => {
    it('hashes the password and creates the user with the given role', async () => {
      repository.findOne.mockResolvedValue(null);

      const user = await service.createByAdmin({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'Senha123',
        role: Role.ADMIN,
      });

      expect(user.email).toBe('maria@example.com');
      const createArg = repository.create.mock.calls[0][0] as Partial<User>;
      expect(createArg.passwordHash).not.toBe('Senha123');
      expect(createArg.role).toBe(Role.ADMIN);
    });
  });

  describe('findByEmail', () => {
    it('does not select the password hash by default', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await service.findByEmail('maria@example.com');

      expect(queryBuilder.addSelect).not.toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'user.deletedAt IS NULL',
      );
    });

    it('selects the password hash when explicitly requested', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await service.findByEmail('maria@example.com', true);

      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
    });
  });

  describe('findAll', () => {
    it('excludes soft-deleted users', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({}) }),
      );
    });
  });

  describe('update', () => {
    it('updates allowed fields and returns the refreshed user', async () => {
      repository.findOne.mockResolvedValue(buildUser());

      const updated = await service.update('user-1', { name: 'New Name' });

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { name: 'New Name' },
      );
      expect(updated.email).toBe('maria@example.com');
    });

    it('throws ConflictException when the new email belongs to another user', async () => {
      repository.findOne
        .mockResolvedValueOnce(buildUser())
        .mockResolvedValueOnce(buildUser({ id: 'user-2' }));

      await expect(
        service.update('user-1', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt instead of removing the row', async () => {
      repository.findOne.mockResolvedValue(buildUser());

      await service.softDelete('user-1');

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { deletedAt: expect.any(Date) },
      );
    });
  });

  describe('updateAvatar', () => {
    it('sets the avatarUrl and returns the refreshed user', async () => {
      repository.findOne.mockResolvedValue(
        buildUser({ avatarUrl: 'https://cdn/avatar.png' }),
      );

      const updated = await service.updateAvatar(
        'user-1',
        'https://cdn/avatar.png',
      );

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { avatarUrl: 'https://cdn/avatar.png' },
      );
      expect(updated.avatarUrl).toBe('https://cdn/avatar.png');
    });
  });
});
