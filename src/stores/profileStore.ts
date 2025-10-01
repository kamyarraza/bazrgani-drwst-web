import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';
import type { ApiResponse, UserData, UpdateProfileRequest, AuthenticatedDevice, ChangePasswordRequest } from 'src/types/auth';

export const useProfileStore = defineStore('profileStore', () => {
  const userProfile = ref<UserData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authenticatedDevices = ref<AuthenticatedDevice[]>([]);
  const profileImageUrl = ref<string | null>(null);

  const fetchUserProfile = async (force = false, errorMessage = 'وەرگرتنی داتای کەسی شکستی هێنا !') => {
    // Prevent duplicate API calls if data is already being loaded, unless forced
    if (loading.value || (!force && userProfile.value)) {
      return userProfile.value;
    }

    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ApiResponse<UserData>>(endPoints.home.me);
      userProfile.value = data.data;
      return data.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      error.value = errorMsg;
      showNotify({
        type: 'negative',
        message: errorMsg,
        position: 'top',
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (profileData: UpdateProfileRequest, successMessage = 'زانیاری پڕۆفایل بە سەرکەوتوویی نوێکرایەوە', errorMessage = 'نوێکردنەوەی زانیاری پڕۆفایل شکستی هێنا') => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.put<ApiResponse<UserData>>(endPoints.home.updateProfile, profileData);
      userProfile.value = data.data;
      showNotify({
        type: 'positive',
        message: successMessage,
        position: 'top',
        duration: 3000,
      });
      return data.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      error.value = errorMsg;
      showNotify({
        type: 'negative',
        message: errorMsg,
        position: 'top',
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest, successMessage = 'ووشەی تێپەڕبوون بە سەرکەوتوویی گۆڕدرا', errorMessage = 'گۆڕینی ووشەی تێپەڕبوون شکستی هێنا') => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<ApiResponse<Record<string, unknown>>>(endPoints.home.changePassword, {...passwordData
        ,
        logout_others:true
      });
      showNotify({
        type: 'positive',
        message: successMessage,
        position: 'top',
        duration: 3000,
      });
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      error.value = errorMsg;
      showNotify({
        type: 'negative',
        message: errorMsg,
        position: 'top',
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProfileImage = async (formData: FormData, successMessage = 'گۆڕینی وێنەی پڕۆفایل سەرکەوتوو بوو', errorMessage = 'گۆڕینی وێنەی پڕۆفایل شکستی هێنا') => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<ApiResponse<UserData>>(
        endPoints.home.changeProfileImage,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      userProfile.value = data.data;
      profileImageUrl.value = data.data.image || null;
      showNotify({
        type: 'positive',
        message: successMessage,
        position: 'top',
        duration: 3000,
      });
      return data.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      error.value = errorMsg;
      showNotify({
        type: 'negative',
        message: errorMsg,
        position: 'top',
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAuthenticatedDevices = async (errorMessage = 'Failed to fetch authenticated devices') => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ApiResponse<AuthenticatedDevice[]>>(endPoints.home.authenticatedDevices);
      authenticatedDevices.value = data as unknown as AuthenticatedDevice[];
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      error.value = errorMsg;
      showNotify({
        type: 'negative',
        message: errorMsg,
        position: 'top',
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const revokeDevice = async (deviceId: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Use DELETE with token_id in body instead of URL parameter
      const response = await api.delete(endPoints.home.revokeToken, {
        data: {
          token_id: deviceId
        }
      });

      // Only proceed if we get a successful response
      if (response.status === 200 || response.status === 201) {
        // Remove the device from our local list
        authenticatedDevices.value = authenticatedDevices.value.filter(device => device.id !== deviceId);

        showNotify({
          type: 'positive',
          message: 'Device access revoked successfully',
          position: 'top',
          duration: 3000,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke device access';
      error.value = errorMessage;

      // Only show error notification if it's not an auth-related error
      // (to prevent confusion when device revocation succeeds but has auth-related response)
      if (!errorMessage.toLowerCase().includes('unauthenticated') &&
          !errorMessage.toLowerCase().includes('unauthorized')) {
        showNotify({
          type: 'negative',
          message: errorMessage,
          position: 'top',
          duration: 3000,
        });
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logoutAllDevices = async () => {
    loading.value = true;
    error.value = null;
    try {
      await api.post(endPoints.auth.logoutAll);
      // Optionally clear devices list
      authenticatedDevices.value = [];
      showNotify({
        type: 'positive',
        message: 'بە سەرکەوتوویی لە هەموو ئامێرەکان چوویتەدەرەوە',
        position: 'top',
        duration: 3000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout from all devices';
      error.value = errorMessage;
      showNotify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        duration: 3000,
      });
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setUserData = (userData: UserData) => {
    userProfile.value = userData;
  };

  const resetProfile = () => {
    userProfile.value = null;
    error.value = null;
    authenticatedDevices.value = [];
    profileImageUrl.value = null;
  };

  return {
    userProfile,
    loading,
    error,
    authenticatedDevices,
    profileImageUrl,
    fetchUserProfile,
    updateProfile,
    changePassword,
    updateProfileImage,
    fetchAuthenticatedDevices,
    revokeDevice,
    logoutAllDevices,
    resetProfile,
    setUserData
  };
});
