import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Model } from 'mongoose';
import { pagination } from '../common/pagination.js';
import {
  Bus,
  Reservation,
  Trip,
} from '../database/schemas.js';
import type {
  BusDocument,
  ReservationDocument,
  TripDocument,
} from '../database/schemas.js';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Bus.name) private readonly buses: Model<BusDocument>,
    @InjectModel(Reservation.name)
    private readonly reservations: Model<ReservationDocument>,
    @InjectModel(Trip.name) private readonly trips: Model<TripDocument>,
  ) {}

  async checkBusOverlap(
    busId: string,
    departureDate: Date | string,
    departureTime: string,
    excludeTripId?: string,
  ): Promise<boolean> {
    const [hours, minutes] = departureTime.split(':').map(Number);
    const requested = hours * 60 + minutes;
    const date = new Date(departureDate);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const trips = await this.trips.find({
      bus: busId,
      departureDate: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'CANCELLED' },
      ...(excludeTripId ? { _id: { $ne: excludeTripId } } : {}),
    });

    return trips.some((trip) => {
      const [tripHours, tripMinutes] = trip.departureTime.split(':').map(Number);
      return Math.abs(tripHours * 60 + tripMinutes - requested) < 180;
    });
  }

  async getAll({
    page = '1',
    limit = '10',
    from,
    to,
    departureDate,
    busClass,
    minPrice,
    maxPrice,
    status,
    availableOnly,
  }: {
    page?: string;
    limit?: string;
    from?: string;
    to?: string;
    departureDate?: string;
    busClass?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: string;
    availableOnly?: string;
  }) {
    const query: Record<string, unknown> = {};
    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };
    if (departureDate) {
      const date = new Date(departureDate);
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.departureDate = { $gte: start, $lte: end };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const price: Record<string, number> = {};
      if (minPrice !== undefined) price.$gte = Number(minPrice);
      if (maxPrice !== undefined) price.$lte = Number(maxPrice);
      query.price = price;
    }
    if (status) query.status = status;
    else if (availableOnly === 'true') query.status = 'SCHEDULED';

    if (busClass) {
      const all = await this.trips.find(query).populate<{ bus: BusDocument }>(
        'bus',
        'busNumber busClass size capacity',
      );
      const filtered = all.filter((trip) => trip.bus?.busClass === busClass);
      const total = filtered.length;
      const start = (Number(page) - 1) * Number(limit);
      return {
        trips: filtered.slice(start, start + Number(limit)),
        pagination: pagination(page, limit, total),
      };
    }

    const total = await this.trips.countDocuments(query);
    const trips = await this.trips
      .find(query)
      .populate('bus', 'busNumber busClass size capacity')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ departureDate: 1, departureTime: 1 });
    return { trips, pagination: pagination(page, limit, total) };
  }

  async getById(id: string) {
    const trip = await this.trips
      .findById(id)
      .populate('bus', 'busNumber busClass size capacity price');
    if (!trip) throw new NotFoundException('Trip not found.');
    return trip;
  }

  async create(input: {
    from: string;
    to: string;
    bus: string;
    departureDate: string;
    departureTime: string;
    price: number;
  }) {
    const bus = await this.buses.findById(input.bus);
    if (!bus) throw new NotFoundException('Bus not found.');
    if (!bus.isActive) {
      throw new BadRequestException('Cannot assign an inactive bus to a trip.');
    }
    if (input.from.trim().toLowerCase() === input.to.trim().toLowerCase()) {
      throw new BadRequestException('Source and destination cities must be different.');
    }
    if (await this.checkBusOverlap(input.bus, input.departureDate, input.departureTime)) {
      throw new ConflictException(
        'This bus already has a trip scheduled within 3 hours of the requested departure time on this date.',
      );
    }
    const trip = await this.trips.create({
      ...input,
      departureDate: new Date(input.departureDate),
      status: 'SCHEDULED',
    });
    return trip.populate('bus', 'busNumber busClass size capacity');
  }

  async update(id: string, updates: Record<string, unknown>) {
    const trip = await this.trips.findById(id);
    if (!trip) throw new NotFoundException('Trip not found.');
    if (trip.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update a cancelled trip.');
    }
    const requestedBus =
      typeof updates.bus === 'string'
        ? updates.bus
        : updates.bus instanceof Types.ObjectId
          ? updates.bus.toString()
          : undefined;
    if (requestedBus && requestedBus !== trip.bus.toString()) {
      const bus = await this.buses.findById(requestedBus);
      if (!bus?.isActive) throw new BadRequestException('Invalid or inactive bus.');
      if (await this.reservations.exists({ trip: id, status: 'CONFIRMED' })) {
        throw new ConflictException(
          'Cannot change the bus for a trip with existing confirmed reservations.',
        );
      }
    }
    const finalBus = requestedBus || trip.bus.toString();
    const finalDate = (updates.departureDate as string | undefined) ?? trip.departureDate;
    const finalTime = (updates.departureTime as string | undefined) ?? trip.departureTime;
    if (await this.checkBusOverlap(finalBus, finalDate, finalTime, id)) {
      throw new ConflictException(
        'This bus already has a trip scheduled within 3 hours of the requested departure time on this date.',
      );
    }
    const updated = await this.trips
      .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('bus', 'busNumber busClass size capacity');
    if (!updated) throw new NotFoundException('Trip not found.');
    return updated;
  }

  async remove(id: string) {
    const trip = await this.trips.findById(id);
    if (!trip) throw new NotFoundException('Trip not found.');
    const count = await this.reservations.countDocuments({
      trip: id,
      status: 'CONFIRMED',
    });
    if (count > 0) {
      throw new ConflictException(
        `Cannot delete this trip. It has ${count} active confirmed reservation(s). Please cancel all reservations before deleting the trip.`,
      );
    }
    await this.trips.findByIdAndDelete(id);
    return trip;
  }

  async cancel(id: string) {
    const trip = await this.trips.findById(id);
    if (!trip) throw new NotFoundException('Trip not found.');
    if (trip.status === 'CANCELLED') {
      throw new BadRequestException('Trip is already cancelled.');
    }
    if (trip.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed trip.');
    }
    trip.status = 'CANCELLED';
    await trip.save();
    return trip;
  }
}
