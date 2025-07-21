export interface Branch {
  code: string;
  name: string;
  location: string;
  phone: string;
  warehouses: number;
  users: number;
  is_active: boolean;
  created_at: string; // ISO date string
}

export interface Warehouse {
  code: string;
  name: string;
  branch: string; // Branch name or could be a branch code if normalized
  address: string;
  capacity: number;
  items: number;
  purchases: number;
  is_active: boolean;
  created_at: string; // ISO date string
}

export interface Category {
  no: number;
  name: string;
  items: number;
  is_active: boolean;
  created_at: string; // ISO date string
}

export interface Purchase {
  code: number;
  warehouse: string; // Warehouse name or code
  supplier: string;
  payment_type: 'cash' | 'credit'; // You can expand this if more types exist
  total_price: number;
  paid_price: number;
  created_at: string; // ISO date string
}

export interface Sell {
  code: number;
  warehouse: string; // Warehouse name or code
  supplier: string;
  payment_type: 'cash' | 'credit'; // You can expand this if more types exist
  total_price: number;
  paid_price: number;
  created_at: string; // ISO date string
}
