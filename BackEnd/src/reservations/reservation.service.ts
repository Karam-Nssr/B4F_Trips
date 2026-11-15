import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { pagination } from '../common/pagination.js';
import {
  Reservation,
  Seat,
  Trip,
} from '../database/schemas.js';
import type {
  BusDocument,
  ReservationDocument,
  SeatDocument,
  TripDocument,
  UserDocument,
} from '../database/schemas.js';
import { CheckoutDto, CreateReservationDto } from '../common/dto.js';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservations: Model<ReservationDocument>,
    @InjectModel(Seat.name) private readonly seats: Model<SeatDocument>,
    @InjectModel(Trip.name) private readonly trips: Model<TripDocument>,
  ) {}

  private createBookingReference() {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `BR-${new Date().getFullYear()}-${random}`;
  }

  async checkout({ tripId, passengers, paymentMethod }: CheckoutDto) {
    const trip = await this.trips
      .findById(tripId)
      .populate<{ bus: BusDocument }>('bus', 'busNumber isActive');
    if (!trip) throw new NotFoundException('Trip not found.');
    if (trip.status !== 'SCHEDULED') {
      throw new ConflictException('This trip is not available for booking.');
    }
    if (!trip.bus?.isActive) {
      throw new ConflictException('The bus assigned to this trip is not active.');
    }
    if (!passengers?.length) {
      throw new BadRequestException('At least one passenger is required.');
    }

    const seatIds = passengers.map((item) => String(item.seatId));
    if (new Set(seatIds).size !== seatIds.length) {
      throw new BadRequestException('A seat cannot be booked more than once.');
    }
    const seats = await this.seats.find({
      _id: { $in: seatIds },
      bus: trip.bus._id,
      isActive: true,
    });
    if (seats.length !== seatIds.length) {
      throw new BadRequestException(
        'One or more selected seats are invalid or unavailable for this bus.',
      );
    }
    const seatById = new Map(seats.map((seat) => [seat._id.toString(), seat]));
    const existing = await this.reservations
      .find({
        trip: tripId,
        seat: { $in: seatIds },
        status: 'CONFIRMED',
      })
      .select('seat');
    if (existing.length) {
      const taken = new Set(existing.map((reservation) => reservation.seat.toString()));
      const numbers = seats
        .filter((seat) => taken.has(seat._id.toString()))
        .map((seat) => seat.seatNumber);
      throw new ConflictException(
        `These seat(s) are no longer available: ${numbers.join(', ')}.`,
      );
    }

    const totalAmount = trip.price * passengers.length;
    if (paymentMethod !== 'SIMULATED_ONLINE') {
      throw new BadRequestException('Unsupported payment method.');
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new BadRequestException('Invalid payment amount.');
    }
    const paidAt = new Date();
    const bookingReference = this.createBookingReference();
    const documents = passengers.map((item) => {
      const seat = seatById.get(String(item.seatId));
      if (!seat) throw new BadRequestException('Selected seat is invalid.');
      return {
        trip: tripId,
        seat: seat._id,
        user: null,
        createdBy: null,
        passengerName: item.passenger.fullName.trim(),
        passengerPhone: item.passenger.phone.trim(),
        nationalId: item.passenger.nationalId.trim(),
        bookingReference,
        paymentMethod,
        paymentStatus: 'PAID',
        paidAt,
        status: 'CONFIRMED',
      };
    });

    let created: ReservationDocument[];
    try {
      created = await this.reservations.insertMany(documents, { ordered: true });
    } catch (error) {
      await this.reservations.deleteMany({ bookingReference });
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'At least one selected seat was just reserved by someone else. No seats from this booking were reserved. Please choose again.',
        );
      }
      throw error;
    }

    return {
      bookingReference,
      reservationIds: created.map((reservation) => reservation._id),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      passengers: passengers.map((item) => {
        const seat = seatById.get(String(item.seatId));
        if (!seat) throw new BadRequestException('Selected seat is invalid.');
        return {
          seatId: seat._id,
          seatNumber: seat.seatNumber,
          fullName: item.passenger.fullName.trim(),
          phone: item.passenger.phone.trim(),
          nationalId: item.passenger.nationalId.trim(),
        };
      }),
      totalAmount,
      paidAt,
      trip: {
        from: trip.from,
        to: trip.to,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        price: trip.price,
        busNumber: trip.bus.busNumber,
      },
    };
  }

  async create(input: CreateReservationDto, requestingUser: UserDocument) {
    const trip = await this.trips.findById(input.trip);
    if (!trip) throw new NotFoundException('Trip not found.');
    if (trip.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `This trip is not available for booking. Status: ${trip.status}`,
      );
    }
    const seat = await this.seats.findById(input.seat);
    if (!seat) throw new NotFoundException('Seat not found.');
    if (seat.bus.toString() !== trip.bus.toString()) {
      throw new BadRequestException(
        'This seat does not belong to the bus assigned to this trip.',
      );
    }
    if (!seat.isActive) throw new BadRequestException('This seat is not available.');
    if (
      await this.reservations.exists({
        trip: input.trip,
        seat: input.seat,
        status: 'CONFIRMED',
      })
    ) {
      throw new ConflictException('This seat is already reserved for this trip.');
    }

    const data: Record<string, unknown> = {
      trip: input.trip,
      seat: input.seat,
      createdBy: requestingUser._id,
      passengerName: input.passengerName,
      passengerPhone: input.passengerPhone,
      status: 'CONFIRMED',
    };
    if (requestingUser.role === 'USER') data.user = requestingUser._id;

    let reservation: ReservationDocument;
    try {
      reservation = await this.reservations.create(data);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'This seat was just reserved by someone else. Please select another seat.',
        );
      }
      throw error;
    }
    return reservation.populate([
      { path: 'trip', select: 'from to departureDate departureTime price status' },
      { path: 'seat', select: 'seatNumber row position column' },
      { path: 'createdBy', select: 'name email role' },
    ]);
  }

  async getAll({
    requestingUser,
    page = '1',
    limit = '10',
    tripId,
    status,
  }: {
    requestingUser: UserDocument;
    page?: string;
    limit?: string;
    tripId?: string;
    status?: string;
  }) {
    const query: Record<string, unknown> = {};
    if (requestingUser.role === 'EMPLOYEE') query.createdBy = requestingUser._id;
    if (tripId) query.trip = tripId;
    if (status) query.status = status;
    const total = await this.reservations.countDocuments(query);
    const reservations = await this.reservations
      .find(query)
      .populate('trip', 'from to departureDate departureTime price status')
      .populate('seat', 'seatNumber row position')
      .populate('user', 'name email phone')
      .populate('createdBy', 'name email role')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    return { reservations, pagination: pagination(page, limit, total) };
  }

  async getMine({
    userId,
    page = '1',
    limit = '10',
    status,
  }: {
    userId: string;
    page?: string;
    limit?: string;
    status?: string;
  }) {
    const query: Record<string, unknown> = { user: userId };
    if (status) query.status = status;
    const total = await this.reservations.countDocuments(query);
    const reservations = await this.reservations
      .find(query)
      .populate('trip', 'from to departureDate departureTime price status')
      .populate('seat', 'seatNumber row position column')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    return { reservations, pagination: pagination(page, limit, total) };
  }

  async getById(id: string, user: UserDocument) {
    const reservation = await this.reservations
      .findById(id)
      .populate<{ user: UserDocument | null; createdBy: UserDocument | null }>(
        'user createdBy',
        'name email phone role',
      )
      .populate('trip', 'from to departureDate departureTime price status')
      .populate('seat', 'seatNumber row position column');
    if (!reservation) throw new NotFoundException('Reservation not found.');
    if (user.role === 'USER') {
      if (!reservation.user || reservation.user._id.toString() !== user._id.toString()) {
        throw new ForbiddenException('You do not have permission to view this reservation.');
      }
    } else if (user.role === 'EMPLOYEE') {
      if (
        !reservation.createdBy ||
        reservation.createdBy._id.toString() !== user._id.toString()
      ) {
        throw new ForbiddenException('You do not have permission to view this reservation.');
      }
    }
    return reservation;
  }

  async cancel(id: string, user: UserDocument) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'Customers are not allowed to cancel reservations. Please contact reception.',
      );
    }
    const reservation = await this.reservations.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found.');
    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('This reservation is already cancelled.');
    }
    if (
      user.role === 'EMPLOYEE' &&
      reservation.createdBy?.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException('You can only cancel reservations that you created.');
    }
    reservation.status = 'CANCELLED';
    await reservation.save();
    return reservation;
  }
}
