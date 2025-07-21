// Category Payloads & Responses

// ✅ Activate/Deactivate Category
export interface ToggleCategoryStatusPayload {
  id: number;
  is_active: boolean;
}

// ✅ Create or Update Category
export interface UpdateCategoryPayload {
  name: string;
  description: string;
}

// ✅ Create Category can reuse Update payload
export type CreateCategoryPayload = UpdateCategoryPayload;

// ✅ Full Category Response
export interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;         // e.g., "2023-10-01T12:00:00Z"
  created_at_humans: string;  // e.g., "منذ 14 ثانية"
}

// ✅ List of Categories
export type CategoryList = Category[];

// ✅ Optional: Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}
