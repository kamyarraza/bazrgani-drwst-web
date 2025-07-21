import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Employee, Pagination, ApiResponse } from 'src/types/employee';
import type { Branch } from 'src/types/branch';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([]);
  const currentEmployee = ref<Employee | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchEmployees(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? '&page=' + page : '';

    try {
      const { data } = await api.get<ApiResponse<Employee[]>>(`${endPoints.employee.list}?relations=branch${parameter}&paginate=true`);
      employees.value = data.data;

      pagination.value = data.pagination || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
      message: errorMessage,
        position: 'top',
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  async function createEmployee(employeeData: Employee) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Employee>>(endPoints.employee.create, employeeData);
      employees.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Employee created successfully',
        position: 'top',
        duration: 3000,
      });
      return data.data;
    } catch (err) {
      let errorMessage = 'Failed to create employee';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err && err.response) {

        errorMessage = err.response.data?.message || errorMessage;
      }
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  async function fetchEmployee(id: string | number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Employee>>(`${endPoints.employee.details(id)}?relations=branch`);
      currentEmployee.value = data.data;
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employee';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  async function updateEmployee(employeeId: string | number, employeeData: Partial<Employee> | FormData) {
    loading.value = true;
    error.value = null;

    try {
      let response;
      // If employeeData is FormData (for file upload), use POST + _method=PUT
      if (employeeData instanceof FormData) {
        employeeData.append('_method', 'PUT');
        response = await api.post<ApiResponse<Employee>>(
          endPoints.employee.update(employeeId),
          employeeData
          // Do NOT set Content-Type, let browser handle it
        );
      } else {
        // Normal update (no file upload)
        response = await api.put<ApiResponse<Employee>>(
          endPoints.employee.update(employeeId),
          employeeData
        );
      }

      const { data } = response;
      const index = employees.value.findIndex(emp => emp.id === employeeId);
      if (index !== -1) {
        employees.value[index] = data.data;
      }
      showNotify({
        type: 'positive',
        message: data?.message || 'Employee updated successfully',
        position: 'top',
        duration: 3000,
      });
      // Refresh the employee list to get updated data
      await fetchEmployees();
      return true;
    } catch (err) {
      let errorMessage = 'Failed to update employee';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err && err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function searchBranches(query: string = ''): Promise<Branch[]> {
    try {
      const searchParam = query ? `&query=${encodeURIComponent(query)}` : '';
      const { data } = await api.get(`${endPoints.branch.list}?${searchParam}`);
      return data.data || [];
    } catch (err) {
      console.error('Failed to search branches:', err);
      return [];
    }
  }

  return {
    employees,
    currentEmployee,
    loading,
    error,
    pagination,
    fetchEmployees,
    createEmployee,
    fetchEmployee,
    updateEmployee,
    searchBranches
  };
});
