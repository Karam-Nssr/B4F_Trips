
import { USE_MOCK_DATA } from '../core/config/api';
import { getMockSeats, MOCK_TRIPS } from '../data/mockData';
import { request } from '../core/network/http_methods';
import { SeatLayoutResponse } from '../types/seat';

interface BackendSeat {
  seatId: string;
  seatNumber: string;
  row: number;
  position: 'LEFT' | 'MIDDLE' | 'RIGHT';
  column: number;
  status: 'AVAILABLE' | 'RESERVED';
}

interface BackendSeatLayout {
  tripId: string;
  busCapacity: number;
  availableSeats: number;
  reservedSeats: number;
  seats: BackendSeat[];
}

export const seatService = {
  async getSeats(tripId: string): Promise<SeatLayoutResponse> {
    if (USE_MOCK_DATA) {
      const trip = MOCK_TRIPS.find(item => item._id === tripId);

      if (!trip) throw new Error('Trip not found.');

      return getMockSeats(trip);
    }

    // request() returns the contents of backend.data directly.
    const layout = await request<BackendSeatLayout>(
      `/trips/${tripId}/seats`,
    );

    return {
      tripId: layout.tripId,
      totalSeats: layout.busCapacity,
      availableSeats: layout.availableSeats,
      reservedSeats: layout.reservedSeats,
      seats: layout.seats.map(seat => ({
        _id: seat.seatId,
        seatNumber: seat.seatNumber,
        row: seat.row,
        position: seat.position,
        column: seat.column,
        status: seat.status,
        isActive: true,
      })),
    };
  },
};
