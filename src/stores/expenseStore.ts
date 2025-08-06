import { ref } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";
import type { Expense, ExpensePagination } from "src/types/expense";
import type { ApiResponse } from "src/types";
import { endPoints } from "src/endpoint";
import { showNotify } from "src/composables/Notify";

export const useExpenseStore = defineStore("expense", () => {
  const expenses = ref<Expense[]>([]);
  const currentExpense = ref<Expense | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<ExpensePagination | null>(null);

  async function fetchExpenses(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? "page=" + page : "";

    try {
      const { data } = await api.get<ApiResponse<Expense[]>>(
        `${endPoints.expense.list}?${parameter}&paginate=true&relations=category`
      );
      expenses.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch expenses";
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

  async function searchExpenses(searchQuery: string, page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? "page=" + page : "";

    try {
      const { data } = await api.get<ApiResponse<Expense[]>>(
        `${
          endPoints.expense.list
        }?${parameter}&paginate=true&relations=category&search=${encodeURIComponent(
          searchQuery
        )}`
      );
      expenses.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search expenses";
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

  async function getExpenseDetails(expenseId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Expense>>(
        endPoints.expense.details(expenseId)
      );
      currentExpense.value = data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch expense details";
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

  async function createExpense(expenseData: Expense) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Expense>>(
        endPoints.expense.create,
        expenseData
      );

      showNotify({
        type: "positive",
        message: "Expense created successfully",
        position: "top",
        duration: 3000,
      });

      return data.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create expense";
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
    expenses,
    currentExpense,
    loading,
    error,
    pagination,
    fetchExpenses,
    searchExpenses,
    getExpenseDetails,
    createExpense,
  };
});
