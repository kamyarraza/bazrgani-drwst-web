export interface AdminForm {
  id?: string;
  gender?: string;
  name: string;
  is_male?: boolean;
  role: string;
  phone: string;
  username: string;
  password: string;
  password_confirmation: string;
  sticky_notes?:[],
  image?: string;
  branch?: {
    id: number;
    name: string;
  };
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
  data: T | {
    data: T[];
    pagination: Pagination;
  };

}
