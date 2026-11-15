import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '../common/auth.js';
import type { UserDocument } from '../database/schemas.js';
import { UserService } from './user.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  @Roles('ADMIN')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    const result = await this.users.getAll({ page, limit, role, isActive });
    return {
      success: true,
      message: 'Users retrieved successfully.',
      data: result.users,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() requestingUser: UserDocument,
  ) {
    if (
      requestingUser.role !== 'ADMIN' &&
      requestingUser._id.toString() !== id
    ) {
      throw new ForbiddenException('Access denied.');
    }
    return {
      success: true,
      message: 'User retrieved successfully.',
      data: await this.users.getById(id),
    };
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() body: Record<string, unknown>) {
    const user = await this.users.create(body);
    return { success: true, message: 'User created successfully.', data: user };
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const user = await this.users.update(id, body);
    return { success: true, message: 'User updated successfully.', data: user };
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.users.remove(id);
    return { success: true, message: 'User deleted successfully.', data: null };
  }
}
