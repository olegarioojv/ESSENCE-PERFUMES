import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<
    Pick<Repository<User>, 'findOne' | 'create' | 'save' | 'createQueryBuilder'>
  >;
  let queryBuilder: {
    where: jest.Mock;
    addSelect: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    repository = {
      findOne: jest.fn(),
      create: jest.fn((data) => data as User),
      save: jest.fn((entity) => Promise.resolve(entity as User)),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repository }],
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
      repository.findOne.mockResolvedValue({
        id: 'user-1',
        name: 'Existing',
        email: 'maria@example.com',
        passwordHash: 'hashed',
        role: Role.CLIENTE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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

  describe('findByEmail', () => {
    it('does not select the password hash by default', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await service.findByEmail('maria@example.com');

      expect(queryBuilder.addSelect).not.toHaveBeenCalled();
    });

    it('selects the password hash when explicitly requested', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await service.findByEmail('maria@example.com', true);

      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
    });
  });
});
