// Type for adding a new item - only allowed fields
export interface AddItemPayload {
  sku: string;
  item_category_id: number | null;
  name: string;
  description: string | null;
  weight_kg: number | null;
  volume: number | null;
  packet_units: number | null;
  package_units: number | null;
  min_qty: number | null;
}

// Type for updating an item - same as AddItemPayload
export type UpdateItemPayload = AddItemPayload;

// Type for form data (used in reactive forms) - compatible with v-model
export interface ItemFormData {
  sku: string;
  item_category_id: number;
  name: string;
  description: string;
  weight_kg: number;
  volume: number;
  packet_units: number;
  package_units: number;
  min_qty: number;
  image?: string;
}


export interface Product {
  id: number;
  sku: string;
  category?: {
    id: number;
    name: string;
  };
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
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
