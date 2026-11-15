import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  Bus,
  Reservation,
  Seat,
  Trip,
} from '../database/schemas.js';
import type {
  BusDocument,
  ReservationDocument,
  SeatDocument,
  TripDocument,
} from '../database/schemas.js';

@Injectable()
export class SeatService {
  constructor(
    @InjectModel(Bus.name) private readonly buses: Model<BusDocument>,
    @InjectModel(Reservation.name)
    private readonly reservations: Model<ReservationDocument>,
    @InjectModel(Seat.name) private readonly seats: Model<SeatDocument>,
    @InjectModel(Trip.name) private readonly trips: Model<TripDocument>,
  ) {}

  async getByBus(busId: string) {
    const bus = await this.buses.findById(busId);
    if (!bus) throw new NotFoundException('Bus not found.');
    const seats = await this.seats.find({ bus: busId }).sort({ row: 1, column: 1 });
    return { bus, seats };
  }

  async getByTrip(tripId: string) {
    const trip = await this.trips
      .findById(tripId)
      .populate<{ bus: BusDocument }>('bus');
    if (!trip) throw new NotFoundException('Trip not found.');
    if (!trip.bus) throw new NotFoundException('Bus not found.');
    if (trip.status === 'CANCELLED') {
      throw new BadRequestException('This trip has been cancelled.');
    }

    const seats = await this.seats
      .find({ bus: trip.bus._id, isActive: true })
      .sort({ row: 1, column: 1 });
    const reservations = await this.reservations
      .find({ trip: tripId, status: 'CONFIRMED' })
      .select('seat');
    const reservedSeatIds = new Set(
      reservations.map((reservation) => reservation.seat.toString()),
    );
    const layout = seats.map((seat) => ({
      seatId: seat._id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      position: seat.position,
      column: seat.column,
      status: reservedSeatIds.has(seat._id.toString()) ? 'RESERVED' : 'AVAILABLE',
    }));

    return {
      tripId: trip._id,
      trip: {
        from: trip.from,
        to: trip.to,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        price: trip.price,
        status: trip.status,
      },
      bus: {
        busId: trip.bus._id,
        busNumber: trip.bus.busNumber,
        busClass: trip.bus.busClass,
        size: trip.bus.size,
      },
      busCapacity: trip.bus.capacity,
      availableSeats: seats.length - reservedSeatIds.size,
      reservedSeats: reservedSeatIds.size,
      seats: layout,
    };
  }
}
