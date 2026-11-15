import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { pagination } from '../common/pagination.js';
import {
  BUS_CAPACITY_MAP,
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
import { assertSeatCount, buildSeatLayout } from '../seats/seat-layout.js';

@Injectable()
export class BusService {
  constructor(
    @InjectModel(Bus.name) private readonly buses: Model<BusDocument>,
    @InjectModel(Seat.name) private readonly seats: Model<SeatDocument>,
    @InjectModel(Trip.name) private readonly trips: Model<TripDocument>,
    @InjectModel(Reservation.name)
    private readonly reservations: Model<ReservationDocument>,
  ) {}

  async getAll({
    page = '1',
    limit = '10',
    busClass,
    size,
    isActive,
  }: {
    page?: string;
    limit?: string;
    busClass?: string;
    size?: string;
    isActive?: string;
  }) {
    const query: Record<string, unknown> = {};
    if (busClass) query.busClass = busClass;
    if (size) query.size = size;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const total = await this.buses.countDocuments(query);
    const buses = await this.buses
      .find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    return { buses, pagination: pagination(page, limit, total) };
  }

  async getById(id: string) {
    const bus = await this.buses.findById(id);
    if (!bus) throw new NotFoundException('Bus not found.');
    return bus;
  }

  async create(input: {
    busNumber: string;
    busClass: string;
    size: string;
    capacity: number;
    price: number;
  }) {
    const expected = BUS_CAPACITY_MAP[input.busClass]?.[input.size];
    if (expected === undefined) {
      throw new BadRequestException('Invalid bus class or size combination.');
    }
    if (Number(input.capacity) !== expected) {
      throw new BadRequestException(
        `Capacity for ${input.busClass} ${input.size} bus must be ${expected}.`,
      );
    }
    const bus = await this.buses.create({ ...input, capacity: expected });
    const seats = buildSeatLayout(bus);
    assertSeatCount(seats, bus.capacity);
    await this.seats.insertMany(seats);
    return bus;
  }

  async update(id: string, input: Record<string, unknown>) {
    const bus = await this.buses.findById(id);
    if (!bus) throw new NotFoundException('Bus not found.');

    if (input.busClass || input.size) {
      const newClass =
        typeof input.busClass === 'string' ? input.busClass : bus.busClass;
      const newSize = typeof input.size === 'string' ? input.size : bus.size;
      if (newClass !== bus.busClass || newSize !== bus.size) {
        const scheduled = await this.trips.find({ bus: id, status: 'SCHEDULED' });
        if (scheduled.length > 0) {
          const hasReservations = await this.reservations.exists({
            trip: { $in: scheduled.map((trip) => trip._id) },
            status: 'CONFIRMED',
          });
          if (hasReservations) {
            throw new ConflictException(
              'Cannot change bus class or size while it has active reservations on scheduled trips.',
            );
          }
          const expected = BUS_CAPACITY_MAP[newClass]?.[newSize];
          if (!expected) {
            throw new BadRequestException('Invalid bus class or size combination.');
          }
          await this.seats.deleteMany({ bus: id });
          const update = { ...input, capacity: expected };
          await this.buses.findByIdAndUpdate(id, update);
          const updated = await this.buses.findById(id);
          if (!updated) throw new NotFoundException('Bus not found.');
          const layout = buildSeatLayout(updated);
          assertSeatCount(layout, updated.capacity);
          await this.seats.insertMany(layout);
          return updated;
        }
      }
    }

    const updated = await this.buses.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new NotFoundException('Bus not found.');
    return updated;
  }

  async remove(id: string) {
    const bus = await this.buses.findById(id);
    if (!bus) throw new NotFoundException('Bus not found.');
    if (await this.trips.exists({ bus: id })) {
      throw new ConflictException(
        'Cannot delete bus. It has existing trips. Remove all trips first.',
      );
    }
    await this.seats.deleteMany({ bus: id });
    await this.buses.findByIdAndDelete(id);
    return bus;
  }

  async deactivate(id: string) {
    const bus = await this.buses.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!bus) throw new NotFoundException('Bus not found.');
    return bus;
  }
}
