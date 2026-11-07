import { USE_MOCK_DATA } from '../core/config/api';
import { createMockTicket, getMockSeats, MOCK_TRIPS } from '../data/mockData';
import { request } from '../core/network/http_methods';
import { CheckoutRequest, Ticket } from '../types/booking';

export const reservationService = {
  async checkout(payload: CheckoutRequest): Promise<Ticket> {
    if (USE_MOCK_DATA) {
      const trip = MOCK_TRIPS.find(item => item._id === payload.tripId);
      if (!trip) throw new Error('Trip not found.');
      const layout = getMockSeats(trip);
      const seat = layout.seats.find(item => item._id === payload.seatId);
      if (!seat || seat.status !== 'AVAILABLE') throw new Error('This seat is no longer available. Please choose another seat.');
      // Demo-only: payment succeeds locally and returns a confirmed, paid ticket.
      return createMockTicket(payload, trip, seat);
    }
    return request<Ticket>('/reservations/checkout', { method: 'POST', body: JSON.stringify(payload) });
  },
};
