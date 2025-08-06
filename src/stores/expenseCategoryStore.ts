import { ref } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";
import type { ExpenseCategory, ExpensePagination } from "src/types/expense";
import type { ApiResponse } from "src/types";
import { endPoints } from "src/endpoint";
import { showNotify } from "src/composables/Notify";

export const useExpenseCategoryStore = defineStore("expenseCategory", () => {
  const categories = ref<ExpenseCategory[]>([]);
  const allCategories = ref<ExpenseCategory[]>([]);
  const currentCategory = ref<ExpenseCategory | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<ExpensePagination | null>(null);

  async function fetchCategories(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? "page=" + page : "";

    try {
      const { data } = await api.get<ApiResponse<ExpenseCategory[]>>(
        `${endPoints.expenseCategory.list}?${parameter}&paginate=true`
      );
      categories.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch expense categories";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllCategories() {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<ExpenseCategory[]>>(
        `${endPoints.expenseCategory.list}?paginate=false`
      );
      allCategories.value = data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch expense categories";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  async function searchCategories(searchQuery: string, page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? "page=" + page : "";

    try {
      const { data } = await api.get<ApiResponse<ExpenseCategory[]>>(
        `${
          endPoints.expenseCategory.list
        }?${parameter}&paginate=true&query=${encodeURIComponent(searchQuery)}`
      );
      categories.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to search expense categories";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  async function getCategoryDetails(categoryId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<ExpenseCategory>>(
        endPoints.expenseCategory.details(categoryId)
      );
      currentCategory.value = data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch category details";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(categoryData: ExpenseCategory) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<ExpenseCategory>>(
        endPoints.expenseCategory.create,
        categoryData
      );

      showNotify({
        type: "positive",
        message: "Expense category created successfully",
        position: "top",
        duration: 3000,
      });

      return data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create expense category";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCategory(
    categoryId: string,
    categoryData: ExpenseCategory
  ) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<ExpenseCategory>>(
        endPoints.expenseCategory.update(categoryId),
        categoryData
      );

      showNotify({
        type: "positive",
        message: "Expense category updated successfully",
        position: "top",
        duration: 3000,
      });

      return data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update expense category";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCategory(categoryId: string) {
    loading.value = true;
    error.value = null;

    try {
      await api.delete(endPoints.expenseCategory.delete(categoryId));

      showNotify({
        type: "positive",
        message: "Expense category deleted successfully",
        position: "top",
        duration: 3000,
      });

      // Remove from local state
      categories.value = categories.value.filter(
        (category) => category.id !== parseInt(categoryId)
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete expense category";
      error.value = errorMessage;
      showNotify({
        type: "negative",
        message: error.value,
        position: "top",
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    allCategories,
    currentCategory,
    loading,
    error,
    pagination,
    fetchCategories,
    fetchAllCategories,
    searchCategories,
    getCategoryDetails,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
