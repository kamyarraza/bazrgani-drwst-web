import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Product, ApiResponse, Pagination, AddItemPayload, UpdateItemPayload } from 'src/types/item';
import type { ApiResponse as GenericApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useItemStore = defineStore('item', () => {
  const items = ref<Product[]>([]);
  const currentItem = ref<Product | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchItems(page: number = 1) {
    loading.value = true;
    error.value = null;
    const url = `${endPoints.item.list}?page=${page}&relations=category&paginate=true`;

    try {
      const { data } = await api.get<ApiResponse<Product[]>>(url);
      items.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch items';
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

  async function searchItems(searchQuery: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Product[]>>(
        `${endPoints.item.list}?query=${encodeURIComponent(searchQuery)}&relations=category`
      );
      items.value = data.data;
      // Clear pagination when searching since we're not using paginated search
      pagination.value = null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search items';
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

  async function createItem(itemData: AddItemPayload | FormData) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Product>>(endPoints.item.create, itemData, {
        headers: itemData instanceof FormData ? {
          'Content-Type': 'multipart/form-data'
        } : {
          'Content-Type': 'application/json'
        }
      });

      showNotify({
        type: 'positive',
        message: data?.message || 'Item created successfully',
        position: 'top',
        duration: 3000,
      });
      await fetchItems()
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
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

  async function getItemDetails(itemId: number | string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Product>>(endPoints.item.details(itemId));
      currentItem.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch item details';
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

  async function updateItem(itemId: number | string, itemData: UpdateItemPayload | Partial<Product> | FormData) {
    loading.value = true;
    error.value = null;

    try {
      let response;
      // If itemData is FormData (for file upload), use POST + _method=PUT
      if (itemData instanceof FormData) {
        itemData.append('_method', 'PUT');
        response = await api.post<ApiResponse<Product>>(
          endPoints.item.update(itemId),
          itemData
          // Do NOT set Content-Type, let browser handle it
        );
      } else {
        // Normal update (no file upload)
        response = await api.put<ApiResponse<Product>>(
          endPoints.item.update(itemId),
          itemData
        );
      }
      const { data } = response;

      // Update the local item data
      const index = items.value.findIndex(item => item.id === Number(itemId));
      if (index !== -1) {
        items.value[index] = data.data;
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Item updated successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the item list to get updated data
      await fetchItems();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
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

  async function deleteItem(itemId: number | string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.delete<GenericApiResponse<null>>(endPoints.item.delete(itemId));

      // Remove the item from the local array
      items.value = items.value.filter(item => item.id !== Number(itemId));

      showNotify({
        type: 'positive',
        message: data?.message || 'Item deleted successfully',
        position: 'top',
        duration: 3000,
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
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
    items,
    currentItem,
    loading,
    error,
    pagination,
    fetchItems,
    searchItems,
    createItem,
    getItemDetails,
    updateItem,
    deleteItem
  };
});
