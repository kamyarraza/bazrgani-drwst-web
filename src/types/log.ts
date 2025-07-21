interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
}

interface NewData {
  id: string;
  name: string;
  is_male: boolean;
  role: string;
  phone: string;
  username: string;
  type: string;
  updated_at: string; // ISO 8601 format
  created_at: string; // ISO 8601 format
}

export interface AuditLogEntry {
  id: string;
  user: User;
  title: string;
  entity: string;
  entity_id: string;
  old_data: null | Record<string, any>;
  new_data: NewData;
  ip_address: string;
  platform: string;
  browser: string;
  created_at: string; // Format: "YYYY-MM-DD HH:mm:ss"
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
