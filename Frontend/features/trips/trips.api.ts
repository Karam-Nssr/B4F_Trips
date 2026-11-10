import "server-only";

import { apiAllPages } from "@/lib/api/all-pages";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { Trip, TripSeatResponse } from "@/lib/domain/types";

export type TripQuery = Record<string, string | number | undefined>;

export const listAllTrips = (query: TripQuery = {}): Promise<Trip[]> =>
  apiAllPages<Trip>(apiEndpoints.trips.collection, query);

export const getTrip = (id: string): Promise<Trip> =>
  apiFetch<Trip>(apiEndpoints.trips.item(id));

export const getTripSeats = (id: string): Promise<TripSeatResponse> =>
  apiFetch<TripSeatResponse>(apiEndpoints.trips.seats(id));
