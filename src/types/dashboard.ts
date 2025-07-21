// Root API response interface
export interface DashboardResponse {
  status: string; // "success" or "error"
  message: string; // Info message, e.g., "Dashboard data retrieved successfully."
  data: DashboardData; // The main dashboard data
}

// Main data object containing all sections of the dashboard
export interface DashboardData {
  counters: DashboardCounters; // Summary counters of users, items, transactions
  branches: Record<string, Branch>;
  // Note: keys are branch names like "Lakin Ltd", each value is a Branch object

  prices: PriceSummary; // Purchase/sell price summary
  exchange_rates: Record<string, number>;
  // Note: keys are dates (e.g., "2025-05-30"), values are exchange rates

  activity_logs: Record<string, ActivityLog>;
  // Note: keys are log IDs as string, each value is an ActivityLog object
}

// User, item, and transaction counters
export interface DashboardCounters {
  users: {
    admins: number;
    accountants: number;
    employees: number;
    customers: number;
  };

  items: Record<string, number>;
  // Note: keys are item/category names like "veniam", "alias", "NEW", etc.

  transactions: {
    purchases: {
      cash: number;
      borrow: number;
    };
    sells: {
      cash: number;
      borrow: number;
    };
  };
}

// Branch details for each branch name
export interface Branch {
  id: number;
  capacity: number;
  warehouses: number;
  users: number;
}

// Pricing summary for purchased/sold and borrowed items
export interface PriceSummary {
  totals: {
    purchased: number;
    sold: number;
  };
  borrows: {
    supplier: number;
    customer: number;
  };
}

// Activity logs showing actions like Authentication
export interface ActivityLog {
  title: string; // Action type, e.g., "Authentication"
  user: string;  // User who performed the action
  created_at: {
    datetime: string; // Full datetime string, e.g., "2025-05-31 22:48:23"
    humans: string;   // Human-readable format, e.g., "12 hours ago"
  };
}
