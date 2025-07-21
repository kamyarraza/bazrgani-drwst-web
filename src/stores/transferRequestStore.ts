import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';
import type { WarehouseTransfer_request_post } from 'src/types/warehouseItemTransfer';
import type { Warehouse, ApiResponse, Pagination } from 'src/types/warehouse';
import type { Product } from 'src/types/item';
import { useBranchStore } from './branchStore';

export interface TransferRequest {
  id: number;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  note: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at: string;
  updated_at?: string;
  // New API structure
  source: {
    id: number;
    name: string;
  };
  target: {
    id: number;
    name: string;
  };
  // Legacy structure (for backward compatibility)
  fromWarehouse?: {
    id: number;
    name: string;
  };
  toWarehouse?: {
    id: number;
    name: string;
  };
  // Items structure - supports both 'items' and 'details' for compatibility
  items?: Array<{
    quantity: number;
    item: {
      id: number;
      name: string;
      sku: string;
      description?: string;
      unit_cost?: number;
      category?: {
        id: number;
        name: string;
      };
    };
  }>;
  details?: Array<{
    id: number;
    item_id: number;
    quantity: number;
    item: Product;
  }>;
}

export interface SelectedTransferItem {
  item_id: number;
  item: Product;
  quantity: number;
}

export const useTransferRequestStore = defineStore('transferRequest', () => {
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Transfer Requests (outgoing from current user's branch)
  const transferRequests = ref<TransferRequest[]>([]);
  const requestsPagination = ref<Pagination | null>(null);

  // Incoming Transfers (to current user's branch)
  const incomingTransfers = ref<TransferRequest[]>([]);
  const incomingPagination = ref<Pagination | null>(null);

  // Direct Transfers (created transfers without approval process)
  const transfers = ref<TransferRequest[]>([]);
  const transfersPagination = ref<Pagination | null>(null);

  // Form state for creating requests
  const selectedFromBranch = ref<number | null>(null);
  const selectedFromWarehouse = ref<number | null>(null);
  const selectedToBranch = ref<number | null>(null);
  const selectedToWarehouse = ref<number | null>(null);
  const transferNote = ref('');
  const selectedItems = ref<SelectedTransferItem[]>([]);
  // Add a reactivity trigger counter to ensure UI updates
  const selectedItemsUpdateCounter = ref(0);

  // Available warehouses and branches
  const fromWarehouses = ref<Warehouse[]>([]);
  const toWarehouses = ref<Warehouse[]>([]);

  // Mode flag for direct transfers vs requests
  const isDirectTransferMode = ref(false);

  // Get stores
  const branchStore = useBranchStore();

  // Actions

  /**
   * Fetch all transfer requests where current user's branch is the source
   */
  const fetchTransferRequests = async (page: number = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<ApiResponse<TransferRequest[]>>(`${endPoints.warehouseItemTransfer.getRequests}?page=${page}&relations=fromWarehouse,toWarehouse,items,&paginate=true`);

      if (response.data.status === 'success') {
        transferRequests.value = response.data.data;
        requestsPagination.value = response.data.pagination || null;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to fetch transfer requests',
          position: 'top',
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = 'Failed to fetch transfer requests';
      console.error('Error fetching transfer requests:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to fetch transfer requests',
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch all incoming transfers where current user's branch is the destination
   */
  const fetchIncomingTransfers = async (page: number = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<ApiResponse<TransferRequest[]>>(`${endPoints.warehouseItemTransfer.getIncomingTransfers}?page=${page}&relations=fromWarehouse,toWarehouse,items&paginate=true`);

      if (response.data.status === 'success') {
        incomingTransfers.value = response.data.data;
        incomingPagination.value = response.data.pagination || null;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to fetch incoming transfers',
          position: 'top',
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = 'Failed to fetch incoming transfers';
      console.error('Error fetching incoming transfers:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to fetch incoming transfers',
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch all direct transfers where current user's branch is the source
   */
  const fetchTransfers = async (page: number = 1) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<ApiResponse<TransferRequest[]>>(`${endPoints.warehouseItemTransfer.getRequests}?page=${page}&relations=fromWarehouse,toWarehouse&type=transfer`);

      if (response.data.status === 'success') {
        transfers.value = response.data.data;
        transfersPagination.value = response.data.pagination || null;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to fetch transfers',
          position: 'top',
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = 'Failed to fetch transfers';
      console.error('Error fetching transfers:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to fetch transfers',
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch warehouses for the current user's branch (for selecting source warehouse)
   */
  const fetchFromWarehouses = async (branchId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<ApiResponse<any>>(endPoints.branchWarehouses(branchId));

      if (response.data.status === 'success') {
        // Handle the case where the API returns a single branch with warehouses
        const branchData = response.data.data;
        if (branchData && branchData.warehouses) {
          fromWarehouses.value = branchData.warehouses;
        } else {
          fromWarehouses.value = [];
        }
      } else {
        error.value = response.data.message;
        fromWarehouses.value = [];
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to fetch warehouses',
          position: 'top',
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = 'Failed to fetch warehouses';
      fromWarehouses.value = [];
      console.error('Error fetching warehouses:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to fetch warehouses',
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch warehouses for selected destination branch
   */
  const fetchToWarehouses = async (branchId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<ApiResponse<any>>(endPoints.branchWarehouses(branchId));

      if (response.data.status === 'success') {
        // Handle the case where the API returns a single branch with warehouses
        const branchData = response.data.data;
        if (branchData && branchData.warehouses) {
          toWarehouses.value = branchData.warehouses;
        } else {
          toWarehouses.value = [];
        }
      } else {
        error.value = response.data.message;
        toWarehouses.value = [];
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to fetch destination warehouses',
          position: 'top',
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = 'Failed to fetch destination warehouses';
      toWarehouses.value = [];
      console.error('Error fetching destination warehouses:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to fetch destination warehouses',
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new transfer request
   */
  const createTransferRequest = async (transferData: WarehouseTransfer_request_post) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<TransferRequest>>(endPoints.warehouseItemTransfer.request, transferData);

      if (response.data.status === 'success') {
        // Refresh transfer requests list
        await fetchTransferRequests();

        showNotify({
          type: 'positive',
          message: response.data.message || 'Transfer request created successfully',
          position: 'top',
          duration: 3000,
        });

        // Reset form
        resetForm();
        return true;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to create transfer request',
          position: 'top',
          duration: 3000,
        });
        return false;
      }
    } catch (err) {
      error.value = 'Failed to create transfer request';
      console.error('Error creating transfer request:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to create transfer request',
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a direct transfer (skips approval process)
   */
  const createTransfer = async (transferData: WarehouseTransfer_request_post) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<TransferRequest>>(endPoints.warehouseItemTransfer.transfer, transferData);

      if (response.data.status === 'success') {
        // Refresh transfers list
        await fetchTransfers();

        showNotify({
          type: 'positive',
          message: response.data.message || 'Transfer created successfully',
          position: 'top',
          duration: 3000,
        });

        // Reset form
        resetForm();
        return true;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to create transfer',
          position: 'top',
          duration: 3000,
        });
        return false;
      }
    } catch (err) {
      error.value = 'Failed to create transfer';
      console.error('Error creating transfer:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to create transfer',
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Approve a pending transfer request (for incoming transfers)
   */
  const approveTransfer = async (transferId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<TransferRequest>>(endPoints.warehouseItemTransfer.approve(transferId));

      if (response.data.status === 'success') {
        // Refresh incoming transfers list
        await fetchIncomingTransfers();

        showNotify({
          type: 'positive',
          message: response.data.message || 'Transfer approved successfully',
          position: 'top',
          duration: 3000,
        });
        return true;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to approve transfer',
          position: 'top',
          duration: 3000,
        });
        return false;
      }
    } catch (err) {
      error.value = 'Failed to approve transfer';
      console.error('Error approving transfer:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to approve transfer',
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Complete an approved transfer (mark as received)
   */
  const completeTransfer = async (transferId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<TransferRequest>>(endPoints.warehouseItemTransfer.complete(transferId));

      if (response.data.status === 'success') {
        // Refresh incoming transfers list
        await fetchIncomingTransfers();

        showNotify({
          type: 'positive',
          message: response.data.message || 'Transfer completed successfully',
          position: 'top',
          duration: 3000,
        });
        return true;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to complete transfer',
          position: 'top',
          duration: 3000,
        });
        return false;
      }
    } catch (err) {
      error.value = 'Failed to complete transfer';
      console.error('Error completing transfer:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to complete transfer',
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reject a pending transfer request
   */
  const rejectTransfer = async (transferId: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<ApiResponse<TransferRequest>>(endPoints.warehouseItemTransfer.reject(transferId));

      if (response.data.status === 'success') {
        // Refresh incoming transfers list
        await fetchIncomingTransfers();

        showNotify({
          type: 'positive',
          message: response.data.message || 'Transfer rejected successfully',
          position: 'top',
          duration: 3000,
        });
        return true;
      } else {
        error.value = response.data.message;
        showNotify({
          type: 'negative',
          message: response.data.message || 'Failed to reject transfer',
          position: 'top',
          duration: 3000,
        });
        return false;
      }
    } catch (err) {
      error.value = 'Failed to reject transfer';
      console.error('Error rejecting transfer:', err);
      showNotify({
        type: 'negative',
        message: 'Failed to reject transfer',
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Add item to transfer request
   */
  const addSelectedItem = (item: Product, quantity: number = 1) => {
    const existingIndex = selectedItems.value.findIndex(si => si.item_id === item.id);
    if (existingIndex >= 0) {
      const existingItem = selectedItems.value[existingIndex];
      if (existingItem) {
        // Use splice to ensure reactivity
        const updatedItem: SelectedTransferItem = {
          item_id: existingItem.item_id,
          item: existingItem.item,
          quantity: existingItem.quantity + quantity
        };
        selectedItems.value.splice(existingIndex, 1, updatedItem);
      }
    } else {
      // Create new item and push to array
      const newItem: SelectedTransferItem = {
        item_id: item.id,
        item: item,
        quantity: quantity
      };
      selectedItems.value.push(newItem);
      // Force reactivity trigger
      selectedItems.value = [...selectedItems.value];
    }
    // Trigger reactivity update
    selectedItemsUpdateCounter.value++;
  };

  /**
   * Remove item from transfer request
   */
  const removeSelectedItem = (itemId: number) => {
    const index = selectedItems.value.findIndex(si => si.item_id === itemId);
    if (index >= 0) {
      selectedItems.value.splice(index, 1);
      // Trigger reactivity update
      selectedItemsUpdateCounter.value++;
    }
  };

  /**
   * Get available quantity for an item
   */
  const getItemAvailableQuantity = (item: Product) => {
    // Check for pivot quantity (warehouse-specific)
    if ((item as any).pivot && (item as any).pivot.quantity !== undefined) {
      return (item as any).pivot.quantity;
    }
    // Check for total_quantity property (common in API responses)
    if ((item as any).total_quantity !== undefined) {
      return (item as any).total_quantity;
    }
    // Fallback to item's general quantity property
    return (item as any).quantity || 0;
  };

  /**
   * Update item quantity in transfer request
   */
  const updateSelectedItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) return;

    const index = selectedItems.value.findIndex(si => si.item_id === itemId);
    if (index >= 0) {
      const existingItem = selectedItems.value[index];
      if (existingItem) {
        // Use array splice to ensure Vue detects the change
        const updatedItem: SelectedTransferItem = {
          item_id: existingItem.item_id,
          item: existingItem.item,
          quantity: quantity
        };
        selectedItems.value.splice(index, 1, updatedItem);
        // Trigger reactivity update
        selectedItemsUpdateCounter.value++;
      }
    }
  };

  /**
   * Update item quantity in transfer request with validation
   */
  const updateSelectedItemQuantityWithValidation = (itemId: number, quantity: number) => {
    if (quantity <= 0) return;

    const index = selectedItems.value.findIndex(si => si.item_id === itemId);
    if (index >= 0) {
      const existingItem = selectedItems.value[index];
      if (existingItem) {
        const availableQuantity = getItemAvailableQuantity(existingItem.item);
        const validQuantity = Math.min(quantity, availableQuantity);

        // Use array splice to ensure Vue detects the change
        const updatedItem: SelectedTransferItem = {
          item_id: existingItem.item_id,
          item: existingItem.item,
          quantity: validQuantity
        };
        selectedItems.value.splice(index, 1, updatedItem);

        return validQuantity;
      }
    }
    return quantity;
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    selectedFromBranch.value = null;
    selectedFromWarehouse.value = null;
    selectedToBranch.value = null;
    selectedToWarehouse.value = null;
    transferNote.value = '';
    selectedItems.value = [];
    fromWarehouses.value = [];
    toWarehouses.value = [];
  };

  /**
   * Ensure branches are loaded
   */
  const ensureBranchesLoaded = async () => {
    if (branchStore.branches.length === 0) {
      await branchStore.fetchBranches();
    }
  };

  /**
   * Search items based on query
   */
  const searchItems = async (searchQuery: string) => {
    try {
      loading.value = true;
      const response = await api.get<ApiResponse<any>>(
        `${endPoints.item.list}?query=${encodeURIComponent(searchQuery)}&relations=category`
      );

      if (response.data.status === 'success') {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Computed
  const canCreateRequest = computed(() => {
    return selectedFromWarehouse.value &&
           selectedToWarehouse.value &&
           selectedItems.value.length > 0 &&
           transferNote.value.trim().length > 0; // Require note to be provided
  });

  const totalItemsToTransfer = computed(() => {
    return selectedItems.value.reduce((total, item) => total + item.quantity, 0);
  });

  return {
    // State
    loading,
    error,
    transferRequests,
    requestsPagination,
    incomingTransfers,
    incomingPagination,
    transfers,
    transfersPagination,
    selectedFromBranch,
    selectedFromWarehouse,
    selectedToBranch,
    selectedToWarehouse,
    transferNote,
    selectedItems,
    fromWarehouses,
    toWarehouses,
    isDirectTransferMode,

    // Actions
    fetchTransferRequests,
    fetchIncomingTransfers,
    fetchTransfers,
    fetchFromWarehouses,
    fetchToWarehouses,
    createTransferRequest,
    createTransfer,
    approveTransfer,
    completeTransfer,
    rejectTransfer,
    addSelectedItem,
    removeSelectedItem,
    updateSelectedItemQuantity,
    updateSelectedItemQuantityWithValidation,
    getItemAvailableQuantity,
    resetForm,
    ensureBranchesLoaded,
    searchItems,

    // Computed
    canCreateRequest,
    totalItemsToTransfer,
    selectedItemsUpdateCounter
  };
});
