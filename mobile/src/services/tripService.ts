import { USE_MOCK_DATA } from '../core/config/api';
import { getMockSeats, MOCK_TRIPS } from '../data/mockData';
import { request } from '../core/network/http_methods';
import { Trip, TripQuery } from '../types/trip';

export const tripService = {
  async getTrips(query: TripQuery = {}): Promise<Trip[]> {
    if (USE_MOCK_DATA) {
      return MOCK_TRIPS.filter(trip =>
        (!query.from || trip.from.toLowerCase() === query.from.toLowerCase()) &&
        (!query.to || trip.to.toLowerCase() === query.to.toLowerCase()) &&
        (!query.date || trip.departureDate.slice(0, 10) === query.date)
      ).map(trip => ({ ...trip, availableSeats: getMockSeats(trip).availableSeats })).sort((a, b) => `${a.departureDate}T${a.departureTime}`.localeCompare(`${b.departureDate}T${b.departureTime}`));
    }
    const params = new URLSearchParams();
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.date) params.set('date', query.date);
    const suffix = params.toString();
    const result = await request<Trip[] | { trips: Trip[] }>(`/trips${suffix ? `?${suffix}` : ''}`);
    return Array.isArray(result) ? result : result.trips;
  },
  async getTrip(id: string): Promise<Trip> {
    if (USE_MOCK_DATA) {
      const trip = MOCK_TRIPS.find(item => item._id === id);
      if (!trip) throw new Error('Trip not found.');
      return trip;
    }
    return request<Trip>(`/trips/${id}`);
  },
};
