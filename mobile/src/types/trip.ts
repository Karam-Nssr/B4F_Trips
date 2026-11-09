export type TripStatus =
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface Trip {
  _id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  status: TripStatus;

  bus:
    | string
    | {
        _id: string;
        busNumber: string;
        busClass: string;
        size?: string;
        capacity: number;
      };

  availableSeats?: number;
  totalSeats?: number;
}

export interface TripQuery {
  from?: string;
  to?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  perPage: number;
}

export interface PaginatedTrips {
  trips: Trip[];
  pagination: PaginationMeta;
}