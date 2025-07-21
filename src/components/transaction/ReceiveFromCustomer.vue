<template>
  <q-dialog
    v-model="isVisible"
    persistent
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
    class="receive-payment-dialog"
  >
    <q-card class="modal-card">
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
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="close"
          class="close-btn"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="modal-body">
        <!-- Payment Status Info -->
        <div v-if="props.transactionData" class="payment-status-card q-mb-md">
          <div class="status-header">
            <q-icon name="info" class="q-mr-sm" />
            <span class="status-title">{{ t('payment.receiveFromCustomer.transactionDetails') }}</span>
          </div>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.totalAmount') }}:</span>
              <span class="status-value total-amount">${{ formatCurrency(props.transactionData.total_price || 0) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.paidAmount') }}:</span>
              <span class="status-value paid-amount">${{ formatCurrency(props.transactionData.paid_price || 0) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ t('payment.receiveFromCustomer.remainingAmount') }}:</span>
              <span class="status-value remaining-amount">${{ formatCurrency(remainingAmount) }}</span>
            </div>
          </div>
        </div>

        <q-form @submit="handleSubmit" class="payment-form">
          <!-- Customer Selection -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="person" class="label-icon" />
              {{ t('payment.receiveFromCustomer.customerLabel') }}
              <span class="required">*</span>
            </label>
            <div v-if="props.transactionData?.customer" class="readonly-field">
              <q-input
                :model-value="props.transactionData.customer.name"
                readonly
                outlined
                dense
                class="form-input readonly-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>
            </div>
            <q-select
              v-else
              v-model="form.customer_id"
              :options="customerOptions"
              option-value="id"
              option-label="display_name"
              emit-value
              map-options
              outlined
              dense
              :loading="loading"
              :placeholder="t('payment.receiveFromCustomer.customerPlaceholder')"
              :rules="[val => !!val || t('payment.receiveFromCustomer.customerRequired')]"
              class="form-input"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ t('payment.receiveFromCustomer.noCustomersAvailable') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="attach_money" class="label-icon" />
              {{ t('payment.receiveFromCustomer.amountLabel') }}
              <span v-if="props.transactionData" class="amount-hint">
                ({{ t('payment.receiveFromCustomer.maxAmount') }}: ${{ formatCurrency(maxPaymentAmount) }})
              </span>
              <span class="required">*</span>
            </label>
            <q-input
              v-model.number="form.amount"
              type="number"
              min="0"
              :max="props.transactionData ? maxPaymentAmount : undefined"
              step="0.001"
              outlined
              dense
              :placeholder="t('payment.receiveFromCustomer.amountPlaceholder')"
              :rules="[
                val => !!val || t('payment.receiveFromCustomer.amountRequired'),
                val => val > 0 || t('payment.receiveFromCustomer.amountMustBeGreater'),
                val => !props.transactionData || val <= maxPaymentAmount || t('payment.receiveFromCustomer.amountExceedsRemaining', { max: formatCurrency(maxPaymentAmount) })
              ]"
              @input="formatAmountInput"
              class="form-input"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" color="primary" />
              </template>
              <template v-slot:append v-if="props.transactionData">
                <q-btn
                  flat
                  dense
                  size="sm"
                  :label="t('payment.receiveFromCustomer.receiveAll')"
                  @click="form.amount = maxPaymentAmount"
                  color="primary"
                />
              </template>
            </q-input>
          </div>

          <!-- Note -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="note" class="label-icon" />
              {{ t('payment.receiveFromCustomer.noteLabel') }}
            </label>
            <q-input
              v-model="form.note"
              type="textarea"
              outlined
              dense
              rows="3"
              :placeholder="t('payment.receiveFromCustomer.notePlaceholder')"
              class="form-input"
            >
              <template v-slot:prepend>
                <q-icon name="note_add" color="primary" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions class="modal-actions q-pa-md">
        <div class="row q-col-gutter-md full-width">
          <div class="col">
            <q-btn
              :label="t('payment.receiveFromCustomer.cancel')"
              flat
              color="grey-7"
              @click="close"
              class="cancel-btn full-width"
            />
          </div>
          <div class="col">
            <q-btn
              :label="t('payment.receiveFromCustomer.receivePayment')"
              color="green-6"
              unelevated
              :loading="loading"
              @click="handleSubmit"
              class="submit-btn full-width"
            />
          </div>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';

// Props & Emits
interface Props {
  modelValue: boolean;
  transactionData?: {
    customer: {
      id: number;
      name: string;
    };
    amount: number;
    total_price?: number;
    paid_price?: number;
    unpaid_price?: number;
  } | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [];
}>();

// Store
const store = useItemTransactionStore();
const $q = useQuasar();
const { t } = useI18n();

// Local state
const isVisible = ref(false);
const loading = ref(false);

const form = ref({
  customer_id: null as number | null,
  amount: null as number | null,
  note: ''
});

// Computed
const customerOptions = computed(() => {
  return store.regularCustomers.map(customer => ({
    ...customer,
    display_name: `${customer.fname} ${customer.sname} (${customer.user?.username || 'N/A'})`
  }));
});

const remainingAmount = computed(() => {
  if (!props.transactionData) return 0;
  // Use unpaid_price if available, otherwise calculate it
  return props.transactionData.unpaid_price ??
         ((props.transactionData.total_price || 0) - (props.transactionData.paid_price || 0));
});

const maxPaymentAmount = computed(() => {
  return remainingAmount.value;
});

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatAmountInput = () => {
  if (form.value.amount !== null && form.value.amount !== undefined) {
    // Round to 3 decimal places
    form.value.amount = Math.round(form.value.amount * 1000) / 1000;
  }
};

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
  if (newVal) {
    // Only fetch customers if no customer is provided
    if (!props.transactionData || !props.transactionData.customer) {
      void store.fetchCustomers('customer');
    }
    // Pre-populate form if transaction data is provided
    if (props.transactionData) {
      form.value.customer_id = props.transactionData.customer.id;
      // Set amount to unpaid amount (remaining amount to be received)
      form.value.amount = remainingAmount.value;
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
  // Only reset if not using pre-populated data
  if (!props.transactionData) {
    form.value = {
      customer_id: null,
      amount: null,
      note: ''
    };
  } else {
    // Keep pre-populated data but clear note, set amount to unpaid amount
    form.value.customer_id = props.transactionData.customer.id;
    form.value.amount = remainingAmount.value;
    form.value.note = '';
  }
};

const handleSubmit = async () => {
  // Get customer_id from either form or transaction data
  const customerId = props.transactionData?.customer.id || form.value.customer_id;

  if (!customerId || !form.value.amount) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    });
    return;
  }

  try {
    loading.value = true;

    const paymentData = {
      customer_id: customerId,
      amount: form.value.amount,
      note: form.value.note
    };

    await store.receiveFromCustomer(paymentData);

    $q.notify({
      type: 'positive',
      message: 'Payment received from customer successfully!',
      position: 'top'
    });

    emit('success');
    close();
  } catch (error) {
    console.error('Payment receiving failed:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to record payment. Please try again.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.modal-card {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  padding: 20px;
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
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .modal-subtitle {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 0.875rem;
    }
  }

  .close-btn {
    color: white;
  }
}

