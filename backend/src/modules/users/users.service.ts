import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async createByAdmin(dto: CreateUserDto): Promise<User> {
    const passwordHash = await this.hashPassword(dto.password);
    return this.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });
  }

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL');

    if (withPassword) {
      query.addSelect('user.passwordHash');
    }

    return query.getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ where: { deletedAt: IsNull() } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id }, { passwordHash });
  }

  async updateProfile(id: string, data: { name?: string }): Promise<User> {
    await this.usersRepository.update({ id }, data);
    return this.findById(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    await this.usersRepository.update({ id }, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.usersRepository.update({ id }, { deletedAt: new Date() });
  }

  async updateAvatar(id: string, avatarUrl: string | null): Promise<User> {
    await this.usersRepository.update({ id }, { avatarUrl });
    return this.findById(id);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    return bcrypt.hash(password, saltRounds);
  }
}
