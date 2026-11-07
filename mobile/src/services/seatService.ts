import { USE_MOCK_DATA } from '../core/config/api';
import { getMockSeats, MOCK_TRIPS } from '../data/mockData';
import { request } from '../core/network/http_methods';
import { SeatLayoutResponse } from '../types/seat';
export const seatService = {
  async getSeats(tripId: string): Promise<SeatLayoutResponse> {
    if (USE_MOCK_DATA) {
      const trip = MOCK_TRIPS.find(item => item._id === tripId);
      if (!trip) throw new Error('Trip not found.');
      return getMockSeats(trip);
    }
    const result = await request<SeatLayoutResponse | { data: SeatLayoutResponse }>(`/trips/${tripId}/seats`);
    return (result as any).data ?? result;
  },
};
