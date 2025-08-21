<template>
  <q-dialog v-model="isVisible" class="refund-details-dialog" :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md">
    <q-card class="refund-details-card">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6 text-primary">
          <q-icon name="undo" class="q-mr-sm" />
          {{ t('transaction.refundDetails') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round v-close-popup size="sm" />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="refundData" class="q-pa-md">
        <!-- Refund Summary -->
        <div class="refund-summary q-mb-md">
          <div class="summary-header q-mb-md">
            <q-icon name="undo" class="summary-main-icon" />
            <div class="summary-title">{{ t('transaction.refundSummary') }}</div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-sm-6 col-xs-12">
              <div class="summary-item cute-card">
                <q-icon name="receipt" class="summary-icon text-primary" />
                <div>
                  <div class="summary-label">{{ t('transaction.refundId') }}</div>
                  <div class="summary-value">#{{ refundData.id }}</div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xs-12">
              <div class="summary-item cute-card">
                <q-icon name="attach_money" class="summary-icon text-green" />
                <div>
                  <div class="summary-label">{{ t('transaction.refundAmount') }}</div>
                  <div class="summary-value text-green text-weight-bold">${{ refundData.refund_price.toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xs-12">
              <div class="summary-item cute-card">
                <q-icon name="currency_exchange" class="summary-icon text-orange" />
                <div>
                  <div class="summary-label">{{ t('transaction.exchangeRate') }}</div>
                  <div class="summary-value">{{ refundData.usd_iqd_rate.toLocaleString() }} IQD/USD</div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xs-12">
              <div class="summary-item cute-card">
                <q-icon name="schedule" class="summary-icon text-blue" />
                <div>
                  <div class="summary-label">{{ t('transaction.refundDate') }}</div>
                  <div class="summary-value">{{ formatDate(refundData.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Refund Reason -->
        <div v-if="refundData.reason" class="refund-reason q-mb-md">
          <div class="reason-card cute-card">
            <div class="reason-header">
              <q-icon name="info" class="text-warning" />
              <span class="reason-title">{{ t('transaction.refundReason') }}</span>
            </div>
            <div class="reason-content">{{ refundData.reason }}</div>
          </div>
        </div>

        <!-- Refunded Amounts -->
        <div class="refunded-amounts q-mb-md">
          <div class="amounts-header q-mb-md">
            <q-icon name="account_balance_wallet" class="amounts-main-icon" />
            <div class="amounts-title">{{ t('transaction.refundedAmounts') }}</div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-sm-3 col-xs-6">
              <div class="amount-card cute-card inflow">
                <q-icon name="south" class="amount-icon" />
                <div class="amount-label">{{ t('transaction.usdIn') }}</div>
                <div class="amount-value">${{ refundData.refunded_amounts.total_usd_in.toFixed(2) }}</div>
              </div>
            </div>
            <div class="col-sm-3 col-xs-6">
              <div class="amount-card cute-card inflow">
                <q-icon name="south" class="amount-icon" />
                <div class="amount-label">{{ t('transaction.iqdIn') }}</div>
                <div class="amount-value">{{ refundData.refunded_amounts.total_iqd_in.toLocaleString() }} IQD</div>
              </div>
            </div>
            <div class="col-sm-3 col-xs-6">
              <div class="amount-card cute-card outflow">
                <q-icon name="north" class="amount-icon" />
                <div class="amount-label">{{ t('transaction.usdOut') }}</div>
                <div class="amount-value">${{ refundData.refunded_amounts.total_usd_out.toFixed(2) }}</div>
              </div>
            </div>
            <div class="col-sm-3 col-xs-6">
              <div class="amount-card cute-card outflow">
                <q-icon name="north" class="amount-icon" />
                <div class="amount-label">{{ t('transaction.iqdOut') }}</div>
                <div class="amount-value">{{ refundData.refunded_amounts.total_iqd_out.toLocaleString() }} IQD</div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Refunded Items -->
        <div class="refunded-items">
          <div class="items-header q-mb-md">
            <q-icon name="inventory" class="items-main-icon" />
            <div class="items-title">{{ t('transaction.refundedItems') }} ({{ refundData.items.length }})</div>
          </div>

          <q-list separator class="rounded-borders">
            <q-item v-for="item in refundData.items" :key="item.id" class="item-card cute-card q-pa-md">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="md" class="item-avatar bouncy">
                  <q-icon name="inventory_2" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium text-h6 item-name">
                  {{ item.name }}
                </q-item-label>
                <q-item-label caption class="text-body2 quantity-info">
                  <q-icon name="production_quantity_limits" size="xs" class="q-mr-xs" />
                  {{ t('transaction.quantity') }}: <span class="text-weight-bold">{{ item.quantity.toLocaleString()
                    }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip color="negative" text-color="white" size="md" icon="undo" class="refund-chip">
                  {{ t('transaction.refunded') }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn :label="t('common.close')" color="primary" flat v-close-popup />
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
  refund_price: number;
  usd_iqd_rate: number;
  reason: string;
  items: {
    id: number;
    name: string;
    quantity: number;
  }[];
  refunded_amounts: {
    total_usd_in: number;
    total_iqd_in: number;
    total_usd_out: number;
    total_iqd_out: number;
  };
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
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

.cute-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(var(--q-primary-rgb), 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    background: rgba(255, 255, 255, 0.95);
  }
}

.refund-summary {
  background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.08) 0%, rgba(var(--q-secondary-rgb), 0.05) 100%);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(var(--q-primary-rgb), 0.1);
}

.summary-header,
.amounts-header,
.items-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-main-icon,
.amounts-main-icon,
.items-main-icon {
  font-size: 28px;
  color: var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 50%;
  padding: 8px;
  animation: pulse 2s infinite;
}

.summary-title,
.amounts-title,
.items-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--q-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.summary-icon {
  font-size: 28px;
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 50%;
  padding: 8px;
  animation: bounce 1s ease-in-out infinite alternate;
}

.summary-label {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--q-dark);
}

.summary-value {
  font-size: 16px;
  font-weight: 700;
  margin-top: 6px;
  color: var(--q-dark);
}

// Refund Reason Card
.refund-reason {
  .reason-card {
    background: linear-gradient(135deg, rgba(var(--q-warning-rgb), 0.1) 0%, rgba(var(--q-warning-rgb), 0.05) 100%);
    border-left: 4px solid var(--q-warning);
  }

  .reason-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .reason-title {
    font-weight: 600;
    color: var(--q-warning);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 13px;
  }

  .reason-content {
    background: rgba(255, 255, 255, 0.6);
    padding: 12px;
    border-radius: 8px;
    font-style: italic;
    color: var(--q-dark);
    line-height: 1.5;
  }
}

// Refunded Amounts
.refunded-amounts {
  background: linear-gradient(135deg, rgba(var(--q-secondary-rgb), 0.05) 0%, rgba(var(--q-accent-rgb), 0.03) 100%);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(var(--q-secondary-rgb), 0.1);
}

.amount-card {
  text-align: center;
  padding: 16px 12px;
  transition: all 0.3s ease;

  &.inflow {
    background: linear-gradient(135deg, rgba(var(--q-positive-rgb), 0.1) 0%, rgba(var(--q-positive-rgb), 0.05) 100%);
    border: 2px solid rgba(var(--q-positive-rgb), 0.2);

    .amount-icon {
      color: var(--q-positive);
      background: rgba(var(--q-positive-rgb), 0.1);
    }

    .amount-value {
      color: var(--q-positive);
    }
  }

  &.outflow {
    background: linear-gradient(135deg, rgba(var(--q-negative-rgb), 0.1) 0%, rgba(var(--q-negative-rgb), 0.05) 100%);
    border: 2px solid rgba(var(--q-negative-rgb), 0.2);

    .amount-icon {
      color: var(--q-negative);
      background: rgba(var(--q-negative-rgb), 0.1);
    }

    .amount-value {
      color: var(--q-negative);
    }
  }
}

.amount-icon {
  font-size: 20px;
  border-radius: 50%;
  padding: 6px;
  margin-bottom: 8px;
}

.amount-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.amount-value {
  font-size: 14px;
  font-weight: 700;
}

// Items Section
.item-card {
  margin-bottom: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.08) 0%, rgba(var(--q-secondary-rgb), 0.05) 100%);
  }
}

.item-avatar {
  border: 3px solid rgba(var(--q-primary-rgb), 0.2);
  box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.3);

  &.bouncy {
    animation: bounce 2s ease-in-out infinite;
  }
}

.item-name {
  background: linear-gradient(45deg, var(--q-primary), var(--q-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quantity-info {
  background: rgba(var(--q-info-rgb), 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-top: 4px;
}

.refund-chip {
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(var(--q-negative-rgb), 0.3);
}

// Animations
@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-8px);
  }

  60% {
    transform: translateY(-4px);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(var(--q-primary-rgb), 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary-rgb), 0);
  }
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
  max-width: 600px;
  min-width: 350px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .refund-details-card {
    border-radius: 0;
    min-width: unset;

    .col-sm-6 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .col-sm-3 {
      width: 50% !important;
      flex: 0 0 50% !important;
      max-width: 50% !important;
    }

    /* Adjust padding for mobile */
    .q-card-section {
      padding: 12px 16px;
    }

    .summary-item {
      flex-direction: column;
      align-items: center !important;
      text-align: center;
      gap: 8px;
    }

    .summary-icon,
    .summary-main-icon,
    .amounts-main-icon,
    .items-main-icon {
      margin-bottom: 8px;
    }

    .summary-title,
    .amounts-title,
    .items-title {
      font-size: 16px;
    }

    .amount-card {
      padding: 12px 8px;
    }

    .amount-value {
      font-size: 12px;
    }

    .amount-label {
      font-size: 10px;
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

    .col-sm-3 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .cute-card {
      padding: 12px;
    }

    .refund-summary,
    .refunded-amounts {
      padding: 16px;
    }

    .summary-value {
      font-size: 14px;
    }

    .amount-value {
      font-size: 13px;
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
