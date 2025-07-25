import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Customer, CustomerPayload, Pagination } from 'src/types/customer';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([]);
  const currentCustomer = ref<Customer | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchCustomers(page: number = 1, type?: 'supplier' | 'customer') {
    loading.value = true;
    error.value = null;
    let parameter = page ? '?page=' + page : '?page=1';
    if (type) {
      parameter += `&type=${type}`;
    }

    try {
      const { data } = await api.get<ApiResponse<Customer[]>>(`${endPoints.customer.list}${parameter}&paginate=true&relations=location`);
      customers.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
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

  async function createCustomer(customerData: CustomerPayload) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Customer>>(endPoints.customer.create, customerData);

      // Refresh the customer list after creation
      await fetchCustomers();

      showNotify({
        type: 'positive',
        message: data?.message || 'Customer created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
        // Handle validation errors
        const responseData = err.response.data as { message?: string, errors?: Record<string, string[]> };
        let errorMessage = responseData.message || 'Failed to create customer';

        // Display specific validation errors if available
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .map(messages => messages[0])
            .join(', ');

          if (errorMessages) {
            errorMessage = errorMessages;
          }
        }

        error.value = errorMessage;
        showNotify({
          type: 'negative',
          message: error.value,
          position: 'top',
          duration: 3000,
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
        error.value = errorMessage;
        showNotify({
          type: 'negative',
          message: error.value,
          position: 'top',
          duration: 3000,
        });
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function getCustomerDetails(customerId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Customer>>(endPoints.customer.details(customerId));
      currentCustomer.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer details';
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

  async function updateCustomer(customerId: string, customerData: CustomerPayload) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<Customer>>(
        endPoints.customer.update(customerId),
        customerData
      );

      // Update the customer in the list
      const index = customers.value.findIndex(customer => customer.id === Number(customerId));
      if (index !== -1) {
        customers.value[index] = data.data;
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Customer updated successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && typeof err.response === 'object' && err.response && 'data' in err.response) {
        // Handle validation errors
        const responseData = err.response.data as { message?: string, errors?: Record<string, string[]> };
        let errorMessage = responseData.message || 'Failed to update customer';

        // Display specific validation errors if available
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .map(messages => messages[0])
            .join(', ');

          if (errorMessages) {
            errorMessage = errorMessages;
          }
        }

        error.value = errorMessage;
        showNotify({
          type: 'negative',
          message: error.value,
          position: 'top',
          duration: 3000,
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
        error.value = errorMessage;
        showNotify({
          type: 'negative',
          message: error.value,
          position: 'top',
          duration: 3000,
        });
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function createCustomerAccount(customerId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<{
        user: {
          id: number;
          name: string;
          username: string;

     };
           password: string;
        customer: Customer;
      }>>(endPoints.customer.createAccount(customerId));

      showNotify({
        type: 'positive',
        message: data?.message || 'Customer account created successfully',
        position: 'top',
        duration: 3000,
      });
      return data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer account';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function searchCustomers(searchQuery: string, type?: 'supplier' | 'customer'): Promise<Customer[]> {
    loading.value = true;
    error.value = null;

    try {
      let parameter = `?query=${searchQuery}`;
      if (type) {
        parameter += `&type=${type}`;
      }

      const { data } = await api.get<ApiResponse<Customer[]>>(`${endPoints.customer.list}${parameter}`);
      return data.data || [];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search customers';
      error.value = errorMessage;
      console.error('Error searching customers:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  return {
    customers,
    currentCustomer,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    getCustomerDetails,
    updateCustomer,
    createCustomerAccount,
    searchCustomers
  };
});
