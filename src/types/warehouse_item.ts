// Interface for warehouse item (from API)
export interface WarehouseItem {
  id: number;
  name: string;
  unit_cost: string;
  solo_unit_price: string;
  bulk_unit_price: string;
  packets?: number | null;
  packages?: number | null;
  pieces: number;
  quantity: number;
  reservations: number;
  volume?: string;
  created_at?: string;
}

// Interface for blum item (from API) - Complete definition
export interface BlumItem {
  id: number;
  code: string;
  part_no: string;
  name: string;
  unit_cost: string;
  unit_price: string;
  quantity: number;
  position?: string | null;
  // Additional fields from the original type
  image?: string;
  created_at?: string;
  created_at_humans?: string;
  updated_at?: string;
}

// Union type for both item types
export type AnyItem = WarehouseItem | BlumItem;

// Interface for warehouse with items (actual API response)
export interface WarehouseWithItems {
  id: number;
  name: string;
  code: string | null;
  address: string;
  capacity: number;
  is_active: boolean;
  items?: WarehouseItem[];
  blum_items?: BlumItem[];
  blum_sets?: any[]; // Add blum_sets support
}

// Re-export existing types
export * from './warehouse';
