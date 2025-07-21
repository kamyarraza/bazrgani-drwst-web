import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import type {
  ListTransactionType,
  PurchaseTransaction,
  SellTransaction,
  Pagination,
  ApiResponse
} from 'src/types/blumTypes';
import type { Warehouse, BranchWithWarehouses } from 'src/types/warehouse';
import type { BlumItem, BlumSet } from 'src/types/blumTypes';
import { useAuthStore } from './authStore';

export const useBlumTransactionStore = defineStore('blumTransaction', () => {
  // State
  const loading = ref(false);
  const transactions = ref<ListTransactionType[]>([]);
  const pagination = ref<Pagination | null>(null);
  const currentTransaction = ref<ListTransactionType | null>(null);

  // Resources for forms
  const warehouses = ref<Warehouse[]>([]);
  const blumItems = ref<BlumItem[]>([]);
  const blumSets = ref<BlumSet[]>([]);

  // Form states
  const purchaseForm = ref<PurchaseTransaction>({
    customer_id: 0,
    warehouse_id: 0,
    branch_id: 0,
    payment_type: 'cash',
    note: '',
    details: []
  });

  const sellForm = ref<SellTransaction>({
    customer_id: 0,
    warehouse_id: 0,
    branch_id: 0,
    payment_type: 'cash',
    discounted_rate: 0,
    note: '',
    details: []
  });

  // Computed
  const transactionsPagination = computed(() => pagination.value);
  const transactionsLoading = computed(() => loading.value);

  // Actions

  // Fetch transactions by type with pagination
  async function fetchBlumTransactions(type: 'purchase' | 'sell', page: number = 1) {
    try {
      loading.value = true;
      const response = await api.get<ApiResponse<ListTransactionType[]>>(
        endPoints.blumTransaction.getBlumTransactions(type),
        { params: { page, relations: 'customer,warehouse,items' } }
      );

      if (response.data.status === 'success') {
        transactions.value = response.data.data;
        pagination.value = response.data.pagination || null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching blum transactions:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Search transactions (no pagination)
  async function searchBlumTransactions(type: 'purchase' | 'sell', query: string) {
    try {
      loading.value = true;
      const response = await api.get<ApiResponse<ListTransactionType[]>>(
        endPoints.blumTransaction.getBlumTransactions(type),
        { params: { query } }
      );

      if (response.data.status === 'success') {
        transactions.value = response.data.data;
        pagination.value = null; // No pagination for search
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error searching blum transactions:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Get single transaction details
  async function getBlumTransaction(transactionId: string | number) {
    try {
      loading.value = true;
      const response = await api.get<ApiResponse<ListTransactionType>>(
        endPoints.blumTransaction.getBlumTransaction(String(transactionId)),
        { params: { relations: 'customer,warehouse,items' } }
      );

      if (response.data.status === 'success') {
        currentTransaction.value = response.data.data;
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching blum transaction:', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Create purchase transaction
  async function createPurchaseTransaction(transactionData: PurchaseTransaction) {
    try {
      loading.value = true;
      const response = await api.post<ApiResponse<ListTransactionType>>(
        endPoints.blumTransaction.purchase,
        transactionData
      );

      if (response.data.status === 'success') {
        // Refresh transactions list
        await fetchBlumTransactions('purchase');
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating purchase transaction:', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Create sell transaction
  async function createSellTransaction(transactionData: SellTransaction) {
    try {
      loading.value = true;
      const response = await api.post<ApiResponse<ListTransactionType>>(
        endPoints.blumTransaction.sell,
        transactionData
      );

      if (response.data.status === 'success') {
        // Refresh transactions list
        await fetchBlumTransactions('sell');
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating sell transaction:', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Fetch warehouses for current user's branch
  async function fetchWarehouses() {
    try {
      const authStore = useAuthStore();

      // Get current user's branch ID
      if (!authStore.currentUser?.branch?.id) {
        console.error('No branch ID found for current user');
        warehouses.value = [];
        return false;
      }

      const branchId = authStore.currentUser.branch.id;
      const response = await api.get<ApiResponse<BranchWithWarehouses>>(
        endPoints.branchWarehouses(branchId)
      );

      if (response.data.status === 'success') {
        // Extract warehouses array from the BranchWithWarehouses response
        warehouses.value = response.data.data.warehouses || [];
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching warehouses for branch:', error);
      warehouses.value = [];
      return false;
    }
  }

  // Fetch warehouses for a specific branch (for admin users)
  async function fetchBranchWarehouses(branchId?: number) {
    try {
      loading.value = true;

      // If no branch ID provided, return empty array
      if (!branchId) {
        console.warn('No branch ID provided for fetching warehouses');
        warehouses.value = [];
        return;
      }

      const response = await api.get<ApiResponse<BranchWithWarehouses>>(
        endPoints.branchWarehouses(branchId)
      );

      if (response.data.status === 'success') {
        warehouses.value = response.data.data.warehouses || [];
      } else {
        console.error('Failed to fetch warehouses:', response.data.message);
        warehouses.value = [];
      }
    } catch (error) {
      console.error('Error fetching branch warehouses:', error);
      warehouses.value = [];
    } finally {
      loading.value = false;
    }
  }

  // Fetch blum items for transaction details
  async function fetchBlumItems() {
    try {
      const response = await api.get<ApiResponse<BlumItem[]>>(endPoints.blumItem.getAll);
      if (response.data.status === 'success') {
        blumItems.value = response.data.data;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching blum items:', error);
      return false;
    }
  }

  // Fetch blum sets for transaction details
  async function fetchBlumSets() {
    try {
      const response = await api.get<ApiResponse<BlumSet[]>>(endPoints.blumSet.getAll);
      if (response.data.status === 'success') {
        blumSets.value = response.data.data;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching blum sets:', error);
      return false;
    }
  }

  // Reset forms
  function resetPurchaseForm() {
    purchaseForm.value = {
      customer_id: 0,
      warehouse_id: 0,
      branch_id: 0,
      payment_type: 'cash',
      note: '',
      details: []
    };
  }

  function resetSellForm() {
    sellForm.value = {
      customer_id: 0,
      warehouse_id: 0,
      branch_id: 0,
      payment_type: 'cash',
      discounted_rate: 0,
      note: '',
      details: []
    };
  }

  function resetCurrentTransaction() {
    currentTransaction.value = null;
  }

  return {
    // State
    loading: transactionsLoading,
    transactions,
    pagination: transactionsPagination,
    currentTransaction,
    warehouses,
    blumItems,
    blumSets,
    purchaseForm,
    sellForm,

    // Actions
    fetchBlumTransactions,
    searchBlumTransactions,
    getBlumTransaction,
    createPurchaseTransaction,
    createSellTransaction,
    fetchWarehouses,
    fetchBranchWarehouses,
    fetchBlumItems,
    fetchBlumSets,
    resetPurchaseForm,
    resetSellForm,
    resetCurrentTransaction
  };
});
