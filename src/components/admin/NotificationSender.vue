<template>
  <div class="notification-sender">
    <!-- Header Section -->
    <div class="section-header">
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="notifications_active" size="2rem" color="white" />
        </div>
        <div class="header-text">
          <h3 class="section-title">{{ t('admin.sendNotification.title', 'Send Notification') }}</h3>
          <p class="section-subtitle">{{ t('admin.sendNotification.subtitle', 'Send notifications to users across the
            system') }}</p>
        </div>
      </div>
    </div>

    <!-- Notification Form -->
    <q-card class="notification-form-card" flat bordered>
      <q-card-section class="q-pa-lg">
        <q-form @submit="sendNotification" class="notification-form">
          <!-- Recipient Selection -->
          <div class="form-section">
            <div class="form-section-header">
              <q-icon name="people" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.recipients', 'Recipients') }}</span>
            </div>
            <div class="recipient-options">
              <div class="recipient-radio-group">
                <!-- All Users Option -->
                <q-radio v-model="notificationForm.recipients" val="all" color="primary" class="recipient-radio-item">
                  <template v-slot:default>
                    <div class="recipient-option">
                      <div class="recipient-icon all">
                        <q-icon name="public" size="1.5rem" />
                      </div>
                      <div class="recipient-details">
                        <div class="recipient-label">{{ t('admin.sendNotification.allUsers', 'All Users') }}</div>
                        <div class="recipient-description">{{ t('admin.sendNotification.allUsersDesc', 'Send to everyone
                          in the system') }}</div>
                      </div>
                    </div>
                  </template>
                </q-radio>

                <!-- Administrators Option -->
                <q-radio v-model="notificationForm.recipients" val="admins" color="primary"
                  class="recipient-radio-item">
                  <template v-slot:default>
                    <div class="recipient-option">
                      <div class="recipient-icon admins">
                        <q-icon name="admin_panel_settings" size="1.5rem" />
                      </div>
                      <div class="recipient-details">
                        <div class="recipient-label">{{ t('admin.sendNotification.admins', 'Administrators') }}</div>
                        <div class="recipient-description">{{ t('admin.sendNotification.adminsDesc', 'Send to system
                          administrators only') }}</div>
                      </div>
                    </div>
                  </template>
                </q-radio>

                <!-- Employees Option -->
                <q-radio v-model="notificationForm.recipients" val="employees" color="primary"
                  class="recipient-radio-item">
                  <template v-slot:default>
                    <div class="recipient-option">
                      <div class="recipient-icon employees">
                        <q-icon name="badge" size="1.5rem" />
                      </div>
                      <div class="recipient-details">
                        <div class="recipient-label">{{ t('admin.sendNotification.employees', 'Employees') }}</div>
                        <div class="recipient-description">{{ t('admin.sendNotification.employeesDesc', 'Send to regular
                          employees') }}</div>
                      </div>
                    </div>
                  </template>
                </q-radio>

                <!-- Accountants Option -->
                <q-radio v-model="notificationForm.recipients" val="accountants" color="primary"
                  class="recipient-radio-item">
                  <template v-slot:default>
                    <div class="recipient-option">
                      <div class="recipient-icon accountants">
                        <q-icon name="account_balance" size="1.5rem" />
                      </div>
                      <div class="recipient-details">
                        <div class="recipient-label">{{ t('admin.sendNotification.accountants', 'Accountants') }}</div>
                        <div class="recipient-description">{{ t('admin.sendNotification.accountantsDesc', 'Send to
                          accounting department') }}</div>
                      </div>
                    </div>
                  </template>
                </q-radio>
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Notification Content -->
          <div class="form-section">
            <div class="form-section-header">
              <q-icon name="edit_notifications" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.content', 'Notification Content') }}</span>
            </div>

            <!-- Title -->
            <div class="q-mb-md">
              <q-input v-model="notificationForm.title"
                :label="t('admin.sendNotification.titleLabel', 'Notification Title')"
                :placeholder="t('admin.sendNotification.titlePlaceholder', 'Enter notification title...')" outlined
                dense maxlength="100" counter
                :rules="[val => val && val.length > 0 || t('admin.sendNotification.titleRequired', 'Title is required')]"
                class="notification-input">
                <template v-slot:prepend>
                  <q-icon name="title" color="grey-6" />
                </template>
              </q-input>
            </div>

            <!-- Description -->
            <div class="q-mb-md">
              <q-input v-model="notificationForm.description"
                :label="t('admin.sendNotification.descriptionLabel', 'Description')"
                :placeholder="t('admin.sendNotification.descriptionPlaceholder', 'Enter notification description...')"
                type="textarea" outlined rows="4" maxlength="500" counter
                :rules="[val => val && val.length > 0 || t('admin.sendNotification.descriptionRequired', 'Description is required')]"
                class="notification-textarea">
                <template v-slot:prepend>
                  <q-icon name="description" color="grey-6" />
                </template>
              </q-input>
            </div>

            <!-- Priority Level -->
            <div class="q-mb-md">
              <q-select v-model="notificationForm.priority" :options="priorityOptions"
                :label="t('admin.sendNotification.priority', 'Priority Level')" outlined dense emit-value map-options
                class="priority-select">
                <template v-slot:prepend>
                  <q-icon name="priority_high" color="grey-6" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Preview Section -->
          <div class="form-section" v-if="notificationForm.title || notificationForm.description">
            <div class="form-section-header">
              <q-icon name="preview" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.preview', 'Preview') }}</span>
            </div>
            <div class="notification-preview">
              <q-card class="preview-card" flat bordered>
                <q-card-section class="preview-content">
                  <div class="preview-header">
                    <q-icon :name="getPriorityIcon(notificationForm.priority)"
                      :color="getPriorityColor(notificationForm.priority)" size="1.2rem" class="q-mr-sm" />
                    <span class="preview-title">{{ notificationForm.title ||
                      t('admin.sendNotification.titlePlaceholder', 'Enter
                      notification title...') }}</span>
                  </div>
                  <div class="preview-description">
                    {{ notificationForm.description || t('admin.sendNotification.descriptionPlaceholder', 'Enter
                    notification
                    description...') }}
                  </div>
                  <div class="preview-meta">
                    <q-chip size="sm" :color="getRecipientColor(notificationForm.recipients)" text-color="white">
                      {{ getRecipientLabel(notificationForm.recipients) }}
                    </q-chip>
                    <span class="preview-time">{{ t('admin.sendNotification.now', 'Now') }}</span>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <q-btn :label="t('common.cancel', 'Cancel')" color="grey-6" flat class="q-mr-md" @click="resetForm" />
            <q-btn :label="t('admin.sendNotification.send', 'Send Notification')" color="primary" type="submit"
              :loading="loading" :disable="!isFormValid" icon="send" class="send-btn" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Recent Notifications -->
    <q-card class="recent-notifications-card q-mt-lg" flat bordered>
      <q-card-section class="q-pa-lg">
        <div class="section-header-simple">
          <q-icon name="history" color="primary" size="1.2rem" class="q-mr-sm" />
          <span class="section-title-simple">{{ t('admin.sendNotification.recentNotifications', 'Recent Notifications')
            }}</span>
        </div>

        <q-list v-if="recentNotifications.length > 0" separator class="recent-list">
          <q-item v-for="notification in recentNotifications" :key="notification.id" class="recent-item">
            <q-item-section avatar>
              <q-icon :name="getPriorityIcon(notification.priority)" :color="getPriorityColor(notification.priority)"
                size="1.2rem" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="notification-title">{{ notification.title }}</q-item-label>
              <q-item-label caption class="notification-desc">{{ notification.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="notification-meta">
                <q-chip size="sm" :color="getRecipientColor(notification.recipients)" text-color="white">
                  {{ getRecipientLabel(notification.recipients) }}
                </q-chip>
                <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="empty-state">
          <q-icon name="notifications_off" size="3rem" color="grey-4" />
          <div class="empty-text">{{ t('admin.sendNotification.noRecentNotifications', 'No recent notifications') }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'boot/axios';
import { showNotify } from 'src/composables/Notify';

interface NotificationForm {
  recipients: 'all' | 'admins' | 'employees' | 'accountants';
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface RecentNotification {
  id: number;
  title: string;
  description: string;
  recipients: string;
  priority: string;
  createdAt: string;
}

const { t } = useI18n();

// Form state
const notificationForm = ref<NotificationForm>({
  recipients: 'all',
  title: '',
  description: '',
  priority: 'normal'
});

const loading = ref(false);
const recentNotifications = ref<RecentNotification[]>([]);

// Priority options
const priorityOptions = computed(() => [
  {
    label: t('admin.sendNotification.priorityLow', 'Low Priority'),
    value: 'low',
    icon: 'low_priority',
    color: 'blue',
    description: t('admin.sendNotification.priorityLowDesc', 'General information')
  },
  {
    label: t('admin.sendNotification.priorityNormal', 'Normal Priority'),
    value: 'normal',
    icon: 'notifications',
    color: 'primary',
    description: t('admin.sendNotification.priorityNormalDesc', 'Standard notification')
  },
  {
    label: t('admin.sendNotification.priorityHigh', 'High Priority'),
    value: 'high',
    icon: 'priority_high',
    color: 'orange',
    description: t('admin.sendNotification.priorityHighDesc', 'Important notification')
  },
  {
    label: t('admin.sendNotification.priorityUrgent', 'Urgent'),
    value: 'urgent',
    icon: 'warning',
    color: 'negative',
    description: t('admin.sendNotification.priorityUrgentDesc', 'Requires immediate attention')
  }
]);

// Form validation
const isFormValid = computed(() => {
  return notificationForm.value.title.trim().length > 0 &&
    notificationForm.value.description.trim().length > 0;
});

// Helper functions
function getPriorityIcon(priority: string): string {
  const icons = {
    low: 'low_priority',
    normal: 'notifications',
    high: 'priority_high',
    urgent: 'warning'
  };
  return icons[priority as keyof typeof icons] || 'notifications';
}

function getPriorityColor(priority: string): string {
  const colors = {
    low: 'blue',
    normal: 'primary',
    high: 'orange',
    urgent: 'negative'
  };
  return colors[priority as keyof typeof colors] || 'primary';
}

function getRecipientColor(recipients: string): string {
  const colors = {
    all: 'purple',
    admins: 'negative',
    employees: 'primary',
    accountants: 'positive'
  };
  return colors[recipients as keyof typeof colors] || 'primary';
}

function getRecipientLabel(recipients: string): string {
  const labels = {
    all: t('admin.sendNotification.allUsers', 'All Users'),
    admins: t('admin.sendNotification.admins', 'Administrators'),
    employees: t('admin.sendNotification.employees', 'Employees'),
    accountants: t('admin.sendNotification.accountants', 'Accountants')
  };
  return labels[recipients as keyof typeof labels] || recipients;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60)), 'minute'
  );
}

// Actions
async function sendNotification() {
  if (!isFormValid.value) return;

  loading.value = true;
  try {
    const payload = {
      title: notificationForm.value.title.trim(),
      description: notificationForm.value.description.trim(),
      recipients: notificationForm.value.recipients,
      priority: notificationForm.value.priority
    };

    await api.post('/admin/notifications/send', payload);

    showNotify({
      type: 'positive',
      message: t('admin.sendNotification.success', 'Notification sent successfully'),
      position: 'top',
      duration: 3000
    });

    // Add to recent notifications
    recentNotifications.value.unshift({
      id: Date.now(),
      title: payload.title,
      description: payload.description,
      recipients: payload.recipients,
      priority: payload.priority,
      createdAt: new Date().toISOString()
    });

    // Keep only last 5 recent notifications
    if (recentNotifications.value.length > 5) {
      recentNotifications.value = recentNotifications.value.slice(0, 5);
    }

    resetForm();
  } catch (error) {
    console.error('Error sending notification:', error);
    showNotify({
      type: 'negative',
      message: t('admin.sendNotification.error', 'Failed to send notification'),
      position: 'top',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  notificationForm.value = {
    recipients: 'all',
    title: '',
    description: '',
    priority: 'normal'
  };
}
</script>

<style lang="scss" scoped>
.notification-sender {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

// Header Section
.section-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

// Form Sections
.notification-form-card,
.recent-notifications-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 32px;
}

.form-section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
}

// Recipient Options
.recipient-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.recipient-radio-group {
  width: 100%;
}

.recipient-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  gap: 16px;

  &:hover {
    border-color: #1976d2;
    background: rgba(25, 118, 210, 0.04);
  }
}

.recipient-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  &.all {
    background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
  }

  &.admins {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  }

  &.employees {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }

  &.accountants {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }
}

.recipient-details {
  flex: 1;
}

.recipient-label {
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 4px;
}

.recipient-description {
  font-size: 0.85rem;
  color: #666;
}

// Form Inputs
.notification-input,
.notification-textarea,
.priority-select {
  :deep(.q-field__control) {
    border-radius: 12px;
  }
}

// Preview Section
.notification-preview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.preview-card {
  border-radius: 12px;
  background: white;
}

.preview-content {
  padding: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-weight: 600;
  color: #1976d2;
}

.preview-description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-time {
  font-size: 0.8rem;
  color: #999;
}

// Action Buttons
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 24px;
}

.send-btn {
  min-width: 160px;
  height: 44px;
  border-radius: 12px;
  font-weight: 600;
}

// Recent Notifications
.section-header-simple {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-simple {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
}

.recent-list {
  border-radius: 12px;
  overflow: hidden;
}

.recent-item {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }
}

.notification-title {
  font-weight: 600;
  color: #333;
}

.notification-desc {
  color: #666;
  margin-top: 4px;
}

.notification-meta {
  text-align: right;
}

.notification-time {
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
}

// Empty State
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-text {
  margin-top: 12px;
  font-size: 1rem;
}

// Responsive Design
@media (max-width: 768px) {
  .notification-sender {
    padding: 16px;
  }

  .section-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .recipient-options {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .send-btn {
    width: 100%;
  }

  .preview-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .notification-meta {
    text-align: left;
  }
}
</style>
