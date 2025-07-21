export interface Customer {
  id: number;
  fname: string;
  password?:string,
  sname: string;
  type: 'supplier' | 'customer';
  location: {
    id: number;
    name: string;
  };
  place: string;
  fphone: string;
  sphone: string;
  note?: string;
  user: {
    id: string;
    name: string;
    username: string;
    phone: string;
  };
  created_at: string; // ISO date string
}
export interface CustomerPayload {
  fname: string;
  sname: string;
  type: 'supplier' | 'customer';
  location_id: number;
  place: string;
  fphone: string;
  sphone: string;
  note?: string;
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
