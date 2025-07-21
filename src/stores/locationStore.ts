import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { Location, Pagination } from 'src/types/Location';
import type { ApiResponse } from 'src/types';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useLocationStore = defineStore('location', () => {
  const locations = ref<Location[]>([]);
  const currentLocation = ref<Location | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchLocations(page: number = 1) {
    loading.value = true;
    error.value = null;
    const parameter = page ? '?page=' + page : '';

    try {
      const { data } = await api.get<ApiResponse<Location[]>>(`${endPoints.locations.list}${parameter}&paginate=true`);
      locations.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch locations';
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

  async function createLocation(locationData: Partial<Location>) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<Location>>(endPoints.locations.create, locationData);
      locations.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Location created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create location';
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

  async function getLocationDetails(locationId: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<Location>>(endPoints.locations.details(locationId));
      currentLocation.value = data.data;
      return data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch location details';
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

  async function updateLocation(locationId: string, locationData: Partial<Location> | FormData) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<Location>>(endPoints.locations.update(locationId), locationData);

      // Update the location in the list if it exists
      const index = locations.value.findIndex(loc => loc.id === Number(locationId));
      if (index !== -1) {
        locations.value[index] = { ...locations.value[index], ...data.data };
      }

      // Also update currentLocation if it's the same location
      if (currentLocation.value && currentLocation.value.id === Number(locationId)) {
        currentLocation.value = { ...currentLocation.value, ...data.data };
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Location updated successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
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
    locations,
    currentLocation,
    loading,
    error,
    pagination,
    fetchLocations,
    createLocation,
    getLocationDetails,
    updateLocation
  };
});
