import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { 
  PendingUpdate, 
  PendingUpdateResponse, 
  PendingUpdateDetailResponse,
  RejectUpdatePayload,
  ApproveUpdatePayload
} from 'src/types/pendingUpdate';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const usePendingUpdateStore = defineStore('pendingUpdate', () => {
  // State
  const pendingUpdates = ref<PendingUpdate[]>([]);
  const currentPendingUpdate = ref<PendingUpdate | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const currentFilters = ref<{ pending?: boolean; approved?: boolean; rejected?: boolean }>({});

  // Actions
  async function fetchPendingUpdates(page: number = 1, filters: { pending?: boolean; approved?: boolean; rejected?: boolean } = {}) {
    loading.value = true;
    error.value = null;

    try {
      // Store current filters for refresh functionality
      currentFilters.value = { ...filters };
      
      const params = new URLSearchParams({ page: page.toString() });
      
      // Add status filters if provided
      if (filters.pending) params.append('pending', 'true');
      if (filters.approved) params.append('approved', 'true');
      if (filters.rejected) params.append('rejected', 'true');

      const url = `${endPoints.pendingUpdate.list}?${params.toString()}`;
      const { data } = await api.get<PendingUpdateResponse>(url);

      if (data.status === 'success') {
        pendingUpdates.value = data.data;
        pagination.value = data.pagination || null;
        return true;
      } else {
        throw new Error(data.message || 'Failed to fetch pending updates');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending updates';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPendingUpdateDetails(pendingUpdateId: string | number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<PendingUpdateDetailResponse>(
        endPoints.pendingUpdate.details(pendingUpdateId)
      );

      if (data.status === 'success') {
        currentPendingUpdate.value = data.data;
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch pending update details');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending update details';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function approvePendingUpdate(pendingUpdateId: string | number) {
    loading.value = true;
    error.value = null;

    try {
      const payload: ApproveUpdatePayload = {};
      const { data } = await api.patch<ApiResponse<null>>(
        endPoints.pendingUpdate.approve(pendingUpdateId),
        payload
      );

      // Remove the approved update from the local array
      pendingUpdates.value = pendingUpdates.value.filter(
        (update) => update.id !== Number(pendingUpdateId)
      );

      showNotify({
        type: 'positive',
        message: data?.message || 'Pending update approved successfully',
        position: 'top',
        duration: 3000,
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve pending update';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function rejectPendingUpdate(pendingUpdateId: string | number, reason: string) {
    loading.value = true;
    error.value = null;

    try {
      const payload: RejectUpdatePayload = { reason };
      const { data } = await api.delete<ApiResponse<null>>(
        endPoints.pendingUpdate.reject(pendingUpdateId),
        { data: payload }
      );

      // Remove the rejected update from the local array
      pendingUpdates.value = pendingUpdates.value.filter(
        (update) => update.id !== Number(pendingUpdateId)
      );

      showNotify({
        type: 'positive',
        message: data?.message || 'Pending update rejected successfully',
        position: 'top',
        duration: 3000,
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject pending update';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function refreshPendingUpdates() {
    const currentPage = pagination.value?.current_page || 1;
    return await fetchPendingUpdates(currentPage, currentFilters.value);
  }

  return {
    // State
    pendingUpdates,
    currentPendingUpdate,
    loading,
    error,
    pagination,
    currentFilters,

    // Actions
    fetchPendingUpdates,
    fetchPendingUpdateDetails,
    approvePendingUpdate,
    rejectPendingUpdate,
    refreshPendingUpdates,
  };
});
