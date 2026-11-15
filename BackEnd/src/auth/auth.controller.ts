import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '../common/auth.js';
import { LoginDto, RegisterDto } from '../common/dto.js';
import type { UserDocument } from '../database/schemas.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const data = await this.auth.register(body);
    return { success: true, message: 'Registration successful.', data };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const data = await this.auth.login(body);
    return { success: true, message: 'Login successful.', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserDocument) {
    const profile = await this.auth.getMe(user._id.toString());
    return {
      success: true,
      message: 'Profile retrieved successfully.',
      data: { user: profile },
    };
  }
}
