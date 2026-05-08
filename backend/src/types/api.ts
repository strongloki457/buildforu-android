import type { Role } from "@prisma/client";

export type AuthContext = {
  userId: string;
  role: Role;
  companyId: string;
  workerId: string | null;
  email: string;
  name: string;
};

export type PaginationQuery = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
