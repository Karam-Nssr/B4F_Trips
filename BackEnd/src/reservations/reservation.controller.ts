import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '../common/auth.js';
import { CheckoutDto, CreateReservationDto } from '../common/dto.js';
import type { UserDocument } from '../database/schemas.js';
import { ReservationService } from './reservation.service.js';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservations: ReservationService) {}

  @Post('checkout')
  async checkout(@Body() body: CheckoutDto) {
    const ticket = await this.reservations.checkout(body);
    return {
      success: true,
      message: 'Payment completed and seats reserved successfully.',
      data: ticket,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE', 'USER')
  async create(
    @Body() body: CreateReservationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return {
      success: true,
      message: 'Reservation created successfully.',
      data: await this.reservations.create(body, user),
    };
  }

  @Get('my-reservations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async getMine(
    @CurrentUser() user: UserDocument,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.reservations.getMine({
      userId: user._id.toString(),
      page,
      limit,
      status,
    });
    return {
      success: true,
      message: 'Your reservations retrieved successfully.',
      data: result.reservations,
      pagination: result.pagination,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  async getAll(
    @CurrentUser() user: UserDocument,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tripId') tripId?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.reservations.getAll({
      requestingUser: user,
      page,
      limit,
      tripId,
      status,
    });
    return {
      success: true,
      message: 'Reservations retrieved successfully.',
      data: result.reservations,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return {
      success: true,
      message: 'Reservation retrieved successfully.',
      data: await this.reservations.getById(id, user),
    };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return {
      success: true,
      message: 'Reservation cancelled successfully.',
      data: await this.reservations.cancel(id, user),
    };
  }
}
