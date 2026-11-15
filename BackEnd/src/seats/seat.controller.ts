import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/auth.js';
import { SeatService } from './seat.service.js';

@Controller()
export class SeatController {
  constructor(private readonly seats: SeatService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('buses/:busId/seats')
  async getByBus(@Param('busId') busId: string) {
    return {
      success: true,
      message: 'Seats retrieved successfully.',
      data: await this.seats.getByBus(busId),
    };
  }

  @Get('trips/:tripId/seats')
  async getByTrip(@Param('tripId') tripId: string) {
    return {
      success: true,
      message: 'Trip seat availability retrieved successfully.',
      data: await this.seats.getByTrip(tripId),
    };
  }
}
