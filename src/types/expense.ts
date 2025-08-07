// Expense-related TypeScript interfaces and types
export interface ExpenseCategory {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id?: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  title: string;
  description?: string;
  expensed_usd?: number;
  expensed_iqd?: number;
  iqd_return_amount?: number;
  usd_return_amount?: number;
  payee: string;
  paid_at: string;
  payment_method: string;
  reference_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpensePagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ExpenseApiResponse<T> {
  status: "success" | "error";
  message: string;
  data:
    | T
    | {
        data: T[];
        pagination: ExpensePagination;
      };
}
