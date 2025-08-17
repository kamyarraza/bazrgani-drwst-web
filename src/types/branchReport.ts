export interface BranchReportItem {
  item_id: number;
  name: string;
  unit_cost: number;
  solo_unit_price: number;
  bulk_unit_price: number;
  packet_units: number;
  package_units: number;
  total_quantity: string;
  total_reservations: string;
}

export interface BranchReportSummary {
  total_items: number;
  total_quantity: number;
  total_value: number;
  total_reservations: number;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
