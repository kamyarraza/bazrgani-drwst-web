export interface Warehouse {
  id: number;
  branch_id: number;
  name: string;
  code: string;
  address: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  unknown_property: string[]; // Replace 'unknown_property' with the actual key name
}
export interface WarehouseCreate {
  branch_id: number,
  name: string,
  code: string,
  address: string,
  capacity: number
}
export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  phone: string;
}

export interface BranchWithWarehouses {
  branch: Branch;
  warehouses: Warehouse[];
}

export interface StockMovement {
  item_id: number;
  warehouse_id: number;
  quantity_change: number;
  old_quantity: number;
  new_quantity: number;
  reason: string;
  user_id: number;
  item?: {
    id: number;
    sku: string;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: Pagination;
}
