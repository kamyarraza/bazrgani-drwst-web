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
  items_cost: number;
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

export interface Product {
  id: number;
  sku: string;
  category?: {
    id: number;
    name: string;
  };
  quantity?: number;
  name: string;
  description: string;
  weight_kg: number;
  volume: number;
  item_category_id: string; // Make this required for backend compatibility
  unit_cost: number;
  profit_margin: number | null;
  solo_unit_price: number;
  bulk_unit_price: number;
  min_qty: number | null;
  // Backend returns these field names (different from what we send)
  packets: number;
  packages: number;
  image?: string;
  pieces: number;
  total_quantity: number;
  // These are the fields we send to backend
  packet_units?: number;
  package_units?: number;
  packet_cost?: number;
  packet_solo_price?: number;
  packet_bulk_price?: number;
  package_cost?: number;
  package_solo_price?: number;
  package_bulk_price?: number;
  can_edit: boolean;
  created_at: string; // ISO date string
  created_at_humans: string;
  "": string[]; // This is an unusual key. If it's an error or unused, you may remove it.
}

export interface TopSoldItem {
  id: number;
  name: string;
  sku: string;
  total_sold_quantity: number;
}
