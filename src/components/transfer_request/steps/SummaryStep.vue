<template>
  <div class="summary-step">
    <!-- Step Header -->
    <div class="step-header q-mb-xl">
      <div class="step-icon-container">
        <q-icon name="summarize" size="2.5rem" class="text-primary" />
      </div>
      <h5 class="step-title">{{ t('transferRequest.reviewSummary') }}</h5>
      <p class="step-subtitle text-grey-6">
        {{ t('transferRequest.reviewSummaryDescription') }}
      </p>
    </div>

    <!-- Transfer Summary Card -->
    <div class="summary-card q-mb-lg">
      <q-card class="transfer-summary-card">
        <q-card-section>
          <div class="summary-header q-mb-lg">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon
                  :name="formData.transferType === 'request' ? 'move_to_inbox' : 'swap_horiz'"
                  size="2rem"
                  class="text-primary q-mr-md"
                />
                <div>
                  <div class="text-h6">
                    {{ formData.transferType === 'request' ? t('transferRequest.transferRequest') : t('transferRequest.directTransfer') }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ formData.transferType === 'request' ? t('transferRequest.requestSummaryNote') : t('transferRequest.transferSummaryNote') }}
                  </div>
                </div>
              </div>
              <q-chip
                :color="formData.transferType === 'request' ? 'info' : 'positive'"
                text-color="white"
                size="lg"
                :icon="formData.transferType === 'request' ? 'move_to_inbox' : 'swap_horiz'"
              >
                {{ formData.transferType === 'request' ? t('transferRequest.request') : t('transferRequest.transfer') }}
              </q-chip>
            </div>
          </div>

          <!-- Warehouse Information -->
          <div class="warehouse-summary q-mb-lg">
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              <q-icon name="warehouse" class="q-mr-sm" />
              {{ t('transferRequest.warehouseDetails') }}
            </div>

            <!-- Horizontal Warehouse Transfer Layout -->
            <q-card flat bordered class="transfer-flow-card">
              <q-card-section class="q-pa-lg">
                <div class="transfer-flow">
                  <!-- Source Warehouse -->
                  <div class="warehouse-info source">
                    <div class="warehouse-type">
                      <q-icon name="upload" class="text-orange q-mr-sm" />
                      <span class="text-weight-medium">
                        {{ formData.transferType === 'request' ? t('transferRequest.from') : t('transferRequest.from') }}
                      </span>
                    </div>
                    <div class="warehouse-details">
                      <div class="warehouse-name text-h6">{{ formData.fromWarehouseName }}</div>
                      <div class="warehouse-branch text-grey-6">{{ formData.fromBranchName }}</div>
                    </div>
                  </div>

                  <!-- Transfer Arrow -->
                  <div :class="transferArrowClass">
                    <q-icon :name="transferArrowIcon" size="2.5rem" class="text-primary" />
                  </div>

                  <!-- Destination Warehouse -->
                  <div class="warehouse-info destination">
                    <div class="warehouse-type">
                      <q-icon name="download" class="text-green q-mr-sm" />
                      <span class="text-weight-medium">
                        {{ formData.transferType === 'request' ? t('transferRequest.to') : t('transferRequest.to') }}
                      </span>
                    </div>
                    <div class="warehouse-details">
                      <div class="warehouse-name text-h6">{{ formData.toWarehouseName }}</div>
                      <div class="warehouse-branch text-grey-6">{{ formData.toBranchName }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Items Summary -->
          <div class="items-summary q-mb-lg">
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              <q-icon name="inventory" class="q-mr-sm" />
              {{ t('transferRequest.itemsToTransfer') }}
              <q-chip color="info" text-color="white" size="sm" class="q-ml-sm">
                {{ formData.selectedItems.length }} {{ t('common.items') }}
              </q-chip>
            </div>

            <q-table
              :rows="formData.selectedItems"
              :columns="itemColumns"
              row-key="item.id"
              flat
              bordered
              :pagination="{ rowsPerPage: 0 }"
              hide-pagination
              class="items-summary-table"
            >
              <!-- Item Name -->
              <template #body-cell-name="props">
                <q-td :props="props">
                  <div class="item-info">
                    <div class="item-name">{{ props.row.item.name }}</div>
                    <div class="item-sku text-caption text-grey-6">
                      {{ t('common.sku') }}: {{ props.row.item.sku }}
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Quantity -->
              <template #body-cell-quantity="props">
                <q-td :props="props">
                  <q-chip color="primary" text-color="white" size="sm">
                    {{ props.row.quantity }} {{ t('common.units') }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Available -->
              <template #body-cell-available="props">
                <q-td :props="props">
                  <div class="text-grey-6">
                    {{ props.row.availableQuantity }} {{ t('common.available') }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Notes Section -->
    <div class="notes-section q-mb-lg">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="note" class="q-mr-sm" />
            {{ t('transferRequest.additionalNotes') }}
          </div>

          <q-input
            v-model="formData.note"
            type="textarea"
            :label="t('transferRequest.addNote')"
            outlined
            rows="3"
            :placeholder="t('transferRequest.notePlaceholder')"
            maxlength="500"
            counter
            @update:model-value="updateNote"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Action Summary -->
    <div class="action-summary">
      <q-card flat bordered class="action-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="action-info">
              <div class="text-h6">
                {{ t('transferRequest.readyToSubmit') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ formData.transferType === 'request'
                    ? t('transferRequest.requestWillBeCreated')
                    : t('transferRequest.transferWillBeCreated')
                }}
              </div>
            </div>
            <div class="action-stats">
              <div class="stat-item">
                <div class="stat-number">{{ formData.selectedItems.length }}</div>
                <div class="stat-label">{{ t('common.items') }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ totalQuantity }}</div>
                <div class="stat-label">{{ t('common.units') }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Props & Emits
interface Props {
  formData: {
    transferType: 'request' | 'transfer';
    fromWarehouseName?: string | null;
    fromBranchName?: string | null;
    toWarehouseName?: string | null;
    toBranchName?: string | null;
    selectedItems: Array<{
      item: any;
      quantity: number;
      availableQuantity: number;
    }>;
    note: string;
    [key: string]: any;
  };
  validationErrors?: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'clearValidationError', _field: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t, locale } = useI18n();

// Computed
const formData = computed({
  get: () => props.formData,
  set: (value) => emit('update:formData', value)
});

// Check if current locale is RTL
const isRTL = computed(() => {
  return locale.value === 'ckb' || locale.value === 'ar';
});

// Transfer arrow icon based on RTL
const transferArrowIcon = computed(() => {
  return isRTL.value ? 'arrow_back' : 'arrow_forward';
});

// Transfer arrow CSS class for RTL
const transferArrowClass = computed(() => {
  return 'transfer-arrow';
});

const itemColumns = computed(() => [
  {
    name: 'name',
    label: t('item.name'),
    field: 'name',
    align: 'left' as const
  },
  {
    name: 'quantity',
    label: t('transferRequest.quantity'),
    field: 'quantity',
    align: 'center' as const
  },
  {
    name: 'available',
    label: t('transferRequest.available'),
    field: 'available',
    align: 'center' as const
  }
]);

const totalQuantity = computed(() => {
  return formData.value.selectedItems.reduce((total, item) => total + item.quantity, 0);
});

// Validation
const isStepValid = computed(() => {
  return formData.value.selectedItems.length > 0 &&
         formData.value.fromWarehouseName &&
         formData.value.toWarehouseName;
});

// Methods
const updateNote = (value: string | number | null) => {
  const updatedData = {
    ...formData.value,
    note: String(value || '')
  };

  emit('update:formData', updatedData);
  emit('clearValidationError', 'note');
};

// Initial validation
const validateStep = () => {
  emit('validate', 3, Boolean(isStepValid.value));
};

// Run validation
validateStep();
</script>

<style lang="scss" scoped>
.summary-step {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;

  .step-header {
    text-align: center;

    .step-icon-container {
      margin-bottom: 1rem;
    }

    .step-title {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: var(--q-primary);
    }

    .step-subtitle {
      margin: 0;
      font-size: 1rem;
    }
  }

  .transfer-summary-card {
    background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.02) 0%, rgba(var(--q-primary-rgb), 0.05) 100%);
    border: 1px solid rgba(var(--q-primary-rgb), 0.1);

    .summary-header {
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
  }

  .warehouse-summary {
    .warehouse-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .warehouse-header {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;

        .warehouse-label {
          font-weight: 500;
          color: var(--q-dark);
        }
      }

      .warehouse-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .warehouse-branch {
        font-size: 0.9rem;
      }
    }

    .transfer-direction {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1rem 0;

      .direction-indicator {
        padding: 0.5rem;
        background: rgba(var(--q-primary-rgb), 0.1);
        border-radius: 50%;
      }
    }
  }

  .items-summary {
    .items-summary-table {
      .item-info {
        .item-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
      }
    }
  }

  .action-card {
    background: linear-gradient(135deg, rgba(var(--q-positive-rgb), 0.05) 0%, rgba(var(--q-positive-rgb), 0.1) 100%);
    border-color: rgba(var(--q-positive-rgb), 0.2);

    .action-info {
      .text-h6 {
        color: var(--q-positive);
        margin-bottom: 0.25rem;
      }
    }

    .action-stats {
      display: flex;
      gap: 2rem;

      .stat-item {
        text-align: center;

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--q-positive);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--q-dark);
          text-transform: uppercase;
          font-weight: 500;
        }
      }
    }
  }

  // Horizontal Transfer Flow Styles
  .transfer-flow-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 2px solid #dee2e6;
    border-radius: 12px;
    overflow: hidden;
  }

  .transfer-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    min-height: 120px;

    .warehouse-info {
      flex: 1;
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &.source {
        border-left: 4px solid #f57c00;
      }

      &.destination {
        border-left: 4px solid #4caf50;
      }

      .warehouse-type {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #666;
      }

      .warehouse-details {
        .warehouse-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .warehouse-branch {
          font-size: 0.85rem;
          font-style: italic;
        }
      }
    }

    .transfer-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: pulse 2s infinite;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(25, 118, 210, 0.3);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    .summary-step {
      padding: 1rem 0.5rem;

      .warehouse-summary {
        .transfer-direction {
          order: 3;
          margin: 0.5rem 0;
        }
      }

      .action-stats {
        gap: 1rem !important;

        .stat-item {
          .stat-number {
            font-size: 1.25rem;
          }
        }
      }
    }

    .transfer-flow {
      flex-direction: column;
      gap: 1rem;

      .transfer-arrow {
        transform: rotate(90deg);
      }

      .warehouse-info {
        width: 100%;
        max-width: 300px;
      }
    }
  }
}
</style>
