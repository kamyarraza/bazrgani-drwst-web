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

  async function fetchBranchReport(branchId: number, page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? `page=${page}` : '';

    try {
      const { data } = await api.get<ApiResponse<BranchReportItem[]>>(
        `${endPoints.branch.report(branchId)}?${parameter}&paginate=true`
      );
      
      // Check if data exists and has items
      if (data && data.data && Array.isArray(data.data)) {
        reportItems.value = data.data;
        pagination.value = data.pagination || null;
        
        // If no items returned, clear the summary
        if (data.data.length === 0) {
          summary.value = null;
        } else {
          calculateSummary();
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

  async function searchBranchReport(branchId: number, searchQuery: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<BranchReportItem[]>>(
        `${endPoints.branch.report(branchId)}?query=${encodeURIComponent(searchQuery)}`
      );
      
      // Check if data exists and has items
      if (data && data.data && Array.isArray(data.data)) {
        reportItems.value = data.data;
        
        // If no items returned, clear the summary
        if (data.data.length === 0) {
          summary.value = null;
        } else {
          calculateSummary();
        }
      } else {
        // Clear existing data if response is invalid
        reportItems.value = [];
        summary.value = null;
      }

    } catch (err: unknown) {
      // Clear existing data when endpoint fails
      reportItems.value = [];
      summary.value = null;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to search branch report';
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

  function calculateSummary() {
    if (!reportItems.value.length) {
      summary.value = null;
      return;
    }

    const totalItems = reportItems.value.length;
    const totalQuantity = reportItems.value.reduce((sum, item) => sum + parseInt(item.total_quantity || '0'), 0);
    const totalReservations = reportItems.value.reduce((sum, item) => sum + parseInt(item.total_reservations || '0'), 0);
    const totalValue = reportItems.value.reduce((sum, item) => {
      const quantity = parseInt(item.total_quantity || '0');
      return sum + (quantity * item.unit_cost);
    }, 0);

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
    searchBranchReport,
    clearReport,
  };
});
