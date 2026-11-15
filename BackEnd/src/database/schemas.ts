import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Schema as MongooseSchema } from 'mongoose';
import type { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, value) => {
      Reflect.deleteProperty(value, 'password');
      return value;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, minlength: 6, select: false })
  password!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ enum: ['ADMIN', 'EMPLOYEE', 'USER'], default: 'USER' })
  role!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

export type BusDocument = HydratedDocument<Bus>;

@Schema({ timestamps: true })
export class Bus {
  @Prop({ required: true, unique: true, trim: true })
  busNumber!: string;

  @Prop({ required: true, enum: ['ORDINARY', 'FIRST_CLASS', 'BUSINESS'] })
  busClass!: string;

  @Prop({ required: true, enum: ['LARGE', 'MEDIUM'] })
  size!: string;

  @Prop({ required: true })
  capacity!: number;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const BUS_CAPACITY_MAP: Record<string, Record<string, number>> = {
  ORDINARY: { LARGE: 45, MEDIUM: 37 },
  FIRST_CLASS: { LARGE: 33, MEDIUM: 27 },
  BUSINESS: { LARGE: 22, MEDIUM: 18 },
};

export const BusSchema = SchemaFactory.createForClass(Bus);
BusSchema.pre('save', function () {
  const expected = BUS_CAPACITY_MAP[this.busClass]?.[this.size];
  if (expected !== undefined && this.capacity !== expected) {
    throw new Error(`Capacity for ${this.busClass} ${this.size} bus must be ${expected}, got ${this.capacity}`);
  }
});

export type SeatDocument = HydratedDocument<Seat>;

@Schema()
export class Seat {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Bus', required: true })
  bus!: Types.ObjectId;

  @Prop({ required: true })
  seatNumber!: string;

  @Prop({ required: true, min: 1 })
  row!: number;

  @Prop({ required: true, enum: ['LEFT', 'MIDDLE', 'RIGHT'] })
  position!: string;

  @Prop({ required: true, min: 1 })
  column!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);
SeatSchema.index({ bus: 1, seatNumber: 1 }, { unique: true });
SeatSchema.index({ bus: 1, row: 1, column: 1 });

@Schema({ _id: false })
export class TripSchedule {
  @Prop({ default: false })
  isRecurring!: boolean;

  @Prop({ enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  frequency?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: [Number], default: [] })
  daysOfWeek!: number[];

  @Prop({ min: 1, max: 31 })
  dayOfMonth?: number;
}

export type TripDocument = HydratedDocument<Trip>;

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true, trim: true })
  from!: string;

  @Prop({ required: true, trim: true })
  to!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Bus', required: true })
  bus!: Types.ObjectId;

  @Prop({ required: true })
  departureDate!: Date;

  @Prop({ required: true, match: /^\d{2}:\d{2}$/ })
  departureTime!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' })
  status!: string;

  @Prop({ type: TripSchedule, default: () => ({ isRecurring: false }) })
  schedule!: TripSchedule;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  recurrenceGroupId!: Types.ObjectId | null;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
TripSchema.pre('save', function () {
  if (this.from?.trim().toLowerCase() === this.to?.trim().toLowerCase()) {
    throw new Error('Source and destination cities must be different');
  }
});
TripSchema.index({ from: 1, to: 1, departureDate: 1, status: 1 });
TripSchema.index({ bus: 1, departureDate: 1 });
TripSchema.index({ recurrenceGroupId: 1 });
TripSchema.index({ 'schedule.isRecurring': 1 });

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ timestamps: true, autoIndex: false })
export class Reservation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trip', required: true })
  trip!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Seat', required: true })
  seat!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  user!: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy!: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  passengerName!: string;

  @Prop({ required: true, trim: true })
  passengerPhone!: string;

  @Prop({ trim: true })
  nationalId?: string;

  @Prop({ trim: true, index: true })
  bookingReference?: string;

  @Prop({ enum: ['SIMULATED_ONLINE'] })
  paymentMethod?: string;

  @Prop({ enum: ['PAID'] })
  paymentStatus?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' })
  status!: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index(
  { trip: 1, seat: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'CONFIRMED' },
    name: 'unique_confirmed_seat_per_trip',
  },
);
ReservationSchema.index({ trip: 1, status: 1 });
ReservationSchema.index({ user: 1, status: 1 });
ReservationSchema.index({ createdBy: 1 });
