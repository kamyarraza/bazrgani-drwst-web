import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { BranchReportItem, BranchReportSummary, Pagination } from 'src/types/branchReport';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useBranchReportStore = defineStore('branchReport', () => {
  const reportItems = ref<BranchReportItem[]>([]);
  const summary = ref<BranchReportSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchBranchReport(
    branchId: number, 
    page: number = 1, 
    query?: string, 
    categoryId?: number
  ) {
    loading.value = true;
    error.value = null;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    params.append('paginate', 'true');
    if (query && query.trim()) params.append('query', query.trim());
    if (categoryId) params.append('category_id', categoryId.toString());

    try {
      const { data, headers } = await api.get<ApiResponse<BranchReportItem[]>>(
        `${endPoints.branch.report(branchId)}?${params.toString()}`
      );

      // Check if data exists and has items
      if (data && data.data && Array.isArray(data.data)) {
        reportItems.value = data.data;
        pagination.value = data.pagination || null;
        
        // If no items returned, clear the summary
        if (data.data.length === 0) {
          summary.value = null;
        } else {
          calculateSummary(headers);
        }
      } else {
        // Clear existing data if response is invalid
        reportItems.value = [];
        summary.value = null;
        pagination.value = null;
      }

    } catch (err: unknown) {
      // Clear existing data when endpoint fails
      reportItems.value = [];
      summary.value = null;
      pagination.value = null;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branch report';
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
  }

  function calculateSummary(headers: any) {
    if (!reportItems.value.length) {
      summary.value = null;
      return;
    }

    const totalItems = pagination.value?.total || reportItems.value.length;
    // const totalQuantity = reportItems.value.reduce((sum, item) => sum + parseInt(item.total_quantity || '0'), 0);
    const totalQuantity = headers['x-total-quantity'] || 0;
    const totalReservations = reportItems.value.reduce((sum, item) => sum + parseInt(item.total_reservations || '0'), 0);
    // const totalValue = reportItems.value.reduce((sum, item) => {
    //   const quantity = parseInt(item.total_quantity || '0');
    //   return sum + (quantity * item.unit_cost);
    // }, 0);
    const totalValue = headers['x-total-cost'] || 0;

    summary.value = {
      total_items: totalItems,
      total_quantity: totalQuantity,
      total_value: totalValue,
      total_reservations: totalReservations,
    };
  }

  function clearReport() {
    reportItems.value = [];
    summary.value = null;
    pagination.value = null;
    error.value = null;
  }

  return {
    reportItems,
    summary,
    loading,
    error,
    pagination,
    fetchBranchReport,
    clearReport,
  };
});
