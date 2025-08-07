import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { ApiResponse, AuthData } from 'src/types/index';
import type { UserData } from 'src/types/auth';
import { endPoints } from 'src/endpoint';
import { showNotify } from 'src/composables/Notify';
import { useMeStore } from './meStore';
import { useProfileStore } from './profileStore';

/*
 * TEMPORARY FIX FOR SESSION ISSUES:
 * The remember me functionality has been temporarily disabled to prevent browser crashes/stopping.
 * - All logins are now treated as "remember me" enabled internally
 * - User's actual preference is stored separately for UI display
 * - No session management or expiry checks are performed
 * - Only localStorage is used (no sessionStorage)
 * This prevents the complex session management from causing issues while maintaining functionality.
 */

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'auth_user';
  const TOKEN_KEY = 'auth_token';
  const REMEMBER_KEY = 'auth_remember'; // New key to track remember preference
  const REFRESH_TOKEN_KEY = 'auth_refresh_token'; // New key for refresh token

  const user = ref<AuthData['user'] | null>(null);
  const currentUser = ref<UserData | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const loading = ref(false);
  const loggedIn = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isLoggedOut = ref<boolean>(false);
  const unauthorizedError = ref<string | null>(null);
  const rememberMe = ref<boolean>(false); // Track if user wants to be remembered

  // Add flag to prevent duplicate initialization
  const _isInitialized = ref(false);

  // Check if the browser tab/window is closing
  const _isWindowClosing = ref(false);

  // Load from localStorage and check session validity
  function loadStoredAuth() {
    // Prevent duplicate initialization
    if (_isInitialized.value) {
      return !!token.value;
    }

    // Always check localStorage (simplified - no session expiry checks)
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // TEMPORARY FIX: Skip all session expiry checks - always load if data exists
    // This prevents session-related crashes and browser stopping issues

    user.value = storedUser ? JSON.parse(storedUser) : null;
    token.value = storedToken;
    refreshToken.value = storedRefreshToken;
    rememberMe.value = true; // Always treat as remembered

    // Update loggedIn state based on token presence
    loggedIn.value = !!token.value;

    // Set authorization header if token exists
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      // Skip session management setup to avoid issues
    }

    _isInitialized.value = true;
    return !!token.value; // Return whether we have a token
  }
  async function loginUser(username: string, password: string, remember: 0 | 1, recaptchaToken?: string) {
    loading.value = true;
    error.value = null;
    loggedIn.value = false; // Reset logged in status at start of login process

    // Clear old data first to ensure fresh state
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    currentUser.value = null;

    try {

        const { data } = await api.post<ApiResponse<AuthData>>(endPoints.auth.login, {
        username: username,
        password: password,
        remember: remember,
        'g-recaptcha-response': recaptchaToken
      });



      // Set token in memory first - this is critical for subsequent requests
      token.value = data.data.token;
      refreshToken.value = data.data.refresh_token;

      // Set up auth header for immediate use in subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      // Set user data
      user.value = data.data.user;

      // TEMPORARY FIX: Always treat as "remember me" enabled to avoid session issues
      // Store the user's actual preference but always behave as if remember=true
      const userPreference = remember === 1;
      rememberMe.value = true; // Always set to true internally

      // Always use localStorage and always treat as persistent session
      localStorage.setItem(USER_KEY, JSON.stringify(user.value));
      localStorage.setItem(TOKEN_KEY, token.value);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value || '');
      localStorage.setItem(REMEMBER_KEY, 'true'); // Always store as true
      localStorage.setItem('user_remember_preference', userPreference.toString()); // Store actual preference for UI

      // Never set session expiration - always treat as persistent
      localStorage.removeItem('auth_session_expiry');
      localStorage.removeItem('auth_last_activity');

      // Clear sessionStorage to avoid conflicts
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(REMEMBER_KEY);

      // Also load the currentUser immediately after login to ensure complete user data
      try {
        const userData = await fetchCurrentUser();
        if (!userData) {
          throw new Error('Failed to fetch complete user data after login');
        }

        // Share the fetched user data with other stores instead of making separate API calls
        const meStore = useMeStore();
        const profileStore = useProfileStore();
        meStore.setUserData(userData);
        profileStore.setUserData(userData);

      } catch {
        // Don't throw here - we'll continue with basic authentication even if user data fetch fails
      }

      // Set logged in flag last, after all operations are complete
      loggedIn.value = true;

      // TEMPORARY FIX: Skip session management to avoid browser issues
      // setupSessionManagement();

      // Show success notification
      showNotify({
        type: 'positive',
        message: data?.message || 'Login successful',
        position: 'top',
        duration: 3000,
      })
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {


      showNotify({
        type: 'negative',
        message: err || 'Login failed',
        position: 'top',
        duration: 3000,

      })
      user.value = null;
      token.value = null;
    } finally {
      loading.value = false;
    }
  }  async function logout() {
    // First clear token and user data from state and storage to prevent additional API calls
    isLoggedOut.value = true;

    // Clean up session listeners to prevent memory leaks (even though we're not using them)
    cleanupSessionListeners();

    // Clear user state
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    currentUser.value = null;
    loggedIn.value = false;
    rememberMe.value = false;

    // Also clear meStore data to ensure consistency
    const meStore = useMeStore();
    meStore.resetMe();

    // Also clear profileStore data to ensure consistency
    const profileStore = useProfileStore();
    profileStore.resetProfile();

    // Clear storage immediately to prevent any race conditions
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem('auth_session_expiry');
    localStorage.removeItem('auth_last_activity');
    localStorage.removeItem('user_remember_preference'); // Clear preference too

    // Clear sessionStorage too (for cleanup)
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);

    try {
      const { data } = await api.post<ApiResponse<AuthData>>(endPoints.auth.logout, {});
      showNotify({
        type: 'positive',
        message: data?.message || 'Logout successful',
        position: 'top',
        duration: 3000,
      });
    } catch (err: unknown) {
      // Even on error, we're already logged out locally
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      error.value = errorMessage;
      // Don't show error notification for logout failures since user is already logged out
    }

    setTimeout(()=>{
      isLoggedOut.value = false;
    },1000)
  }

  // Set up session management
  function setupSessionManagement() {
    // For persistent logins (remember me = true), no special session management needed
    if (rememberMe.value) {
      return;
    }

    // Remove any existing listeners first to prevent duplicates
    cleanupSessionListeners();

    // For non-persistent logins, set up browser close detection with proper cleanup
    let handleBeforeUnload: (() => void) | null = null;
    let inactivityTimer: NodeJS.Timeout | null = null;

    // Handle page beforeunload for non-persistent sessions
    handleBeforeUnload = () => {
      if (!rememberMe.value && token.value) {
        // Update session expiry to mark that browser might be closing
        const shortExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes grace period
        localStorage.setItem('auth_session_expiry', shortExpiry.toString());
      }
    };

    // Set up inactivity timeout (30 minutes)
    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      inactivityTimer = setTimeout(() => {
        if (!rememberMe.value && token.value && !document.hidden) {
          void logout();
        }
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Start the inactivity timer
    resetInactivityTimer();

    // Reset timer on user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const resetTimerHandler = () => {
      if (!rememberMe.value && token.value) {
        resetInactivityTimer();
      }
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimerHandler, { passive: true });
    });

    // Add beforeunload listener
    if (handleBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload, { passive: true });
    }

    // Store references for cleanup
    _sessionCleanup.value.beforeUnload = handleBeforeUnload;
    _sessionCleanup.value.inactivityTimer = inactivityTimer;
    _sessionCleanup.value.activityHandler = resetTimerHandler;
    _sessionCleanup.value.activityEvents = activityEvents;
  }

  // Add cleanup tracking
  const _sessionCleanup = ref<{
    beforeUnload: (() => void) | null;
    visibilityChange: (() => void) | null;
    inactivityTimer: NodeJS.Timeout | null;
    activityHandler: (() => void) | null;
    activityEvents: string[];
  }>({
    beforeUnload: null,
    visibilityChange: null,
    inactivityTimer: null,
    activityHandler: null,
    activityEvents: []
  });

  // Clean up session listeners
  function cleanupSessionListeners() {
    if (_sessionCleanup.value.beforeUnload) {
      window.removeEventListener('beforeunload', _sessionCleanup.value.beforeUnload);
      _sessionCleanup.value.beforeUnload = null;
    }
    if (_sessionCleanup.value.visibilityChange) {
      document.removeEventListener('visibilitychange', _sessionCleanup.value.visibilityChange);
      _sessionCleanup.value.visibilityChange = null;
    }
    if (_sessionCleanup.value.inactivityTimer) {
      clearTimeout(_sessionCleanup.value.inactivityTimer);
      _sessionCleanup.value.inactivityTimer = null;
    }
    if (_sessionCleanup.value.activityHandler && _sessionCleanup.value.activityEvents.length > 0) {
      _sessionCleanup.value.activityEvents.forEach(event => {
        document.removeEventListener(event, _sessionCleanup.value.activityHandler!);
      });
      _sessionCleanup.value.activityHandler = null;
      _sessionCleanup.value.activityEvents = [];
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) {
      return null;
    }

    loading.value = true;
    error.value = null;

    try {

      // Ensure our Authorization header is set for this request
      const headers = { Authorization: `Bearer ${token.value}` };

      const { data } = await api.get<ApiResponse<UserData>>(endPoints.auth.me, { headers });

      if (!data.data) {
        return null;
      }

      currentUser.value = data.data;

      // If this succeeded, we're definitely logged in
      loggedIn.value = true;

      return data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
      error.value = errorMessage;
      // If fetch fails, token might be invalid
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as any;
        if (response?.status === 401) {
          // Token is invalid, logout
          await logout();
        } else if (response?.status === 503) {
          // Server is under maintenance, don't clear auth state
          // Let the axios interceptor handle the redirect
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
    // Clear error after 5 seconds
    setTimeout(() => {
      unauthorizedError.value = null;
    }, 5000);
  }

  function clearUnauthorizedError() {
    unauthorizedError.value = null;
  }  // Force refresh both auth and me store data
  async function refreshUserData() {
    if (!token.value) {
      return false;
    }

    try {
      const userData = await fetchCurrentUser();

      if (userData) {
        // Share the refreshed user data with other stores instead of making separate API calls
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

  // 🔄 Sync user/token changes to localStorage

  // Load stored values on init


  // Get the user's actual remember preference (for UI display only)
  function getUserRememberPreference(): boolean {
    const preference = localStorage.getItem('user_remember_preference');
    return preference === 'true';
  }

  // Return a properly typed object for better TypeScript support
  // Add a method to update tokens after refresh
  function updateTokens(newToken: string, newRefreshToken: string) {
    token.value = newToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }
  return {
    // State
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

    // Methods
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
