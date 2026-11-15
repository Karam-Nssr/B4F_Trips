import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import type { Model } from 'mongoose';
import { pagination } from '../common/pagination.js';
import { User } from '../database/schemas.js';
import type { UserDocument } from '../database/schemas.js';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly users: Model<UserDocument>) {}

  async getAll({
    page = '1',
    limit = '10',
    role,
    isActive,
  }: {
    page?: string;
    limit?: string;
    role?: string;
    isActive?: string;
  }) {
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const total = await this.users.countDocuments(query);
    const users = await this.users
      .find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    return { users, pagination: pagination(page, limit, total) };
  }

  async getById(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async create(input: Record<string, unknown>) {
    const email =
      typeof input.email === 'string' ? input.email.toLowerCase() : '';
    if (await this.users.exists({ email })) {
      throw new ConflictException('Email already registered.');
    }
    const role = typeof input.role === 'string' &&
      ['ADMIN', 'EMPLOYEE', 'USER'].includes(input.role)
      ? input.role
      : 'USER';
    return this.users.create({ ...input, email, role });
  }

  async update(id: string, input: Record<string, unknown>) {
    const allowed = ['name', 'email', 'phone', 'isActive', 'role', 'password'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (input[key] !== undefined) update[key] = input[key];
    }
    if (typeof update.email === 'string') update.email = update.email.toLowerCase();
    if (typeof update.password === 'string') {
      update.password = await bcrypt.hash(update.password, 12);
    }
    const user = await this.users.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async remove(id: string) {
    const user = await this.users.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }
}
