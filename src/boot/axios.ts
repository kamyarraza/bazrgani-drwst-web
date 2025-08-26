// src/boot/axios.ts
import { defineBoot } from "#q-app/wrappers";
import axios, { type AxiosInstance } from "axios";
import { Notify } from "quasar";
import { useAuthStore } from "src/stores/authStore";
import { type ApiResponse } from "src/types/index";

declare module "vue" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Create the Axios instance that will be used throughout the app
const api = axios.create({
  // baseURL: "https://dev-warehouse-api.bazrganidrwst.com/api",
  // baseURL: "https://warehouse-api.bazrganidrwst.com/api",
  baseURL: "http://localhost:4000/api",

  // baseURL: import.meta.env.VITE_API_URL,

  withCredentials: true,
  timeout: 7000, // 7 seconds timeout for all requests mr kamyar you needed only this line
  headers: {
    Accept: "application/json",
    "Accept-Language": localStorage.getItem("locale") || "ckb",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // Load the auth store to get the token
    const authStore = useAuthStore();
    const token = authStore.token;

    // Authentication token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Accept-Language header based on current locale
    const savedLocale = localStorage.getItem("locale") || "ckb";
    config.headers["Accept-Language"] = savedLocale;

    return config;
  },
  (error) => {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
);

// RESPONSE INTERCEPTOR
let isLoggingOut = false; // Flag to prevent multiple logout attempts
let isRefreshing = false; // Prevent multiple refresh attempts
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

async function logoutAndRedirect(authStore) {
  await authStore.logout();
  isRefreshing = false;
  if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/auth/login"
  ) {
    window.location.href = "/auth/login";
  }
  return Promise.reject(new Error("Session expired. Please login again."));
}

api.interceptors.response.use(
  (response) => response, // Let the caller handle success
  async (error) => {
    const { response } = error;
    let message = "Unknown error";
    const authStore = useAuthStore();

    if (response) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as ApiResponse<any>;
      message = apiResponse?.message || "An error occurred";

      // Handle authentication errors (401, 403) or unauthenticated messages
      const isDeviceRevocationRequest =
        error.config?.url?.includes("/revoke-token");
      const isAuthError =
        !isDeviceRevocationRequest &&
        (response.status === 401 ||
          apiResponse?.message?.toLowerCase().includes("unauthenticated.") ||
          apiResponse?.message?.toLowerCase().includes("unauthorized") ||
          apiResponse?.message?.toLowerCase().includes("token") ||
          apiResponse?.message?.toLowerCase().includes("expired"));

      // Check if this is a refresh token error
      const isRefreshTokenError = error.config?.url?.includes("/refresh");

      if (isAuthError) {
        if (isRefreshTokenError) {
          return logoutAndRedirect(authStore);
        }

        // Try refresh token logic
        const refreshToken = authStore.refreshToken;
        if (refreshToken && !isLoggingOut && !isRefreshing) {
          isRefreshing = true;
          try {
            const { data } = await api.post("/refresh", {
              refresh_token: refreshToken,
            });

            if (
              data &&
              data.status === "success" &&
              data.data.token &&
              data.data.refresh_token
            ) {
              if (import.meta.env.VITE_APP_ENV == "local") {
                console.log("data", data, "and", data.data);
              }
              authStore.updateTokens(data.data.token, data.data.refresh_token);
              isRefreshing = false;
              onRefreshed();
              // Instead of reloading, retry the original request
              return api(error.config);
            } else {
              // Refresh failed, logout
              return logoutAndRedirect(authStore);
            }
          } catch {
            return logoutAndRedirect(authStore);
          }
        } else if (!refreshToken) {
          // No refresh token, logout
          if (!authStore.isLoggedOut && authStore.token && !isLoggingOut) {
            isLoggingOut = true;
            await logoutAndRedirect(authStore);
          }
          return Promise.reject(
            new Error("Session expired. Please login again.")
          );
        }
        // If already refreshing, queue the request
        return new Promise((resolve) => {
          refreshSubscribers.push(() => {
            // After refresh, retry original request
            resolve(api(error.config));
          });
        });
      }

      // Handle maintenance mode (503 Service Unavailable)
      if (response.status === 503) {
        console.log("503 Error detected - redirecting to maintenance page");

        // Clear any loading states that might prevent redirect
        const authStore = useAuthStore();
        authStore.loading = false;

        // Set maintenance mode flag
        if (typeof window !== "undefined") {
          sessionStorage.setItem("maintenance_mode", "true");
        }

        // Force redirect immediately - use multiple methods to ensure it works
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/maintenance"
        ) {
          console.log("Forcing redirect to maintenance page");

          // Method 1: Try window.location.replace first
          try {
            window.location.replace("/maintenance");
          } catch {
            // Method 2: Fallback to href
            window.location.href = "/maintenance";
          }

          // Method 3: Force reload after a short delay as backup
          setTimeout(() => {
            if (window.location.pathname !== "/maintenance") {
              console.log("Forcing reload to maintenance");
              window.location.href = "/maintenance";
            }
          }, 100);

          return Promise.reject(
            new Error("Server is under maintenance. Redirecting...")
          );
        }
        message = "Server is under maintenance. Please try again later.";
      }

      // Show notification for all error responses except auth errors (handled by logout)
      if (
        !(
          response.status === 401 ||
          response.status === 403 ||
          apiResponse?.message?.toLowerCase().includes("unauthenticated") ||
          apiResponse?.message?.toLowerCase().includes("unauthorized")
        )
      ) {
        void Notify.create({
          type: "negative",
          message,
        });
      }
    } else {
      message = "Network error: Please check your internet connection";
      void Notify.create({
        type: "negative",
        message,
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
