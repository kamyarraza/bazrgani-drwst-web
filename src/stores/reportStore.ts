import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import type {
  Branch,
  Warehouse,
  Category,
  Purchase,
  Sell,
  Product,
  TopSoldItem
} from 'src/types/report';
import type { ApiResponse } from 'src/types';
import { showNotify } from 'src/composables/Notify';

export const useReportStore = defineStore('report', () => {
  // State
  const branches = ref<Branch[]>([]);
  const warehouses = ref<Warehouse[]>([]);
  const categories = ref<Category[]>([]);
  const purchases = ref<Purchase[]>([]);
  const sells = ref<Sell[]>([]);
  const topSoldItems = ref<TopSoldItem[]>([]);

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const totalItemsQuantity = computed(() => branches.value?.reduce((sum, b) => sum + (b.total_items_quantity || 0), 0) || 0);
  const totalItemsCost = computed(() => branches.value?.reduce((sum, b) => sum + (b.total_items_cost || 0), 0) || 0);
  const totalPurchaseBorrow = computed(() => branches.value?.reduce((sum, b) => sum + (b.purchase_borrow || 0), 0) || 0);
  const totalWarehouses = computed(() => warehouses.value?.length || 0);
  const activeWarehouses = computed(() => warehouses.value?.filter(w => w.is_active).length || 0);
  const totalCategories = computed(() => categories.value?.length || 0);
  const totalSellBorrow = computed(() => branches.value?.reduce((sum, b) => sum + (b.sell_borrow || 0), 0) || 0);

  // Purchase statistics
  const totalPurchases = computed(() => purchases.value?.length || 0);
  const totalPurchaseAmount = computed(() =>
    purchases.value?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0
  );
  const totalPaidAmount = computed(() =>
    purchases.value?.reduce((sum, p) => sum + (p.paid_price || 0), 0) || 0
  );
  const outstandingAmount = computed(() =>
    totalPurchaseAmount.value - totalPaidAmount.value
  );

  // Sell statistics
  const totalSells = computed(() => sells.value?.length || 0);
  const totalSellAmount = computed(() =>
    sells.value?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0
  );
  const totalSellPaid = computed(() =>
    sells.value?.reduce((sum, s) => sum + (s.paid_price || 0), 0) || 0
  );
  const sellsOutstanding = computed(() =>
    totalSellAmount.value - totalSellPaid.value
  );

  // Actions
  const fetchBranches = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Branch[]>>(endPoints.report.branches);

      branches.value = data as unknown as Branch[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branches';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchWarehouses = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Warehouse[]>>(endPoints.report.warehouses);
      warehouses.value = data as unknown as Warehouse[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch warehouses';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Category[]>>(endPoints.report.itemCategories);
      categories.value = data as unknown as Category[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      error.value = errorMessage;
      console.error("Error fetching categories:", errorMessage);
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchPurchases = async (filters?: { fromDate?: string | undefined; toDate?: string | undefined }) => {
    loading.value = true;
    error.value = null;

    try {
      let url = endPoints.report.purchases;
      const params = new URLSearchParams();

      if (filters?.fromDate) {
        params.append('from_date', filters.fromDate);
      }
      if (filters?.toDate) {
        params.append('to_date', filters.toDate);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const { data } = await api.get<ApiResponse<Purchase[]>>(url);
      purchases.value = data as unknown as Purchase[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch purchases';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchSells = async (filters?: { fromDate?: string | undefined; toDate?: string | undefined }) => {
    loading.value = true;
    error.value = null;

    try {
      let url = endPoints.report.sells;
      const params = new URLSearchParams();

      if (filters?.fromDate) {
        params.append('from_date', filters.fromDate);
      }
      if (filters?.toDate) {
        params.append('to_date', filters.toDate);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const { data } = await api.get<ApiResponse<Sell[]>>(url);
      sells.value = data as unknown as Sell[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sells';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchAllReports = async () => {
    await Promise.all([
      fetchBranches(),
      fetchWarehouses(),
      fetchCategories(),
      fetchPurchases(),
      fetchSells()
    ]);
  };

  const clearData = () => {
    branches.value = [];
    warehouses.value = [];
    categories.value = [];
    purchases.value = [];
    sells.value = [];
    error.value = null;
  };

  async function fetchTopSoldItems(
    categoryId?: number | null,
    itemCount: number = 3,
    excludeKeywords: string = ''
  ) {
    loading.value = true;
    error.value = null;
    let url = `${endPoints.report.topSold}`;
    const params = new URLSearchParams();

    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }

    params.append('item_count', itemCount.toString());

    if (excludeKeywords.length > 0) {
      params.append('exclude_keywords', excludeKeywords);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const { data } = await api.get<ApiResponse<Product[]>>(url);

      topSoldItems.value = data.data as any;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch items";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    branches,
    warehouses,
    categories,
    purchases,
    sells,
    loading,
    topSoldItems,
    error,

    // Computed
    totalItemsCost,
    totalItemsQuantity,
    totalPurchaseBorrow,
    totalWarehouses,
    activeWarehouses,
    totalCategories,
    totalSellBorrow,
    totalPurchases,
    totalPurchaseAmount,
    totalPaidAmount,
    outstandingAmount,
    totalSells,
    totalSellAmount,
    totalSellPaid,
    sellsOutstanding,

    // Actions
    fetchBranches,
    fetchWarehouses,
    fetchCategories,
    fetchPurchases,
    fetchSells,
    fetchAllReports,
    clearData,
    fetchTopSoldItems,
  };
});
