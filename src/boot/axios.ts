// src/boot/axios.ts
import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/authStore';
import { type ApiResponse } from 'src/types/index';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Create the Axios instance that will be used throughout the app
const api = axios.create({
    //  baseURL: 'https://dev-warehouse-api.bazrganidrwst.com/api',
     baseURL: 'https://warehouse-api.bazrganidrwst.com/api',

  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Accept-Language': localStorage.getItem('locale') || 'ckb',
  },
});


// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Accept-Language header based on current locale
    const savedLocale = localStorage.getItem('locale') || 'ckb';
    config.headers['Accept-Language'] = savedLocale;

    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// RESPONSE INTERCEPTOR
let isLoggingOut = false; // Flag to prevent multiple logout attempts
let isRefreshing = false; // Prevent multiple refresh attempts
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response, // Let the caller handle success
  async (error) => {
    const { response } = error;
    let message = 'Unknown error';
    const authStore = useAuthStore();

    if (response) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as ApiResponse<any>;
      message = apiResponse?.message || 'An error occurred';

      // Handle authentication errors (401, 403) or unauthenticated messages
      const isDeviceRevocationRequest = error.config?.url?.includes('/revoke-token');
      const isAuthError =
        !isDeviceRevocationRequest &&
        (
          response.status === 401 ||
          apiResponse?.message?.toLowerCase().includes('Unauthenticated.') ||
          apiResponse?.message?.toLowerCase().includes('unauthorized') ||
          apiResponse?.message?.toLowerCase().includes('token') ||
          apiResponse?.message?.toLowerCase().includes('expired')
        );

      if (isAuthError) {
        // Try refresh token logic
        const refreshToken = authStore.refreshToken;
        if (refreshToken && !isLoggingOut && !isRefreshing) {
          isRefreshing = true;
          try {
            const { data } = await api.post('/refresh', { refresh_token: refreshToken });
            if (data && data.status === 'success' && data.data.token && data.data.refresh_token) {
              console.log('data', data,'and',data.data);
              authStore.updateTokens(data.data.token, data.data.refresh_token);
              isRefreshing = false;
              onRefreshed();
              // Instead of reloading, retry the original request
              return api(error.config);
            } else {
              // Refresh failed, logout
              await authStore.logout();
              isRefreshing = false;
              if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
              }
              return Promise.reject(new Error('Session expired. Please login again.'));
            }
          } catch (refreshError) {
            await authStore.logout();
            isRefreshing = false;
            if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(new Error('Session expired. Please login again.'));
          }
        } else if (!refreshToken) {
          // No refresh token, logout
          if (!authStore.isLoggedOut && authStore.token && !isLoggingOut) {
            isLoggingOut = true;
            try {
              await authStore.logout();
            } catch (logoutError) {
              console.error('Error during logout:', logoutError);
            } finally {
              isLoggingOut = false;
            }
            if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
              window.location.href = '/auth/login';
            }
          }
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          refreshSubscribers.push(() => {
            // After refresh, retry original request
            resolve(api(error.config));
          });
        });
      }

      // Handle maintenance mode (503 Service Unavailable)
      if (response.status === 503) {
        // Redirect to maintenance page using window.location for immediate redirect
        if (typeof window !== 'undefined' && window.location.pathname !== '/maintenance') {
          window.location.href = '/maintenance';
        }
        message = 'Server is under maintenance. Please try again later.';
      }

      // Show notification for all error responses except auth errors (handled by logout)
      if (!(response.status === 401 || response.status === 403 ||
            apiResponse?.message?.toLowerCase().includes('unauthenticated') ||
            apiResponse?.message?.toLowerCase().includes('unauthorized'))) {
        void Notify.create({
          type: 'negative',
          message
        });
      }
    } else {
      message = 'Network error: Please check your internet connection';
      void Notify.create({
        type: 'negative',
        message
      });
    }

    return Promise.reject(new Error(message));
  }
);

// Inject into Vue
export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
