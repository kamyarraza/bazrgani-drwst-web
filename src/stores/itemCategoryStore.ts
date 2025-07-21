import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Category, CategoryList, CreateCategoryPayload, UpdateCategoryPayload, ApiResponse } from 'src/types/category';
import type { Pagination } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useItemCategoryStore = defineStore('itemCategory', () => {
  const itemCategories = ref<Category[]>([]);
  const currentItemCategory = ref<Category | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);
  async function fetchItemCategories(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? '?page=' + page : '';
    try {
      const { data } = await api.get<ApiResponse<CategoryList>>(`${endPoints.itemCategory.list}${parameter}&paginate=true`);
      itemCategories.value = data.data;
      // @ts-expect-error - Pagination might not be present in all responses
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch item categories';
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

  async function searchItemCategories(searchQuery: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<CategoryList>>(
        `${endPoints.itemCategory.list}?query=${encodeURIComponent(searchQuery)}`
      );
      itemCategories.value = data.data;
      // Clear pagination when searching since we're not using paginated search
      pagination.value = null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search categories';
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

  async function createItemCategory(categoryData: CreateCategoryPayload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<ApiResponse<Category>>(endPoints.itemCategory.create, categoryData);
      itemCategories.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Category created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
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

  async function getItemCategoryDetails(categoryId: number | string) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ApiResponse<Category>>(endPoints.itemCategory.details(categoryId));
      currentItemCategory.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch category details';
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

  async function updateItemCategory(categoryId: number | string, categoryData: UpdateCategoryPayload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.put<ApiResponse<Category>>(endPoints.itemCategory.update(categoryId), categoryData);
      const index = itemCategories.value.findIndex(cat => cat.id === Number(categoryId));
      if (index !== -1) {
        itemCategories.value[index] = data.data;
      }
      showNotify({
        type: 'positive',
        message: data?.message || 'Category updated successfully',
        position: 'top',
        duration: 3000,
      });
      await fetchItemCategories();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
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

  async function toggleItemCategoryStatus(categoryId: number | string) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.put<ApiResponse<Category>>(endPoints.itemCategory.toggleStatus(categoryId));
      // Update the local category status
      const index = itemCategories.value.findIndex(cat => cat.id === Number(categoryId));
      if (index !== -1 && itemCategories.value[index]) {
        itemCategories.value[index].is_active = !itemCategories.value[index].is_active;
      }
      showNotify({
        type: 'positive',
        message: data?.message || 'Category status updated successfully',
        position: 'top',
        duration: 3000,
      });
      await fetchItemCategories();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle category status';
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
    itemCategories,
    currentItemCategory,
    loading,
    error,
    pagination,
    fetchItemCategories,
    searchItemCategories,
    createItemCategory,
    getItemCategoryDetails,
    updateItemCategory,
    toggleItemCategoryStatus
  };
});
