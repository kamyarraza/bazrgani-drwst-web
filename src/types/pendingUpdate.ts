export interface PendingUpdateUser {
  id: string;
  name: string;
}

export interface PendingUpdateUpdatable {
  id: number;
  type: string;
}

export interface PendingUpdateChanges {
  [key: string]: string | number | boolean;
}

export interface PendingUpdate {
  id: number;
  user: PendingUpdateUser;
  updatable: PendingUpdateUpdatable;
  changes: PendingUpdateChanges;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  created_human: string;
}

export interface PendingUpdateResponse {
  status: string;
  message: string;
  data: PendingUpdate[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PendingUpdateDetailResponse {
  status: string;
  message: string;
  data: PendingUpdate;
}

export type ApproveUpdatePayload = Record<string, never>;

export interface RejectUpdatePayload {
  reason: string;
}
