import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { ApiResponse, UserData, StickyNote } from 'src/types/auth';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';

export const useMeStore = defineStore('meStore', () => {
  const me = ref<UserData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMe = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ApiResponse<UserData>>(endPoints.home.me);
      me.value = data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user info';
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
  };

  const createStickyNote = async (content: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post<ApiResponse<StickyNote>>(endPoints.stickyNote.create, { content });
     // refresh user data after creating note
      showNotify({
        type: 'positive',
        message: 'Note saved successfully',
        position: 'top',
        duration: 3000,
      });

      return response; // return the full response with data.data containing the note
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save note';
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
  };

  const updateStickyNote = async (noteId: string, content: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.put<ApiResponse<StickyNote>>(
        endPoints.stickyNote.update(noteId),
        { content }
      );
      await fetchMe(); // always refresh after update
      showNotify({
        type: 'positive',
        message: 'Note updated successfully',
        position: 'top',
        duration: 3000,
      });
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
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
  };

  const deleteStickyNote = async (noteId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(endPoints.stickyNote.delete(noteId));
      await fetchMe(); // always refresh after delete
      showNotify({
        type: 'positive',
        message: 'Note deleted successfully',
        position: 'top',
        duration: 3000,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
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
  };

  const setUserData = (userData: UserData) => {
    me.value = userData;
  };

  const resetMe = () => {
    me.value = null;
    error.value = null;
  };

  return {
    me,
    loading,
    error,
    fetchMe,
    createStickyNote,
    updateStickyNote,
    deleteStickyNote,
    resetMe,
    setUserData
  };
});
