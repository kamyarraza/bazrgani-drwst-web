<template>
  <div class="summary-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="summarize" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('transaction.steps.summary') }}</span>
        </div>
        <div class="step-description">
          {{ t('transaction.steps.summaryDesc') }}
        </div>
      </div>

      <!-- Transaction Overview -->
      <div class="transaction-overview">
        <q-card flat bordered class="overview-card">
          <q-card-section class="overview-header">
            <div class="transaction-title">
              <q-avatar
                :color="transactionType === 'sell' ? 'positive' : 'primary'"
                text-color="white"
                size="lg"
                class="q-mr-md"
              >
                <q-icon :name="transactionType === 'sell' ? 'sell' : 'shopping_cart'" />
              </q-avatar>
              <div>
                <div class="text-h6">
                  {{ transactionType === 'sell' ? t('transaction.sellTransaction') : t('transaction.purchaseTransaction') }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ t('transaction.readyToCreate') }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="overview-content">
            <div class="overview-grid">
              <!-- Customer/Supplier Info -->
              <div class="overview-item">
                <div class="item-label">
                  <q-icon name="person" class="q-mr-xs" />
                  {{ transactionType === 'sell' ? t('customer.customer') : t('customer.supplier') }}
                </div>
                <div class="item-value">{{ customerName }}</div>
              </div>

              <!-- Branch Info (if admin) -->
              <div v-if="branchName" class="overview-item">
                <div class="item-label">
                  <q-icon name="business" class="q-mr-xs" />
                  {{ t('common.branch') }}
                </div>
                <div class="item-value">{{ branchName }}</div>
              </div>

              <!-- Warehouse Info -->
              <div class="overview-item">
                <div class="item-label">
                  <q-icon name="warehouse" class="q-mr-xs" />
                  {{ t('warehouse.warehouse') }}
                </div>
                <div class="item-value">{{ warehouseName }}</div>
              </div>

              <!-- Payment Type -->
              <div class="overview-item">
                <div class="item-label">
                  <q-icon name="payment" class="q-mr-xs" />
                  {{ t('transaction.paymentType') }}
                </div>
                <div class="item-value">
                  <q-badge
                    :color="formData.payment_type === 'cash' ? 'positive' : 'orange'"
                    :label="paymentTypeText"
                  />
                </div>
              </div>

              <!-- Discount (if sell) -->
              <div v-if="transactionType === 'sell' && formData.discount_percentage > 0" class="overview-item">
                <div class="item-label">
                  <q-icon name="percent" class="q-mr-xs" />
                  {{ t('transaction.discount') }}
                </div>
                <div class="item-value">{{ formData.discount_percentage }}%</div>
              </div>

              <!-- Status (if sell) -->
              <div v-if="transactionType === 'sell'" class="overview-item">
                <div class="item-label">
                  <q-icon name="receipt" class="q-mr-xs" />
                  {{ t('transaction.status') }}
                </div>
                <div class="item-value">
                  <q-badge
                    :color="formData.status === 'complete' ? 'positive' : 'orange'"
                    :label="statusText"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Items Summary -->
      <div class="items-summary q-mt-lg">
        <div class="section-title">
          <q-icon name="inventory" class="q-mr-sm" />
          {{ t('transaction.itemsSummary') }}
          <q-chip
            :label="`${formData.selectedItems.length} ${formData.selectedItems.length === 1 ? 'item' : 'items'}`"
            color="primary"
            text-color="white"
            size="sm"
            dense
            class="q-ml-sm"
          />
        </div>

        <q-card flat bordered class="items-summary-card">
          <q-markup-table separator="cell" flat>
            <thead>
              <tr>
                <th class="text-left">{{ t('item.item') }}</th>
                <th class="text-center">{{ t('transaction.quantity') }}</th>
                <th class="text-right">{{ t('transaction.unitPrice') }}</th>
                <th class="text-right">{{ t('transaction.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in formData.selectedItems" :key="index">
                <td>
                  <div class="item-info">
                    <div class="item-name">{{ item.item.name }}</div>
                    <div class="item-sku">{{ item.item.sku }}</div>
                  </div>
                </td>
                <td class="text-center">
                  <q-chip
                    :label="item.quantity"
                    color="blue-1"
                    text-color="blue-8"
                    size="sm"
                  />
                </td>
                <td class="text-right">{{ formatCurrency(item.unit_price) }}</td>
                <td class="text-right font-weight-bold">{{ formatCurrency(item.total) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>

      <!-- Financial Summary -->
      <div class="financial-summary q-mt-lg">
        <q-card flat bordered class="financial-summary-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="calculate" class="q-mr-sm" />
              {{ t('transaction.financialSummary') }}
            </div>

            <div class="financial-grid">
              <div class="financial-row">
                <div class="financial-label">{{ t('transaction.subtotal') }}</div>
                <div class="financial-value">{{ formatCurrency(subtotal) }}</div>
              </div>

              <div v-if="transactionType === 'sell' && formData.discount_percentage > 0" class="financial-row discount-row">
                <div class="financial-label">
                  {{ t('transaction.discount') }} ({{ formData.discount_percentage }}%)
                </div>
                <div class="financial-value text-negative">-{{ formatCurrency(discountAmount) }}</div>
              </div>

              <q-separator class="q-my-md" />

              <div class="financial-row total-row">
                <div class="financial-label">{{ t('transaction.total') }}</div>
                <div class="financial-value">{{ formatCurrency(finalTotal) }}</div>
              </div>

              <div class="financial-row">
                <div class="financial-label">{{ t('transaction.totalItems') }}</div>
                <div class="financial-value">{{ totalItems }}</div>
              </div>

              <div class="financial-row">
                <div class="financial-label">{{ t('transaction.totalQuantity') }}</div>
                <div class="financial-value">{{ totalQuantity }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Additional Notes -->
      <div v-if="formData.note?.trim()" class="notes-section q-mt-lg">
        <q-card flat bordered class="notes-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="note" class="q-mr-sm" />
              {{ t('common.notes') }}
            </div>
            <div class="notes-content">
              {{ formData.note }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Exchange Rate Info (if applicable) -->
      <div v-if="formData.usd_iqd_rate > 0" class="exchange-rate-section q-mt-lg">
        <q-card flat bordered class="exchange-rate-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="currency_exchange" class="q-mr-sm" />
              {{ t('transaction.exchangeRate') }}
            </div>
            <div class="exchange-rate-info">
              <div class="rate-item">
                <span class="rate-label">USD to IQD:</span>
                <span class="rate-value">1 USD = {{ formatNumber(formData.usd_iqd_rate) }} IQD</span>
              </div>
              <div class="rate-item">
                <span class="rate-label">{{ t('transaction.totalInIqd') }}:</span>
                <span class="rate-value">{{ formatNumber(finalTotal * formData.usd_iqd_rate) }} IQD</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Final Actions -->
      <div class="final-actions q-mt-xl">
        <q-card flat bordered class="actions-card">
          <q-card-section class="text-center">
            <div class="text-h6 q-mb-md text-positive">
              <q-icon name="check_circle" class="q-mr-sm" />
              {{ t('transaction.readyToSubmit') }}
            </div>
            <div class="text-body2 text-grey-6 q-mb-lg">
              {{ t('transaction.reviewBeforeSubmit') }}
            </div>
            <div class="action-buttons">
              <q-btn
                flat
                :label="t('common.goBack')"
                :icon="backIcon"
                @click="$emit('previous')"
                class="q-mr-sm"
              />
              <q-btn
                color="positive"
                :label="t('transaction.createTransaction')"
                icon="check"
                no-caps
                size="lg"
                @click="$emit('submit')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRTL } from 'src/composables/useRTL';
import { useCustomerStore } from 'src/stores/customerStore';
import { useBranchStore } from 'src/stores/branchStore';
import { useWarehouseStore } from 'src/stores/warehouseStore';

// Props & Emits
interface Props {
  formData: any;
  transactionType: 'sell' | 'purchase';
  validationErrors: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'previous'): void;
  (_e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const { backIcon } = useRTL();

// Stores
const customerStore = useCustomerStore();
const branchStore = useBranchStore();
const warehouseStore = useWarehouseStore();

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const isStepValid = computed(() => {
  return formData.value.selectedItems.length > 0 &&
         formData.value.customer_id &&
         formData.value.warehouse_id &&
         formData.value.payment_type;
});

const customerName = computed(() => {
  if (!formData.value.customer_id) {
    return t('transaction.selectedCustomer');
  }

  // First try to use the stored name from form data
  if (formData.value.customer_name) {
    return formData.value.customer_name;
  }

  // Fallback to store lookup
  const customer = customerStore.customers.find(c => c.id === formData.value.customer_id);
  return customer ? `${customer.fname} ${customer.sname}` : t('transaction.selectedCustomer');
});

const branchName = computed(() => {
  if (!formData.value.branch_id) {
    return null;
  }

  // First try to use the stored name from form data
  if (formData.value.branch_name) {
    return formData.value.branch_name;
  }

  // Fallback to store lookup
  const branch = branchStore.branches.find(b => b.id === formData.value.branch_id);
  return branch ? branch.name : t('transaction.selectedBranch');
});

const warehouseName = computed(() => {
  if (!formData.value.warehouse_id) {
    return t('transaction.selectedWarehouse');
  }

  // First try to use the stored name from form data
  if (formData.value.warehouse_name) {
    return formData.value.warehouse_name;
  }

  // Fallback to store lookup
  const warehouse = warehouseStore.warehouses.find(w => w.id === formData.value.warehouse_id);
  return warehouse ? warehouse.name : t('transaction.selectedWarehouse');
});

const paymentTypeText = computed(() => {
  return formData.value.payment_type === 'cash'
    ? t('transaction.paymentTypes.cash')
    : t('transaction.paymentTypes.borrow');
});

const statusText = computed(() => {
  return formData.value.status === 'complete'
    ? t('transaction.status.complete')
    : t('transaction.status.reserved');
});

const totalItems = computed(() => {
  return formData.value.selectedItems.length;
});

const totalQuantity = computed(() => {
  return formData.value.selectedItems.reduce((total: number, item: any) =>
    total + item.quantity, 0);
});

const subtotal = computed(() => {
  return formData.value.selectedItems.reduce((total: number, item: any) =>
    total + (item.quantity * item.unit_price), 0);
});

const discountAmount = computed(() => {
  if (props.transactionType === 'sell' && formData.value.discount_percentage > 0) {
    return subtotal.value * (formData.value.discount_percentage / 100);
  }
  return 0;
});

const finalTotal = computed(() => {
  return subtotal.value - discountAmount.value;
});

// Methods
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatNumber = (number: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
};

// Watch for validation changes
watch(isStepValid, (isValid) => {
  emit('validate', 4, isValid);
}, { immediate: true });
</script>

<style lang="scss" scoped>
.summary-step {
  .step-container {
    max-width: 1000px;
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

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $primary;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .transaction-overview {
    .overview-card {
      border-radius: 12px;
      border: 2px solid $primary;

      .overview-header {
        background: $blue-1;

        .transaction-title {
          display: flex;
          align-items: center;
        }
      }

      .overview-content {
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;

          .overview-item {
            .item-label {
              font-size: 0.875rem;
              color: $grey-6;
              margin-bottom: 0.25rem;
              display: flex;
              align-items: center;
            }

            .item-value {
              font-weight: 600;
              font-size: 1rem;
            }
          }
        }
      }
    }
  }

  .items-summary {
    .items-summary-card {
      border-radius: 12px;

      :deep(table) {
        border-radius: 12px;
        overflow: hidden;

        thead {
          background: $grey-2;

          th {
            font-weight: 600;
            color: $dark;
          }
        }

        tbody {
          tr {
            &:nth-child(even) {
              background: $grey-1;
            }
          }

          .item-info {
            .item-name {
              font-weight: 600;
              margin-bottom: 0.25rem;
            }

            .item-sku {
              font-size: 0.8rem;
              color: $grey-6;
            }
          }
        }
      }
    }
  }

  .financial-summary {
    .financial-summary-card {
      border-radius: 12px;
      border: 2px solid $green-5;

      .financial-grid {
        .financial-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;

          .financial-label {
            font-weight: 500;
          }

          .financial-value {
            font-weight: 600;
            font-size: 1.1rem;
          }

          &.total-row {
            background: $positive;
            color: white;
            padding: 1rem;
            margin: 0 -1rem;
            border-radius: 8px;

            .financial-label,
            .financial-value {
              font-size: 1.25rem;
              font-weight: 700;
            }
          }

          &.discount-row {
            .financial-value {
              color: $negative;
            }
          }
        }
      }
    }
  }

  .notes-section {
    .notes-card {
      border-radius: 12px;
      border: 2px solid $orange-5;

      .notes-content {
        background: $orange-1;
        padding: 1rem;
        border-radius: 8px;
        font-style: italic;
        line-height: 1.6;
      }
    }
  }

  .exchange-rate-section {
    .exchange-rate-card {
      border-radius: 12px;
      border: 2px solid $purple-5;

      .exchange-rate-info {
        .rate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;

          .rate-label {
            font-weight: 500;
          }

          .rate-value {
            font-weight: 600;
            color: $purple-8;
          }
        }
      }
    }
  }

  .final-actions {
    .actions-card {
      border-radius: 12px;
      border: 2px solid $positive;
      background: $green-1;

      .action-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
      }
    }
  }
}

// Dark mode support
.body--dark {
  .summary-step {
    .step-header {
      .step-title {
        color: $grey-1;
      }
    }

    .transaction-overview {
      .overview-card {
        .overview-header {
          background: rgba(33, 150, 243, 0.1);
        }
      }
    }

    .items-summary {
      .items-summary-card {
        :deep(table) {
          thead {
            background: rgba(255, 255, 255, 0.05);
          }

          tbody {
            tr {
              &:nth-child(even) {
                background: rgba(255, 255, 255, 0.02);
              }
            }
          }
        }
      }
    }

    .notes-section {
      .notes-card {
        .notes-content {
          background: rgba(255, 152, 0, 0.1);
        }
      }
    }

    .final-actions {
      .actions-card {
        background: rgba(76, 175, 80, 0.1);
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .summary-step {
    .step-header {
      margin-bottom: 1.5rem;

      .step-title {
        font-size: 1.25rem;
      }

      .step-description {
        font-size: 0.9rem;
      }
    }

    .transaction-overview {
      .overview-card {
        .overview-content {
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }
      }
    }

    .financial-summary {
      .financial-summary-card {
        .financial-grid {
          .financial-row {
            &.total-row {
              margin: 0;
            }
          }
        }
      }
    }

    .final-actions {
      .actions-card {
        .action-buttons {
          flex-direction: column;
          width: 100%;

          .q-btn {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
