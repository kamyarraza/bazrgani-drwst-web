export interface BranchUpdatePayload {
  name: string;
  code?: string;
  location_id: number;
  phone: string;
  is_active: boolean;
}

export interface BranchFormData {
  name: string;
  code: string;
  location_id: number | null;
  phone: string;
  is_active: boolean;
}

export interface Branch {
  id: number;
  name: string;
  code?: string;
  location_id: number;
  phone: string;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  [key: string]: unknown; // catch unexpected keys like the empty one in your example
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
