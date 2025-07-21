import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Branch, BranchUpdatePayload, Pagination, ApiResponse } from 'src/types/branch';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useBranchStore = defineStore('branch', () => {
  const branches = ref<Branch[]>([]);
  const currentBranch = ref<Branch | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchBranches(page: number = 1) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Branch[]>>(`${endPoints.branch.list}?page=${page}&paginate=true&relations=warehouses,location`);
      branches.value = data.data;

      pagination.value = data.pagination || null;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branches';
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

  async function createBranch(branchData: Partial<Branch> | FormData) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Branch>>(endPoints.branch.create, branchData);

      showNotify({
        type: 'positive',
        message: data?.message || 'Branch created successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the branch list to get updated data
      await fetchBranches(pagination.value?.current_page || 1);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create branch';
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

  async function getBranchDetails(branchId: string | number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Branch>>(endPoints.branch.details(branchId));
      currentBranch.value = data.data;
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch branch details';
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

  async function updateBranch(branchId: string | number, branchData: BranchUpdatePayload | FormData) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<Branch>>(
        endPoints.branch.update(branchId),
        branchData,
      );

      showNotify({
        type: 'positive',
        message: data?.message || 'Branch updated successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the branch list to get updated data
      await fetchBranches(pagination.value?.current_page || 1);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update branch';
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

  async function toggleBranchActive(branchId: string | number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<Branch>>(
        endPoints.branch.toggleActive(branchId)
      );

      // Update the local branch data
      const index = branches.value.findIndex(branch => branch.id === Number(branchId));
      if (index !== -1 && branches.value[index]) {
        branches.value[index].is_active = !branches.value[index].is_active;
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Branch status updated successfully',
        position: 'top',
        duration: 3000,
      });

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle branch status';
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

  async function searchBranches(query: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Branch[]>>(`${endPoints.branch.list}?query=${encodeURIComponent(query)}&relations=warehouses,location`);
      return data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search branches';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: error.value,
        position: 'top',
        duration: 3000,
      });
      return [];
    } finally {
      loading.value = false;
    }
  }

  return {
    branches,
    currentBranch,
    loading,
    error,
    pagination,
    fetchBranches,
    createBranch,
    getBranchDetails,
    updateBranch,
    toggleBranchActive,
    searchBranches,
  };
});
