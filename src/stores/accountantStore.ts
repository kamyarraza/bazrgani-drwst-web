import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Accountant, AccountantResponse, Pagination } from 'src/types/accountant';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useAccountantStore = defineStore('accountant', () => {
  const accountants = ref<Accountant[]>([]);
  const currentAccountant = ref<Accountant | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);
  async function fetchAccountants(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? '?page=' + page : '';

    try {
      const { data } = await api.get<AccountantResponse>(`${endPoints.accountant.list}${parameter}&paginate=true`);
      accountants.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accountants';
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

  async function createAccountant(accountantData: Partial<Accountant> ) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Accountant>>(endPoints.accountant.create, accountantData);
      accountants.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Accountant created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create accountant';
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

  async function getAccountantDetails(accountantId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Accountant>>(endPoints.accountant.details(accountantId));
      currentAccountant.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accountant details';
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

  async function updateAccountant(accountantId: string, accountantData: Partial<Accountant> | FormData) {
    loading.value = true;
    error.value = null;

    try {
      let response;
      // If accountantData is FormData (for file upload), use POST + _method=PUT
      if (accountantData instanceof FormData) {
        accountantData.append('_method', 'PUT');
        response = await api.post<ApiResponse<Accountant>>(
          endPoints.accountant.update(accountantId),
          accountantData
          // Do NOT set Content-Type, let browser handle it
        );
      } else {
        // Normal update (no file upload)
        response = await api.put<ApiResponse<Accountant>>(
          endPoints.accountant.update(accountantId),
          accountantData
        );
      }
      const { data } = response;
      // Update the local accountant data
      const index = accountants.value.findIndex(accountant => accountant.id === parseInt(accountantId));
      if (index !== -1) {
        accountants.value[index] = data.data;
      }
      showNotify({
        message: data?.message || 'Accountant updated successfully',
        type: 'positive',
        position: 'top',
        duration: 3000,
      });
      // Refresh the accountant list to get updated data
      await fetchAccountants();
      return true;
    } catch (err: unknown) {

      showNotify({
        message: err instanceof Error ? err.message : 'Failed to update accountant',
        type: 'negative',
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    accountants,
    currentAccountant,
    loading,
    error,
    pagination,
    fetchAccountants,
    createAccountant,
    getAccountantDetails,
    updateAccountant,
  };
});
