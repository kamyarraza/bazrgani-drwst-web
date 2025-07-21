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

export interface AuthUser {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  image: string | null;
  type: string;
  username: string;
  phone: string;
}


export interface AuthData {
  user: AuthUser;
  token: string;
}


// menu
export interface MenuItem {
    label: string;
    icon: string;
    value: string;
}

export interface Column {
  name: string;
  label: string;
  align: 'left' | 'right' | 'center';
  field: string | ((_row: Record<string, unknown>) => unknown);
  sortable: boolean;
  format?: (_value: unknown, _row: Record<string, unknown>) => string;
}