.modal-body {
  padding: 24px;
}

.payment-form {
  .form-group {
    margin-bottom: 20px;

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;

      .label-icon {
        font-size: 1.1rem;
        color: var(--q-primary);
      }

      .required {
        color: #ef4444;
      }
    }

    .form-input {
      :deep(.q-field__control) {
        border-radius: 8px;
      }

      :deep(.q-field--outlined .q-field__control) {
        border: 1px solid #d1d5db;

        &:hover {
          border-color: var(--q-primary);
        }
      }

      :deep(.q-field--focused .q-field__control) {
        border-color: var(--q-primary);
        box-shadow: 0 0 0 3px rgba(var(--q-primary-rgb), 0.1);
      }
    }
  }
}

.modal-actions {
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  .cancel-btn {
    padding: 8px 20px;
    border-radius: 6px;
  }

  .submit-btn {
    padding: 8px 20px;
    border-radius: 6px;
    font-weight: 500;
  }
}

/* Payment Status Card */
.payment-status-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #b3e5fc;
  border-radius: 12px;
  padding: 16px;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.status-title {
  font-weight: 600;
  color: #0277bd;
  font-size: 0.9rem;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e1f5fe;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 0.85rem;
  color: #546e7a;
  font-weight: 500;
}

.status-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.total-amount {
  color: #1565c0;
}

.paid-amount {
  color: #2e7d32;
}

.remaining-amount {
  color: #d84315;
}

.amount-hint {
  font-size: 0.75rem;
  color: #666;
  font-weight: normal;
}

.readonly-field {
  .readonly-input {
    :deep(.q-field__control) {
      background-color: #f5f5f5;
      border-color: #d1d5db;
    }

    :deep(.q-field__native) {
      color: #6b7280;
      font-weight: 500;
    }
  }
}

/* Responsive styles */
.modal-card {
  width: 100%;
  max-width: 500px;
  min-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .modal-card {
    border-radius: 0;

    .q-card-section {
      padding: 12px 16px;
    }

    .modal-actions {
      .row.q-col-gutter-md > .col {
        .q-btn {
          min-height: 44px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .modal-card {
    font-size: 14px;

    .modal-title {
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
  .modal-card {
    max-width: 90vw;
    width: 90vw;
  }
}

/* Ensure dialog is properly positioned */
:deep(.receive-payment-dialog .q-dialog__inner) {
  padding: 0;
}

:deep(.receive-payment-dialog .q-dialog__inner--minimized) {
  padding: 16px;
}

@media (max-width: 768px) {
  :deep(.receive-payment-dialog .q-dialog__inner) {
    padding: 0 !important;
  }

  :deep(.receive-payment-dialog .q-dialog__inner--minimized) {
    padding: 0 !important;
  }
}
</style>
