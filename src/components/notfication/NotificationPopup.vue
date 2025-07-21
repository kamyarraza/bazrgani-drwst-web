<template>
  <q-menu

    anchor="bottom right"
    self="top right"
    :offset="[0, 10]"
    class="notification-popup-menu"
    transition-show="scale"
    transition-hide="scale"

  >
    <q-card class="notification-popup-card">
      <!-- Header -->
      <q-card-section class="notification-header-section">
        <div class="header-content">
          <div class="header-left">
            <q-icon name="notifications" color="primary" size="24px" class="header-icon" />
            <div class="header-text">
              <div class="header-title">{{ t('notifications.title') }}</div>
              <div class="header-subtitle" v-if="notificationStore.unreadCount > 0">
                {{ t('notifications.unread') }}: {{ notificationStore.unreadCount }}
              </div>
            </div>
          </div>

          <div class="header-actions">
            <q-btn
              v-if="notificationStore.unreadCount > 0"
              flat
              round
              dense
              icon="done_all"
              size="sm"
              @click="markAllAsRead"
              :loading="loadingMarkAll"
              class="mark-all-btn"
            >
              <q-tooltip>{{ t('notifications.markAllRead') }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              icon="close"
              size="sm"
              @click="close"
              class="close-btn"
            >
              <q-tooltip>{{ t('notifications.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator class="header-separator" />

      <!-- Content -->
      <q-card-section class="notification-content">
        <!-- Loading State -->
        <div v-if="notificationStore.loading" class="state-container">
          <div class="state-content">
            <q-spinner-ring size="40px" color="primary" class="state-spinner" />
            <div class="state-text">{{ t('notifications.loading') }}</div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="notificationStore.error" class="state-container">
          <div class="state-content">
            <q-icon name="error_outline" size="48px" color="negative" class="state-icon" />
            <div class="state-text error-text">{{ notificationStore.error }}</div>
            <q-btn
              unelevated
              color="primary"
              @click="retryLoad"
              class="retry-btn"
              size="sm"
              rounded
            >
              <q-icon name="refresh" size="16px" class="q-mr-xs" />
              {{ t('notifications.refresh') }}
            </q-btn>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="notificationStore.notifications?.length === 0" class="state-container">
          <div class="state-content">
            <q-icon name="notifications_none" size="48px" color="grey-5" class="state-icon" />
            <div class="state-text">{{ t('notifications.empty') }}</div>
            <div class="state-subtext">{{ t('notifications.noNotifications') }}</div>
          </div>
        </div>

        <!-- Notifications List -->
        <div v-else class="notifications-list">
          <div
            v-for="(notification, index) in notificationStore.notifications"
            :key="notification.id"
            class="notification-item"
            :class="{
              'notification-unread': !notification.read,
              'notification-animate': true
            }"
            :style="{ animationDelay: `${index * 50}ms` }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Notification Icon & Content -->
            <div class="notification-main">
              <div class="notification-icon-wrapper">
                <div class="notification-icon" :class="getNotificationTypeClass(notification)">
                  <q-icon :name="getNotificationIcon(notification)" size="20px" />
                </div>
                <div v-if="!notification.read" class="unread-indicator"></div>
              </div>

              <div class="notification-content-wrapper">
                <div class="notification-header">
                  <div class="notification-title">
                    {{ notification.title }}
                  </div>
                  <div class="notification-time">
                    {{ formatDate(notification.created_at) }}
                  </div>
                </div>

                <div class="notification-message">
                  {{ notification.message }}
                </div>

                <div class="notification-footer">
                  <div class="notification-actions">
                    <q-btn
                      v-if="!notification.read"
                      flat
                      dense
                      size="xs"
                      color="primary"
                      @click.stop="markAsRead(notification.id)"
                      :loading="loadingMarkRead === notification.id"
                      class="action-btn"
                      rounded
                    >
                      <q-icon name="check" size="14px" class="q-mr-xs" />
                      {{ t('notifications.markRead') }}
                    </q-btn>

                    <div v-else class="read-status">
                      <q-icon name="check_circle" color="positive" size="16px" />
                      <span>{{ t('notifications.read') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-menu>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from 'src/stores/notificationStore';
import type { Notification } from 'src/types/notfication';

const { t } = useI18n();
const notificationStore = useNotificationStore();
const loadingMarkRead = ref<number | null>(null);
const loadingMarkAll = ref(false);

// Disable body scroll when popup is open
onMounted(() => {
  document.body.classList.add('no-scroll-notification-popup');
});
onUnmounted(() => {
  document.body.classList.remove('no-scroll-notification-popup');
});

function close() {
  notificationStore.isOpenNotfication = !notificationStore.isOpenNotfication;
}

async function retryLoad() {
  await notificationStore.getNotifications();
}

async function markAsRead(notificationId: number) {
  loadingMarkRead.value = notificationId;
  try {
    await notificationStore.markAsRead(notificationId);
  } finally {
    loadingMarkRead.value = null;
  }
}

async function markAllAsRead() {
  loadingMarkAll.value = true;
  try {
    await notificationStore.markAllAsRead();
  } finally {
    loadingMarkAll.value = false;
  }
}

async function handleNotificationClick(notification: Notification) {
  if (!notification.read) {
     await markAsRead(notification.id);
  }

  // Handle navigation based on notification action if needed
  if (notification.action) {
    // You can implement navigation logic here based on the action
    console.log('Navigate to:', notification.action);
  }
}

function getNotificationIcon(notification: Notification): string {
  // You can customize icons based on notification type or action
  const iconMap: Record<string, string> = {
    'system': 'settings',
    'user': 'person',
    'order': 'shopping_cart',
    'payment': 'payment',
    'alert': 'warning',
    'info': 'info',
    'success': 'check_circle',
    'error': 'error'
  };

  // Extract type from action or use default
  const type = notification.action?.split('_')[0] || 'info';
  return iconMap[type] || 'notifications';
}

function getNotificationTypeClass(notification: Notification): string {
  // You can customize colors based on notification type
  const typeMap: Record<string, string> = {
    'system': 'type-system',
    'user': 'type-user',
    'order': 'type-order',
    'payment': 'type-payment',
    'alert': 'type-alert',
    'info': 'type-info',
    'success': 'type-success',
    'error': 'type-error'
  };

  const type = notification.action?.split('_')[0] || 'info';
  return typeMap[type] || 'type-default';
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}
</script>

<style scoped>
/* Disable body scroll when notification popup is open */
:global(body.no-scroll-notification-popup) {
  overflow: hidden !important;
}

.notification-popup-menu {
  min-width: 380px;
  max-width: 95vw;
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  background: transparent;
  padding: 0;
  /* Prevent scroll on popup menu itself */
  overflow: hidden !important;
}

.notification-popup-card {
  min-width: 380px;
  max-width: 95vw;
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  background: #fff;
  overflow: hidden !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Header Styles */
.notification-header-section {
  padding: 20px 24px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  padding: 8px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mark-all-btn,
.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.mark-all-btn {
  color: #1976d2;
  background: rgba(25, 118, 210, 0.08);
}

.mark-all-btn:hover {
  background: rgba(25, 118, 210, 0.15);
  transform: scale(1.05);
}

.close-btn {
  color: #64748b;
  background: rgba(100, 116, 139, 0.08);
}

.close-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.05);
}

.header-separator {
  margin: 0;
  background: rgba(0, 0, 0, 0.06);
}

/* Content Styles */
.notification-content {
  padding: 0;
  max-height: 65vh;
  overflow: hidden !important;
}

/* State Styles */
.state-container {
  padding: 48px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.state-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.state-spinner {
  animation: pulse 2s infinite;
}

.state-icon {
  opacity: 0.7;
}

.state-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.error-text {
  color: #ef4444;
}

.state-subtext {
  font-size: 14px;
  color: #9ca3af;
  margin-top: -8px;
}

.retry-btn {
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

/* Notifications List */
.notifications-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px 0;
}

/* Notification Item */
.notification-item {
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  background: #fff;
}

.notification-item:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(25, 118, 210, 0.05) 100%);
  transform: translateX(4px);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-unread {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%);
  border-left: 4px solid #3b82f6;
}

.notification-unread:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%);
}

.notification-animate {
  animation: slideInUp 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

/* Notification Content */
.notification-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.notification-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
}

.unread-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.notification-content-wrapper {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  word-break: break-word;
  flex: 1;
}

.notification-unread .notification-title {
  color: #1d4ed8;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
}

.notification-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px;
  word-break: break-word;
}

.notification-unread .notification-message {
  color: #374151;
}

.notification-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  padding: 4px 12px;
  min-height: 28px;
  background: rgba(25, 118, 210, 0.08);
  color: #1976d2;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(25, 118, 210, 0.15);
  transform: scale(1.05);
}

.read-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}

/* Notification Type Colors */
.type-system {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.type-user {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

.type-order {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.type-payment {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.type-alert {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.type-info {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.type-success {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.type-error {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

.type-default {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

/* Custom Scrollbar */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 6px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

/* Animations */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .notification-popup-menu,
  .notification-popup-card {
    min-width: 320px;
    max-width: 90vw;
  }

  .notification-header-section {
    padding: 16px 20px 12px;
  }

  .notification-item {
    padding: 12px 20px;
  }

  .header-title {
    font-size: 16px;
  }

  .notification-main {
    gap: 12px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
