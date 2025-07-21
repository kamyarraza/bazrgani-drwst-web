// For the first object
export interface BasicExchangeRate {
  usd_iqd_rate: number;
  eur_usd_rate: number;
  source: string;
  note: string;
}
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;

}

// For the second object
export interface DetailedExchangeRate {
  id: number;
  usd_iqd_rate: number;
  eur_usd_rate: number;
  source: string;
  note: string;
  created_by: string;
  created_at: string;
}
