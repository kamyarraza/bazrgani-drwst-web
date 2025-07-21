<template>
  <div class="basic-info-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="info" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('transaction.steps.basicInfo') }}</span>
        </div>
        <div class="step-description">
          {{ transactionType === 'sell' ? t('transaction.steps.basicInfoSellDesc') : t('transaction.steps.basicInfoPurchaseDesc') }}
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
                      {{ transactionType === 'sell' ? t('transaction.sellTransaction') : t('transaction.purchaseTransaction') }}
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
              {{ t('transaction.paymentType') }}
            </div>
            <q-option-group
              v-model="formData.payment_type"
              :options="paymentTypeOptions"
              color="primary"
              inline
              class="payment-options"
            />
            <div v-if="validationErrors.payment_type" class="text-negative text-caption q-mt-xs">
              {{ validationErrors.payment_type }}
            </div>
          </div>

          <!-- Additional Options for Sell Transactions -->
          <div v-if="transactionType === 'sell'" class="sell-options">
            <div class="row q-col-gutter-md">
              <!-- Discount Percentage -->
              <div class="col-12 col-md-6">
                <div class="section-title">
                  <q-icon name="percent" class="q-mr-sm" />
                  {{ t('transaction.discountPercentage') }}
                </div>
                <q-input
                  v-model.number="formData.discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  outlined
                  :label="t('transaction.discountPercentage')"
                  suffix="%"
                  hint="0-100%"
                  class="discount-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="percent" />
                  </template>
                </q-input>
              </div>

              <!-- Transaction Status -->
              <div class="col-12 col-md-6">
                <div class="section-title">
                  <q-icon name="receipt" class="q-mr-sm" />
                  {{ t('transaction.status') }}
                </div>
                <q-select
                  v-model="formData.status"
                  :options="statusOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  :label="t('transaction.status')"
                  class="status-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="receipt" />
                  </template>
                </q-select>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="notes-section">
            <div class="section-title">
              <q-icon name="note" class="q-mr-sm" />
              {{ t('common.notes') }}
            </div>
            <q-input
              v-model="formData.note"
              type="textarea"
              outlined
              :label="t('transaction.addNote')"
              rows="3"
              maxlength="500"
              counter
              hint="Optional transaction notes"
              class="notes-input"
            >
              <template v-slot:prepend>
                <q-icon name="note" />
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
import { useAuthStore } from 'src/stores/authStore';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';

// Components
import CustomerSelector from '../shared/CustomerSelector.vue';
import BranchSelector from '../shared/BranchSelector.vue';
import WarehouseSelector from '../shared/WarehouseSelector.vue';

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
const authStore = useAuthStore();
const itemTransactionStore = useItemTransactionStore();

// Local state
const availableWarehouses = ref<any[]>([]);
const warehouseLoading = ref(false);

// Computed properties
const isAdminUser = computed(() => {
  return authStore.currentUser?.type === 'admin';
});

const transactionTypeDescription = computed(() => {
  return props.transactionType === 'sell'
    ? t('transaction.sellTransactionDesc')
    : t('transaction.purchaseTransactionDesc');
});

const paymentTypeOptions = computed(() => [
  {
    label: t('transaction.paymentTypes.cash'),
    value: 'cash',
    icon: 'payments'
  },
  {
    label: t('transaction.paymentTypes.borrow'),
    value: 'borrow',
    icon: 'credit_card'
  }
]);

const statusOptions = computed(() => [
  {
    label: t('transaction.status.complete'),
    value: 'complete'
  },
  {
    label: t('transaction.status.reserved'),
    value: 'reserved'
  }
]);

// Form data proxy
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

// Validation
const isStepValid = computed(() => {
  const hasCustomer = !!formData.value.customer_id;
  const hasWarehouse = !!formData.value.warehouse_id;
  const hasPaymentType = !!formData.value.payment_type;
  const hasBranch = !isAdminUser.value || !!formData.value.branch_id;

  return hasCustomer && hasWarehouse && hasPaymentType && hasBranch;
});

// Methods
const onCustomerSelected = (customer: any) => {
  // Store the customer name for display in summary
  if (customer) {
    formData.value.customer_name = customer.fname && customer.sname
      ? `${customer.fname} ${customer.sname}`
      : customer.name || `Customer ${customer.id}`;
  } else {
    formData.value.customer_name = null;
  }

  // Clear validation error when customer is selected
  if (customer && props.validationErrors.customer_id) {
    emit('clear-validation-error', 'customer_id');
  }
};

const onBranchSelected = async (branch: any) => {
  // Store the branch name for display in summary
  if (branch) {
    formData.value.branch_name = branch.name || `Branch ${branch.id}`;
  } else {
    formData.value.branch_name = null;
  }

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
  } else {
    availableWarehouses.value = [];
  }
};

const onWarehouseSelected = (warehouse: any) => {
  // Store the warehouse name for display in summary
  if (warehouse) {
    formData.value.warehouse_name = warehouse.name || `Warehouse ${warehouse.id}`;
  } else {
    formData.value.warehouse_name = null;
  }

  // Clear validation error when warehouse is selected
  if (warehouse && props.validationErrors.warehouse_id) {
    emit('clear-validation-error', 'warehouse_id');
  }
};

const fetchWarehousesForBranch = async (branchId: number) => {
  try {
    warehouseLoading.value = true;
    await itemTransactionStore.fetchBranchWarehouses(branchId);
    availableWarehouses.value = itemTransactionStore.warehouses;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    availableWarehouses.value = [];
  } finally {
    warehouseLoading.value = false;
  }
};

const validateAndContinue = () => {
  if (isStepValid.value) {
    emit('next');
  }
};

// Initialize component
onMounted(async () => {
  // For non-admin users, fetch warehouses for their branch
  if (!isAdminUser.value && authStore.currentUser?.branch?.id) {
    formData.value.branch_id = authStore.currentUser.branch.id;
    formData.value.branch_name = authStore.currentUser.branch.name || `Branch ${authStore.currentUser.branch.id}`;
    await fetchWarehousesForBranch(authStore.currentUser.branch.id);
  }
  // For admin users, if there's already a branch_id (when navigating back), load its warehouses
  else if (isAdminUser.value && formData.value.branch_id) {
    await fetchWarehousesForBranch(formData.value.branch_id);
  }
});

// Watch for validation changes
watch(isStepValid, (isValid) => {
  emit('validate', 1, isValid);
}, { immediate: true });

// Watch for branch_id changes in form data (when navigating back or external updates)
watch(() => formData.value.branch_id, async (newBranchId, oldBranchId) => {
  if (newBranchId && newBranchId !== oldBranchId) {
    await fetchWarehousesForBranch(newBranchId);
  } else if (!newBranchId) {
    availableWarehouses.value = [];
  }
});

// Watch for payment type changes
watch(() => formData.value.payment_type, (newType) => {
  if (newType && props.validationErrors.payment_type) {
    emit('clear-validation-error', 'payment_type');
  }
});
</script>

<style lang="scss" scoped>
.basic-info-step {
  .step-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .step-header {
    margin-bottom: 2rem;
    text-align: center;

    .step-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: $dark;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .step-description {
      color: $grey-6;
      font-size: 1rem;
      line-height: 1.5;
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

    .sell-options {
      .discount-input,
      .status-select {
        :deep(.q-field__control) {
          border-radius: 8px;
        }
      }
    }

    .notes-input {
      :deep(.q-field__control) {
        border-radius: 8px;
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
