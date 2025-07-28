export interface User {
  id: string;
  name: string;
}

export interface CashboxSession {
  cashbox_id: string;
  opened_by: User;
  opened_at: string;
  usd_opening_balance: number;
  iqd_opening_balance: number;
  closed_by: User | null;
  closed_at: string | null;
  usd_closing_balance: number;
  iqd_closing_balance: number;
  date: string;
}

export interface CashboxSessionInfo {
  opened_by: string;
  opened_at: string;
  usd_opening_balance: string;
  iqd_opening_balance: number;
  closed_by: string;
  closed_at: string;
  usd_closing_balance: string;
  iqd_closing_balance: number | null;
}

export interface CashboxTransaction {
  id: number;
  cashbox_id: string;
  cashbox_session_id: CashboxSessionInfo;
  description: string;
  tag: 'deposit' | 'withdraw';
  total_iqd: number;
  total_usd: number;
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface Cashbox {
  iqd_balance: number;
  usd_balance: number;
  is_opened: boolean;
  transactions?: CashboxTransaction[];
  sessions?: CashboxSession[];
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
