import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import type { Transaction, PurchaseResponse, List, Pagination, RefundTransaction } from 'src/types/item_transaction';
import type { BranchWithWarehouses, Warehouse } from 'src/types/warehouse';
import type { Customer } from 'src/types/customer';
import type { Product } from 'src/types/item';
import type { ApiResponse } from 'src/types';

export const useItemTransactionStore = defineStore('itemTransaction', () => {
  // State
  const loading = ref(false);
  const list = ref<List[]>([]);
  const pagination = ref<Pagination | null>(null);
  const transactions = ref<PurchaseResponse[]>([]);
  const warehouses = ref<Warehouse[]>([]);
  const customers = ref<Customer[]>([]);
  const selectedItems = ref<Array<{
    item_id: number;
    item: Product;
    quantity: number;
    unit_price: number;
    solo_unit_price: number;
    bulk_unit_price: number;
  }>>([]);

  // Form state
  const transactionForm = ref({
    customer_id: null as number | null,
    warehouse_id: null as number | null,
    payment_type: 'cash' as 'cash' | 'borrow',
    note: '',
    details: [] as Array<{
      item_id: number;
      quantity: number;
      unit_price: number;
      solo_unit_price: number;
      bulk_unit_price: number;
    }>
  });

  // Actions
  const fetchBranchWarehouses = async (branchId?: number) => {
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
        warehouses.value = response.data.data.warehouses;
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
  };

  const fetchCustomers = async (type?: 'supplier' | 'customer') => {
    try {
      loading.value = true;
      const queryParam = type ? `?type=${type}` : '';
      const response = await api.get<ApiResponse<Customer[]>>(`${endPoints.customer.list}${queryParam}`);

      if (response.data.status === 'success') {
        customers.value = response.data.data;
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchTransactionList = async (transactionType: 'purchase' | 'sell' = 'purchase', page: number = 1) => {
    try {
      loading.value = true;
      const endpoint = endPoints.transaction.list(transactionType);
      const response = await api.get<ApiResponse<List[]>>(`${endpoint}?page=${page}&relations=customer,warehouse,items&paginate=true`);

      if (response.data.status === 'success') {
        list.value = response.data.data;
        if (response.data.pagination) {
          pagination.value = response.data.pagination;
        }
      }
    } catch (error) {
      console.error('Error fetching transaction list:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchSingleTransaction = async (transactionId: string | number, currency: 'USD' | 'IQD' = 'USD') => {
    try {
      loading.value = true;
      const response = await api.get<ApiResponse<List>>(
        `${endPoints.transaction.one(transactionId.toString())}?relations=customer,warehouse,payment,items&currency=${currency}`
      );

      if (response.data.status === 'success') {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching single transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createTransaction = async (transaction: Transaction, transactionType: 'purchase' | 'sale') => {
    try {
      loading.value = true;
      const response = await api.post<ApiResponse<PurchaseResponse>>(
        endPoints.transaction.create(transactionType === 'purchase' ? 'purchase' : 'sell'),
        transaction
      );

      if (response.data.status === 'success') {
        transactions.value.unshift(response.data.data);
        resetForm();
        return response.data;
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // New method for the new purchase/sell endpoints
  const createNewTransaction = async (transactionData: any, endpoint: string) => {
    try {
      loading.value = true;

      // Debug: Log the forgiven_price value
      console.log('🔍 Debug - forgiven_price value:', transactionData.forgiven_price);
      console.log('🔍 Debug - full transactionData:', transactionData);

      // Create FormData for the new endpoints
      const formData = new FormData();

      // Add basic fields
      formData.append('branch_id', transactionData.branch_id.toString());
      formData.append('customer_id', transactionData.customer_id.toString());
      formData.append('warehouse_id', transactionData.warehouse_id.toString());
      formData.append('payment_type', transactionData.payment_type);
      formData.append('usd_iqd_rate', transactionData.usd_iqd_rate.toString());
      formData.append('note', transactionData.note || '');
      formData.append('created_at', transactionData.created_at);
      formData.append('iqd_price', transactionData.iqd_price.toString());
      formData.append('usd_price', transactionData.usd_price.toString());
      formData.append('iqd_return_amount', transactionData.iqd_return_amount.toString());
      formData.append('usd_return_amount', transactionData.usd_return_amount.toString());
      formData.append('forgiven_price', (transactionData.forgiven_price || 0).toString());

      // Add details array
      transactionData.details.forEach((detail: any, index: number) => {
        formData.append(`details[${index}][item_id]`, detail.item_id.toString());
        formData.append(`details[${index}][quantity]`, detail.quantity.toString());
        formData.append(`details[${index}][unit_price]`, detail.unit_price.toString());
        formData.append(`details[${index}][solo_unit_price]`, detail.solo_unit_price.toString());
        formData.append(`details[${index}][bulk_unit_price]`, detail.bulk_unit_price.toString());
      });

      // Add sell-specific fields
      if (transactionData.discounted_rate !== undefined && transactionData.discounted_rate !== null) {
        formData.append('discounted_rate', transactionData.discounted_rate.toString());
      }
      if (transactionData.status) {
        formData.append('status', transactionData.status);
      }

      // Debug: Log FormData contents
      console.log('🔍 FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await api.post<ApiResponse<any>>(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 'success') {
        // Refresh the transaction list if needed
        // await fetchTransactionList(transactionData.type || 'purchase');
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error creating new transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const addSelectedItem = (item: Product) => {
    const existingIndex = selectedItems.value.findIndex(si => si.item_id === item.id);
    if (existingIndex >= 0) {
      const existingItem = selectedItems.value[existingIndex];
      if (existingItem) {
        existingItem.quantity += 1;
      }
    } else {
      selectedItems.value.push({
        item_id: item.id,
        item: item,
        quantity: 1,
        unit_price: item.solo_unit_price || 0,
        solo_unit_price: item.solo_unit_price || 0,
        bulk_unit_price: item.bulk_unit_price || 0
      });
    }
  };

  const removeSelectedItem = (itemId: number) => {
    const index = selectedItems.value.findIndex(si => si.item_id === itemId);
    if (index >= 0) {
      selectedItems.value.splice(index, 1);
    }
  };

  const updateSelectedItemQuantity = (itemId: number, quantity: number) => {
    const item = selectedItems.value.find(si => si.item_id === itemId);
    if (item && quantity > 0) {
      item.quantity = quantity;
    }
  };

  const updateSelectedItemPrice = (itemId: number, price: number) => {
    const item = selectedItems.value.find(si => si.item_id === itemId);
    if (item && price >= 0) {
      item.unit_price = price;
    }
  };

  const resetForm = () => {
    transactionForm.value = {
      customer_id: null,
      warehouse_id: null,
      payment_type: 'cash',
      note: '',
      details: []
    };
    selectedItems.value = [];
  };

  const paySupplier = async (
    transactionId: string,
    paymentData: {
      customer_id: number;
      iqd_price: number;
      usd_price: number;
      iqd_return_amount: number;
      usd_return_amount: number;
      note: string
    }
  ) => {
    try {
      loading.value = true;
      const response = await api.post<ApiResponse<any>>(
        endPoints.transaction.paySupplier(transactionId),
        paymentData
      );

      if (response.data.status === 'success') {
        return response.data;
      }
    } catch (error) {
      console.error('Error paying supplier:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const receiveFromCustomer = async (
    transactionId: string,
    paymentData: {
      customer_id: number;
      iqd_price: number;
      usd_price: number;
      iqd_return_amount: number;
      usd_return_amount: number;
      note: string
    }
  ) => {
    try {
      loading.value = true;
      const response = await api.post<ApiResponse<any>>(
        endPoints.transaction.receiveCustomer(transactionId),
        paymentData
      );

      if (response.data.status === 'success') {
        return response.data;
      }
    } catch (error) {
      console.error('Error receiving payment from customer:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const refundTransaction = async (refundData: RefundTransaction) => {
    try {
      loading.value = true;
      const response = await api.post<ApiResponse<any>>(
        endPoints.transaction.refund,
        refundData
      );

      if (response.data.status === 'success') {
        return response.data;
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const feedingTransaction = async (transactionId: string | number) => {
    try {
      loading.value = true;
      const response = await api.put<ApiResponse<any>>(
        endPoints.transaction.freeding(transactionId.toString())
      );

      if (response.data.status === 'success') {
        return response.data;
      }
    } catch (error) {
      console.error('Error processing freeding (return to warehouse):', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const searchItems = async (searchQuery: string, warehouseId?: number, transactionType?: 'purchase' | 'sell') => {
    try {
      loading.value = true;
      let endpoint = '';

      // For sell transactions, use warehouse-specific endpoint to get items with quantities
      if (transactionType === 'sell' && warehouseId) {
        endpoint = `${endPoints.specialwarehouseItems(warehouseId)}?query=${encodeURIComponent(searchQuery)}&relations=items`;
      } else {
        // For purchase transactions or when no warehouse selected, use general item endpoint
        endpoint = `${endPoints.item.list}?query=${encodeURIComponent(searchQuery)}&relations=category`;
      }

      const response = await api.get<ApiResponse<any>>(endpoint);

      if (response.data.status === 'success') {
        // For warehouse-specific endpoint, extract items from warehouse data
        if (transactionType === 'sell' && warehouseId && response.data.data?.items) {
          const itemsData = response.data.data.items;
          // Handle both array and object formats
          if (Array.isArray(itemsData)) {
            return itemsData;
          } else if (typeof itemsData === 'object' && itemsData !== null) {
            // If items is an object, convert to array
            return Object.values(itemsData);
          }
          return [];
        }
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
  const totalAmount = computed(() => {
    return selectedItems.value.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  });

  // Update transaction method
  const updateTransaction = async (endpoint: string, transactionData: any) => {
    try {
      loading.value = true;

      // Update transaction called with validated data

      // Validate required fields before creating FormData
      if (!transactionData.branch_id || !transactionData.customer_id || !transactionData.warehouse_id || !transactionData.payment_type) {
        throw new Error('Missing required fields in transaction data');
      }

      if (!transactionData.details || !Array.isArray(transactionData.details) || transactionData.details.length === 0) {
        throw new Error('Transaction details are required and must be a non-empty array');
      }

      // Create FormData for the update endpoints
      const formData = new FormData();

      // Add basic fields with validation
      formData.append('branch_id', Number(transactionData.branch_id).toString());
      formData.append('customer_id', Number(transactionData.customer_id).toString());
      formData.append('warehouse_id', Number(transactionData.warehouse_id).toString());
      formData.append('payment_type', transactionData.payment_type.toString());
      formData.append('usd_iqd_rate', Number(transactionData.usd_iqd_rate || 1500).toString());
      formData.append('note', (transactionData.note || '').toString());
      formData.append('created_at', transactionData.created_at || new Date().toISOString().split('T')[0]);
      formData.append('iqd_price', Number(transactionData.iqd_price || 0).toString());
      formData.append('usd_price', Number(transactionData.usd_price || 0).toString());
      formData.append('iqd_return_amount', Number(transactionData.iqd_return_amount || 0).toString());
      formData.append('usd_return_amount', Number(transactionData.usd_return_amount || 0).toString());
      formData.append('forgiven_price', Number(transactionData.forgiven_price || 0).toString());

      // Add sell-specific fields if present
      if (transactionData.discounted_rate !== undefined) {
        formData.append('discounted_rate', Number(transactionData.discounted_rate || 0).toString());
      }
      if (transactionData.status) {
        formData.append('status', transactionData.status.toString());
      }

      // Add details array with validation
      transactionData.details.forEach((detail: any, index: number) => {
        if (!detail.item_id || !detail.quantity || !detail.unit_price) {
          throw new Error(`Invalid detail at index ${index}: missing item_id, quantity, or unit_price`);
        }
        formData.append(`details[${index}][item_id]`, Number(detail.item_id).toString());
        formData.append(`details[${index}][quantity]`, Number(detail.quantity).toString());
        formData.append(`details[${index}][unit_price]`, Number(detail.unit_price).toString());
        formData.append(`details[${index}][solo_unit_price]`, Number(detail.solo_unit_price || detail.unit_price).toString());
        formData.append(`details[${index}][bulk_unit_price]`, Number(detail.bulk_unit_price || detail.unit_price).toString());
      });

      // FormData created with all required fields

      const response = await api.put<ApiResponse<any>>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to update transaction');
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const supplierCustomers = computed(() => {
    return customers.value.filter(customer => customer.type === 'supplier');
  });

  const regularCustomers = computed(() => {
    return customers.value.filter(customer => customer.type === 'customer');
  });

  return {
    // State
    loading,
    list,
    pagination,
    transactions,
    warehouses,
    customers,
    selectedItems,
    transactionForm,

    // Actions
    fetchBranchWarehouses,
    fetchCustomers,
    fetchTransactionList,
    fetchSingleTransaction,
    createTransaction,
    createNewTransaction,
    updateTransaction,
    addSelectedItem,
    removeSelectedItem,
    updateSelectedItemQuantity,
    updateSelectedItemPrice,
    resetForm,
    paySupplier,
    receiveFromCustomer,
    refundTransaction,
    feedingTransaction,
    searchItems,

    // Computed
    totalAmount,
    supplierCustomers,
    regularCustomers
  };
});
