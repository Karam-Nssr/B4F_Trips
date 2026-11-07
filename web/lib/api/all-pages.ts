import "server-only";

import { apiList, type Pagination } from "@/lib/api/client";

const PAGE_SIZE = 100;

export const apiAllPages = async <T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T[]> => {
  const items: T[] = [];
  let page = 1;
  let pagination: Pagination | undefined;

  do {
    const result = await apiList<T>(path, { ...query, page, limit: PAGE_SIZE });
    items.push(...result.items);
    pagination = result.pagination;
    page++;
  } while (pagination && page <= pagination.totalPages);

  return items;
};
