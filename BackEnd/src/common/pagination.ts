export function pagination(page: number | string, limit: number | string, total: number) {
  const currentPage = Number(page);
  const perPage = Number(limit);
  return {
    currentPage,
    totalPages: Math.ceil(total / perPage),
    totalRecords: total,
    perPage,
  };
}
