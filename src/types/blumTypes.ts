// ========== ITEM ==========

export interface BlumItem {
  id: number;
  code: string;
  part_no: string;
  name: string;
  image: string;
  created_at: string;
  created_at_humans: string;
  updated_at: string;
}

export interface CreateOrUpdateBlumItem {
  code: string;
  part_no: string;
  name: string;
  image: string;
}

// ========== SET ==========

export interface BlumSetItem {
  item_id: number;
  id?:number;
  name: string;
  code?: string;
  part_no?: string;
  quantity: number;
}

export interface BlumSet {
  id: number;
  item_id?:number;
  name: string;
  description: string;
  image: string;
  items: BlumSetItem[];
  created_at: string;
  created_at_humans: string;
  updated_at: string;
}

export interface CreateOrUpdateBlumSet {
  name: string;
  description: string;
  image: string;
  items: BlumSetItem[];
}

// ========== TRANSACTIONS ==========

export interface PurchaseTransactionDetail {
  item_id: number;
  quantity: number;
  unit_price: number;
  solo_unit_price: number;
}

export interface PurchaseTransaction {
  customer_id: number;
  warehouse_id: number;
  branch_id: number;
  payment_type: string;
  note: string;
  details: PurchaseTransactionDetail[];
}

export interface SellTransactionDetail {
  item_id: number;
  set_id?: number; // optional, since it's not always used
  quantity: number;
  unit_price: number;
}

export interface SellTransaction {
  customer_id: number;
  warehouse_id: number;
  branch_id: number;
  payment_type: string;
  discounted_rate: number;
  note: string;
  details: SellTransactionDetail[];
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
export interface ListTransactionType {
  id: number;
  type: string;
  customer_id: number;
  warehouse_id: number;
  payment_type: string;
  discounted_rate: number;
  total_price: number;
  paid_price: number;
  unpaid_price: number;
  note: string;
  remaining_balance: number;
  is_fully_paid: boolean;
  created_at: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
  }[];
  customer: {
    id: number;
    name: string;
    fphone: string;
    sphone: string | null;
  };
  warehouse: {
    id: number;
    branch_id: number;
    name: string;
    code: string;
    address: string;
    capacity: number;
    is_active: boolean;
    created_at: string;
  };

}
