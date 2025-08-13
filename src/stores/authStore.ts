import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { ApiResponse, AuthData } from 'src/types/index';
import type { UserData } from 'src/types/auth';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';
import { useMeStore } from './meStore';
import { useProfileStore } from './profileStore';

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'auth_user';
  const TOKEN_KEY = 'auth_token';
  const REMEMBER_KEY = 'auth_remember';
  const REFRESH_TOKEN_KEY = 'auth_refresh_token';

  const user = ref<AuthData['user'] | null>(null);
  const currentUser = ref<UserData | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const loading = ref(false);
  const loggedIn = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isLoggedOut = ref<boolean>(false);
  const unauthorizedError = ref<string | null>(null);
  const rememberMe = ref<boolean>(false);

  const _isInitialized = ref(false);

  function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  }

  function persistAuth() {
    if (user.value) localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    if (token.value) localStorage.setItem(TOKEN_KEY, token.value);
    if (refreshToken.value) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value);
    localStorage.setItem(REMEMBER_KEY, 'true');
  }

  function clearStorage() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem('auth_session_expiry');
    localStorage.removeItem('auth_last_activity');
    localStorage.removeItem('user_remember_preference');

    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);
  }

  // Load from localStorage
  function loadStoredAuth() {
    if (_isInitialized.value) return !!token.value;

    const storedUser = safeParse<AuthData['user'] | null>(localStorage.getItem(USER_KEY), null);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    user.value = storedUser;
    token.value = storedToken;
    refreshToken.value = storedRefreshToken;
    rememberMe.value = true; // persistent sessions only

    loggedIn.value = !!token.value;

    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }

    _isInitialized.value = true;
    return !!token.value;
  }

  async function loginUser(username: string, password: string, remember: 0 | 1, recaptchaToken?: string) {
    loading.value = true;
    error.value = null;
    loggedIn.value = false;

    user.value = null;
    token.value = null;
    refreshToken.value = null;
    currentUser.value = null;

    try {
      const { data } = await api.post<ApiResponse<AuthData>>(endPoints.auth.login, {
        username,
        password,
        remember,
        'g-recaptcha-response': recaptchaToken
      });

      token.value = data.data.token;
      refreshToken.value = data.data.refresh_token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      user.value = data.data.user;

      const userPreference = remember === 1;
      rememberMe.value = true;

      persistAuth();
      localStorage.setItem('user_remember_preference', String(userPreference));
      localStorage.removeItem('auth_session_expiry');
      localStorage.removeItem('auth_last_activity');

      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(REMEMBER_KEY);

      const userData = await fetchCurrentUser();
      if (userData) {
        const meStore = useMeStore();
        const profileStore = useProfileStore();
        meStore.setUserData(userData);
        profileStore.setUserData(userData);
      }

      loggedIn.value = true;
    } catch {
      showNotify({ type: 'negative', message: 'Login failed', position: 'top', duration: 3000 });
      user.value = null;
      token.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    isLoggedOut.value = true;

    user.value = null;
    token.value = null;
    refreshToken.value = null;
    currentUser.value = null;
    loggedIn.value = false;
    rememberMe.value = false;

    const meStore = useMeStore();
    meStore.resetMe();
    const profileStore = useProfileStore();
    profileStore.resetProfile();

    clearStorage();

    try {
      const { data } = await api.post<ApiResponse<AuthData>>(endPoints.auth.logout, {});
      showNotify({ type: 'positive', message: data?.message || 'Logout successful', position: 'top', duration: 3000 });
    } catch {
      // ignore
    }

    setTimeout(() => { isLoggedOut.value = false; }, 1000);
  }

  // No-op session management (persistent-only strategy)
  function setupSessionManagement() { /* no-op */ }
  function cleanupSessionListeners() { /* no-op */ }

  async function fetchCurrentUser() {
    if (!token.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const headers = { Authorization: `Bearer ${token.value}` };
      const { data } = await api.get<ApiResponse<UserData>>(endPoints.auth.me, { headers });
      if (!data.data) return null;

      currentUser.value = data.data;
      loggedIn.value = true;
      return data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
      error.value = errorMessage;
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        if (response?.status === 401) {
          await logout();
        } else if (response?.status === 503) {
          return null;
        }
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  function setUnauthorizedError(message: string) {
    unauthorizedError.value = message;
    setTimeout(() => { unauthorizedError.value = null; }, 5000);
  }
  function clearUnauthorizedError() { unauthorizedError.value = null; }

  async function refreshUserData() {
    if (!token.value) return false;
    try {
      const userData = await fetchCurrentUser();
      if (userData) {
        const meStore = useMeStore();
        const profileStore = useProfileStore();
        meStore.setUserData(userData);
        profileStore.setUserData(userData);
      }
      return true;
    } catch {
      return false;
    }
  }

  function getUserRememberPreference(): boolean {
    const preference = localStorage.getItem('user_remember_preference');
    return preference === 'true';
  }

  function updateTokens(newToken: string, newRefreshToken: string) {
    token.value = newToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  return {
    user,
    currentUser,
    token,
    refreshToken,
    loading,
    error,
    isLoggedOut,
    loggedIn,
    unauthorizedError,
    rememberMe,

    loginUser,
    logout,
    loadStoredAuth,
    fetchCurrentUser,
    refreshUserData,
    setUnauthorizedError,
    clearUnauthorizedError,
    setupSessionManagement,
    cleanupSessionListeners,
    getUserRememberPreference,
    updateTokens
  };
});
