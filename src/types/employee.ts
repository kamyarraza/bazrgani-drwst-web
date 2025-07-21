export interface Employee {
  id?: string | number;
  name: string;
  is_male: 'Male' | 'Female' | null;
  role: string;
  phone: string;
  username: string;
  gender?:'Male' | 'Female' | null;
  password: string;
  password_confirmation: string;
  branch_id: string;
  image?: string;
  stickyNotes?: [];
  created_at?: string;
  updated_at?: string;
  branch?: {
    id: number;
    name: string;
    code?: string | null;
    phone: string;
    is_active: boolean;
    created_at: string;
  };
};

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
  pagination?: Pagination; // optional if some responses don't have it
}
