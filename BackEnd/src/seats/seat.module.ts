import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import {
  Bus,
  BusSchema,
  Reservation,
  ReservationSchema,
  Seat,
  SeatSchema,
  Trip,
  TripSchema,
} from '../database/schemas.js';
import { SeatController } from './seat.controller.js';
import { SeatService } from './seat.service.js';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Bus.name, schema: BusSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Seat.name, schema: SeatSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  controllers: [SeatController],
  providers: [SeatService],
})
export class SeatModule {}
