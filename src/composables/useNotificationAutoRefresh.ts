import { onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from 'src/stores/notificationStore';

/**
 * Composable for automatic notification refresh with tab visibility detection
 * Automatically starts refresh on mount and stops on unmount
 */
export function useNotificationAutoRefresh() {
  const notificationStore = useNotificationStore();

  onMounted(() => {
    console.log('🔔 Starting notification auto-refresh (every 40 seconds)');
    notificationStore.startAutoRefresh();
  });

  onUnmounted(() => {
    console.log('🛑 Stopping notification auto-refresh');
    notificationStore.stopAutoRefresh();
  });

  return {
    // Expose store properties and methods if needed
    notifications: notificationStore.notifications,
    unreadCount: notificationStore.unreadCount,
    isTabVisible: notificationStore.isTabVisible,
    startAutoRefresh: notificationStore.startAutoRefresh,
    stopAutoRefresh: notificationStore.stopAutoRefresh,
  };
}
