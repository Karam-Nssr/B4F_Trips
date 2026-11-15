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
import { CreateBusDto } from '../common/dto.js';
import { BusService } from './bus.service.js';

@Controller('buses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BusController {
  constructor(private readonly buses: BusService) {}

  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('busClass') busClass?: string,
    @Query('size') size?: string,
    @Query('isActive') isActive?: string,
  ) {
    const result = await this.buses.getAll({ page, limit, busClass, size, isActive });
    return {
      success: true,
      message: 'Buses retrieved successfully.',
      data: result.buses,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return {
      success: true,
      message: 'Bus retrieved successfully.',
      data: await this.buses.getById(id),
    };
  }

  @Post()
  async create(@Body() body: CreateBusDto) {
    return {
      success: true,
      message: 'Bus created successfully.',
      data: await this.buses.create(body),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return {
      success: true,
      message: 'Bus updated successfully.',
      data: await this.buses.update(id, body),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.buses.remove(id);
    return { success: true, message: 'Bus deleted successfully.', data: null };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return {
      success: true,
      message: 'Bus deactivated successfully.',
      data: await this.buses.deactivate(id),
    };
  }
}
