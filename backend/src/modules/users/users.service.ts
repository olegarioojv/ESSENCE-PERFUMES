import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (withPassword) {
      query.addSelect('user.passwordHash');
    }

    return query.getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

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
      .getOne();
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id }, { passwordHash });
  }

  async updateProfile(id: string, data: { name?: string }): Promise<User> {
    await this.usersRepository.update({ id }, data);
    return this.findById(id);
  }
}
