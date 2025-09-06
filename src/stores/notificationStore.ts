import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import type { Notification, ApiResponse } from 'src/types/notfication';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

export const useNotificationStore = defineStore('notification', () => {
  const isOpenNotfication = ref(false);
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Auto-refresh state
  const autoRefreshTimer = ref<NodeJS.Timeout | null>(null);
  const isAutoRefreshActive = ref(false); // prevent duplicate timers
  const isTabVisible = ref(true);
  const autoRefreshInterval = 120000; // 2 minutes

  // Track previous notification count for sound alerts
  const previousUnreadCount = ref(0);

  const router = useRouter();

  // Basic audio: no preload/permission gymnastics
  const playNotificationSound = async () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.6;
      await audio.play();
    } catch {
      showVisualNotification();
    }
  };

  // Show visual notification when sound can't play
  const showVisualNotification = () => {
    Notify.create({
      type: 'info',
      message: '🔔 ئاگادارییەکی نوێ گەیشت',
      position: 'top-right',
      timeout: 3000,
      color: 'primary',
      textColor: 'white',
      actions: [
        { label: 'View', color: 'white', handler: () => { isOpenNotfication.value = true; } }
      ]
    });
  };

  // Show a notification
const showBrowserNotification = (title, options:any = {}) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body: options.body || "",
      icon: options.icon || "https://cdn-icons-png.flaticon.com/512/11820/11820177.png", // put your icon path
    })

    // Optional: Handle click
    notification.onclick = async () => {
      window.focus()
      await router.push(options.url) // Navigate to item section page
    }
  }
}

  // Computed properties
  const unreadNotifications = computed(() =>
    notifications.value.filter(notification => !notification.read)
  );

  const unreadCount = computed(() => unreadNotifications.value.length);

  // Optimized: list is already sorted on fetch; avoid re-sorting on every change
  const sortedNotifications = computed(() => notifications.value);

  // Get notifications from API
  const getNotifications = async (forceRefresh = false) => {
    if (!forceRefresh && (loading.value || (notifications.value.length > 0 && !error.value))) {
      return;
    }

    loading.value = true;
    error.value = null;

    // const wasFirstLoad = notifications.value.length === 0;

    try {
      // Request notification permission if not already granted
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      // Fetch notifications
      const response = await api.get<ApiResponse<Notification[]>>(endPoints.notification.getUnreads);

      // Handle API response
      if (response.data.status === 'success') {
        const sorted = response.data.data.sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1; // unread first
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const currentUnreadCount = sorted.filter(n => !n.read).length;
        const currentUnread:any = sorted.filter(n => !n.read);

        if (currentUnreadCount > previousUnreadCount.value) {
          // New unread notifications arrived
          void playNotificationSound();
          // Show browser notification for the latest unread
          showBrowserNotification(currentUnread[0].title, {
            body: currentUnread[0].message.slice(0, 30)+"...",
            url: currentUnread[0].action
          });
        }
        
        previousUnreadCount.value = currentUnreadCount;

        notifications.value = sorted;
      } else {
        error.value = response.data.message;
        if (!response.data.message?.toLowerCase().includes('unauthenticated') &&
            !response.data.message?.toLowerCase().includes('unauthorized')) {
          Notify.create({ type: 'negative', message: response.data.message || 'Failed to fetch notifications' });
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications';
      const isAuthError = err.response?.status === 401 ||
                         err.response?.status === 403 ||
                         error.value?.toLowerCase().includes('unauthenticated') ||
                         error.value?.toLowerCase().includes('unauthorized');
      if (!isAuthError) {
        Notify.create({ type: 'negative', message: error.value || 'Failed to fetch notifications' });
      }
      if (isAuthError) stopAutoRefresh();
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
        const index = notifications.value.findIndex(n => n.id === notificationId);
        if (index !== -1 && notifications.value[index]) notifications.value[index].read = true;
        Notify.create({ type: 'positive', message: 'ئاگادارییەکە خوێندرایەوە' });
      } else {
        Notify.create({ type: 'negative', message: response.data.message || 'Failed to mark notification as read' });
      }
    } catch (err: any) {
      Notify.create({ type: 'negative', message: err.response?.data?.message || 'Failed to mark notification as read' });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        endPoints.notification.markAllAsRead
      );
      if (response.data.status === 'success') {
        notifications.value = notifications.value.map(n => ({ ...n, read: true }));
        Notify.create({ type: 'positive', message: 'All notifications marked as read' });
      } else {
        Notify.create({ type: 'negative', message: response.data.message || 'Failed to mark all notifications as read' });
      }
    } catch (err: any) {
      Notify.create({ type: 'negative', message: err.response?.data?.message || 'Failed to mark all notifications as read' });
    }
  };

  const clearNotifications = () => { notifications.value = []; };

  const toggleNotificationPopup = () => {
    isOpenNotfication.value = !isOpenNotfication.value;
    if (isOpenNotfication.value) void getNotifications();
  };

  const refreshNotifications = async () => {
    notifications.value = [];
    error.value = null;
    await getNotifications(true);
  };

  // Auto-refresh functionality with single-instance guard
  let handleVisibilityChangeRef: (() => void) | null = null;

  const startAutoRefresh = () => {
    if (isAutoRefreshActive.value) return; // already running
    isAutoRefreshActive.value = true;

    if (autoRefreshTimer.value) clearInterval(autoRefreshTimer.value);
    if (handleVisibilityChangeRef) document.removeEventListener('visibilitychange', handleVisibilityChangeRef);

    const handleVisibilityChange = () => {
      isTabVisible.value = !document.hidden;
      if (isTabVisible.value) {
        startAutoRefreshTimer();
        void getNotifications(true);
      } else {
        stopAutoRefreshTimer();
      }
    };

    handleVisibilityChangeRef = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChangeRef, { passive: true });

    if (isTabVisible.value) startAutoRefreshTimer();
  };

  const startAutoRefreshTimer = () => {
    if (autoRefreshTimer.value) clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = setInterval(() => {
      if (isTabVisible.value) void getNotifications(true);
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
    if (handleVisibilityChangeRef) {
      document.removeEventListener('visibilitychange', handleVisibilityChangeRef);
      handleVisibilityChangeRef = null;
    }
    isAutoRefreshActive.value = false;
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
