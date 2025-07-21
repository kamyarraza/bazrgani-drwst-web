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

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  pagination?: Pagination;
}
