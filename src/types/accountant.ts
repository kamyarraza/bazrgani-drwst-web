// accountant.ts

export interface Accountant {
  id: number;
  name: string;
  phone: string;
  username: string;
  role: string;
  gender: string;
  image: string | null;
  password?:string,
  password_confirmation?:string,
  branch_id?: number;
  is_male?:boolean | null
}

export interface AccountantForm {
  id?: number;
  name: string;
  phone: string;
  username: string;
  role: string;
  gender?: string;
  image?: File | null;
  password?: string;
  password_confirmation?: string;
  is_male?: boolean | null;
  branch_id?: number; // Optional - kept for backward compatibility
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
  pagination?: Pagination; // optional if some responses don't have it
}

// Specific usage for accountants
export type AccountantResponse = ApiResponse<Accountant[]>;
