import "server-only";

import { apiAllPages } from "@/lib/api/all-pages";
import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { Reservation } from "@/lib/domain/types";

export const getReservation = (id: string): Promise<Reservation> =>
  apiFetch<Reservation>(apiEndpoints.reservations.item(id));

export const listAllReservations = (): Promise<Reservation[]> =>
  apiAllPages<Reservation>(apiEndpoints.reservations.collection);
