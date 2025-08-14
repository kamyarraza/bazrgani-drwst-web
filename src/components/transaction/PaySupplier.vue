<template>
  <q-dialog v-model="isVisible" persistent class="pay-supplier-dialog">
    <q-card class="modal-card" style="width: 700px; max-width: 95vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <q-icon name="payment" size="2rem" />
          </div>
          <div>
            <h4 class="modal-title">{{ t('payment.paySupplier.title') }}</h4>
            <p class="modal-subtitle">{{ t('payment.paySupplier.subtitle') }}</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="close" class="close-btn" />
      </q-card-section>

      <q-separator />

      <q-card-section class="modal-body" style="overflow-y: auto; flex: 1;">
        <!-- Payment Status Info -->
        <div v-if="props.transactionData" class="payment-status-card q-mb-md">
          <div class="status-header">
            <q-icon name="info" class="q-mr-sm" />
            <span class="status-title">{{ t('payment.paySupplier.transactionDetails') }}</span>
          </div>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">{{ t('payment.paySupplier.totalAmount') }}:</span>
              <span class="status-value total-amount">${{ formatCurrency(props.transactionData.total_price || 0)
              }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.paySupplier.paidAmount') }}:</span>
              <span class="status-value paid-amount">${{ formatCurrency(props.transactionData.paid_price || 0) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.paySupplier.remainingAmount') }}:</span>
              <span class="status-value remaining-amount">${{ formatCurrency(remainingAmount) }}</span>
            </div>
          </div>
        </div>

        <q-form @submit="handleSubmit" class="payment-form">
          <!-- Exchange Rate Display -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="currency_exchange" class="label-icon" />
              {{ t('payment.paySupplier.exchangeRateLabel') }}
            </label>
            <div class="exchange-rate-display">
              <div class="rate-item">
                <q-chip color="primary" text-color="white" icon="attach_money">
                  1 USD = {{ formatNumber(usdIqdRate) }} IQD
                </q-chip>
                <q-btn flat dense round icon="refresh" @click="refreshExchangeRate" :loading="refreshingRate"
                  class="refresh-btn" :title="t('payment.paySupplier.refreshRate')" />
              </div>
            </div>
          </div>

          <!-- Payment Amounts Section -->
          <div class="form-group">
            <label class="form-label section-label">
              <q-icon name="account_balance_wallet" class="label-icon" />
              {{ t('payment.paySupplier.paymentAmountsLabel') }}
            </label>

            <div class="payment-grid">
              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="currency_exchange" color="primary" size="16px" />
                  {{ t('payment.paySupplier.iqdAmountLabel') }}
                </label>
                <q-input v-model.number="form.iqd_price" type="number" min="0" step="1" outlined dense suffix="IQD"
                  :placeholder="t('payment.paySupplier.enterIqdAmount')" class="form-input payment-input"
                  @input="onIqdAmountChange">
                  <template v-slot:prepend>
                    <q-icon name="currency_exchange" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="attach_money" color="primary" size="16px" />
                  {{ t('payment.paySupplier.usdAmountLabel') }}
                </label>
                <q-input v-model.number="form.usd_price" type="number" min="0" step="0.01" outlined dense suffix="USD"
                  :placeholder="t('payment.paySupplier.enterUsdAmount')" class="form-input payment-input"
                  @input="onUsdAmountChange">
                  <template v-slot:prepend>
                    <q-icon name="attach_money" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="keyboard_return" color="warning" size="16px" />
                  {{ t('payment.paySupplier.iqdReturnLabel') }}
                </label>
                <q-input v-model.number="form.iqd_return_amount" type="number" min="0" step="1" outlined dense
                  suffix="IQD" :placeholder="t('payment.paySupplier.enterIqdReturn')" class="form-input payment-input">
                  <template v-slot:prepend>
                    <q-icon name="keyboard_return" color="warning" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="keyboard_return" color="warning" size="16px" />
                  {{ t('payment.paySupplier.usdReturnLabel') }}
                </label>
                <q-input v-model.number="form.usd_return_amount" type="number" min="0" step="0.01" outlined dense
                  suffix="USD" :placeholder="t('payment.paySupplier.enterUsdReturn')" class="form-input payment-input">
                  <template v-slot:prepend>
                    <q-icon name="keyboard_return" color="warning" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Payment Summary -->
          <div class="payment-summary-card" v-if="totalPaymentAmount > 0">
            <div class="summary-header">
              <q-icon name="receipt" class="q-mr-sm" />
              <span class="summary-title">{{ t('payment.paySupplier.paymentSummary') }}</span>
            </div>
            <div class="summary-content">
              <div class="summary-row">
                <span class="summary-label">{{ t('payment.paySupplier.totalPayment') }}:</span>
                <span class="summary-value total-payment">${{ formatCurrency(totalPaymentAmount) }}</span>
              </div>
              <div v-if="totalReturnAmount > 0" class="summary-row">
                <span class="summary-label">{{ t('payment.paySupplier.totalReturn') }}:</span>
                <span class="summary-value total-return">${{ formatCurrency(totalReturnAmount) }}</span>
              </div>
              <div class="summary-row final-row">
                <span class="summary-label">{{ t('payment.paySupplier.netAmount') }}:</span>
                <span class="summary-value net-amount">${{ formatCurrency(netPaymentAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="note" class="label-icon" />
              {{ $t('payment.paySupplier.noteLabel') }}
            </label>
            <q-input v-model="form.note" type="textarea" outlined dense rows="3"
              :placeholder="$t('payment.paySupplier.notePlaceholder')" class="form-input">
              <template v-slot:prepend>
                <q-icon name="note_add" color="primary" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions class="modal-actions" style="flex-shrink: 0;">
        <q-btn :label="$t('payment.paySupplier.cancel')" flat color="grey-7" @click="close" class="cancel-btn" />
        <q-btn :label="$t('payment.paySupplier.makePayment')" color="primary" unelevated :loading="loading"
          @click="handleSubmit" class="submit-btn" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';

// Props & Emits
interface Props {
  modelValue: boolean;
  transactionId?: string | number;
  transactionData?: {
    id?: number;
    customer: {
      id: number;
      name: string;
    };
    amount?: number;
    total_price?: number;
    paid_price?: number;
    unpaid_price?: number;
  } | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [payload?: any];
}>();

// Store
const store = useItemTransactionStore();
const exchangeRateStore = useExchangeRateStore();
const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();

// Local state
const isVisible = ref(false);
const loading = ref(false);
const refreshingRate = ref(false);

const form = ref({
  note: '',
  iqd_price: 0,
  usd_price: 0,
  iqd_return_amount: 0,
  usd_return_amount: 0
});

// Computed
const remainingAmount = computed(() => {
  if (!props.transactionData) return 0;
  return (props.transactionData.total_price || 0) - (props.transactionData.paid_price || 0);
});

const usdIqdRate = computed(() => exchangeRateStore.activeRate?.usd_iqd_rate || 1500);

const totalPaymentAmount = computed(() => {
  const iqdInUsd = (form.value.iqd_price || 0) / usdIqdRate.value;
  return iqdInUsd + (form.value.usd_price || 0);
});

const totalReturnAmount = computed(() => {
  const iqdInUsd = (form.value.iqd_return_amount || 0) / usdIqdRate.value;
  return iqdInUsd + (form.value.usd_return_amount || 0);
});

const netPaymentAmount = computed(() => {
  return totalPaymentAmount.value - totalReturnAmount.value;
});

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-US').format(amount);
};

const onIqdAmountChange = () => {
  // Payment amounts changed - calculation handled by computed properties
};

const onUsdAmountChange = () => {
  // Payment amounts changed - calculation handled by computed properties
};

const refreshExchangeRate = async () => {
  refreshingRate.value = true;
  try {
    await exchangeRateStore.fetchActiveExchangeRate();
    $q.notify({
      type: 'positive',
      message: t('payment.paySupplier.exchangeRateRefreshed'),
      position: 'top'
    });
  } catch (error) {
    console.error('Error refreshing exchange rate:', error);
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.exchangeRateRefreshError'),
      position: 'top'
    });
  } finally {
    refreshingRate.value = false;
  }
};

// Initialize exchange rate on mount
onMounted(async () => {
  if (!exchangeRateStore.activeRate) {
    await exchangeRateStore.fetchActiveExchangeRate();
  }
});

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
  if (newVal) {
    // Pre-populate form if transaction data is provided
    if (props.transactionData) {
      // Transaction data is provided, customer info is available
      // Note: Individual payment amounts will be entered by user
    }
  }
});

watch(isVisible, (newVal) => {
  emit('update:modelValue', newVal);
});

// Methods
const close = () => {
  isVisible.value = false;
  resetForm();
};

const resetForm = () => {
  // Reset payment details
  form.value = {
    note: '',
    iqd_price: 0,
    usd_price: 0,
    iqd_return_amount: 0,
    usd_return_amount: 0
  };
};

const handleSubmit = async () => {
  // Get required data from transaction data
  const customerId = props.transactionData?.customer.id;
  // Try multiple ways to get transaction ID
  const transactionId = props.transactionId ||
    props.transactionData?.id ||
    route.params.id ||
    route.params.transactionId;

  if (!props.transactionData) {
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.errors.transactionDataRequired'),
      position: 'top'
    });
    return;
  }

  if (!customerId) {
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.errors.customerIdMissing'),
      position: 'top'
    });
    return;
  }

  if (!transactionId) {
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.errors.transactionIdRequired'),
      position: 'top'
    });
    return;
  }

  // Validate that at least one payment amount is provided
  const hasPayment = (form.value.iqd_price || 0) > 0 || (form.value.usd_price || 0) > 0;
  if (!hasPayment) {
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.errors.paymentAmountRequired'),
      position: 'top'
    });
    return;
  }

  try {
    loading.value = true;

    const paymentData = {
      customer_id: customerId,
      iqd_price: form.value.iqd_price || 0,
      usd_price: form.value.usd_price || 0,
      iqd_return_amount: form.value.iqd_return_amount || 0,
      usd_return_amount: form.value.usd_return_amount || 0,
      note: form.value.note || ''
    };

    const resp = await store.paySupplier(transactionId.toString(), paymentData);

    $q.notify({
      type: 'positive',
      message: t('payment.paySupplier.success.paymentSuccessful'),
      position: 'top'
    });

    // Emit the payload data (response.data.data) so parent can show invoice
    emit('success', resp?.data ?? null);
    close();
  } catch (error) {
    console.error('Payment failed:', error);
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.errors.paymentFailed'),
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.pay-supplier-dialog {
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

.payment-type-options {
  :deep(.q-radio) {
    margin-right: 24px;

    .q-radio__label {
      font-weight: 500;
      color: #475569;
    }
  }
}

.payment-type-wrapper {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 4px;
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

.readonly-field {
  .readonly-input {
    :deep(.q-field__control) {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }

    :deep(.q-field__native) {
      color: #6b7280;
      font-weight: 500;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .pay-supplier-dialog {
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

  .payment-type-wrapper {
    .payment-type-options {
      :deep(.q-radio) {
        margin-right: 16px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
