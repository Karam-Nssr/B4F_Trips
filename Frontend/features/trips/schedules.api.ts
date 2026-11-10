import "server-only";

import { apiFetch, apiList, type Pagination } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { Schedule } from "@/lib/domain/types";

export const listSchedules = (
  query: Record<string, string | number | undefined> = {},
): Promise<{ items: Schedule[]; pagination?: Pagination }> =>
  apiList<Schedule>(apiEndpoints.schedules.collection, query);

export const getSchedule = (id: string): Promise<Schedule> =>
  apiFetch<Schedule>(apiEndpoints.schedules.item(id));
