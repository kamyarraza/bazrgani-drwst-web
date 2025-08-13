import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { DashboardResponse, DashboardData } from 'src/types/dashboard';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const dashboardData = ref<DashboardData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // Prevent overlapping fetches
  const isFetching = ref(false);

  // Computed getters for easy access to specific dashboard sections
  const counters = computed(() => dashboardData.value?.counters || null);
  const branches = computed(() => dashboardData.value?.branches || {});
  const prices = computed(() => dashboardData.value?.prices || null);
  const exchangeRates = computed(() => dashboardData.value?.exchange_rates || {});
  const activityLogs = computed(() => dashboardData.value?.activity_logs || {});

  // Computed for formatted exchange rates (for charts)
  const exchangeRatesArray = computed(() => {
    if (!exchangeRates.value) return [] as Array<{ date: string; rate: number; label: string; value: number }>;

    return Object.entries(exchangeRates.value)
      .map(([date, rate]) => ({
        date,
        rate: Number(rate as unknown as number),
        label: formatDateForChart(date),
        value: Number(rate as unknown as number)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Computed for branches array (for top performers)
  const branchesArray = computed(() => {
    if (!branches.value) return [] as Array<any>;

    return Object.entries(branches.value).map(([name, branchData]: [string, any]) => ({
      id: branchData.id,
      name,
      capacity: branchData.capacity,
      warehouses: branchData.warehouses,
      users: branchData.users,
      performance: (branchData.capacity * 0.4) + (branchData.warehouses * 0.3) + (branchData.users * 0.3)
    })).sort((a, b) => b.performance - a.performance);
  });

  // Computed for activity logs array (for recent activities)
  const activityLogsArray = computed(() => {
    if (!activityLogs.value) return [] as Array<any>;

    return Object.entries(activityLogs.value).map(([id, log]: [string, any]) => ({
      id,
      title: log.title,
      user: log.user,
      datetime: log.created_at.datetime,
      humanTime: log.created_at.humans,
      description: `Action performed by ${log.user}`
    })).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  });

  // Computed for users breakdown
  const usersBreakdown = computed(() => {
    if (!counters.value) return [] as Array<any>;

    const userCounts = counters.value.users;

    return [
      { type: 'accountants', count: userCounts.accountants, icon: 'account_balance', color: 'primary' },
      { type: 'admins', count: userCounts.admins, icon: 'admin_panel_settings', color: 'secondary' },
      { type: 'customers', count: userCounts.customers, icon: 'person', color: 'accent' },
      { type: 'employees', count: userCounts.employees, icon: 'work', color: 'positive' }
    ];
  });

  // Actions
  async function fetchDashboard() {
    if (isFetching.value) return true; // avoid parallel calls
    isFetching.value = true;
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<DashboardResponse>(endPoints.home.dashboard);

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

  // Helper functions
  function formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toLocaleString()}`;
  }

  function formatDateForChart(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function calculateTrend(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
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
    prices,
    exchangeRates,
    activityLogs,
    exchangeRatesArray,
    branchesArray,
    activityLogsArray,
    usersBreakdown,

    // Actions
    fetchDashboard,
    refreshDashboard,
    startAutoRefresh,
    stopAutoRefresh,

    // Internal flags (optional for debugging)
    isFetching
  };
});
