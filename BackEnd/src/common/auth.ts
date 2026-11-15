import {
  createParamDecorator,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import type { Model } from 'mongoose';
import { User } from '../database/schemas.js';
import type { UserDocument } from '../database/schemas.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access denied. No token provided.');
    }

    let payload: { id?: string };
    try {
      payload = await this.jwt.verifyAsync<{ id?: string }>(header.slice(7));
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
    if (!payload.id) throw new UnauthorizedException('Invalid or expired token.');

    const user = await this.users.findById(payload.id).select('-password');
    if (!user) throw new UnauthorizedException('User no longer exists.');
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated.');
    }
    request.user = user;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) throw new UnauthorizedException('Authentication required.');
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
    return true;
  }
}
