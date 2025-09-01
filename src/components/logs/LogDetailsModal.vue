<template>
  <q-dialog
    v-model="isVisible"
    class="log-details-dialog"
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
  >
    <q-card class="log-details-card">
      <!-- Beautiful Modal Header -->
      <div class="modal-header">
        <div class="text-h5">
          <q-icon name="history" class="q-mr-sm" />
          {{ t('logs.activityDetails') }}
        </div>
        <q-btn
          icon="close"
          flat
          round
          v-close-popup
          size="sm"
        />
      </div>

      <q-card-section v-if="logData" class="q-pa-md">
        <!-- Activity Summary -->
        <div class="activity-summary q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="person" class="summary-icon text-primary" />
                <div>
                  <div class="summary-label">{{ t('logs.columns.user') }}</div>
                  <div class="summary-value">{{ logData.user?.name || t('common.notSet') }}</div>
                  <div class="summary-subtitle">{{ logData.user?.username || '' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="event" class="summary-icon text-blue" />
                <div>
                  <div class="summary-label">{{ t('logs.columns.action') }}</div>
                  <div class="summary-value">{{ logData.title || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="category" class="summary-icon text-purple" />
                <div>
                  <div class="summary-label">{{ t('logs.entity') }}</div>
                  <div class="summary-value">{{ logData.entity || t('common.notSet') }}</div>
                  <div class="summary-subtitle">ID: {{ logData.entity_id || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="schedule" class="summary-icon text-green" />
                <div>
                  <div class="summary-label">{{ t('logs.timestamp') }}</div>
                  <div class="summary-value">{{ formatDateTime(logData.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Device Information -->
        <div class="device-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="devices" class="q-mr-sm" />
            {{ t('logs.deviceInfo') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <div class="device-card">
                <q-icon name="computer" class="device-icon text-primary" />
                <div class="device-label">{{ t('logs.platform') }}</div>
                <div class="device-value">{{ formatPlatform(logData.platform) }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="device-card">
                <q-icon name="language" class="device-icon text-blue" />
                <div class="device-label">{{ t('logs.browser') }}</div>
                <div class="device-value">{{ logData.browser || t('common.notSet') }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="device-card">
                <q-icon name="router" class="device-icon text-green" />
                <div class="device-label">{{ t('logs.ipAddress') }}</div>
                <div class="device-value">{{ logData.ip_address || t('common.notSet') }}</div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Data Changes Section -->
        <div class="changes-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="compare_arrows" class="q-mr-sm" />
            {{ t('logs.dataChanges') }}
          </div>

          <!-- Old Data -->
          <div v-if="logData.old_data" class="data-comparison q-mb-md">
            <div class="data-section old-data">
              <div class="data-header">
                <q-icon name="history" class="q-mr-sm" />
                {{ t('logs.oldData') }}
              </div>
              <div class="data-content">
                <pre class="json-display">{{ formatJson(logData.old_data) }}</pre>
              </div>
            </div>
          </div>

          <!-- New Data -->
          <div v-if="logData.new_data" class="data-comparison">
            <div class="data-section new-data">
              <div class="data-header">
                <q-icon name="update" class="q-mr-sm" />
                {{ t('logs.newData') }}
              </div>
              <div class="data-content">
                <pre class="json-display">{{ formatJson(logData.new_data) }}</pre>
              </div>
            </div>
          </div>

          <!-- No Changes Message -->
          <div v-if="!logData.old_data && !logData.new_data" class="no-changes q-mt-md">
            <q-icon name="info" size="md" class="q-mr-sm" />
            {{ t('logs.noDataChanges') }}
          </div>
        </div>

        <!-- User Details Section -->
        <div v-if="logData.new_data" class="user-details-section q-mt-md">
          <q-separator class="q-my-md" />
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="person_outline" class="q-mr-sm" />
            {{ t('logs.userDetails') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="detail-item">
                <q-icon name="badge" class="detail-icon text-primary" />
                <div>
                  <div class="detail-label">{{ t('logs.name') }}</div>
                  <div class="detail-value">{{ logData.new_data.name || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-item">
                <q-icon name="person" class="detail-icon text-blue" />
                <div>
                  <div class="detail-label">{{ t('logs.username') }}</div>
                  <div class="detail-value">{{ logData.new_data.username || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-item">
                <q-icon name="phone" class="detail-icon text-green" />
                <div>
                  <div class="detail-label">{{ t('logs.phone') }}</div>
                  <div class="detail-value">{{ logData.new_data.phone || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-item">
                <q-icon name="admin_panel_settings" class="detail-icon text-purple" />
                <div>
                  <div class="detail-label">{{ t('logs.role') }}</div>
                  <div class="detail-value">{{ logData.new_data.role || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-item">
                <q-icon name="category" class="detail-icon text-orange" />
                <div>
                  <div class="detail-label">{{ t('logs.type') }}</div>
                  <div class="detail-value">{{ logData.new_data.type || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-item">
                <q-icon name="wc" class="detail-icon text-teal" />
                <div>
                  <div class="detail-label">{{ t('logs.gender') }}</div>
                  <div class="detail-value">{{ logData.new_data.is_male ? t('logs.male') : t('logs.female') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Fallback when no log data -->
      <q-card-section v-else class="q-pa-md text-center">
        <q-icon name="history" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6">{{ t('common.noDataAvailable') }}</div>
        <div class="text-body2 text-grey-5">{{ t('logs.noLogSelected') }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          :label="t('common.close')"
          color="primary"
          flat
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from 'quasar'
import type { AuditLogEntry } from 'src/types/log'

// Composables
const $q = useQuasar()

interface Props {
  modelValue: boolean;
  logData?: AuditLogEntry | null;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>()

const { t } = useI18n()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Helper functions
const formatDateTime = (dateString: string) => {
  if (!dateString) return t('common.notSet')
  try {
    return date.formatDate(dateString.replace(' ', 'T'), 'YYYY-MM-DD HH:mm:ss')
  } catch {
    return dateString
  }
}

const formatPlatform = (platform: string) => {
  if (!platform) return t('common.notSet')
  const lower = platform.toLowerCase()
  if (lower.includes('android')) return '🤖 Android'
  if (lower.includes('windows')) return '🪟 Windows'
  if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) return '🍏 iOS'
  if (lower.includes('mac')) return '🍎 macOS'
  if (lower.includes('linux')) return '🐧 Linux'
  return platform
}

const formatJson = (data: any) => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
</script>

<style lang="scss" scoped>
.log-details-card {
  border-radius: 4;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .modal-header {
    background: #2A7B9B;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .text-h5 {
      color: white !important;
      margin: 0;
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .q-btn {
      color: white !important;
    }
  }
}

.activity-summary {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  font-size: 24px;
}

.summary-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.summary-subtitle {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
}

.device-section {
  background: rgba(var(--q-secondary-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.device-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.device-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.device-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 4px;
}

.device-value {
  font-size: 14px;
  font-weight: 600;
  word-break: break-word;
}

.changes-section {
  background: rgba(var(--q-accent-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.data-comparison {
  margin-bottom: 16px;
}

.data-section {
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-header {
  background: rgba(var(--q-primary-rgb), 0.1);
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.data-content {
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.json-display {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid #e9ecef;
}

.old-data .data-header {
  background: rgba(var(--q-negative-rgb), 0.1);
  color: var(--q-negative);
}

.new-data .data-header {
  background: rgba(var(--q-positive-rgb), 0.1);
  color: var(--q-positive);
}

.no-changes {
  text-align: center;
  color: var(--q-grey-6);
  font-style: italic;
  padding: 20px;
}

.user-details-section {
  background: rgba(var(--q-info-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-icon {
  font-size: 20px;
}

.detail-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
}

:deep(.q-dialog__inner) {
  padding: 16px;
}

:deep(.q-card) {
  max-height: 90vh;
  overflow-y: auto;
}
</style>

<style scoped>
.log-details-card {
  width: 100%;
  max-width: 900px;
  min-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .log-details-card {
    border-radius: 0;

    .modal-header {
      padding: 12px 16px;

      .text-h5 {
        font-size: 1.1rem;
        line-height: 1.2;
      }
    }

    .col-6 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .col-4 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    /* Adjust padding for mobile */
    .q-card-section {
      padding: 12px 16px;
    }

    .summary-item, .detail-item {
      flex-direction: column;
      align-items: flex-start !important;
      text-align: left;
    }

    .summary-icon, .detail-icon {
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .log-details-card {
    font-size: 14px;

    .text-h6 {
      font-size: 1.1rem;
    }

    /* Make form more compact on very small screens */
    .q-card-section {
      padding: 8px 12px;
    }
  }
}

/* Tablet responsive styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .log-details-card {
    max-width: 90vw;
    width: 90vw;
  }
}

/* Ensure dialog is properly positioned */
.log-details-dialog .q-dialog__inner {
  padding: 0;
}

.log-details-dialog .q-dialog__inner--minimized {
  padding: 16px;
}

@media (max-width: 768px) {
  .log-details-dialog .q-dialog__inner {
    padding: 0 !important;
  }

  .log-details-dialog .q-dialog__inner--minimized {
    padding: 0 !important;
  }
}
</style> 