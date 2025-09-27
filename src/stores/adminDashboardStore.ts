import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export interface AdminDashboardData {
  users_count: {
    admins: number;
    accountants: number;
    employees: number;
    customers: number;
    suppliers: number;
    all: number;
  };
  online_users: Record<string, {
    image: string;
    name: string;
    type: string;
    is_online: boolean;
    last_activity_at: {
      datetime: string;
      humans: string;
    };
  }>;
  branches: Record<string, {
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
  }>;
  last_expenses: Record<string, {
    branch: string;
    category: string;
    title: string;
    total_usd: number;
    total_iqd: number;
    paid_at: string;
  }>;
  categories_items_count: Record<string, number>;
  last_purchases: Record<string, {
    branch: string;
    payment_type: string;
    items: number;
    total_usd: string;
    created_at: string;
  }>;
  last_sells: Record<string, {
    branch: string;
    payment_type: string;
    items: number;
    total_usd: string | number;
    created_at: string;
  }>;
  last_activity_logs: Record<string, {
    id: number;
    title: string;
    platform: string;
    user: string;
    browser: string;
    created_humans: string;
    created_at: string;
  }>;
}

export interface AdminDashboardResponse {
  status: string;
  message: string;
  data: AdminDashboardData;
}

export const useAdminDashboardStore = defineStore('dashboard', () => {
  // State
  const dashboardData = ref<AdminDashboardData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // Prevent overlapping fetches
  const isFetching = ref(false);

  // Computed getters for easy access to specific dashboard sections
  const counters = computed(() => dashboardData.value?.users_count || null);
  const online_users = computed(() => dashboardData.value?.online_users || {});
  const branches = computed(() => dashboardData.value?.branches || {});
  const activityLogs = computed(() => dashboardData.value?.last_activity_logs || {});

  const onlineUsersArray = computed(() => {
    if (!online_users.value) return [] as Array<any>;

    return Object.entries(online_users.value).map(([id, user]) => ({
      id,
      name: user.name,
      type: user.type,
      image: user.image,
      // is_online: user.is_online,
      last_activity_at: user.last_activity_at,
    }));
  });

  // Computed for formatted exchange rates (for charts)
  // const exchangeRatesArray = computed(() => {
  //   if (!exchangeRates.value) return [] as Array<{ date: string; rate: number; label: string; value: number }>;

  //   return Object.entries(exchangeRates.value)
  //     .map(([date, rate]) => ({
  //       date,
  //       rate: Number(rate as unknown as number),
  //       label: formatDateForChart(date),
  //       value: Number(rate as unknown as number)
  //     }))
  //     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // });

  // Computed for branches array (for top performers)
  const branchesArray = computed(() => {
    if (!branches.value) return [] as Array<any>;

    return Object.entries(branches.value).map(([name, branchData]: [string, any]) => ({
      id: branchData.id,
      name,
      code: branchData.code,
      users: branchData.users,
      warehouses: branchData.warehouses,
      capacity: branchData.capacity,
      items_count: branchData.items_count,
      items_quantity: branchData.items_quantity,
      items_cost: branchData.items_cost,
      cashbox: branchData.cashbox,
      performance: (
        (branchData.items_cost / Math.max(branchData.capacity, 1)) * 0.35 + // Revenue efficiency
        (branchData.items_quantity / Math.max(branchData.capacity, 1)) * 0.25 + // Inventory utilization
        (
          (
            (branchData.cashbox?.iqd_balance || 0) +
            (parseFloat(branchData.cashbox?.usd_balance || '0') * 1320)
          ) / 1_000_000
        ) * 0.20 + // Cash flow score
        (branchData.items_count / Math.max(branchData.warehouses, 1)) * 0.15 + // Warehouse efficiency
        ((branchData.users > 0 ? 1 : 0) * 0.05) // Active branch bonus
      )
    })).sort((a, b) => b.performance - a.performance);
  });

  // Computed for activity logs array (for recent activities)
  const activityLogsArray = computed(() => {
    if (!activityLogs.value) return [] as Array<any>;

    return Object.entries(activityLogs.value).map(([_id, log]: [string, any]) => ({
      id: log.id,
      title: log.title,
      platform: log.platform,
      user: log.user,
      created_humans: log.created_humans,
      browser: log.browser,
      created_at: log.created_at,
    })).sort((a, b) => b.id - a.id);
  });

  // Computed for users breakdown
  const usersBreakdown = computed(() => {
    if (!counters.value) return [] as Array<any>;

    return [
      { type: 'accountants', count: counters.value.accountants, icon: 'account_balance', color: 'primary' },
      { type: 'admins', count: counters.value.admins, icon: 'admin_panel_settings', color: 'secondary' },
      { type: 'customers', count: counters.value.customers, icon: 'people', color: 'accent' },
      { type: 'suppliers', count: counters.value.suppliers, icon: 'local_shipping', color: 'warning' },
      { type: 'employees', count: counters.value.employees, icon: 'badge', color: 'positive' },
      { type: 'all', count: counters.value.all, icon: 'groups', color: 'info' }
    ];
  });

  // Actions
  async function fetchDashboard() {
    if (isFetching.value) return true; // avoid parallel calls
    isFetching.value = true;
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<AdminDashboardResponse>(endPoints.home.dashboardForAdmin);

      if (data.status === 'success') {
        dashboardData.value = data.data;
        lastUpdated.value = new Date();
        return true;
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      error.value = errorMessage;

      showNotify({ type: 'negative', message: error.value, position: 'top', duration: 3000 });
      console.error('Dashboard fetch error:', err);
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

  function startAutoRefresh(intervalMinutes: number = 1) {
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
    counters,
    branches,
    // prices,
    // exchangeRates,
    activityLogs,
    // exchangeRatesArray,
    branchesArray,
    activityLogsArray,
    usersBreakdown,
    onlineUsersArray,

    // Actions
    fetchDashboard,
    refreshDashboard,
    startAutoRefresh,
    stopAutoRefresh,

    // Internal flags (optional for debugging)
    isFetching
  };
});
