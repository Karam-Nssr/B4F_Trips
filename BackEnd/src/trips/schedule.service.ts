import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import mongoose from 'mongoose';
import type { Model } from 'mongoose';
import { pagination } from '../common/pagination.js';
import {
  Bus,
  Reservation,
  Trip,
  TripSchedule,
} from '../database/schemas.js';
import type {
  BusDocument,
  ReservationDocument,
  TripDocument,
} from '../database/schemas.js';
import { TripService } from './trip.service.js';

const GENERATION_WINDOW_DAYS = 30;

@Injectable()
export class ScheduleService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(Bus.name) private readonly buses: Model<BusDocument>,
    @InjectModel(Reservation.name)
    private readonly reservations: Model<ReservationDocument>,
    @InjectModel(Trip.name) private readonly trips: Model<TripDocument>,
    private readonly tripService: TripService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const count = await this.runMaintenance();
      this.logger.log(`Startup maintenance: ${count} trip(s) generated.`);
    } catch (error) {
      this.logger.error(
        'Startup maintenance failed.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async dailyMaintenance() {
    this.logger.log('Running daily schedule maintenance...');
    const count = await this.runMaintenance();
    this.logger.log(`Daily maintenance complete: ${count} trip(s) generated.`);
  }

  private todayInDamascus() {
    const date = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Damascus',
    });
    return new Date(`${date}T00:00:00.000Z`);
  }

  async create(input: {
    from: string;
    to: string;
    bus: string;
    departureTime: string;
    price: number;
    frequency: string;
    startDate: string;
    endDate?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  }) {
    const bus = await this.buses.findById(input.bus);
    if (!bus?.isActive) throw new BadRequestException('Bus not found or inactive.');
    if (input.from.trim().toLowerCase() === input.to.trim().toLowerCase()) {
      throw new BadRequestException('Source and destination cities must be different.');
    }
    const recurrenceGroupId = new mongoose.Types.ObjectId();
    const schedule = await this.trips.create({
      from: input.from,
      to: input.to,
      bus: input.bus,
      departureDate: new Date(input.startDate),
      departureTime: input.departureTime,
      price: input.price,
      status: 'SCHEDULED',
      schedule: {
        isRecurring: true,
        frequency: input.frequency,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        daysOfWeek: input.daysOfWeek ?? [],
        dayOfMonth: input.dayOfMonth,
      },
      recurrenceGroupId,
    });
    const generatedCount = await this.generate(schedule);
    return { schedule, generatedCount };
  }

  async getAll({ page = '1', limit = '10' }: { page?: string; limit?: string }) {
    const query = { 'schedule.isRecurring': true };
    const total = await this.trips.countDocuments(query);
    const schedules = await this.trips
      .find(query)
      .populate('bus', 'busNumber busClass size')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    return { schedules, pagination: pagination(page, limit, total) };
  }

  async getById(id: string) {
    const schedule = await this.trips
      .findOne({ _id: id, 'schedule.isRecurring': true })
      .populate('bus', 'busNumber busClass size capacity');
    if (!schedule) throw new NotFoundException('Schedule not found.');
    const generatedCount = await this.trips.countDocuments({
      recurrenceGroupId: schedule.recurrenceGroupId,
      'schedule.isRecurring': false,
    });
    return { schedule, generatedCount };
  }

  async update(id: string, updates: Record<string, unknown>) {
    const schedule = await this.trips.findOne({
      _id: id,
      'schedule.isRecurring': true,
    });
    if (!schedule) throw new NotFoundException('Schedule not found.');
    const filtered: Record<string, unknown> = {};
    for (const key of ['from', 'to', 'bus', 'price', 'departureTime']) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }
    if (updates.frequency) filtered['schedule.frequency'] = updates.frequency;
    if (typeof updates.startDate === 'string') {
      filtered['schedule.startDate'] = new Date(updates.startDate);
    }
    if (typeof updates.endDate === 'string') {
      filtered['schedule.endDate'] = new Date(updates.endDate);
    }
    if (updates.daysOfWeek) filtered['schedule.daysOfWeek'] = updates.daysOfWeek;
    if (updates.dayOfMonth) filtered['schedule.dayOfMonth'] = updates.dayOfMonth;

    const updatedSchedule = await this.trips.findByIdAndUpdate(id, filtered, {
      new: true,
      runValidators: true,
    });
    if (!updatedSchedule) throw new NotFoundException('Schedule not found.');

    const today = this.todayInDamascus();
    const future = await this.trips.find({
      recurrenceGroupId: schedule.recurrenceGroupId,
      'schedule.isRecurring': false,
      departureDate: { $gte: today },
    });
    let updatedTripsCount = 0;
    for (const trip of future) {
      const reserved = await this.reservations.exists({
        trip: trip._id,
        status: 'CONFIRMED',
      });
      if (!reserved) {
        const tripUpdates: Record<string, unknown> = {};
        for (const key of ['from', 'to', 'bus', 'price', 'departureTime']) {
          if (updates[key] !== undefined) tripUpdates[key] = updates[key];
        }
        if (Object.keys(tripUpdates).length > 0) {
          await this.trips.findByIdAndUpdate(trip._id, tripUpdates);
          updatedTripsCount++;
        }
      }
    }
    return { schedule: updatedSchedule, updatedTripsCount };
  }

  async remove(id: string) {
    const schedule = await this.trips.findOne({
      _id: id,
      'schedule.isRecurring': true,
    });
    if (!schedule) throw new NotFoundException('Schedule not found.');
    const today = this.todayInDamascus();
    const future = await this.trips.find({
      recurrenceGroupId: schedule.recurrenceGroupId,
      'schedule.isRecurring': false,
      departureDate: { $gte: today },
      status: 'SCHEDULED',
    });
    let deletedTripsCount = 0;
    let cancelledTripsCount = 0;
    for (const trip of future) {
      const reserved = await this.reservations.exists({
        trip: trip._id,
        status: 'CONFIRMED',
      });
      if (!reserved) {
        await this.trips.findByIdAndDelete(trip._id);
        deletedTripsCount++;
      } else {
        await this.trips.findByIdAndUpdate(trip._id, { status: 'CANCELLED' });
        cancelledTripsCount++;
      }
    }
    await this.trips.findByIdAndDelete(id);
    return { deletedTripsCount, cancelledTripsCount };
  }

  private datesInRange(start: Date, end: Date, schedule: TripSchedule) {
    const dates: Date[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);
    while (current <= last) {
      const weekday = current.getDay();
      const day = current.getDate();
      const include =
        schedule.frequency === 'DAILY' ||
        (schedule.frequency === 'WEEKLY' &&
          (!schedule.daysOfWeek?.length || schedule.daysOfWeek.includes(weekday))) ||
        (schedule.frequency === 'MONTHLY' &&
          day === (schedule.dayOfMonth || 1));
      if (include) dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  private async generate(scheduleDoc: TripDocument): Promise<number> {
    const { schedule, recurrenceGroupId, bus, from, to, departureTime, price } =
      scheduleDoc;
    const today = this.todayInDamascus();
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + GENERATION_WINDOW_DAYS);
    const start =
      schedule.startDate && schedule.startDate > today ? schedule.startDate : today;
    const end =
      schedule.endDate && schedule.endDate < windowEnd ? schedule.endDate : windowEnd;
    const existing = await this.trips
      .find({ recurrenceGroupId, 'schedule.isRecurring': false })
      .select('departureDate');
    const existingDates = new Set(
      existing.map((trip) => trip.departureDate.toISOString().split('T')[0]),
    );
    const toCreate: Array<Record<string, unknown>> = [];
    for (const date of this.datesInRange(start, end, schedule)) {
      if (existingDates.has(date.toISOString().split('T')[0])) continue;
      if (await this.tripService.checkBusOverlap(bus.toString(), date, departureTime)) {
        continue;
      }
      toCreate.push({
        from,
        to,
        bus,
        departureDate: date,
        departureTime,
        price,
        status: 'SCHEDULED',
        schedule: { isRecurring: false },
        recurrenceGroupId,
      });
    }
    if (toCreate.length) await this.trips.insertMany(toCreate);
    return toCreate.length;
  }

  private async runMaintenance() {
    const schedules = await this.trips.find({ 'schedule.isRecurring': true });
    let totalGenerated = 0;
    for (const schedule of schedules) {
      try {
        totalGenerated += await this.generate(schedule);
      } catch (error) {
        this.logger.error(
          `Schedule ${schedule._id.toString()} failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    if (totalGenerated > 0) {
      this.logger.log(`Generated ${totalGenerated} new trip(s).`);
    }
    return totalGenerated;
  }
}
