<template>
  <q-dialog v-model="isVisible" persistent class="refund-dialog">
    <q-card class="modal-card" style="width: 700px; max-width: 95vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <q-icon name="undo" size="2rem" />
          </div>
          <div>
            <h4 class="modal-title">{{ t('payment.refund.title') }}</h4>
            <p class="modal-subtitle">{{ t('payment.refund.subtitle') }}</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="close" class="close-btn" />
      </q-card-section>

      <q-separator />

      <q-card-section class="modal-body" style="overflow-y: auto; flex: 1;">
        <!-- Status Card -->
        <div v-if="props.transactionData" class="payment-status-card q-mb-md">
          <div class="status-header">
            <q-icon name="info" class="q-mr-sm" />
            <div class="status-title">{{ t('payment.paySupplier.transactionDetails') }}</div>
          </div>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-label">{{ t('payment.paySupplier.totalAmount') }}</div>
              <div class="status-value total-amount">${{ formatCurrency(props.transactionData.total_price || 0) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">{{ t('payment.paySupplier.paidAmount') }}</div>
              <div class="status-value paid-amount">${{ formatCurrency(props.transactionData.paid_price || 0) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">{{ t('payment.paySupplier.remainingAmount') }}</div>
              <div class="status-value remaining-amount">${{ formatCurrency(props.transactionData.unpaid_price || 0) }}</div>
            </div>
          </div>
        </div>

        <q-form @submit.prevent="handleSubmit" class="payment-form">
          <!-- Exchange Rate -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="currency_exchange" class="label-icon" />
              {{ t('payment.refund.exchangeRateLabel') }}
            </label>
            <div class="exchange-rate-display">
              <div class="rate-item">
                <q-chip color="primary" text-color="white" icon="attach_money">
                  1 USD = {{ formatNumber(usdIqdRate) }} IQD
                </q-chip>
                <q-btn flat dense round icon="refresh" @click="refreshExchangeRate" :loading="refreshingRate" class="refresh-btn" :title="t('payment.refund.refreshRate')" />
              </div>
            </div>
          </div>

          <!-- Amounts Grid -->
          <div class="form-group">
            <label class="form-label section-label">
              <q-icon name="account_balance_wallet" class="label-icon" />
              {{ t('payment.refund.paymentAmountsLabel') }}
            </label>

            <div class="payment-grid">
              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="currency_exchange" color="primary" size="16px" />
                  {{ t('payment.refund.iqdAmountLabel') }}
                </label>
                <q-input v-model.number="iqd_price" type="number" min="0" step="250" outlined dense suffix="IQD" :placeholder="t('payment.refund.enterIqdAmount')" class="form-input payment-input" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="currency_exchange" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="attach_money" color="primary" size="16px" />
                  {{ t('payment.refund.usdAmountLabel') }}
                </label>
                <q-input v-model.number="usd_price" type="number" min="0" step="0.01" outlined dense suffix="USD" :placeholder="t('payment.refund.enterUsdAmount')" class="form-input payment-input" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="attach_money" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="keyboard_return" color="warning" size="16px" />
                  {{ t('payment.refund.iqdReturnLabel') }}
                </label>
                <q-input v-model.number="iqd_return_amount" type="number" min="0" step="250" outlined dense suffix="IQD" :placeholder="t('payment.refund.enterIqdReturn')" class="form-input payment-input" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="keyboard_return" color="warning" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="keyboard_return" color="warning" size="16px" />
                  {{ t('payment.refund.usdReturnLabel') }}
                </label>
                <q-input v-model.number="usd_return_amount" type="number" min="0" step="0.01" outlined dense suffix="USD" :placeholder="t('payment.refund.enterUsdReturn')" class="form-input payment-input" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="keyboard_return" color="warning" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Payment Summary -->
            <div class="payment-summary-card" v-if="totalRefundAmount > 0">
              <div class="summary-header">
                <q-icon name="receipt" class="q-mr-sm" />
                <span class="summary-title">{{ t('payment.refund.paymentSummary') }}</span>
              </div>
              <div class="summary-content">
                <div class="summary-row">
                  <span class="summary-label">{{ t('payment.refund.totalPayment') }}:</span>
                  <span class="summary-value total-payment">${{ formatCurrency(totalRefundAmount) }}</span>
                </div>
                <div v-if="totalReturnAmount > 0" class="summary-row">
                  <span class="summary-label">{{ t('payment.refund.totalReturn') }}:</span>
                  <span class="summary-value total-return">${{ formatCurrency(totalReturnAmount) }}</span>
                </div>
                <div class="summary-row final-row">
                  <span class="summary-label">{{ t('payment.refund.netAmount') }}:</span>
                  <span class="summary-value net-amount">${{ formatCurrency(netRefundAmount) }}</span>
                </div>
              </div>
            </div>

            <div v-if="!isAmountsMatching" class="warning-message q-mt-sm">
              <q-icon name="warning" />
              {{ t('transaction.calculatedAmount', { amount: calculatedRefundAmount.toFixed(2) }) }}
            </div>
          </div>

          <!-- Items to Refund -->
          <div class="form-group">
            <label class="form-label section-label">
              <q-icon name="inventory_2" class="label-icon" />
              {{ t('transaction.itemsToRefund') }}
            </label>

            <div v-if="availableItems.length > 0" class="items-section">
              <div v-for="item in availableItems" :key="item.id" class="item-card">
                <div class="item-info">
                  <div class="item-header">
                    <q-icon name="inventory_2" class="item-icon" />
                    <div>
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-details">
                        {{ t('transaction.available') }}: {{ item.quantity }} {{ t('transaction.units') }} |
                        {{ t('transaction.unitPrice') }}: ${{ item.unit_price.toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="item-controls">
                  <q-input :model-value="refundQuantities[item.id] || 0" @update:model-value="(val) => {
                      const numVal = Number(val) || 0;
                      const maxAllowed = item.quantity;
                      refundQuantities[item.id] = numVal > maxAllowed ? maxAllowed : numVal;
                      updateRefundDetails();
                    }" type="number" min="0" :max="item.quantity" outlined dense style="width: 140px" class="payment-input"
                    :hint="t('transaction.maxAvailable', { max: item.quantity })">
                    <template v-slot:prepend>
                      <q-icon name="production_quantity_limits" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div v-if="!hasItemsToRefund" class="warning-message">
                <q-icon name="warning" /> {{ t('transaction.selectAtLeastOneItem') }}
              </div>
            </div>

            <div v-else class="no-items-message">
              <q-icon name="info" color="info" />
              {{ t('transaction.noItemsForRefund') }}
            </div>
          </div>

          <!-- Reason -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="note" class="label-icon" />
              {{ t('payment.refund.noteLabel') }}
            </label>
            <q-input v-model="form.reason" type="textarea" outlined dense rows="3" :placeholder="t('payment.refund.notePlaceholder')" class="form-input" @wheel.prevent />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions class="modal-actions" style="flex-shrink: 0;">
        <q-btn :label="t('payment.refund.cancel')" flat color="grey-7" @click="close" class="cancel-btn" />
        <q-btn :label="t('payment.refund.processRefund')" color="primary" unelevated :loading="loading" :disable="!isFormValid" @click="handleSubmit" class="submit-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useItemTransactionStore } from 'src/stores/itemTransactionStore'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import type { List } from 'src/types/item_transaction'
import { useExchangeRateStore } from 'src/stores/exchangeRateStore'

const { t } = useI18n()

// Props
interface Props {
  modelValue: boolean
  transactionData: List | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// Store and composables
const transactionStore = useItemTransactionStore()
const exchangeRateStore = useExchangeRateStore()
const $q = useQuasar()

// Reactive state
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = computed(() => transactionStore.loading)

// Form data
const form = ref({
  transaction_id: 0,
  refund_price: 0,
  usd_iqd_rate: 1500, // Default rate
  reason: '',
  details: [] as Array<{ item_id: number; quantity: number }>
})

const refundQuantities = ref<Record<number, number>>({})

// Refund currency split fields
const iqd_price = ref<number>(0)
const usd_price = ref<number>(0)
const iqd_return_amount = ref<number>(0)
const usd_return_amount = ref<number>(0)
const refreshingRate = ref(false)

// Computed properties
const availableItems = computed(() => {
  return props.transactionData?.items || []
})

const _maxRefundAmount = computed(() => {
  return props.transactionData?.total_price || 0
})

const calculatedRefundAmount = computed(() => {
  let total = 0
  Object.entries(refundQuantities.value).forEach(([itemId, quantity]) => {
    const item = availableItems.value.find(i => i.id === parseInt(itemId))
    if (item && quantity > 0) {
      total += item.unit_price * quantity
    }
  })
  return total
})

// Exchange rate & amounts
const usdIqdRate = computed(() => form.value.usd_iqd_rate || exchangeRateStore.activeRate?.usd_iqd_rate || 1500)

const totalRefundAmount = computed(() => {
  const iqdInUsd = (iqd_price.value || 0) / usdIqdRate.value
  return iqdInUsd + (usd_price.value || 0)
})

const totalReturnAmount = computed(() => {
  const iqdInUsd = (iqd_return_amount.value || 0) / usdIqdRate.value
  return iqdInUsd + (usd_return_amount.value || 0)
})

const netRefundAmount = computed(() => {
  return Math.max(0, totalRefundAmount.value - totalReturnAmount.value)
})

const isAmountsMatching = computed(() => {
  return Math.abs(netRefundAmount.value - calculatedRefundAmount.value) < 0.01
})

const hasItemsToRefund = computed(() => {
  return Object.values(refundQuantities.value).some(qty => qty > 0)
})

const isFormValid = computed(() => {
  return calculatedRefundAmount.value > 0 &&
         form.value.reason.length >= 10 &&
         hasItemsToRefund.value &&
         isAmountsMatching.value
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const updateRefundDetails = () => {
  form.value.details = Object.entries(refundQuantities.value)
    .filter(([_, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({
      item_id: parseInt(itemId),
      quantity: quantity
    }))

  // Auto-calculate refund amount based on selected items
  form.value.refund_price = calculatedRefundAmount.value
  // If user hasn't entered any split yet, default all to USD
  const noInputs = (iqd_price.value || 0) + (usd_price.value || 0) + (iqd_return_amount.value || 0) + (usd_return_amount.value || 0) === 0
  if (noInputs) {
    usd_price.value = Number(calculatedRefundAmount.value.toFixed(2))
    iqd_price.value = 0
    iqd_return_amount.value = 0
    usd_return_amount.value = 0
  }
}

const close = () => {
  isVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    transaction_id: 0,
    refund_price: 0,
    usd_iqd_rate: 1500,
    reason: '',
    details: []
  }
  refundQuantities.value = {}
  iqd_price.value = 0
  usd_price.value = 0
  iqd_return_amount.value = 0
  usd_return_amount.value = 0
}

const handleSubmit = async () => {
  try {
    if (!props.transactionData) {
      throw new Error(t('transaction.noTransactionData'))
    }

    // Validate quantities don't exceed available amounts
    for (const detail of form.value.details) {
      const item = availableItems.value.find(i => i.id === detail.item_id)
      if (!item || detail.quantity > item.quantity) {
        throw new Error(t('transaction.cannotRefundQuantity', {
          quantity: detail.quantity,
          itemName: item?.name || 'item',
          available: item?.quantity || 0
        }))
      }
    }

    form.value.transaction_id = props.transactionData.id
    // Use the split to set the final refund price
    form.value.refund_price = Number(netRefundAmount.value.toFixed(2))

    await transactionStore.refundTransaction(form.value)

    $q.notify({
      type: 'positive',
      message: t('transaction.refundProcessedSuccessfully'),
      position: 'top'
    })

    emit('success')
    close()
  } catch (error) {
    console.error('Error processing refund:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('transaction.failedToProcessRefund'),
      position: 'top'
    })
  }
}

// Initialize form when transaction data changes
watch(() => props.transactionData, (newData) => {
  if (newData) {
    form.value.transaction_id = newData.id
    // Use the original transaction's exchange rate
    form.value.usd_iqd_rate = newData.usd_iqd_rate || 1500
    // Initialize refund quantities to 0 for all items
    const quantities: Record<number, number> = {}
    newData.items?.forEach(item => {
      quantities[item.id] = 0
    })
    refundQuantities.value = quantities
  }
}, { immediate: true })

// Initialize when component mounts
onMounted(() => {
  if (props.transactionData) {
    form.value.transaction_id = props.transactionData.id
    // Use the original transaction's exchange rate
    form.value.usd_iqd_rate = props.transactionData.usd_iqd_rate || 1500
  }
})

// Keep form refund_price in sync with split
watch(netRefundAmount, (val) => {
  form.value.refund_price = Number(val.toFixed(2))
})

// Load active exchange rate if not available
onMounted(async () => {
  if (!exchangeRateStore.activeRate) {
    try {
      refreshingRate.value = true
      await exchangeRateStore.fetchActiveExchangeRate()
    } finally {
      refreshingRate.value = false
    }
  }
})

const refreshExchangeRate = async () => {
  try {
    refreshingRate.value = true
    await exchangeRateStore.fetchActiveExchangeRate()
    if (exchangeRateStore.activeRate?.usd_iqd_rate) {
      form.value.usd_iqd_rate = exchangeRateStore.activeRate.usd_iqd_rate
    }
    $q.notify({ type: 'positive', message: t('payment.paySupplier.exchangeRateRefreshed'), position: 'top' })
  } catch (error) {
    console.error('Error refreshing exchange rate:', error)
    $q.notify({ type: 'negative', message: t('payment.paySupplier.exchangeRateRefreshError'), position: 'top' })
  } finally {
    refreshingRate.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-US').format(amount)
}
</script>

<style lang="scss" scoped>
.transaction-info {
  .info-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid var(--q-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-icon {
        color: var(--q-primary);
        font-size: 1.2rem;
        min-width: 24px;
      }

      .info-label {
        font-weight: 500;
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 2px;
      }

      .info-value {
        font-weight: 600;
        color: #333;
        font-size: 1rem;
      }
    }
  }
}

.items-section {
  .item-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border: 2px solid #f0f4f8;
    border-radius: 12px;
    margin-bottom: 12px;
    background: #fafbfc;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(var(--q-primary-rgb), 0.3);
      background: rgba(var(--q-primary-rgb), 0.02);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .item-info {
      flex: 1;

      .item-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .item-icon {
          color: var(--q-primary);
          font-size: 1.3rem;
        }
      }

      .item-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
        font-size: 1rem;
      }

      .item-details {
        font-size: 0.85rem;
        color: #666;
        line-height: 1.4;
      }
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

.enhanced-input-small {
  :deep(.q-field__control) {
    height: 40px;
    border-radius: 8px;
  }

  &.q-field--outlined .q-field__control:before {
    border: 2px solid rgba(0, 0, 0, 0.1);
  }

  &.q-field--outlined.q-field--focused .q-field__control:before {
    border-color: var(--q-primary);
    border-width: 2px;
  }
}

.no-items-message {
  text-align: center;
  padding: 32px 24px;
  color: #666;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #ddd;

  .q-icon {
    margin-right: 8px;
    font-size: 1.2rem;
  }
}

.warning-message {
  color: #f59e0b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

// Enhanced styling to match admin modals
:deep(.enhanced-input) {
  margin-bottom: 16px;

  .q-field__control {
    height: 52px;
    border-radius: 8px;
  }

  &.q-field--outlined .q-field__control:before {
    border: 2px solid rgba(0, 0, 0, 0.1);
  }

  &.q-field--outlined.q-field--focused .q-field__control:before {
    border-color: var(--q-primary);
    border-width: 2px;
  }
}

// Section headers styling
.text-subtitle1.text-primary {
  font-weight: 600;
  border-bottom: 2px solid rgba(var(--q-primary-rgb), 0.1);
  padding-bottom: 8px;
  margin-bottom: 16px !important;
}

// Readonly field styling
:deep(.enhanced-input .q-field--readonly) {
  .q-field__control {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
  }

  .q-field__native {
    color: #666;
  }

  .q-field__label {
    color: #666;
  }
}

/* Payment modal inspired styles */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-label {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 6px;
}

.exchange-rate-display .rate-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.payment-input :deep(.q-field__control) {
  height: 48px;
}

.summary-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
</style>
<style lang="scss" scoped>
.refund-dialog {
  .modal-card {
    border-radius: 16px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .icon-wrapper {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .modal-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .modal-subtitle {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
      font-weight: 400;
    }
  }

  .close-btn {
    color: white;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
}

.modal-body {
  padding: 32px;
  background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
}

.payment-status-card {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 2px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;

  .status-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #1e40af;
    font-weight: 700;

    .status-title {
      font-size: 1rem;
    }
  }

  .status-grid {
    display: grid;
    gap: 12px;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      border-bottom: none;
    }

    .status-label {
      font-size: 0.95rem;
      color: #64748b;
      font-weight: 600;
    }

    .status-value {
      font-weight: 700;
      font-family: 'SF Mono', 'Monaco', monospace;

      &.total-amount {
        color: #475569;
      }

      &.paid-amount {
        color: #059669;
      }

      &.remaining-amount {
        color: #dc2626;
        font-size: 1.15rem;
      }
    }
  }
}

.payment-form {
  .form-group {
    margin-bottom: 24px;

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;

      .label-icon {
        font-size: 1.1rem;
        color: #667eea;
      }

      .required {
        color: #ef4444;
        font-weight: 700;
      }

      &.section-label {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e2e8f0;
      }
    }

    .form-input {
      :deep(.q-field__control) {
        border-radius: 10px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      :deep(.q-field--outlined .q-field__control) {
        border: 2px solid #e2e8f0;
        transition: all 0.3s ease;

        &:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
      }

      :deep(.q-field--focused .q-field__control) {
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }
    }
  }
}

.exchange-rate-display {
  .rate-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .q-chip {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .refresh-btn {
      color: #667eea;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  .payment-item {
    .form-label {
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .payment-input {
      :deep(.q-field__control) {
        border-radius: 8px;
      }
    }
  }
}

.payment-summary-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid rgba(3, 105, 161, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;

  .summary-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #0c4a6e;
    font-weight: 700;

    .summary-title {
      font-size: 1rem;
    }
  }

  .summary-content {
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      &:last-child {
        border-bottom: none;
      }

      &.final-row {
        border-top: 2px solid rgba(3, 105, 161, 0.2);
        margin-top: 8px;
        padding-top: 12px;
        font-weight: 700;
      }

      .summary-label {
        font-weight: 600;
        color: #475569;
      }

      .summary-value {
        font-weight: 700;
        font-family: 'SF Mono', 'Monaco', monospace;

        &.total-payment {
          color: #0c4a6e;
        }

        &.total-return {
          color: #ea580c;
        }

        &.net-amount {
          color: #059669;
          font-size: 1.1rem;
        }
      }
    }
  }
}

.modal-actions {
  padding: 20px 32px;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  .cancel-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    color: #64748b;

    &:hover {
      background: #f1f5f9;
    }
  }

  .submit-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .refund-dialog {
    .modal-card {
      max-height: 95vh;
    }
  }

  .modal-body {
    padding: 20px;
    max-height: calc(95vh - 140px); // Account for header and actions
  }

  .payment-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-actions {
    padding: 16px 20px;
    flex-direction: column;

    .cancel-btn,
    .submit-btn {
      width: 100%;
    }
  }
}
</style>
