import { request } from '../core/network/http_methods';
import {
  PaginatedTrips,
  Trip,
  TripQuery,
} from '../types/trip';

interface TripsApiResponse {
  success: boolean;
  message: string;
  data: Trip[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    perPage: number;
  };
}

const PAGE_SIZE = 10;

export const tripService = {
  async getTrips(
    query: TripQuery = {},
  ): Promise<PaginatedTrips> {
    const params = new URLSearchParams();

    if (query.from?.trim()) {
      params.set('from', query.from.trim());
    }

    if (query.to?.trim()) {
      params.set('to', query.to.trim());
    }

    if (query.date) {
      params.set('departureDate', query.date);
    }

    // Customers only see trips that are still scheduled.
    params.set('availableOnly', 'true');
    params.set('page', String(query.page ?? 1));
    params.set('limit', String(query.limit ?? PAGE_SIZE));

    const response = await request<TripsApiResponse>(
      `/trips?${params.toString()}`,
      {},
      false,
    );

    return {
      trips: response.data ?? [],
      pagination: response.pagination ?? {
        currentPage: query.page ?? 1,
        totalPages: 1,
        totalRecords: response.data?.length ?? 0,
        perPage: query.limit ?? PAGE_SIZE,
      },
    };
  },

  async getTrip(id: string): Promise<Trip> {
    return request<Trip>(`/trips/${id}`);
  },
};