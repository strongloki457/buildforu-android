import type { PaginatedResult, PaginationQuery } from "../types/api";

export function getPagination(query: PaginationQuery) {
  const page = query.page;
  const limit = query.limit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit
  };
}

export function toPaginatedResult<T>(data: T[], total: number, query: PaginationQuery): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}
