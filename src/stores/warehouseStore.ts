import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";
import { endPoints } from "src/endpoint";
import type {
  Warehouse,
  ApiResponse,
  BranchWithWarehouses,
  StockMovement,
  Pagination,
  WarehouseCreate,
} from "src/types/warehouse";
import type { WarehouseWithItems } from "src/types/warehouse_item";
import { showNotify } from "src/composables/Notify";

export const useWarehouseStore = defineStore("warehouse", () => {
  // State
  const warehouses = ref<Warehouse[]>([]);
  const branchWarehouses = ref<BranchWithWarehouses | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);
  const selectedBranchId = ref<number | null>(null);

  // Warehouse Items State
  const warehouseItems = ref<WarehouseWithItems | null>(null);
  const selectedWarehouseId = ref<number | null>(null);

  // Stock movements
  const stockMovements = ref<StockMovement[]>([]);

  // Actions
  async function fetchWarehouses(page = 1, perPage = 10) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Warehouse[]>>(
        `${endPoints.warehouse.list}?page=${page}&per_page=${perPage}`
      );

      if (data.status === "success") {
        warehouses.value = data.data;
        pagination.value = data.pagination || null;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to fetch warehouses",
          position: "top",
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = "Failed to fetch warehouses";
      console.error("Error fetching warehouses:", err);
      showNotify({
        type: "negative",
        message: "Failed to fetch warehouses",
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }
  async function fetchBranchWarehouses(
    branchId: number,
    page = 1,
    perPage = 10
  ) {
    loading.value = true;
    error.value = null;
    selectedBranchId.value = branchId;

    try {
      const { data } = await api.get<ApiResponse<BranchWithWarehouses>>(
        `${endPoints.branchWarehouses(
          branchId
        )}?page=${page}&per_page=${perPage}&paginate=true`
      );

      if (data.status === "success") {
        branchWarehouses.value = data.data;
        pagination.value = data.pagination || null;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to fetch branch warehouses",
          position: "top",
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = "Failed to fetch branch warehouses";
      console.error("Error fetching branch warehouses:", err);
      showNotify({
        type: "negative",
        message: "Failed to fetch branch warehouses",
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }
  async function toggleWarehouseActive(warehouseId: number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<Warehouse>>(
        endPoints.warehouse.toggleActive(warehouseId)
      );

      if (data.status === "success") {
        // If we have the branch warehouses loaded, update the status in the local data
        if (branchWarehouses.value && branchWarehouses.value.warehouses) {
          const warehouse = branchWarehouses.value.warehouses.find(
            (w) => w.id === warehouseId
          );
          if (warehouse) {
            warehouse.is_active = !warehouse.is_active;
          }
        }

        showNotify({
          type: "positive",
          message: data.message || "Warehouse status updated successfully",
          position: "top",
          duration: 3000,
        });

        return true;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to toggle warehouse status",
          position: "top",
          duration: 3000,
        });
        return false;
      }
    } catch (err: unknown) {
      error.value = "Failed to toggle warehouse status";
      console.error("Error toggling warehouse status:", err);
      showNotify({
        type: "negative",
        message: "Failed to toggle warehouse status",
        position: "top",
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStockMovements(
    warehouseId: number,
    page = 1,
  ) {
    loading.value = true;
    error.value = null;
    selectedBranchId.value = warehouseId;

    try {
      const { data } = await api.get<ApiResponse<StockMovement[]>>(
        `${endPoints.warehouseStockMovements(
          warehouseId
        )}?page=${page}`
      );

      if (data.status === "success") {
        stockMovements.value = data.data;
        pagination.value = data.pagination || null;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to fetch stock movements",
          position: "top",
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = "Failed to fetch stock movements"
      console.error("Error fetching stock movements", err);
      showNotify({
        type: "negative",
        message: "Failed to fetch stock movements",
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  // Warehouse Item Actions

  /**
   * Fetches all items in a specific warehouse
   */
  async function fetchWarehouseItems(
    warehouseId: number,
    page = 1,
    query?: string,
    category_id?: number
  ) {
    loading.value = true;
    error.value = null;
    selectedWarehouseId.value = warehouseId;

    try {
      let url = `${endPoints.specialwarehouseItems(warehouseId)}?page=${page}`;

      if (query) {
        url += `&query=${encodeURIComponent(query)}`;
      }

      if (category_id) {
        url += `&category_id=${category_id}`;
      }

      const { data } = await api.get<ApiResponse<any[]>>(url);

      if (data.status === "success") {
        warehouseItems.value = {
          id: warehouseId,
          items: data.data,
        };
        pagination.value = data.pagination || null;

        console.log(data, warehouseItems.value);
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to fetch warehouse items",
          position: "top",
          duration: 3000,
        });
      }
    } catch (err) {
      error.value = "Failed to fetch warehouse items";
      console.error("Error fetching warehouse items:", err);
      showNotify({
        type: "negative",
        message: "Failed to fetch warehouse items",
        position: "top",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  async function createWarehouse(warehouseData: WarehouseCreate) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Warehouse>>(
        endPoints.warehouse.create,
        warehouseData
      );

      if (data.status === "success") {
        // If we have the branch warehouses loaded, refresh them
        if (selectedBranchId.value) {
          void fetchBranchWarehouses(selectedBranchId.value);
        }

        showNotify({
          type: "positive",
          message: data.message || "Warehouse created successfully",
          position: "top",
          duration: 3000,
        });

        return true;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to create warehouse",
          position: "top",
          duration: 3000,
        });
        return false;
      }
    } catch (err: unknown) {
      error.value = "Failed to create warehouse";
      console.error("Error creating warehouse:", err);
      showNotify({
        type: "negative",
        message: "Failed to create warehouse",
        position: "top",
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updateWarehouse(
    warehouseId: number,
    warehouseData: Partial<WarehouseCreate>
  ) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<Warehouse>>(
        endPoints.warehouse.update(warehouseId),
        warehouseData
      );

      if (data.status === "success") {
        // If we have the branch warehouses loaded, refresh them
        if (selectedBranchId.value) {
          void fetchBranchWarehouses(selectedBranchId.value);
        }

        showNotify({
          type: "positive",
          message: data.message || "Warehouse updated successfully",
          position: "top",
          duration: 3000,
        });

        return true;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to update warehouse",
          position: "top",
          duration: 3000,
        });
        return false;
      }
    } catch (err: unknown) {
      error.value = "Failed to update warehouse";
      console.error("Error updating warehouse:", err);
      showNotify({
        type: "negative",
        message: "Failed to update warehouse",
        position: "top",
        duration: 3000,
      });
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Searches blum items in a specific warehouse with query
   */
  async function searchWarehouseBlumItems(
    warehouseId: number,
    query = "",
    page = 1,
    perPage = 10
  ) {
    loading.value = true;
    error.value = null;
    selectedWarehouseId.value = warehouseId;

    try {
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : "";
      const { data } = await api.get<ApiResponse<WarehouseWithItems>>(
        `${endPoints.specialwarehouseItems(
          warehouseId
        )}?relations=blum_items&page=${page}&per_page=${perPage}${queryParam}`
      );

      if (data.status === "success") {
        warehouseItems.value = data.data;
        pagination.value = data.pagination || null;
        return data.data;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to search warehouse blum items",
          position: "top",
          duration: 3000,
        });
        return null;
      }
    } catch (err) {
      error.value = "Failed to search warehouse blum items";
      console.error("Error searching warehouse blum items:", err);
      showNotify({
        type: "negative",
        message: "Failed to search warehouse blum items",
        position: "top",
        duration: 3000,
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Searches blum sets in a specific warehouse with query
   */
  async function searchWarehouseBlumSets(
    warehouseId: number,
    query = "",
    page = 1,
    perPage = 10
  ) {
    loading.value = true;
    error.value = null;
    selectedWarehouseId.value = warehouseId;

    try {
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : "";
      const { data } = await api.get<ApiResponse<WarehouseWithItems>>(
        `${endPoints.specialwarehouseItems(
          warehouseId
        )}?relations=blum_sets&page=${page}&per_page=${perPage}${queryParam}`
      );

      if (data.status === "success") {
        warehouseItems.value = data.data;
        pagination.value = data.pagination || null;
        return data.data;
      } else {
        error.value = data.message;
        showNotify({
          type: "negative",
          message: data.message || "Failed to search warehouse blum sets",
          position: "top",
          duration: 3000,
        });
        return null;
      }
    } catch (err) {
      error.value = "Failed to search warehouse blum sets";
      console.error("Error searching warehouse blum sets:", err);
      showNotify({
        type: "negative",
        message: "Failed to search warehouse blum sets",
        position: "top",
        duration: 3000,
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Reset store state
  function reset() {
    warehouses.value = [];
    branchWarehouses.value = null;
    loading.value = false;
    error.value = null;
    pagination.value = null;
    selectedBranchId.value = null;
    warehouseItems.value = null;
    selectedWarehouseId.value = null;
  }

  return {
    // State
    warehouses,
    branchWarehouses,
    loading,
    error,
    pagination,
    selectedBranchId,
    warehouseItems,
    selectedWarehouseId,
    stockMovements,

    // Actions
    fetchWarehouses,
    fetchBranchWarehouses,
    toggleWarehouseActive,
    fetchWarehouseItems,
    fetchStockMovements,
    createWarehouse,
    updateWarehouse,
    searchWarehouseBlumItems,
    searchWarehouseBlumSets,
    reset,
  };
});
