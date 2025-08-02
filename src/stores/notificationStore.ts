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

  // Track previous notification count for sound alerts
  const previousUnreadCount = ref(0);

  // Track sound permission state
  const soundEnabled = ref(false);
  const soundPermissionAsked = ref(false);

  // Pre-load audio for better performance
  let audioInstance: HTMLAudioElement | null = null;

  // Initialize audio instance
  const initializeAudio = () => {
    if (!audioInstance) {
      audioInstance = new Audio('/sounds/notification.mp3');
      audioInstance.volume = 0.5;
      audioInstance.preload = 'auto';
    }
    return audioInstance;
  };

  // Request permission to enable notification sounds
  const requestSoundPermission = async () => {
    if (soundPermissionAsked.value) return soundEnabled.value;

    try {
      // Try to play a silent audio to test autoplay capability
      const audio = initializeAudio();
      audio.volume = 0; // Silent test

      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.5; // Restore volume

      soundEnabled.value = true;
      soundPermissionAsked.value = true;

      // console.log('✅ Notification sounds enabled');

      // Show success notification
      // Notify.create({
      //   type: 'positive',
      //   message: 'Notification sounds enabled',
      //   position: 'top-right',
      //   timeout: 3000
      // });

      return true;
    } catch {
      soundPermissionAsked.value = true;
      console.log('🔇 Notification sounds blocked by browser policy');

      // Show informational notification about sound permission
      Notify.create({
        type: 'info',
        message: 'Click anywhere to enable notification sounds',
        position: 'top-right',
        timeout: 5000,
        actions: [
          {
            label: 'Enable Sounds',
            color: 'white',
            handler: () => {
              // Reset permission state to allow retry
              soundPermissionAsked.value = false;
              void requestSoundPermission();
            }
          }
        ]
      });

      return false;
    }
  };

  // Function to play notification sound
  const playNotificationSound = async () => {
    try {
      console.log('🔊 Attempting to play notification sound...');

      // Check if sound is enabled, if not try to enable it
      if (!soundEnabled.value && !soundPermissionAsked.value) {
        const enabled = await requestSoundPermission();
        if (!enabled) {
          showVisualNotification();
          return;
        }
      }

      // If sound is still not enabled, show visual notification
      if (!soundEnabled.value) {
        showVisualNotification();
        return;
      }

      const audio = initializeAudio();

      // Add event listeners for debugging
      audio.addEventListener('canplay', () => {
        console.log('🎵 Audio can play - starting playback');
      }, { once: true });

      audio.addEventListener('ended', () => {
        console.log('✅ Audio playback completed');
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        showVisualNotification();
      }, { once: true });

      // Reset audio position and play
      audio.currentTime = 0;
      await audio.play();

      console.log('🎵 Audio started playing successfully');
    } catch (error) {
      console.warn('⚠️ Could not play notification sound:', error);
      showVisualNotification();
    }
  };

  // Show visual notification when sound can't play
  const showVisualNotification = () => {
    Notify.create({
      type: 'info',
      message: '🔔 New notification received',
      position: 'top-right',
      timeout: 3000,
      color: 'primary',
      textColor: 'white',
      actions: [
        {
          label: 'View',
          color: 'white',
          handler: () => {
            isOpenNotfication.value = true;
          }
        }
      ]
    });
  };

  // Manual test function for sound (can be called from browser console)
  const testNotificationSound = () => {
    console.log('🧪 Manual test: Playing notification sound...');
    void playNotificationSound();
  };

  // Test function to simulate new notifications for debugging
  const simulateNewNotification = () => {
    console.log('🧪 Simulating new notification arrival...');
    console.log('Current unread count:', previousUnreadCount.value);

    // Temporarily decrease the count to simulate new notifications
    const originalCount = previousUnreadCount.value;
    previousUnreadCount.value = Math.max(0, originalCount - 1);

    console.log('Decreased count to:', previousUnreadCount.value);
    console.log('Now calling getNotifications to trigger sound...');

    // Force refresh to trigger sound
    void getNotifications(true);
  };

  // Expose test functions globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).testNotificationSound = testNotificationSound;
    (window as any).simulateNewNotification = simulateNewNotification;
  }

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

    // Store the current unread count before fetching
    const wasFirstLoad = notifications.value.length === 0;

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
        });        // Check if there are new notifications and play sound
        const currentUnreadCount = sortedNotifications.filter(n => !n.read).length;

        console.log('🔔 Notification count check:');
        console.log('  - Previous unread count:', previousUnreadCount.value);
        console.log('  - Current unread count:', currentUnreadCount);
        console.log('  - Was first load:', wasFirstLoad);

        // Play sound if there are more unread notifications than before
        // Don't play sound on first load (when wasFirstLoad is true)
        if (currentUnreadCount > previousUnreadCount.value && !wasFirstLoad) {
          console.log('🎵 Triggering notification sound!');
          void playNotificationSound();
        } else {
          console.log('🔇 No sound triggered because:');
          if (wasFirstLoad) console.log('  - This is the first load');
          if (currentUnreadCount <= previousUnreadCount.value) console.log('  - No new notifications');
        }

        // Update the previous count for next comparison
        previousUnreadCount.value = currentUnreadCount;

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
    stopAutoRefresh,
    testNotificationSound,
    simulateNewNotification
  };
});
