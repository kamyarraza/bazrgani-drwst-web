<template>
  <div class="basic-info-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="info" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('blumTransaction.steps.basicInfo') }}</span>
        </div>
        <div class="step-description">
          {{ transactionType === 'sell' ? t('blumTransaction.steps.basicInfoSellDesc') : t('blumTransaction.steps.basicInfoPurchaseDesc') }}
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <q-form @submit.prevent="validateAndContinue" class="q-gutter-lg">

          <!-- Transaction Type Display -->
          <div class="transaction-type-display">
            <q-card flat bordered class="type-card">
              <q-card-section class="q-py-md">
                <div class="row items-center">
                  <q-avatar
                    :color="transactionType === 'sell' ? 'positive' : 'primary'"
                    text-color="white"
                    size="lg"
                    class="q-mr-md"
                  >
                    <q-icon :name="transactionType === 'sell' ? 'sell' : 'shopping_cart'" />
                  </q-avatar>
                  <div class="col">
                    <div class="text-h6">
                      {{ transactionType === 'sell' ? t('blumTransaction.sellTransaction') : t('blumTransaction.purchaseTransaction') }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ transactionTypeDescription }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Customer/Supplier Selection -->
          <div class="customer-section">
            <div class="section-title">
              <q-icon name="person" class="q-mr-sm" />
              {{ transactionType === 'sell' ? t('customer.customer') : t('customer.supplier') }}
            </div>
            <CustomerSelector
              v-model="formData.customer_id"
              :customer-type="transactionType === 'sell' ? 'customer' : 'supplier'"
              v-bind="validationErrors.customer_id ? { error: validationErrors.customer_id } : {}"
              @customer-selected="onCustomerSelected"
            />
          </div>

          <!-- Branch Selection (Admin Only) -->
          <div v-if="isAdminUser" class="branch-section">
            <div class="section-title">
              <q-icon name="business" class="q-mr-sm" />
              {{ t('common.branch') }}
            </div>
            <BranchSelector
              v-model="formData.branch_id"
              v-bind="validationErrors.branch_id ? { error: validationErrors.branch_id } : {}"
              @branch-selected="onBranchSelected"
            />
          </div>

          <!-- Warehouse Selection -->
          <div class="warehouse-section">
            <div class="section-title">
              <q-icon name="warehouse" class="q-mr-sm" />
              {{ t('warehouse.warehouse') }}
            </div>
            <WarehouseSelector
              v-model="formData.warehouse_id"
              :warehouses="availableWarehouses"
              :loading="warehouseLoading"
              :disabled="isAdminUser && !formData.branch_id"
              :branch-required="isAdminUser"
              v-bind="validationErrors.warehouse_id ? { error: validationErrors.warehouse_id } : {}"
              @warehouse-selected="onWarehouseSelected"
            />
          </div>

          <!-- Payment Type -->
          <div class="payment-section">
            <div class="section-title">
              <q-icon name="payment" class="q-mr-sm" />
              {{ t('blumTransaction.paymentType') }}
            </div>
            <q-option-group
              v-model="formData.payment_type"
              :options="paymentTypeOptions"
              color="primary"
              inline
              class="payment-options"
              @update:model-value="onPaymentTypeChange"
            />
          </div>

          <!-- Exchange Rate Info Card -->
          <div class="exchange-rate-info">
            <q-card flat bordered class="exchange-rate-card">
              <q-card-section class="q-py-md">
                <div class="section-title">
                  <q-icon name="currency_exchange" class="q-mr-sm" />
                  {{ t('blumTransaction.exchangeRates') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div class="exchange-rate-item">
                      <q-icon name="attach_money" size="xs" class="q-mr-xs" />
                      USD → IQD: {{ formData.usd_iqd_rate?.toLocaleString() || 'N/A' }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="exchange-rate-item">
                      <q-icon name="euro_symbol" size="xs" class="q-mr-xs" />
                      EUR → USD: {{ formData.eur_usd_rate || 'N/A' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Transaction Note -->
          <div class="note-section">
            <div class="section-title">
              <q-icon name="note" class="q-mr-sm" />
              {{ t('blumTransaction.transactionNote') }}
            </div>
            <q-input
              v-model="formData.note"
              :label="t('blumTransaction.note')"
              type="textarea"
              outlined
              rows="3"
              :placeholder="t('blumTransaction.notePlaceholder')"
              counter
              maxlength="500"
            >
              <template v-slot:prepend>
                <q-icon name="notes" />
              </template>
            </q-input>
          </div>

        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCustomerStore } from 'src/stores/customerStore';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { useBranchStore } from 'src/stores/branchStore';
import { useMeStore } from 'src/stores/meStore';
import CustomerSelector from 'src/components/transaction_new/shared/CustomerSelector.vue';
import WarehouseSelector from 'src/components/transaction_new/shared/WarehouseSelector.vue';
import BranchSelector from 'src/components/transaction_new/shared/BranchSelector.vue';

// Props & Emits
interface Props {
  formData: any;
  transactionType: 'sell' | 'purchase';
  validationErrors: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'next'): void;
  (_e: 'clear-validation-error', _field: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const customerStore = useCustomerStore();
const warehouseStore = useWarehouseStore();
const branchStore = useBranchStore();
const meStore = useMeStore();

// Local state
const warehouseLoading = ref(false);

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const isAdminUser = computed(() => {
  return meStore.me?.type === 'admin';
});

const availableWarehouses = computed(() => {
  return warehouseStore.branchWarehouses?.warehouses || [];
});

const transactionTypeDescription = computed(() => {
  if (props.transactionType === 'sell') {
    return t('blumTransaction.sellTransactionDesc');
  } else {
    return t('blumTransaction.purchaseTransactionDesc');
  }
});

const paymentTypeOptions = computed(() => [
  {
    label: t('blumTransaction.cash'),
    value: 'cash',
    icon: 'money'
  },
  {
    label: t('blumTransaction.borrow'),
    value: 'borrow',
    icon: 'credit_card'
  }
]);

const isStepValid = computed(() => {
  return !!(
    formData.value.customer_id &&
    formData.value.warehouse_id &&
    formData.value.payment_type &&
    (!isAdminUser.value || formData.value.branch_id)
  );
});

// Methods
const onCustomerSelected = (customer: any) => {
  formData.value.customer_id = customer?.id || null;
  formData.value.customer_name = customer ? `${customer.fname} ${customer.sname}` : null;
  emit('clear-validation-error', 'customer_id');
  validateStep();
};

const onWarehouseSelected = (warehouse: any) => {
  formData.value.warehouse_id = warehouse?.id || null;
  if (warehouse) {
    formData.value.warehouse_name = warehouse.name || `Warehouse ${warehouse.id}`;
  } else {
    formData.value.warehouse_name = null;
  }

  if (warehouse && props.validationErrors.warehouse_id) {
    emit('clear-validation-error', 'warehouse_id');
  }
  validateStep();
};

const fetchWarehousesForBranch = async (branchId: number) => {
  try {
    warehouseLoading.value = true;
    await warehouseStore.fetchBranchWarehouses(branchId);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  } finally {
    warehouseLoading.value = false;
  }
};

const onBranchSelected = async (branch: any) => {
  formData.value.branch_id = branch?.id || null;
  formData.value.branch_name = branch?.name || null;

  // Clear warehouse selection when branch changes
  formData.value.warehouse_id = null;
  formData.value.warehouse_name = null;

  if (branch) {
    // Fetch warehouses for selected branch
    await fetchWarehousesForBranch(branch.id);

    // Clear validation error
    if (props.validationErrors.branch_id) {
      emit('clear-validation-error', 'branch_id');
    }
  }

  validateStep();
};

const onPaymentTypeChange = (value: string) => {
  formData.value.payment_type = value;
  emit('clear-validation-error', 'payment_type');
  validateStep();
};

const validateStep = () => {
  emit('validate', 1, isStepValid.value);
};

const validateAndContinue = () => {
  if (isStepValid.value) {
    emit('next');
  }
};

// Watchers
watch(isStepValid, (newValue) => {
  emit('validate', 1, newValue);
}, { immediate: true });

watch(() => props.formData, () => {
  validateStep();
}, { deep: true });

// Lifecycle
onMounted(async () => {
  // Load required data
  await Promise.all([
    customerStore.fetchCustomers(1, props.transactionType === 'purchase' ? 'supplier' : 'customer'),
    isAdminUser.value ? branchStore.fetchBranches() : Promise.resolve()
  ]);

  // Set default branch for non-admin users and fetch their warehouses
  if (!isAdminUser.value && meStore.me?.branch?.id) {
    formData.value.branch_id = meStore.me.branch.id;
    formData.value.branch_name = meStore.me.branch.name;
    await fetchWarehousesForBranch(meStore.me.branch.id);
  }

  validateStep();
});
</script>

<style scoped lang="scss">
@import "src/css/quasar.variables.scss";

.basic-info-step {
  .step-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .step-header {
    text-align: center;
    margin-bottom: 2rem;

    .step-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: $grey-8;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-description {
      color: $grey-6;
      font-size: 0.95rem;
      line-height: 1.4;
    }
  }

  .form-content {
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: $primary;
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }

    .transaction-type-display {
      .type-card {
        border-radius: 12px;
        border: 2px solid $blue-3;
        background: $blue-1;
      }
    }

    .payment-options {
      :deep(.q-radio) {
        margin-right: 2rem;

        .q-radio__label {
          font-weight: 500;
          margin-left: 0.5rem;
        }
      }
    }

    .exchange-rate-section {
      .exchange-rate-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border: 1px solid $blue-2;
        border-radius: 8px;

        .exchange-rate-item {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: $grey-8;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

// Dark mode support
.body--dark {
  .basic-info-step {
    .step-header {
      .step-title {
        color: $grey-1;
      }
    }

    .transaction-type-display {
      .type-card {
        background: rgba(33, 150, 243, 0.1);
        border-color: rgba(33, 150, 243, 0.3);
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .basic-info-step {
    .step-header {
      margin-bottom: 1.5rem;

      .step-title {
        font-size: 1.25rem;
      }

      .step-description {
        font-size: 0.9rem;
      }
    }

    .form-content {
      .section-title {
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
      }

      .payment-options {
        :deep(.q-radio) {
          margin-right: 1rem;
          margin-bottom: 0.5rem;
        }
      }
    }
  }
}
</style>
