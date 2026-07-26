import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Maria Silva',
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

const currentUser: JwtPayload = {
  sub: 'user-1',
  email: 'maria@example.com',
  role: Role.CLIENTE,
};
const adminUser: JwtPayload = {
  sub: 'admin-1',
  email: 'admin@example.com',
  role: Role.ADMIN,
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      | 'findById'
      | 'updateProfile'
      | 'updateAvatar'
      | 'findAll'
      | 'createByAdmin'
      | 'update'
      | 'softDelete'
    >
  >;
  let auditLogsService: jest.Mocked<Pick<AuditLogsService, 'record'>>;
  let cloudinaryService: jest.Mocked<Pick<CloudinaryService, 'uploadImage'>>;

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
      updateAvatar: jest.fn(),
      findAll: jest.fn(),
      createByAdmin: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    auditLogsService = {
      record: jest.fn(),
    };
    cloudinaryService = {
      uploadImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: AuditLogsService, useValue: auditLogsService },
        { provide: CloudinaryService, useValue: cloudinaryService },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('getProfile returns the current user', async () => {
    const result = buildUser();
    usersService.findById.mockResolvedValue(result);

    await expect(controller.getProfile(currentUser)).resolves.toBe(result);
    expect(usersService.findById).toHaveBeenCalledWith(currentUser.sub);
  });

  it('updateProfile updates the current user profile', async () => {
    const dto = { name: 'Maria Souza' };
    const result = buildUser({ name: 'Maria Souza' });
    usersService.updateProfile.mockResolvedValue(result);

    await expect(
      controller.updateProfile(currentUser, dto),
    ).resolves.toBe(result);
    expect(usersService.updateProfile).toHaveBeenCalledWith(
      currentUser.sub,
      dto,
    );
  });

  it('uploadAvatar uploads the file to Cloudinary and updates the avatar', async () => {
    const file = {
      buffer: Buffer.from('fake-image'),
    } as Express.Multer.File;
    cloudinaryService.uploadImage.mockResolvedValue({
      url: 'https://cdn.example.com/avatar.png',
      publicId: 'avatars/user-1',
    });
    const result = buildUser({ avatarUrl: 'https://cdn.example.com/avatar.png' });
    usersService.updateAvatar.mockResolvedValue(result);

    await expect(
      controller.uploadAvatar(currentUser, file),
    ).resolves.toBe(result);
    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
      file.buffer,
      currentUser.sub,
      'avatars',
    );
    expect(usersService.updateAvatar).toHaveBeenCalledWith(
      currentUser.sub,
      'https://cdn.example.com/avatar.png',
    );
  });

  it('removeAvatar clears the current user avatar', async () => {
    const result = buildUser({ avatarUrl: null });
    usersService.updateAvatar.mockResolvedValue(result);

    await expect(controller.removeAvatar(currentUser)).resolves.toBe(result);
    expect(usersService.updateAvatar).toHaveBeenCalledWith(
      currentUser.sub,
      null,
    );
  });

  it('findAll returns all users', async () => {
    const result = [buildUser()];
    usersService.findAll.mockResolvedValue(result);

    await expect(controller.findAll()).resolves.toBe(result);
    expect(usersService.findAll).toHaveBeenCalledWith();
  });

  it('findOne returns the user with the given id', async () => {
    const result = buildUser();
    usersService.findById.mockResolvedValue(result);

    await expect(controller.findOne('user-1')).resolves.toBe(result);
    expect(usersService.findById).toHaveBeenCalledWith('user-1');
  });

  it('create creates a user by an admin and records an audit log', async () => {
    const dto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
      password: 'Senha123',
      role: Role.CLIENTE,
    };
    const created = buildUser();
    usersService.createByAdmin.mockResolvedValue(created);
    auditLogsService.record.mockResolvedValue({} as never);

    await expect(controller.create(adminUser, dto)).resolves.toBe(created);
    expect(usersService.createByAdmin).toHaveBeenCalledWith(dto);
    expect(auditLogsService.record).toHaveBeenCalledWith({
      actorId: adminUser.sub,
      action: 'user.created',
      targetType: 'User',
      targetId: created.id,
      changes: {
        name: created.name,
        email: created.email,
        role: created.role,
      },
    });
  });

  it('update updates a user and records an audit log', async () => {
    const dto = { name: 'Maria Updated' };
    const updated = buildUser({ name: 'Maria Updated' });
    usersService.update.mockResolvedValue(updated);
    auditLogsService.record.mockResolvedValue({} as never);

    await expect(
      controller.update(adminUser, 'user-1', dto),
    ).resolves.toBe(updated);
    expect(usersService.update).toHaveBeenCalledWith('user-1', dto);
    expect(auditLogsService.record).toHaveBeenCalledWith({
      actorId: adminUser.sub,
      action: 'user.updated',
      targetType: 'User',
      targetId: 'user-1',
      changes: { ...dto },
    });
  });

  it('remove soft-deletes a user and records an audit log', async () => {
    usersService.softDelete.mockResolvedValue(undefined);
    auditLogsService.record.mockResolvedValue({} as never);

    await controller.remove(adminUser, 'user-1');

    expect(usersService.softDelete).toHaveBeenCalledWith('user-1');
    expect(auditLogsService.record).toHaveBeenCalledWith({
      actorId: adminUser.sub,
      action: 'user.deleted',
      targetType: 'User',
      targetId: 'user-1',
    });
  });
});
