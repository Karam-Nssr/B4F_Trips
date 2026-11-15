import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import {
  Bus,
  BusSchema,
  Reservation,
  ReservationSchema,
  Trip,
  TripSchema,
} from '../database/schemas.js';
import { ScheduleService } from './schedule.service.js';
import { TripController } from './trip.controller.js';
import { TripService } from './trip.service.js';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Bus.name, schema: BusSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  controllers: [TripController],
  providers: [TripService, ScheduleService],
})
export class TripModule {}
