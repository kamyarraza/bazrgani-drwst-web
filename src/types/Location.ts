export interface Location {
  id: number;
  name: string;
  type: string; // e.g., "country", "city", etc.
  parent: Record<string, unknown>; // Changed from object to Record for better typing
  children: string[]; // Array of child location IDs
  phone_code: string;
  timezone: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: Pagination;
}

// Specific usage for locations
export type LocationResponse = ApiResponse<Location[]>;
