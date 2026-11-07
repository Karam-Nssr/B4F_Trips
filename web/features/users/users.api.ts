import "server-only";

import { apiFetch, apiList, type Pagination } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { User } from "@/lib/domain/types";

export const listUsers = (
  query: Record<string, string | number | undefined> = {},
): Promise<{ items: User[]; pagination?: Pagination }> =>
  apiList<User>(apiEndpoints.users.collection, query);

export const getUser = (id: string): Promise<User> =>
  apiFetch<User>(apiEndpoints.users.item(id));
