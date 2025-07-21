<template>
  <q-dialog
    v-model="isVisible"
    class="refund-details-dialog"
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
  >
    <q-card class="refund-details-card">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6 text-primary">
          <q-icon name="undo" class="q-mr-sm" />
          {{ t('transaction.refundDetails') }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          v-close-popup
          size="sm"
        />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="refundData" class="q-pa-md">
        <!-- Refund Summary -->
        <div class="refund-summary q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="receipt" class="summary-icon text-primary" />
                <div>
                  <div class="summary-label">{{ t('transaction.refundId') }}</div>
                  <div class="summary-value">#{{ refundData.id }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="attach_money" class="summary-icon text-green" />
                <div>
                  <div class="summary-label">{{ t('transaction.refundAmount') }}</div>
                  <div class="summary-value text-green text-weight-bold">${{ refundData.refund_price.toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="currency_exchange" class="summary-icon text-orange" />
                <div>
                  <div class="summary-label">{{ t('transaction.exchangeRate') }}</div>
                  <div class="summary-value">{{ refundData.usd_iqd_rate }} IQD/USD</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="schedule" class="summary-icon text-blue" />
                <div>
                  <div class="summary-label">{{ t('transaction.refundDate') }}</div>
                  <div class="summary-value">{{ formatDate(refundData.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Refunded Items -->
        <div class="refunded-items">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="inventory" class="q-mr-sm" />
            {{ t('transaction.refundedItems') }}
          </div>

          <q-list separator class="rounded-borders">
            <q-item
              v-for="item in refundData.items"
              :key="item.id"
              class="item-card q-pa-md"
            >
              <q-item-section avatar>
                <q-avatar
                  color="primary"
                  text-color="white"
                  size="md"
                  class="item-avatar"
                >
                  <q-icon name="inventory_2" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium text-h6">
                  {{ item.name }}
                </q-item-label>
                <q-item-label caption class="text-body2">
                  <q-icon name="production_quantity_limits" size="xs" class="q-mr-xs" />
                  {{ t('transaction.quantity') }}: {{ item.quantity }}
                </q-item-label>
                <q-item-label
                  v-if="item.reason"
                  caption
                  class="reason-text q-mt-xs"
                >
                  <q-icon name="info" size="xs" class="q-mr-xs" />
                  <strong>{{ t('transaction.reason') }}:</strong> {{ item.reason }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip
                  color="primary"
                  text-color="white"
                  size="sm"
                  icon="undo"
                >
                  {{ t('transaction.refunded') }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
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

// Composables
const $q = useQuasar()

interface RefundData {
  id: number;
  items: {
    id: number;
    name: string;
    quantity: number;
    reason: string;
  }[];
  refund_price: number;
  usd_iqd_rate: number;
  created_at: string;
}

interface Props {
  modelValue: boolean;
  refundData?: RefundData | null;
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

const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.refund-details-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.refund-summary {
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

.item-card {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin-bottom: 8px;

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.05);
  }
}

.item-avatar {
  border: 2px solid rgba(var(--q-primary-rgb), 0.2);
}

.reason-text {
  background: rgba(var(--q-warning-rgb), 0.1);
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 3px solid var(--q-warning);
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
.refund-details-card {
  width: 100%;
  max-width: 500px;
  min-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .refund-details-card {
    border-radius: 0;

    .col-6 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    /* Adjust padding for mobile */
    .q-card-section {
      padding: 12px 16px;
    }

    .summary-item {
      flex-direction: column;
      align-items: flex-start !important;
      text-align: left;
    }

    .summary-icon {
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .refund-details-card {
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
  .refund-details-card {
    max-width: 90vw;
    width: 90vw;
  }
}

/* Ensure dialog is properly positioned */
.refund-details-dialog .q-dialog__inner {
  padding: 0;
}

.refund-details-dialog .q-dialog__inner--minimized {
  padding: 16px;
}

@media (max-width: 768px) {
  .refund-details-dialog .q-dialog__inner {
    padding: 0 !important;
  }

  .refund-details-dialog .q-dialog__inner--minimized {
    padding: 0 !important;
  }
}
</style>
