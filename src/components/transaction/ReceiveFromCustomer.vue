<template>
  <q-dialog v-model="isVisible" persistent class="receive-customer-dialog">
    <q-card class="modal-card" style="width: 700px; max-width: 95vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <q-icon name="account_balance_wallet" size="2rem" />
          </div>
          <div>
            <h4 class="modal-title">{{ t('payment.receiveFromCustomer.title') }}</h4>
            <p class="modal-subtitle">{{ t('payment.receiveFromCustomer.subtitle') }}</p>
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
            <span class="status-title">{{ t('payment.receiveFromCustomer.transactionDetails') }}</span>
          </div>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.totalAmount') }}:</span>
              <span class="status-value total-amount">${{ formatCurrency(props.transactionData.total_price || 0)
              }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.paidAmount') }}:</span>
              <span class="status-value paid-amount">${{ formatCurrency(props.transactionData.paid_price || 0) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.remainingAmount') }}:</span>
              <span class="status-value remaining-amount">${{ formatCurrency(remainingAmount) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.remainingAmount') }}:</span>
              <span class="status-value remaining-amount iqd">{{ formatCurrency(remainingAmount * (props.transactionData as any).usd_iqd_rate, ' IQD') }}</span>
            </div>
          </div>
        </div>

        <q-form @submit="handleSubmit" class="payment-form">
          <!-- Exchange Rate Display -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="currency_exchange" class="label-icon" />
              {{ t('payment.receiveFromCustomer.exchangeRateLabel') }}
            </label>
            <div class="exchange-rate-display">
              <div class="rate-item">
                <q-chip color="primary" text-color="white" icon="attach_money">
                  1 USD = {{ formatNumber(usdIqdRate) }} IQD
                </q-chip>
                <q-btn flat dense round icon="refresh" @click="refreshExchangeRate" :loading="refreshingRate"
                  class="refresh-btn" :title="t('payment.receiveFromCustomer.refreshRate')" />
              </div>
            </div>
          </div>

          <!-- Payment Amounts Section -->
          <div class="form-group">
            <label class="form-label section-label">
              <q-icon name="account_balance_wallet" class="label-icon" />
              {{ t('payment.receiveFromCustomer.paymentAmountsLabel') }}
            </label>

            <div class="payment-grid">
              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="currency_exchange" color="primary" size="16px" />
                  {{ t('payment.receiveFromCustomer.iqdAmountLabel') }}
                </label>
                <q-input v-model.number="form.iqd_price" type="number" min="0" step="250" outlined dense suffix="IQD"
                  :placeholder="t('payment.receiveFromCustomer.enterIqdAmount')" class="form-input payment-input"
                  @input="onIqdAmountChange" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="currency_exchange" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="attach_money" color="primary" size="16px" />
                  {{ t('payment.receiveFromCustomer.usdAmountLabel') }}
                </label>
                <q-input v-model.number="form.usd_price" type="number" min="0" step="0.01" outlined dense suffix="USD"
                  :placeholder="t('payment.receiveFromCustomer.enterUsdAmount')" class="form-input payment-input"
                  @input="onUsdAmountChange" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="attach_money" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="keyboard_return" color="warning" size="16px" />
                  {{ t('payment.receiveFromCustomer.iqdReturnLabel') }}
                </label>
                <q-input v-model.number="form.iqd_return_amount" type="number" min="0" step="250" outlined dense
                  suffix="IQD" :placeholder="t('payment.receiveFromCustomer.enterIqdReturn')"
                  class="form-input payment-input" @wheel.prevent>
                  <template v-slot:prepend>
                    <q-icon name="keyboard_return" color="warning" />
                  </template>
                </q-input>
              </div>

              <div class="payment-item">
                <label class="form-label">
                  <q-icon name="keyboard_return" color="warning" size="16px" />
                  {{ t('payment.receiveFromCustomer.usdReturnLabel') }}
                </label>
                <q-input v-model.number="form.usd_return_amount" type="number" min="0" step="0.01" outlined dense
                  suffix="USD" :placeholder="t('payment.receiveFromCustomer.enterUsdReturn')"
                  class="form-input payment-input" @wheel.prevent>
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
              <span class="summary-title">{{ t('payment.receiveFromCustomer.paymentSummary') }}</span>
            </div>
            <div class="summary-content">
              <div class="summary-row">
                <span class="summary-label">{{ t('payment.receiveFromCustomer.totalPayment') }}:</span>
                <span class="summary-value total-payment">${{ formatCurrency(totalPaymentAmount) }}</span>
              </div>
              <div v-if="totalReturnAmount > 0" class="summary-row">
                <span class="summary-label">{{ t('payment.receiveFromCustomer.totalReturn') }}:</span>
                <span class="summary-value total-return">${{ formatCurrency(totalReturnAmount) }}</span>
              </div>
              <div class="summary-row final-row">
                <span class="summary-label">{{ t('payment.receiveFromCustomer.netAmount') }}:</span>
                <span class="summary-value net-amount">${{ formatCurrency(netPaymentAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="note" class="label-icon" />
              {{ $t('payment.receiveFromCustomer.noteLabel') }}
            </label>
            <q-input v-model="form.note" type="textarea" outlined dense rows="3"
              :placeholder="$t('payment.receiveFromCustomer.notePlaceholder')" class="form-input">
              <template v-slot:prepend>
                <q-icon name="note_add" color="primary" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions class="modal-actions" style="flex-shrink: 0;">
        <q-btn :label="$t('payment.receiveFromCustomer.cancel')" flat color="grey-7" @click="close"
          class="cancel-btn" />
        <q-btn :label="$t('payment.receiveFromCustomer.receivePayment')" color="green-6" unelevated :loading="loading"
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
import { formatCurrency } from 'src/composables/useFormat';

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
    usd_iqd_rate?: number;
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
// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('en-US', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }).format(amount);
// };

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
      message: t('payment.receiveFromCustomer.exchangeRateRefreshed'),
      position: 'top'
    });
  } catch (error) {
    console.error('Error refreshing exchange rate:', error);
    $q.notify({
      type: 'negative',
      message: t('payment.receiveFromCustomer.exchangeRateRefreshError'),
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
      message: t('payment.receiveFromCustomer.errors.transactionDataRequired'),
      position: 'top'
    });
    return;
  }

  if (!customerId) {
    $q.notify({
      type: 'negative',
      message: t('payment.receiveFromCustomer.errors.customerIdMissing'),
      position: 'top'
    });
    return;
  }

  if (!transactionId) {
    $q.notify({
      type: 'negative',
      message: t('payment.receiveFromCustomer.errors.transactionIdRequired'),
      position: 'top'
    });
    return;
  }

  // Validate that at least one payment amount is provided
  const hasPayment = (form.value.iqd_price || 0) > 0 || (form.value.usd_price || 0) > 0;
  if (!hasPayment) {
    $q.notify({
      type: 'negative',
      message: t('payment.receiveFromCustomer.errors.paymentAmountRequired'),
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

    const resp = await store.receiveFromCustomer(transactionId.toString(), paymentData);

    $q.notify({
      type: 'positive',
      message: t('payment.receiveFromCustomer.success.paymentSuccessful'),
      position: 'top'
    });

    emit('success', resp?.data ?? null);
    close();
  } catch (error) {
    console.error('Payment receiving failed:', error);
    $q.notify({
      type: 'negative',
      message: t('payment.receiveFromCustomer.errors.paymentFailed'),
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.receive-customer-dialog {
  .modal-card {
    border-radius: 16px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.modal-header {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
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
      font-size: 0.95rem;
    }
  }

  .close-btn {
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-body {
  padding: 24px;
  background: #fafafa;
}

.payment-status-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .status-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #43a047;
    font-weight: 600;
    font-size: 1.1rem;

    .status-title {
      font-weight: 600;
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e8e8e8;

      .status-label {
        font-weight: 500;
        color: #666;
      }

      .status-value {
        font-weight: 700;
        font-size: 1.1rem;

        &.total-amount {
          color: #1976d2;
        }

        &.paid-amount {
          color: #43a047;
        }

        &.remaining-amount {
          color: #f57c00;
        }

        &.remaining-amount.iqd {
          color: #aa3ec5;
        }
      }
    }
  }
}

.form-group {
  margin-bottom: 24px;

  .form-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    font-size: 0.95rem;

    &.section-label {
      font-size: 1.1rem;
      color: #43a047;
      margin-bottom: 16px;
    }

    .label-icon {
      font-size: 18px;
    }
  }

  .form-input {
    :deep(.q-field__control) {
      border-radius: 8px;
    }

    &.payment-input {
      :deep(.q-field__control) {
        background: white;
        border: 2px solid #e0e0e0;
        transition: all 0.3s ease;

        &:hover {
          border-color: #43a047;
        }
      }

      :deep(.q-field--focused .q-field__control) {
        border-color: #43a047 !important;
        box-shadow: 0 0 0 3px rgba(67, 160, 71, 0.1);
      }
    }
  }
}

.exchange-rate-display {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;

  .rate-item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .refresh-btn {
      margin-left: 12px;
      color: #43a047;

      &:hover {
        background: rgba(67, 160, 71, 0.1);
      }
    }
  }
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;

  .payment-item {
    .form-label {
      margin-bottom: 8px;
    }
  }
}

.payment-summary-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 1px solid #c8e6c9;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;

  .summary-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #2e7d32;
    font-weight: 600;
    font-size: 1.1rem;

    .summary-title {
      font-weight: 600;
    }
  }

  .summary-content {
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;

      &.final-row {
        border-top: 2px solid #c8e6c9;
        margin-top: 8px;
        padding-top: 12px;
        font-weight: 700;
      }

      .summary-label {
        font-weight: 500;
        color: #2e7d32;
      }

      .summary-value {
        font-weight: 700;
        font-size: 1.1rem;

        &.total-payment {
          color: #43a047;
        }

        &.total-return {
          color: #f57c00;
        }

        &.net-amount {
          color: #1976d2;
          font-size: 1.2rem;
        }
      }
    }
  }
}

.modal-actions {
  background: white;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;

  .cancel-btn {
    min-width: 120px;
    font-weight: 600;
  }

  .submit-btn {
    min-width: 140px;
    font-weight: 600;
    background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);

    &:hover {
      background: linear-gradient(135deg, #388e3c 0%, #1b5e20 100%);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .modal-card {
    width: 100% !important;
    height: 100% !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }

  .status-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 16px;

    .header-content {
      .icon-wrapper {
        width: 48px;
        height: 48px;
      }

      .modal-title {
        font-size: 1.4rem;
      }
    }
  }

  .modal-body {
    padding: 16px;
  }

  .modal-actions {
    padding: 16px;
  }
}
</style>
