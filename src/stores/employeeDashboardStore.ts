import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { endPoints } from "src/endpoint";
import { showNotify } from "src/composables/Notify";

export interface EmployeeDashboardData {
  branch: {
    id: number;
    name: string;
    code: string;
    users: number;
    warehouses: number;
    capacity: number;
    items_count: number;
    items_quantity: number;
    items_cost: number;
    cashbox: {
      iqd_balance: number;
      usd_balance: string;
    };
  };
  last_expenses: Record<
    string,
    {
      category: string;
      title: string;
      total_usd: number;
      total_iqd: number;
      paid_at: string;
    }
  >;
  last_purchases: Record<
    string,
    {
      branch: string;
      payment_type: string;
      items: number;
      total_usd: string;
      created_at: string;
    }
  >;
  last_sells: Record<
    string,
    {
      branch: string;
      payment_type: string;
      items: number;
      total_usd: string;
      created_at: string;
    }
  >;
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
}

export interface EmployeeDashboardResponse {
  status: string;
  message: string;
  data: EmployeeDashboardData;
}

export const useEmployeeDashboardStore = defineStore(
  "employeeDashboard",
  () => {
    // State
    const dashboardData = ref<EmployeeDashboardData | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const lastUpdated = ref<Date | null>(null);

    // Prevent overlapping fetches
    const isFetching = ref(false);

    // Computed getters
    const branch = computed(() => dashboardData.value?.branch || null);
    const lastExpenses = computed(
      () => dashboardData.value?.last_expenses || {}
    );
    const lastPurchases = computed(
      () => dashboardData.value?.last_purchases || {}
    );
    const lastSells = computed(() => dashboardData.value?.last_sells || {});
    const lastActivityLogs = computed(
      () => dashboardData.value?.last_activity_logs || {}
    );

    // Computed arrays for easier iteration
    const expensesArray = computed(() => {
      return Object.entries(lastExpenses.value).map(([id, expense]) => ({
        id,
        ...expense,
      }));
    });

    const purchasesArray = computed(() => {
      return Object.entries(lastPurchases.value).map(([id, purchase]) => ({
        id,
        ...purchase,
      }));
    });

    const sellsArray = computed(() => {
      return Object.entries(lastSells.value).map(([id, sell]) => ({
        id,
        ...sell,
      }));
    });

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
        const { data } = await api.get<EmployeeDashboardResponse>(
          endPoints.home.dashboardForEmployee
        );

        if (data.status === "success") {
          dashboardData.value = data.data;
          lastUpdated.value = new Date();
          return true;
        } else {
          throw new Error(
            data.message || "Failed to fetch employee dashboard data"
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch employee dashboard data";
        error.value = errorMessage;

        showNotify({
          type: "negative",
          message: error.value,
          position: "top",
          duration: 3000,
        });
        console.error("Employee dashboard fetch error:", err);
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
      branch,
      lastExpenses,
      lastPurchases,
      lastSells,
      lastActivityLogs,
      expensesArray,
      purchasesArray,
      sellsArray,
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
