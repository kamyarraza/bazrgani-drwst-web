import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { AdminForm, Pagination } from 'src/types/admin';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useAdminStore = defineStore('admin', () => {
  const admins = ref<AdminForm[]>([]);
  const currentAdmin = ref<AdminForm | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchAdmins(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? 'page=' + page : '';

    try {
      const { data } = await api.get<ApiResponse<AdminForm[]>>(`${endPoints.admin.list}?${parameter}&paginate=true`);
      admins.value = data.data;

      pagination.value = data.pagination || null;


    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch admins';
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

  async function searchAdmins(searchQuery: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<AdminForm[]>>(
        `${endPoints.admin.list}?query=${encodeURIComponent(searchQuery)}`
      );
      admins.value = data.data;
      // Clear pagination when searching since we're not using paginated search
      pagination.value = null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search admins';
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

  async function createAdmin(adminData: AdminForm | FormData) {
    loading.value = true;
    error.value = null;

    try {
      let response;
      // If adminData is FormData (for file upload), use POST with FormData
      if (adminData instanceof FormData) {
        response = await api.post<ApiResponse<AdminForm>>(
          endPoints.admin.create,
          adminData
          // Do NOT set Content-Type, let browser handle it for FormData
        );
      } else {
        // Normal create (no file upload)
        response = await api.post<ApiResponse<AdminForm>>(
          endPoints.admin.create,
          adminData
        );
      }

      const { data } = response;
      admins.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Admin created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create admin';
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

  async function getAdminDetails(adminId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<AdminForm>>(endPoints.admin.details(adminId));
      currentAdmin.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch admin details';
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

  async function updateAdmin(adminId: string, adminData: Partial<AdminForm> | FormData) {
    loading.value = true;
    error.value = null;

    try {
      let response;
      // If adminData is FormData (for file upload), use POST + _method=PUT
      if (adminData instanceof FormData) {
        adminData.append('_method', 'PUT');
        response = await api.post<ApiResponse<AdminForm>>(
          endPoints.admin.update(adminId),
          adminData
          // Do NOT set Content-Type, let browser handle it
        );
      } else {
        // Normal update (no file upload)
        response = await api.put<ApiResponse<AdminForm>>(
          endPoints.admin.update(adminId),
          adminData
        );
      }
      const { data } = response;
      // Update the local admin data
      const index = admins.value.findIndex(admin => admin.id === adminId);
      if (index !== -1) {
        admins.value[index] = data.data;
      }
      showNotify({
        type: 'positive',
        message: data?.message || 'Admin updated successfully',
        position: 'top',
        duration: 3000,
      });
      // Refresh the admin list to get updated data
      await fetchAdmins();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update admin';
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
    admins,
    currentAdmin,
    loading,
    error,
    pagination,
    fetchAdmins,
    createAdmin,
    getAdminDetails,
    updateAdmin,
    searchAdmins
  };
});
