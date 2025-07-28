import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Cashbox, CashboxResponse } from 'src/types/cashbox';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useCashboxStore = defineStore('cashbox', () => {
  const cashbox = ref<Cashbox | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCashbox(branchId: number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<CashboxResponse>(`${endPoints.cashbox.details(branchId)}?relations=sessions,transactions`);
      cashbox.value = data.data;
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cashbox';
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

  async function openCashbox(branchId: number, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<CashboxResponse>(`${endPoints.cashbox.open(branchId)}`, {
        password
      });

      showNotify({
        type: 'positive',
        message: data?.message || 'Cashbox opened successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the cashbox data
      await fetchCashbox(branchId);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open cashbox';
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

  async function closeCashbox(branchId: number, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<CashboxResponse>(`${endPoints.cashbox.close(branchId)}`, {
        password
      });

      showNotify({
        type: 'positive',
        message: data?.message || 'Cashbox closed successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the cashbox data
      await fetchCashbox(branchId);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to close cashbox';
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

  async function depositToCashbox(branchId: number, depositData: { iqd_amount?: number; usd_amount?: number; note?: string }) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<CashboxResponse>(`${endPoints.cashbox.deposit(branchId)}`, depositData);

      showNotify({
        type: 'positive',
        message: data?.message || 'Deposit completed successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the cashbox data to get updated transactions
      await fetchCashbox(branchId);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit money';
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

  async function withdrawFromCashbox(branchId: number, withdrawData: { iqd_amount?: number; usd_amount?: number; note?: string }) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<CashboxResponse>(`${endPoints.cashbox.withdraw(branchId)}`, withdrawData);

      showNotify({
        type: 'positive',
        message: data?.message || 'Withdrawal completed successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the cashbox data to get updated transactions
      await fetchCashbox(branchId);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw money';
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

  return {
    cashbox,
    loading,
    error,
    fetchCashbox,
    openCashbox,
    closeCashbox,
    depositToCashbox,
    withdrawFromCashbox,
  };
});
