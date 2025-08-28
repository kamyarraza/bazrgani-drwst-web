import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';
import type { BasicExchangeRate, DetailedExchangeRate, ApiResponse } from 'src/types/exchange_rate';

export const useExchangeRateStore = defineStore('exchangeRate', () => {
  const activeRate = ref<DetailedExchangeRate | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const fetchPromise = ref<Promise<void> | null>(null);

  async function createExchangeRate(payload: BasicExchangeRate) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<ApiResponse<DetailedExchangeRate>>(endPoints.exchangeRate.create, payload);
      activeRate.value = data.data;
      showNotify({
        type: 'positive',
        message: data?.message || 'Exchange rate created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create exchange rate';
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

  async function fetchActiveExchangeRate() {
    // Check if we already have active rate data
    if (activeRate.value) {
      return;
    }

    // If a fetch is already in progress, wait for it to complete
    if (fetchPromise.value) {
      return await fetchPromise.value;
    }

    // Create a new fetch promise
    fetchPromise.value = (async () => {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await api.get<ApiResponse<DetailedExchangeRate>>(endPoints.exchangeRate.activeRate);
        
        activeRate.value = data.data;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active exchange rate';
        error.value = errorMessage;
        showNotify({
          type: 'negative',
          message: error.value,
          position: 'top',
          duration: 3000,
        });
      } finally {
        loading.value = false;
        fetchPromise.value = null; // Clear the promise when done
      }
    })();

    return await fetchPromise.value;
  }

  // Method to clear cached data and force a fresh fetch
  function clearActiveRate() {
    activeRate.value = null;
    fetchPromise.value = null;
    error.value = null;
  }

  return {
    activeRate,
    loading,
    error,
    createExchangeRate,
    fetchActiveExchangeRate,
    clearActiveRate
  };
});
