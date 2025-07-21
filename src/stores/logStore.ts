import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { AuditLogEntry, Pagination } from 'src/types/log';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useLogStore = defineStore('log', () => {
  const logs = ref<AuditLogEntry[]>([]);
  const currentLog = ref<AuditLogEntry | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchLogs(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? 'page=' + page : '';

    try {
      const { data } = await api.get<ApiResponse<AuditLogEntry[]>>(`${endPoints.asset.activityLogs.list}?${parameter}&paginate=true`);
      logs.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity logs';
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

  async function getLogDetails(logId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<AuditLogEntry>>(`${endPoints.asset.activityLogs.list}/${logId}`);
      currentLog.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch log details';
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

  function clearError() {
    error.value = null;
  }

  function clearLogs() {
    logs.value = [];
    pagination.value = null;
  }

  return {
    logs,
    currentLog,
    loading,
    error,
    pagination,
    fetchLogs,
    getLogDetails,
    clearError,
    clearLogs
  };
});
