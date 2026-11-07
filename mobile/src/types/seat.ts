export type SeatPosition = 'LEFT' | 'MIDDLE' | 'RIGHT';
export type SeatStatus = 'AVAILABLE' | 'RESERVED';
export interface Seat {
  _id: string;
  seatNumber: string;
  row: number;
  position: SeatPosition;
  column?: number;
  status: SeatStatus;
  isActive?: boolean;
}
export interface SeatLayoutResponse {
  tripId: string;
  seats: Seat[];
  totalSeats?: number;
  availableSeats?: number;
  reservedSeats?: number;
}
