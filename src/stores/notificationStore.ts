import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import type { Notification, ApiResponse } from 'src/types/notfication';
import { Notify } from 'quasar';

export const useNotificationStore = defineStore('notification', () => {
  const isOpenNotfication = ref(false);
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Auto-refresh state
  const autoRefreshTimer = ref<NodeJS.Timeout | null>(null);
  const isTabVisible = ref(true);
  const autoRefreshInterval = 50000; // 50 seconds

  // Computed properties
  const unreadNotifications = computed(() =>
    notifications.value.filter(notification => !notification.read)
  );

  const unreadCount = computed(() => unreadNotifications.value.length);

  // Sorted notifications - newest first, unread first
  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      // First sort by read status - unread notifications first
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      // Then sort by date - newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  // Get notifications from API
  const getNotifications = async (forceRefresh = false) => {
    // Prevent duplicate API calls if already loading or data exists (unless force refresh)
    if (!forceRefresh && (loading.value || (notifications.value.length > 0 && !error.value))) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<ApiResponse<Notification[]>>(endPoints.notification.getUnreads);

      if (response.data.status === 'success') {
        // Sort notifications: newest first, then unread first
        const sortedNotifications = response.data.data.sort((a, b) => {
          // First sort by read status - unread notifications first
          if (a.read !== b.read) {
            return a.read ? 1 : -1;
          }
          // Then sort by date - newest first
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        notifications.value = sortedNotifications;
      } else {
        error.value = response.data.message;
        // Don't show error notification for auth-related failures
        if (!response.data.message?.toLowerCase().includes('unauthenticated') &&
            !response.data.message?.toLowerCase().includes('unauthorized')) {
          Notify.create({
            type: 'negative',
            message: response.data.message || 'Failed to fetch notifications'
          });
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications';

      // Don't show error notification for auth-related failures (401, 403)
      const isAuthError = err.response?.status === 401 ||
                         err.response?.status === 403 ||
                         error.value?.toLowerCase().includes('unauthenticated') ||
                         error.value?.toLowerCase().includes('unauthorized');

      if (!isAuthError) {
        Notify.create({
          type: 'negative',
          message: error.value || 'Failed to fetch notifications'
        });
      }

      // Stop auto-refresh on auth errors to prevent further failures
      if (isAuthError) {
        stopAutoRefresh();
      }
    } finally {
      loading.value = false;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await api.post<ApiResponse<Notification>>(
        endPoints.notification.markAsRead(notificationId)
      );

      if (response.data.status === 'success') {
        // Update local state
        const index = notifications.value.findIndex(n => n.id === notificationId);
        if (index !== -1 && notifications.value[index]) {
          notifications.value[index].read = true;
        }

        Notify.create({
          type: 'positive',
          message: 'Notification marked as read'
        });
      } else {
        Notify.create({
          type: 'negative',
          message: response.data.message || 'Failed to mark notification as read'
        });
      }
    } catch (err: any) {
      Notify.create({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to mark notification as read'
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        endPoints.notification.markAllAsRead
      );

      if (response.data.status === 'success') {
        // Update local state - mark all notifications as read
        notifications.value = notifications.value.map(notification => ({
          ...notification,
          read: true
        }));

        Notify.create({
          type: 'positive',
          message: 'All notifications marked as read'
        });
      } else {
        Notify.create({
          type: 'negative',
          message: response.data.message || 'Failed to mark all notifications as read'
        });
      }
    } catch (err: any) {
      Notify.create({
        type: 'negative',
        message: err.response?.data?.message || 'Failed to mark all notifications as read'
      });
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    notifications.value = [];
  };

  // Toggle notification popup
  const toggleNotificationPopup = () => {
    isOpenNotfication.value = !isOpenNotfication.value;

    // Fetch notifications when opening popup
    if (isOpenNotfication.value) {
      void getNotifications();
    }
  };

  // Refresh notifications (force fetch)
  const refreshNotifications = async () => {
    // Clear existing data and fetch fresh
    notifications.value = [];
    error.value = null;
    await getNotifications();
  };

  // Auto-refresh functionality
  const startAutoRefresh = () => {
    // Clear existing timer if any
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value);
    }

    // Remove existing visibility listener to prevent duplicates
    if (handleVisibilityChangeRef) {
      document.removeEventListener('visibilitychange', handleVisibilityChangeRef);
    }

    // Set up visibility change listeners
    const handleVisibilityChange = () => {
      isTabVisible.value = !document.hidden;

      if (isTabVisible.value) {
        // Tab is visible again - restart auto refresh
        startAutoRefreshTimer();
        // Fetch notifications immediately when tab becomes visible
        void getNotifications(true);
      } else {
        // Tab is hidden - stop auto refresh
        stopAutoRefreshTimer();
      }
    };

    // Store reference for proper cleanup
    handleVisibilityChangeRef = handleVisibilityChange;

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChangeRef, { passive: true });

    // Start the timer if tab is currently visible
    if (isTabVisible.value) {
      startAutoRefreshTimer();
    }
  };

  // Store visibility change handler reference for cleanup
  let handleVisibilityChangeRef: (() => void) | null = null;

  const startAutoRefreshTimer = () => {
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value);
    }

    autoRefreshTimer.value = setInterval(() => {
      if (isTabVisible.value) {
        void (async () => {
          try {
            await getNotifications(true);
          } catch (error: any) {
            // If we get auth errors, stop the auto-refresh to prevent spam
            const isAuthError = error?.response?.status === 401 ||
                               error?.response?.status === 403 ||
                               error?.message?.toLowerCase().includes('unauthenticated') ||
                               error?.message?.toLowerCase().includes('unauthorized');

            if (isAuthError) {
              console.log('🛑 Stopping notification auto-refresh due to auth error');
              stopAutoRefresh();
            }
          }
        })();
      }
    }, autoRefreshInterval);
  };

  const stopAutoRefreshTimer = () => {
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value);
      autoRefreshTimer.value = null;
    }
  };

  const stopAutoRefresh = () => {
    stopAutoRefreshTimer();
    // Remove visibility change listener properly
    if (handleVisibilityChangeRef) {
      document.removeEventListener('visibilitychange', handleVisibilityChangeRef);
      handleVisibilityChangeRef = null;
    }
  };

  return {
    // State
    isOpenNotfication,
    notifications,
    loading,
    error,
    isTabVisible,

    // Computed
    unreadNotifications,
    unreadCount,
    sortedNotifications,

    // Actions
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    toggleNotificationPopup,
    refreshNotifications,
    startAutoRefresh,
    stopAutoRefresh
  };
});
