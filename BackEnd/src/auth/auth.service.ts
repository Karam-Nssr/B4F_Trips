import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import type { Model } from 'mongoose';
import { LoginDto, RegisterDto } from '../common/dto.js';
import { User } from '../database/schemas.js';
import type { UserDocument } from '../database/schemas.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.toLowerCase();
    if (await this.users.exists({ email })) {
      throw new ConflictException('Email already registered.');
    }

    const user = await this.users.create({
      name: input.name,
      email,
      password: input.password,
      phone: input.phone,
      role: 'USER',
    });
    const token = await this.jwt.signAsync({
      id: user._id.toString(),
      role: user.role,
    });
    return { user, token };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.users
      .findOne({ email: email.toLowerCase() })
      .select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated.');
    }

    const token = await this.jwt.signAsync({
      id: user._id.toString(),
      role: user.role,
    });
    return { user, token };
  }

  async getMe(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }
}
