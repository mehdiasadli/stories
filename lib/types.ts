export type TPagination = {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
};
