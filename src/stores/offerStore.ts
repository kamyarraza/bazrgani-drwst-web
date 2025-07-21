import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { OfferResponse, OfferPost } from 'src/types/offer';
import type { ApiResponse } from 'src/types';
import type { Pagination } from 'src/types/admin';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useOfferStore = defineStore('offer', () => {
  const offers = ref<OfferResponse[]>([]);
  const currentOffer = ref<OfferResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination | null>(null);

  async function fetchOffers(page: number = 1, perPage: number = 25) {
    loading.value = true;
    error.value = null;
    const parameters: string[] = [];
    if (page) parameters.push(`page=${page}`);
    if (perPage) parameters.push(`per_page=${perPage}`);
    const queryString = parameters.length > 0 ? `?${parameters.join('&')}&paginate=true&relations=customer,items` : '?paginate=true&relations=customer,items';

    try {
      const { data } = await api.get<ApiResponse<OfferResponse[]>>(`${endPoints.offer.list}${queryString}`);
      offers.value = data.data;
      pagination.value = data.pagination || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offers';
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

  async function createOffer(offerData: OfferPost) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post<ApiResponse<OfferResponse>>(endPoints.offer.create, offerData);
      offers.value.push(data.data);
      showNotify({
        type: 'positive',
        message: data?.message || 'Offer created successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create offer';
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

  async function getOfferDetails(offerId: string | number) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiResponse<OfferResponse>>(endPoints.offer.details(offerId));
      currentOffer.value = data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offer details';
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

  async function updateOffer(offerId: string | number, offerData: Partial<OfferPost>) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.put<ApiResponse<OfferResponse>>(
        endPoints.offer.update(offerId),
        offerData
      );

      // Update the local offer data
      const index = offers.value.findIndex(offer => offer.id === Number(offerId));
      if (index !== -1) {
        offers.value[index] = data.data;
      }

      showNotify({
        type: 'positive',
        message: data?.message || 'Offer updated successfully',
        position: 'top',
        duration: 3000,
      });

      // Refresh the offer list to get updated data
      await fetchOffers();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update offer';
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

  async function changeOfferStatus(offerId: string | number, status: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.patch<ApiResponse<OfferResponse>>(
        endPoints.offer.changeStatus(offerId, status)
      );

      // Update the local offer data
      const index = offers.value.findIndex(offer => offer.id === Number(offerId));
      if (index !== -1) {
        offers.value[index] = data.data;
      }

      showNotify({
        type: 'positive',
        message: data?.message || `Offer status changed to ${status} successfully`,
        position: 'top',
        duration: 3000,
      });

      // Refresh the offer list to get updated data
      await fetchOffers();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change offer status';
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
    offers,
    currentOffer,
    loading,
    error,
    pagination,
    fetchOffers,
    createOffer,
    getOfferDetails,
    updateOffer,
    changeOfferStatus
  };
});
