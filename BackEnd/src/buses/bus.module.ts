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
import { BusController } from './bus.controller.js';
import { BusService } from './bus.service.js';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Bus.name, schema: BusSchema },
      { name: Seat.name, schema: SeatSchema },
      { name: Trip.name, schema: TripSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [BusController],
  providers: [BusService],
})
export class BusModule {}
