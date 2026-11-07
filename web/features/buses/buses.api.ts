import "server-only";

import { apiFetch, apiList, type Pagination } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { Bus } from "@/lib/domain/types";

export type BusSeat = {
  _id: string;
  seatNumber: string;
  row: number;
  column?: number;
  position?: "LEFT" | "MIDDLE" | "RIGHT";
  isActive: boolean;
};

export type BusSeatResponse = {
  bus: Bus;
  seats: BusSeat[];
};

export const listBuses = (
  query: Record<string, string | number | undefined> = {},
): Promise<{ items: Bus[]; pagination?: Pagination }> =>
  apiList<Bus>(apiEndpoints.buses.collection, query);

export const getBus = (id: string): Promise<Bus> =>
  apiFetch<Bus>(apiEndpoints.buses.item(id));

export const getBusSeats = (id: string): Promise<BusSeatResponse> =>
  apiFetch<BusSeatResponse>(apiEndpoints.buses.seats(id));
