export type OfferStatus = 'draft' | 'accepted' | 'rejected';

export interface OfferResponse {
  id: number;
  customer_id: Customer; // This is actually a Customer object in the response
  title: string;
  valid_until: string; // ISO date format
  note: string;
  discounted_rate: number;
  discounted_price: number; // Add discounted_price field
  total_price: number;
  status: OfferStatus;
  reference: string; // Add reference field
  items: OfferItem[];
  customer?: Customer; // Make optional since customer_id contains customer data
  created_by?: User; // Make optional
  created_at: string; // ISO datetime
  updated_at?: string; // Make optional
}

export interface OfferItem {
  id: number; // Add id field that exists in the actual data
  item_id?: number; // Make optional
  item_name: string;
  item_sku: string;
  description: string;
  unit_price: number;
  quantity: number;
  subtotal: number; // Add subtotal field from actual data
  price?: number; // Keep for compatibility
  discount_percentage?: number; // Make optional
  item?: { name: string }; // Make optional
}

export interface Customer {
  id: number;
  name: string;
  full_name?: string; // Add full_name field
  phone: string; // Add phone field
  email?: string; // Add email field
}

export interface User {
  id: number;
  name: string;
}

export interface OfferPost {
  customer_id: number;
  title: string;
  valid_until: string; // ISO date format
  note: string;
  discounted_rate: number;
  details: OfferPostDetail[];
}

export interface OfferPostDetail {
  item_id: number;
  item_type?: 'item' | 'blum_item' | 'blum_set'; // Add item type support
  item_name?: string; // Add item name for display
  item_code?: string; // Add code for blum items
  item_part_no?: string; // Add part number for blum items
  description: string;
  unit_price: number;
  quantity: number;
  set_items?: any[]; // For blum sets, store the items in the set
}
