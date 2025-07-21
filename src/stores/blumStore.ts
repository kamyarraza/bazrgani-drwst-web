import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { BlumItem, BlumSet, CreateOrUpdateBlumItem, CreateOrUpdateBlumSet, ApiResponse } from 'src/types/blumTypes';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useBlumStore = defineStore('blum', () => {
  // Blum Items state
  const blumItems = ref<BlumItem[]>([]);
  const currentBlumItem = ref<BlumItem | null>(null);
  const blumItemsLoading = ref(false);
  const blumItemsError = ref<string | null>(null);
  const blumItemsPagination = ref<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);

  // Blum Sets state
  const blumSets = ref<BlumSet[]>([]);
  const currentBlumSet = ref<BlumSet | null>(null);
  const blumSetsLoading = ref(false);
  const blumSetsError = ref<string | null>(null);
  const blumSetsPagination = ref<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);

  // ============= BLUM ITEMS FUNCTIONS =============
  async function fetchBlumItems(page: number = 1) {
    blumItemsLoading.value = true;
    blumItemsError.value = null;

    // Clean endpoint with only pagination - no search parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('paginate', 'true');

    try {
      const { data } = await api.get<ApiResponse<BlumItem[]>>(`${endPoints.blumItem.getAll}?${params.toString()}`);
      blumItems.value = data.data;
      blumItemsPagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Blum items';
      blumItemsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
    } finally {
      blumItemsLoading.value = false;
    }
  }

  async function searchBlumItems(query: string) {
    blumItemsLoading.value = true;
    blumItemsError.value = null;

    // Use same endpoint but with ONLY query parameter - no pagination
    const params = new URLSearchParams();
    params.append('query', query.trim());

    try {
      const { data } = await api.get<ApiResponse<BlumItem[]>>(`${endPoints.blumItem.getAll}?${params.toString()}`);
      blumItems.value = data.data;
      // Clear pagination for search results since search doesn't use pagination
      blumItemsPagination.value = null;

      showNotify({
        type: 'positive',
        message: data?.message || 'Blum items search completed',
        position: 'top',
        duration: 3000,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search Blum items';
      blumItemsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
    } finally {
      blumItemsLoading.value = false;
    }
  }

  async function createBlumItem(itemData: CreateOrUpdateBlumItem | FormData) {
    blumItemsLoading.value = true;
    blumItemsError.value = null;

    try {
      let response;
      // Handle FormData for file upload
      if (itemData instanceof FormData) {
        response = await api.post<ApiResponse<BlumItem>>(
          endPoints.blumItem.create,
          itemData
          // Do NOT set Content-Type, let browser handle it for FormData
        );
      } else {
        // Normal JSON submission
        response = await api.post<ApiResponse<BlumItem>>(
          endPoints.blumItem.create,
          itemData
        );
      }

      const { data } = response;
      blumItems.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Blum item created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create Blum item';
      blumItemsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      blumItemsLoading.value = false;
    }
  }

  async function updateBlumItem(itemId: number | string, itemData: CreateOrUpdateBlumItem | FormData) {
    blumItemsLoading.value = true;
    blumItemsError.value = null;

    try {
      let response;
      // Handle FormData for file upload
      if (itemData instanceof FormData) {
        // For updates with FormData, we need to use POST with _method=PUT
        itemData.append('_method', 'PUT');
        response = await api.post<ApiResponse<BlumItem>>(
          endPoints.blumItem.update(itemId),
          itemData
          // Do NOT set Content-Type, let browser handle it for FormData
        );
      } else {
        // Normal JSON submission
        response = await api.put<ApiResponse<BlumItem>>(
          endPoints.blumItem.update(itemId),
          itemData
        );
      }

      const { data } = response;

      // Update the item in the list
      const index = blumItems.value.findIndex(item => item.id === Number(itemId));
      if (index !== -1) {
        blumItems.value[index] = data.data;
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Blum item updated successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update Blum item';
      blumItemsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      blumItemsLoading.value = false;
    }
  }

  // ============= BLUM SETS FUNCTIONS =============
  async function fetchBlumSets(page: number = 1) {
    blumSetsLoading.value = true;
    blumSetsError.value = null;

    // Clean endpoint with only pagination - no search parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('paginate', 'true');

    try {
      const { data } = await api.get<ApiResponse<BlumSet[]>>(`${endPoints.blumSet.getAll}?${params.toString()}`);
      blumSets.value = data.data;
      blumSetsPagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Blum sets';
      blumSetsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
    } finally {
      blumSetsLoading.value = false;
    }
  }

  async function searchBlumSets(query: string) {
    blumSetsLoading.value = true;
    blumSetsError.value = null;

    // Use the updated endpoint with query parameter for general searchable sets
    const params = new URLSearchParams();
    if (query && query.trim()) {
      params.append('query', query.trim());
    }

    try {
      const { data } = await api.get<ApiResponse<BlumSet[]>>(`${endPoints.blumSet.getAll}?${params.toString()}`);
      blumSets.value = data.data;
      // Clear pagination for search results since search doesn't use pagination
      blumSetsPagination.value = null;

      showNotify({
        type: 'positive',
        message: data?.message || 'Blum sets search completed',
        position: 'top',
        duration: 3000,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search Blum sets';
      blumSetsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
    } finally {
      blumSetsLoading.value = false;
    }
  }

  async function getBlumSetDetails(setId: string | number) {
    blumSetsLoading.value = true;
    blumSetsError.value = null;

    try {
      const { data } = await api.get<ApiResponse<BlumSet>>(endPoints.blumSet.getOne(setId));
      currentBlumSet.value = data.data;
      return data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Blum set details';
      blumSetsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return null;
    } finally {
      blumSetsLoading.value = false;
    }
  }

  async function createBlumSet(setData: CreateOrUpdateBlumSet | FormData) {
    blumSetsLoading.value = true;
    blumSetsError.value = null;

    try {
      let response;
      // Handle FormData for file upload
      if (setData instanceof FormData) {
        response = await api.post<ApiResponse<BlumSet>>(
          endPoints.blumSet.create,
          setData
          // Do NOT set Content-Type, let browser handle it for FormData
        );
      } else {
        // Normal JSON submission
        response = await api.post<ApiResponse<BlumSet>>(
          endPoints.blumSet.create,
          setData
        );
      }

      const { data } = response;
      blumSets.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Blum set created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create Blum set';
      blumSetsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      blumSetsLoading.value = false;
    }
  }

  async function updateBlumSet(setId: number | string, setData: CreateOrUpdateBlumSet | FormData) {
    blumSetsLoading.value = true;
    blumSetsError.value = null;

    try {
      let response;
      // Handle FormData for file upload
      if (setData instanceof FormData) {
        // For updates with FormData, we need to use POST with _method=PUT
        setData.append('_method', 'PUT');
        response = await api.post<ApiResponse<BlumSet>>(
          endPoints.blumSet.update(setId),
          setData
          // Do NOT set Content-Type, let browser handle it for FormData
        );
      } else {
        // Normal JSON submission
        response = await api.put<ApiResponse<BlumSet>>(
          endPoints.blumSet.update(setId),
          setData
        );
      }

      const { data } = response;

      // Update the set in the list
      const index = blumSets.value.findIndex(set => set.id === Number(setId));
      if (index !== -1) {
        blumSets.value[index] = data.data;
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Blum set updated successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update Blum set';
      blumSetsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      blumSetsLoading.value = false;
    }
  }

  async function deleteBlumItem(itemId: number | string) {
    blumItemsLoading.value = true;
    blumItemsError.value = null;

    try {
      const { data } = await api.delete<ApiResponse<{ message: string }>>(endPoints.blumItem.delete(itemId));

      // Remove the item from the list
      const index = blumItems.value.findIndex(item => item.id === Number(itemId));
      if (index !== -1) {
        blumItems.value.splice(index, 1);
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Blum item deleted successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete Blum item';
      blumItemsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      blumItemsLoading.value = false;
    }
  }

  async function deleteBlumSet(setId: number | string) {
    blumSetsLoading.value = true;
    blumSetsError.value = null;

    try {
      const { data } = await api.delete<ApiResponse<{ message: string }>>(endPoints.blumSet.delete(setId));

      // Remove the set from the list
      const index = blumSets.value.findIndex(set => set.id === Number(setId));
      if (index !== -1) {
        blumSets.value.splice(index, 1);
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Blum set deleted successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete Blum set';
      blumSetsError.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      blumSetsLoading.value = false;
    }
  }

  return {
    // Blum Items
    blumItems,
    currentBlumItem,
    blumItemsLoading,
    blumItemsError,
    blumItemsPagination,
    fetchBlumItems,
    searchBlumItems,
    createBlumItem,
    updateBlumItem,
    deleteBlumItem,

    // Blum Sets
    blumSets,
    currentBlumSet,
    blumSetsLoading,
    blumSetsError,
    blumSetsPagination,
    fetchBlumSets,
    searchBlumSets,
    getBlumSetDetails,
    createBlumSet,
    updateBlumSet,
    deleteBlumSet,
  };
});
