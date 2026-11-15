import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/auth.js';
import { CreateScheduleDto, CreateTripDto } from '../common/dto.js';
import { ScheduleService } from './schedule.service.js';
import { TripService } from './trip.service.js';

@Controller('trips')
export class TripController {
  constructor(
    private readonly trips: TripService,
    private readonly schedules: ScheduleService,
  ) {}

  @Post('schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createSchedule(@Body() body: CreateScheduleDto) {
    const result = await this.schedules.create(body);
    return {
      success: true,
      message: `Recurring schedule created. ${result.generatedCount} trip(s) generated.`,
      data: result.schedule,
      generatedCount: result.generatedCount,
    };
  }

  @Get('schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSchedules(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.schedules.getAll({ page, limit });
    return {
      success: true,
      message: 'Schedules retrieved successfully.',
      data: result.schedules,
      pagination: result.pagination,
    };
  }

  @Get('schedules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSchedule(@Param('id') id: string) {
    const result = await this.schedules.getById(id);
    return {
      success: true,
      message: 'Schedule retrieved successfully.',
      data: result.schedule,
      generatedCount: result.generatedCount,
    };
  }

  @Put('schedules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateSchedule(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const result = await this.schedules.update(id, body);
    return {
      success: true,
      message: `Schedule updated. ${result.updatedTripsCount} future unbooked trip(s) updated.`,
      data: result.schedule,
      updatedTripsCount: result.updatedTripsCount,
    };
  }

  @Delete('schedules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteSchedule(@Param('id') id: string) {
    const result = await this.schedules.remove(id);
    return {
      success: true,
      message: `Schedule deleted. ${result.deletedTripsCount} trip(s) deleted, ${result.cancelledTripsCount} cancelled.`,
      data: null,
    };
  }

  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('departureDate') departureDate?: string,
    @Query('busClass') busClass?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
    @Query('availableOnly') availableOnly?: string,
  ) {
    const result = await this.trips.getAll({
      page,
      limit,
      from,
      to,
      departureDate,
      busClass,
      minPrice,
      maxPrice,
      status,
      availableOnly,
    });
    return {
      success: true,
      message: 'Trips retrieved successfully.',
      data: result.trips,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return {
      success: true,
      message: 'Trip retrieved successfully.',
      data: await this.trips.getById(id),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: CreateTripDto) {
    return {
      success: true,
      message: 'Trip created successfully.',
      data: await this.trips.create(body),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return {
      success: true,
      message: 'Trip updated successfully.',
      data: await this.trips.update(id, body),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.trips.remove(id);
    return {
      success: true,
      message: 'Trip deleted successfully.',
      data: null,
    };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async cancel(@Param('id') id: string) {
    return {
      success: true,
      message: 'Trip cancelled successfully.',
      data: await this.trips.cancel(id),
    };
  }
}
