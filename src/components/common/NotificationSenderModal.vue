<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="notification-sender-modal" style="min-width: 600px; max-width: 800px;">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="notifications_active" size="2rem" color="white" />
          </div>
          <div class="header-text">
            <h3 class="modal-title">{{ t('admin.sendNotification.title', 'Send Notification') }}</h3>
            <p class="modal-subtitle">{{ t('admin.sendNotification.subtitle', 'Send notifications to users across the system') }}</p>
          </div>
        </div>
        <q-btn flat round dense icon="close" color="white" @click="closeModal" class="close-btn" />
      </q-card-section>

      <!-- Form Content -->
      <q-card-section class="modal-content">
        <q-form @submit="sendNotification" class="notification-form"> <!-- Recipient Selection -->
          <div class="form-section">
            <div class="form-section-header">
              <q-icon name="people" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.recipients', 'Recipients') }}</span>
            </div>

            <q-option-group v-model="notificationForm.recipients" :options="recipientOptions" color="primary"
              class="recipient-options" />
          </div>

          <!-- Title Input -->
          <div class="form-section">
            <div class="form-section-header">
              <q-icon name="title" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.titleLabel', 'Title') }}</span>
            </div>

            <q-input v-model="notificationForm.title"
              :placeholder="t('admin.sendNotification.titlePlaceholder', 'Enter notification title...')" outlined dense
              counter maxlength="255"
              :rules="[val => !!val || t('admin.sendNotification.titleRequired', 'Title is required')]"
              class="title-input" />
          </div>

          <!-- Description Input -->
          <div class="form-section">
            <div class="form-section-header">
              <q-icon name="description" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.descriptionLabel', 'Description') }}</span>
            </div>

            <q-input v-model="notificationForm.description"
              :placeholder="t('admin.sendNotification.descriptionPlaceholder', 'Enter notification description...')"
              outlined type="textarea" rows="4" counter maxlength="256"
              :rules="[val => !!val || t('admin.sendNotification.descriptionRequired', 'Description is required')]"
              class="description-input" />
          </div>

          <!-- Preview Section -->
          <div class="form-section">
            <div class="form-section-header">
              <q-icon name="preview" color="primary" size="1.2rem" class="q-mr-sm" />
              <span class="form-section-title">{{ t('admin.sendNotification.preview', 'Preview') }}</span>
            </div>

            <q-card class="notification-preview" flat bordered>
              <q-card-section class="preview-content">
                <div class="preview-header">
                  <q-icon name="notifications" color="primary" size="1.2rem" class="q-mr-sm" />
                  <span class="preview-title">{{ notificationForm.title || t('admin.sendNotification.titlePlaceholder',
                    'Enter notification title...') }}</span>
                </div>
                <div class="preview-description">
                  {{ notificationForm.description || t('admin.sendNotification.descriptionPlaceholder', 'Enter notification description...') }}
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
        </q-form>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="modal-actions">
        <q-btn :label="t('common.cancel', 'Cancel')" color="grey-6" flat @click="closeModal" />
        <q-btn :label="t('admin.sendNotification.send', 'Send Notification')" color="primary" :loading="loading"
          :disable="!isFormValid" icon="send" @click="sendNotification" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'boot/axios';
import { showNotify } from 'src/composables/Notify';

interface NotificationForm {
  recipients: 'all' | 'admins' | 'employees' | 'accountants';
  title: string;
  description: string;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'notification-sent': [];
}>();

const { t } = useI18n();

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Form state
const notificationForm = ref<NotificationForm>({
  recipients: 'all',
  title: '',
  description: ''
});

const loading = ref(false);

// Recipient options
const recipientOptions = computed(() => [
  {
    label: t('admin.sendNotification.allUsers', 'All Users'),
    value: 'all',
    sublabel: t('admin.sendNotification.allUsersDesc', 'Send to everyone in the system')
  },
  {
    label: t('admin.sendNotification.admins', 'Administrators'),
    value: 'admins',
    sublabel: t('admin.sendNotification.adminsDesc', 'Send to system administrators only')
  },
  {
    label: t('admin.sendNotification.employees', 'Employees'),
    value: 'employees',
    sublabel: t('admin.sendNotification.employeesDesc', 'Send to all employees')
  },
  {
    label: t('admin.sendNotification.accountants', 'Accountants'),
    value: 'accountants',
    sublabel: t('admin.sendNotification.accountantsDesc', 'Send to accountants only')
  }
]);

// Form validation
const isFormValid = computed(() => {
  return notificationForm.value.title.trim().length > 0 &&
    notificationForm.value.description.trim().length > 0;
});

// Helper functions

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

// Actions
async function sendNotification() {
  if (!isFormValid.value) return;

  loading.value = true;
  try {
    const payload: any = {
      title: notificationForm.value.title.trim(),
      description: notificationForm.value.description.trim(),
    };

    // Add options field only if not sending to all users
    if (notificationForm.value.recipients !== 'all') {
      payload.options = notificationForm.value.recipients;
    }

    await api.post('/send-notification', payload);

    showNotify({
      type: 'positive',
      message: t('admin.sendNotification.success', 'Notification sent successfully'),
      position: 'top',
      duration: 3000
    });

    emit('notification-sent');
    closeModal();
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

function closeModal() {
  isOpen.value = false;
}

function resetForm() {
  notificationForm.value = {
    recipients: 'all',
    title: '',
    description: ''
  };
}

// Reset form when modal closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});
</script>

<style lang="scss" scoped>
.notification-sender-modal {
  .modal-header {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    position: relative;
    padding: 24px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
      }

      .header-text {
        flex: 1;

        .modal-title {
          margin: 0 0 4px 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .modal-subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }
      }
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }

  .modal-content {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .notification-form {
    .form-section {
      margin-bottom: 24px;

      .form-section-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .form-section-title {
          font-weight: 600;
          color: #37474f;
        }
      }
    }

    .recipient-options {
      :deep(.q-radio) {
        margin-bottom: 8px;

        .q-radio__label {
          font-weight: 500;
        }
      }
    }

    .priority-select {
      max-width: 300px;
    }

    .notification-preview {
      background: #f8f9fa;
      border: 1px dashed #dee2e6;

      .preview-content {
        .preview-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .preview-title {
            font-weight: 600;
            color: #37474f;
          }
        }

        .preview-description {
          color: #666;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .preview-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .preview-time {
            font-size: 0.8rem;
            color: #999;
          }
        }
      }
    }
  }

  .modal-actions {
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
  }
}
</style>
