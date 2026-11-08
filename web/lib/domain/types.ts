import type { Role } from "@/lib/auth/session";

export type EntityRef = string | { _id: string };

export type Bus = {
  _id: string;
  busNumber: string;
  busClass: "ORDINARY" | "FIRST_CLASS" | "BUSINESS";
  size: "LARGE" | "MEDIUM";
  capacity: number;
  price: number;
  isActive: boolean;
};

export type BusSummary = Pick<
  Bus,
  "_id" | "busNumber" | "busClass" | "size" | "capacity"
> &
  Partial<Pick<Bus, "price" | "isActive">>;

export type Trip = {
  _id: string;
  from: string;
  to: string;
  bus: BusSummary | EntityRef;
  departureDate: string;
  departureTime: string;
  price: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  schedule?: { isRecurring?: boolean; frequency?: string };
};

export type Schedule = Trip & {
  schedule: {
    isRecurring: true;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    startDate: string;
    endDate?: string | null;
    daysOfWeek?: number[];
    dayOfMonth?: number | null;
  };
};

export type Reservation = {
  _id: string;
  trip: (Trip & { bus?: BusSummary | EntityRef }) | EntityRef;
  seat: { _id: string; seatNumber: string; row: number } | EntityRef;
  passengerName: string;
  passengerPhone: string;
  status: "CONFIRMED" | "CANCELLED";
  createdBy?: { name: string } | EntityRef;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
};

export type TripSeat = {
  seatId: string;
  seatNumber: string;
  row: number;
  column: number;
  position: "LEFT" | "MIDDLE" | "RIGHT";
  status: "AVAILABLE" | "RESERVED";
};

export type TripSeatResponse = {
  tripId: string;
  trip: Pick<Trip, "from" | "to" | "departureDate" | "departureTime" | "price" | "status">;
  bus: Pick<Bus, "busNumber" | "busClass" | "size"> & { busId: string };
  busCapacity: number;
  availableSeats: number;
  reservedSeats: number;
  seats: TripSeat[];
};

export const isPopulated = <T extends { _id: string }>(
  value: EntityRef | T,
): value is T => typeof value !== "string" && "_id" in value;

export const formatDate = (date: string): string => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString();
};
