<template>
  <div class="log-details-container">
    <q-card class="log-details-card">
      <q-card-section class="card-header">
        <div class="flex items-center justify-between">
          <div class="header-info">
            <h6 class="text-weight-bold q-my-none">
              <q-icon name="info" size="sm" class="q-mr-sm" />
              {{ t('logs.activityDetails', 'Activity Details') }}
            </h6>
            <p class="text-caption text-grey-6 q-mb-none">
              {{ t('logs.detailedInformation', 'Detailed information about this activity') }}
            </p>
          </div>
          <q-chip :color="getActionColor(logEntry.title)" text-color="white" icon="event">
            {{ logEntry.title }}
          </q-chip>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="card-content">
        <div class="details-grid">
          <!-- User Information -->
          <div class="detail-section">
            <div class="section-title">
              <q-icon name="person" size="sm" class="q-mr-sm" />
              {{ t('logs.userInformation', 'User Information') }}
            </div>
            <q-list class="detail-list">
              <q-item>
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ logEntry.user.name }}</q-item-label>
                  <q-item-label caption>@{{ logEntry.user.username }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="phone" size="xs" class="q-mr-xs" />
                    {{ logEntry.user.phone }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Action Information -->
          <div class="detail-section">
            <div class="section-title">
              <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
              {{ t('logs.actionInformation', 'Action Information') }}
            </div>
            <q-list class="detail-list">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ t('logs.entityType', 'Entity Type') }}</q-item-label>
                  <q-item-label caption>{{ logEntry.entity }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ t('logs.entityId', 'Entity ID') }}</q-item-label>
                  <q-item-label caption>{{ logEntry.entity_id }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ t('logs.timestamp', 'Timestamp') }}</q-item-label>
                  <q-item-label caption>{{ formatFullDate(logEntry.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- System Information -->
          <div class="detail-section">
            <div class="section-title">
              <q-icon name="devices" size="sm" class="q-mr-sm" />
              {{ t('logs.systemInformation', 'System Information') }}
            </div>
            <q-list class="detail-list">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ t('logs.ipAddress', 'IP Address') }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="public" size="xs" class="q-mr-xs" />
                    {{ logEntry.ip_address }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ t('logs.platform', 'Platform') }}</q-item-label>
                  <q-item-label caption>
                    <q-icon :name="getPlatformIcon(logEntry.platform)" size="xs" class="q-mr-xs" />
                    {{ logEntry.platform }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ t('logs.browser', 'Browser') }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="web" size="xs" class="q-mr-xs" />
                    {{ logEntry.browser }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Data Changes Section -->
        <div class="data-changes-section q-mt-lg">
          <div class="section-title">
            <q-icon name="compare_arrows" size="sm" class="q-mr-sm" />
            {{ t('logs.dataChanges', 'Data Changes') }}
          </div>

          <div class="changes-container">
            <!-- Old Data -->
            <div class="data-column" v-if="logEntry.old_data">
              <div class="data-header old-data-header">
                <q-icon name="history" size="sm" class="q-mr-sm" />
                {{ t('logs.previousData', 'Previous Data') }}
              </div>
              <q-card class="data-card old-data-card">
                <q-card-section>
                  <pre class="data-content">{{ formatJsonData(logEntry.old_data) }}</pre>
                </q-card-section>
              </q-card>
            </div>

            <!-- Arrow separator -->
            <div class="arrow-separator" v-if="logEntry.old_data">
              <q-icon name="arrow_forward" size="md" color="primary" />
            </div>

            <!-- New Data -->
            <div class="data-column">
              <div class="data-header new-data-header">
                <q-icon name="fiber_new" size="sm" class="q-mr-sm" />
                {{ logEntry.old_data ? t('logs.newData', 'New Data') : t('logs.createdData', 'Created Data') }}
              </div>
              <q-card class="data-card new-data-card">
                <q-card-section>
                  <pre class="data-content">{{ formatJsonData(logEntry.new_data) }}</pre>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { AuditLogEntry } from 'src/types/log'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const _props = defineProps<{
  logEntry: AuditLogEntry
}>()

// Methods
function getActionColor(action: string): string {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('create') || actionLower.includes('add')) return 'positive'
  if (actionLower.includes('update') || actionLower.includes('edit')) return 'warning'
  if (actionLower.includes('delete') || actionLower.includes('remove')) return 'negative'
  if (actionLower.includes('login') || actionLower.includes('auth')) return 'info'
  return 'primary'
}

function getPlatformIcon(platform: string): string {
  const platformLower = platform.toLowerCase()
  if (platformLower.includes('windows')) return 'desktop_windows'
  if (platformLower.includes('mac')) return 'laptop_mac'
  if (platformLower.includes('linux')) return 'computer'
  if (platformLower.includes('android')) return 'android'
  if (platformLower.includes('ios')) return 'phone_iphone'
  if (platformLower.includes('mobile')) return 'smartphone'
  return 'devices'
}

function formatFullDate(dateString: string): string {
  return date.formatDate(dateString, 'MMM DD, YYYY HH:mm:ss')
}

function formatJsonData(data: any): string {
  return JSON.stringify(data, null, 2)
}
</script>

<style lang="scss" scoped>
.log-details-container {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  margin: 8px 0;
}

.log-details-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%);
  padding: 20px 24px;
}

.header-info h6 {
  font-size: 1.1rem;
  color: var(--q-dark);
}

.card-content {
  padding: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 16px;
}

.detail-section {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--q-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-list {
  padding: 0;
}

.detail-list .q-item {
  padding: 8px 0;
  min-height: auto;
}

.data-changes-section {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 24px;
}

.changes-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 16px;
}

.data-column {
  flex: 1;
}

.data-header {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.old-data-header {
  color: var(--q-negative);
}

.new-data-header {
  color: var(--q-positive);
}

.data-card {
  border-radius: 8px;
  max-height: 300px;
  overflow: hidden;
}

.old-data-card {
  border-left: 4px solid var(--q-negative);
}

.new-data-card {
  border-left: 4px solid var(--q-positive);
}

.data-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 250px;
  overflow-y: auto;
  color: var(--q-dark);
  background: transparent;
}

.arrow-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  margin-top: 32px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .changes-container {
    flex-direction: column;
    gap: 12px;
  }

  .arrow-separator {
    transform: rotate(90deg);
    margin: 8px 0;
  }

  .card-content {
    padding: 16px;
  }
}

/* Scrollbar styling for data content */
.data-content::-webkit-scrollbar {
  width: 6px;
}

.data-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.data-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.data-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
