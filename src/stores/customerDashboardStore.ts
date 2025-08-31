import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { endPoints } from "src/endpoint";
import { showNotify } from "src/composables/Notify";

export interface CustomerDashboardData {
  last_transactions: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
    created_at: string;
  }>;
  last_activity_logs: Record<
    string,
    {
      title: string;
      ip_address: string;
      platform: string;
      browser: string;
      created_at: string;
    }
  >;
  // Additional fields that might be available from the API
  customer_info?: {
    name: string;
    phone: string;
    member_since: string;
  };
  stats?: {
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    loyalty_points: number;
  };
  recent_orders?: Array<{
    id: string;
    status: string;
    items_count: number;
    total_amount: number;
    created_at: string;
  }>;
  special_offers?: Array<{
    id: number;
    title: string;
    description: string;
    discount: number;
    valid_until: string;
  }>;
  notifications?: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    created_at: string;
  }>;
}

export interface CustomerDashboardResponse {
  status: string;
  message: string;
  data: CustomerDashboardData;
}

export const useCustomerDashboardStore = defineStore(
  "customerDashboard",
  () => {
    // State
    const dashboardData = ref<CustomerDashboardData | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const lastUpdated = ref<Date | null>(null);

    // Prevent overlapping fetches
    const isFetching = ref(false);

    // Computed getters
    const lastTransactions = computed(
      () => dashboardData.value?.last_transactions || []
    );
    const lastActivityLogs = computed(
      () => dashboardData.value?.last_activity_logs || {}
    );
    const customerInfo = computed(
      () => dashboardData.value?.customer_info || null
    );
    const stats = computed(() => dashboardData.value?.stats || null);
    const recentOrders = computed(
      () => dashboardData.value?.recent_orders || []
    );
    const specialOffers = computed(
      () => dashboardData.value?.special_offers || []
    );
    const notifications = computed(
      () => dashboardData.value?.notifications || []
    );

    // Computed arrays for easier iteration
    const activityLogsArray = computed(() => {
      return Object.entries(lastActivityLogs.value).map(([id, activity]) => ({
        id,
        ...activity,
      }));
    });

    // Actions
    async function fetchDashboard() {
      if (isFetching.value) return true; // avoid parallel calls
      isFetching.value = true;
      loading.value = true;
      error.value = null;

      try {
        const { data } = await api.get<CustomerDashboardResponse>(
          endPoints.home.dashboardForCustomer
        );

        if (data.status === "success") {
          dashboardData.value = data.data;
          lastUpdated.value = new Date();
          return true;
        } else {
          throw new Error(
            data.message || "Failed to fetch customer dashboard data"
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch customer dashboard data";
        error.value = errorMessage;

        showNotify({
          type: "negative",
          message: error.value,
          position: "top",
          duration: 3000,
        });
        console.error("Customer dashboard fetch error:", err);
        return false;
      } finally {
        loading.value = false;
        isFetching.value = false;
      }
    }

    async function refreshDashboard() {
      return await fetchDashboard();
    }

    // Auto-refresh functionality
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    function startAutoRefresh(intervalMinutes: number = 5) {
      stopAutoRefresh();
      const ms = Math.max(1, intervalMinutes) * 60 * 1000;
      refreshInterval = setInterval(() => {
        void fetchDashboard();
      }, ms);
    }

    function stopAutoRefresh() {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }

    return {
      // State
      dashboardData,
      loading,
      error,
      lastUpdated,

      // Computed
      lastTransactions,
      lastActivityLogs,
      customerInfo,
      stats,
      recentOrders,
      specialOffers,
      notifications,
      activityLogsArray,

      // Actions
      fetchDashboard,
      refreshDashboard,
      startAutoRefresh,
      stopAutoRefresh,

      // Internal flags
      isFetching,
    };
  }
);
