export type TripStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export interface Trip {
  _id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  status: TripStatus;
  bus: string | { _id: string; busNumber: string; busClass: string; size?: string; capacity: number };
  availableSeats?: number;
  totalSeats?: number;
}
export interface TripQuery { from?: string; to?: string; date?: string }
