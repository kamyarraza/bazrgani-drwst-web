export interface Transaction  {
  customer_id: number;  //only suplier type customer id valid when purchase
  warehouse_id: number; // the customer is going to  select the warehouse of his branch that he is from
  payment_type: 'cash' | 'borrow' ; // Replace with exact types if needed
  /* when a employee buy an item from a customer of type suplier and not cash but,
   {{borrow}} the branch will owe the suplier $money */
  note: string;
  details: {
    item_id: number;
    quantity: number;
    unit_price: number;
    solo_unit_price: number; // For both purchase and sell transactions
    bulk_unit_price: number; // For both purchase and sell transactions
  }[];
};


export interface PurchaseResponse {

    id: number;
    type: string;
    warehouse: {
      id: number;
      name: string;
      code: string;
      capacity: number;
    };
    payment_type: string;
    items: {
      id: number;
      name: string;
      quantity: number;
      unit_price: number;
      solo_unit_price: number;
      bulk_unit_price: number;
    }[];
    total_price: number;
    paid_price: number;
    note: string;
    created_at: string;


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
export interface List {
  id: number;
  type: string;
  customer?: {
    id: number;
    name: string;
    type?: string;
    phone?: string;
    place?: string;
    fphone?: string;
    purchase_borrow?: number;
  };
  warehouse?: {
    id: number;
    name: string;
    code?: string;
    capacity?: number;
  };
  payment_type: string;
  items?: {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    solo_unit_price?: number;
    bulk_unit_price?: number;
  }[];
  discounted_rate?: number;
  total_price: number;
  discounted_price?: number;
  old_borrowed_price?: number;
  new_borrowed_price?: number;
  paid_price: number;
  unpaid_price: number;
  usd_iqd_rate: number;
  note: string;
  status?: string; // Status of the transaction (e.g., 'completed', 'reserved')
  is_editable?: boolean;
  created_at: string;
  refunded?: {
    id: number;
    items: {
      id: number;
      name: string;
      quantity: number;
      reason: string;
    }[];
    refund_price: number;
    usd_iqd_rate: number;
    created_at: string;
  };
}
export interface RefundTransaction {
  transaction_id: number;
  refund_price: number;
  usd_iqd_rate: number;
  reason: string;
  details: {
    item_id: number;
    quantity: number;
  }[];
}

