export interface ApiResponseMultiple<T> {
  items: T[];
  meta: Meta;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
