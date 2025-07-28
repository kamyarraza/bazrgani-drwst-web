export interface Cashbox {
  iqd_balance: number;
  usd_balance: number;
  is_opened: boolean;
}

export interface CashboxResponse {
  status: string;
  message: string;
  data: Cashbox;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
