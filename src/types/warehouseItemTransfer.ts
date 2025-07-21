 export interface TransferDetail {
  item_id: number;
  quantity: number;
}

export interface WarehouseTransfer_request_post {
  from_warehouse_id: number;
  to_warehouse_id: number;
  note: string;
  details: TransferDetail[];
}

export interface TransferRequest {
  id: number;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  note: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at: string;
  updated_at?: string;
  // New API structure
  source: {
    id: number;
    name: string;
  };
  target: {
    id: number;
    name: string;
  };
  // Legacy structure (for backward compatibility)
  fromWarehouse?: {
    id: number;
    name: string;
  };
  toWarehouse?: {
    id: number;
    name: string;
  };
  details?: Array<{
    id: number;
    item_id: number;
    quantity: number;
    item: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message: string;
  data: any; // not clear what data i get exactly for now we let it like this in future we update it
  pagination?: Pagination;
}
