export interface Customer {
  id: number;
  name?: string; // Full name combination from API
  fname: string;
  password?: string;
  sname: string;
  type: string;
  type_value: 'supplier' | 'customer';
  location: {
    id: number;
    name: string;
  } | null;
  place: string;
  fphone: string;
  sphone?: string; // Secondary phone (optional)
  note?: string; // Customer notes
  hasAccount?: boolean; // Whether customer has user account
  user?: {
    id: string;
    name: string;
    username: string;
    phone: string;
  };
  created_at: string; // ISO date string
  sell_borrow?: number; // Amount owed to supplier
  purchase_borrow?: number; // Amount customer owes us
  has_borrowed_price?: number | boolean; // Flag indicating if customer has ever borrowed
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
