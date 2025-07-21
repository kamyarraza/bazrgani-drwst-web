export interface Notification {
  id: number;
  title: string;
  message: string;
  action?: string;
  created_at: Date;
  read?: boolean;
  user_id?: number;
  data?: any;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}
