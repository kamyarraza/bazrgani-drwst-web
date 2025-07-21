<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="modal-card" style="width: 500px; max-width: 90vw;">
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
            <span class="status-title">{{ t('payment.paySupplier.transactionDetails') }}</span>
          </div>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">{{ t('payment.paySupplier.totalAmount') }}:</span>
              <span class="status-value total-amount">${{ formatCurrency(props.transactionData.total_price || 0) }}</span>
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
          <!-- Supplier Selection -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="person" class="label-icon" />
              {{ t('payment.paySupplier.supplierLabel') }}
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
                  <q-icon name="business" color="primary" />
                </template>
              </q-input>
            </div>
            <q-select
              v-else
              v-model="form.customer_id"
              :options="supplierOptions"
              option-value="id"
              option-label="display_name"
              emit-value
              map-options
              outlined
              dense
              :loading="loading"
              :placeholder="t('payment.paySupplier.supplierPlaceholder')"
              :rules="[val => !!val || t('payment.paySupplier.supplierRequired')]"
              class="form-input"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ t('payment.paySupplier.noSuppliersAvailable') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="attach_money" class="label-icon" />
              {{ t('payment.paySupplier.amountLabel') }}
              <span v-if="props.transactionData" class="amount-hint">
                ({{ t('payment.paySupplier.maxAmount') }}: ${{ formatCurrency(maxPaymentAmount) }})
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
              :placeholder="$t('payment.paySupplier.amountPlaceholder')"
              :rules="[
                val => !!val || $t('payment.paySupplier.amountRequired'),
                val => val > 0 || $t('payment.paySupplier.amountMustBeGreater'),
                val => !props.transactionData || val <= maxPaymentAmount || $t('payment.paySupplier.amountExceedsRemaining', { max: formatCurrency(maxPaymentAmount) })
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
                  :label="$t('payment.paySupplier.payAll')"
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
              {{ $t('payment.paySupplier.noteLabel') }}
            </label>
            <q-input
              v-model="form.note"
              type="textarea"
              outlined
              dense
              rows="3"
              :placeholder="$t('payment.paySupplier.notePlaceholder')"
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

      <q-card-actions class="modal-actions">
        <q-btn
          :label="$t('payment.paySupplier.cancel')"
          flat
          color="grey-7"
          @click="close"
          class="cancel-btn"
        />
        <q-btn
          :label="$t('payment.paySupplier.makePayment')"
          color="primary"
          unelevated
          :loading="loading"
          @click="handleSubmit"
          class="submit-btn"
        />
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
const supplierOptions = computed(() => {
  return store.supplierCustomers.map(supplier => ({
    ...supplier,
    display_name: `${supplier.fname} ${supplier.sname} (${supplier.user?.username || 'N/A'})`
  }));
});

const remainingAmount = computed(() => {
  if (!props.transactionData) return 0;
  return (props.transactionData.total_price || 0) - (props.transactionData.paid_price || 0);
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
    // Fetch suppliers when modal opens
    void store.fetchCustomers('supplier');

    // Pre-populate form if transaction data is provided
    if (props.transactionData) {
      form.value.customer_id = props.transactionData.customer.id;
      form.value.amount = props.transactionData.amount;
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
    // Keep pre-populated data but clear note
    form.value.note = '';
  }
};

const handleSubmit = async () => {
  // Get customer_id from either form or transaction data
  const customerId = props.transactionData?.customer.id || form.value.customer_id;

  if (!customerId || !form.value.amount) {
    $q.notify({
      type: 'negative',
      message: t('payment.paySupplier.errors.allFieldsRequired'),
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

    await store.paySupplier(paymentData);

    $q.notify({
      type: 'positive',
      message: t('payment.paySupplier.success.paymentSuccessful'),
      position: 'top'
    });

    emit('success');
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
.modal-card {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
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

.payment-status-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #e3e6ea;
  border-radius: 8px;
  padding: 16px;

  .status-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: var(--q-primary);
    font-weight: 600;

    .status-title {
      font-size: 0.95rem;
    }
  }

  .status-grid {
    display: grid;
    gap: 8px;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      border-bottom: none;
    }

    .status-label {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }

    .status-value {
      font-weight: 600;
      font-family: monospace;

      &.total-amount {
        color: #495057;
      }

      &.paid-amount {
        color: #28a745;
      }

      &.remaining-amount {
        color: #dc3545;
        font-size: 1.1rem;
      }
    }
  }
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
</style>
