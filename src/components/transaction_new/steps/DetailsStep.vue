<template>
  <div class="details-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="edit" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('transaction.steps.details') }}</span>
        </div>
        <div class="step-description">
          {{ t('transaction.steps.detailsDesc') }}
        </div>
      </div>

      <!-- Items Details Section -->
      <div v-if="formData.selectedItems.length > 0" class="items-details">
        <div class="section-title">
          <q-icon name="edit" class="q-mr-sm" />
          {{ t('transaction.itemDetails') }}
          <q-chip
            :label="`${formData.selectedItems.length} ${formData.selectedItems.length === 1 ? t('common.item') : t('common.items')}`"
            color="primary"
            text-color="white"
            size="sm"
            dense
            class="q-ml-sm"
          />
        </div>

        <div class="items-list">
          <div
            v-for="(selectedItem, index) in formData.selectedItems"
            :key="selectedItem.item.id"
            class="item-card-wrapper"
          >
            <q-card flat bordered class="item-detail-card">
              <q-card-section class="q-pa-md">
                <!-- Item Header -->
                <div class="item-header">
                  <div class="item-info">
                    <div class="item-name">{{ selectedItem.item.name }}</div>
                    <div class="item-sku">{{ t('item.sku') }}: {{ selectedItem.item.sku }}</div>
                    <div v-if="selectedItem.item.category?.name" class="item-category">
                      {{ t('item.category') }}: {{ selectedItem.item.category.name }}
                    </div>
                  </div>
                  <q-btn
                    @click="removeItem(index)"
                    icon="close"
                    flat
                    round
                    color="negative"
                    size="sm"
                    class="remove-btn"
                  >
                    <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>

                <q-separator class="q-my-md" />

                <!-- Main Content Grid -->
                <div class="item-content-grid">
                  <!-- Quantity Section -->
                  <div class="content-section">
                    <div class="section-header">
                      <q-icon name="inventory" size="sm" class="q-mr-xs text-primary" />
                      <span class="section-title">{{ t('transaction.quantity') }}</span>
                    </div>

                    <div class="quantity-controls">
                      <q-btn
                        flat
                        round
                        icon="remove"
                        @click="decreaseQuantity(index)"
                        :disable="selectedItem.quantity <= 1"
                        size="sm"
                        color="primary"
                      />
                      <q-input
                        v-model.number="selectedItem.quantity"
                        type="number"
                        min="1"
                        :max="transactionType === 'sell' ? getItemQuantity(selectedItem.item) : undefined"
                        outlined
                        dense
                        class="quantity-input"
                        @update:model-value="updateItemTotal(index)"
                      />
                      <q-btn
                        flat
                        round
                        icon="add"
                        @click="increaseQuantity(index)"
                        :disable="transactionType === 'sell' && selectedItem.quantity >= getItemQuantity(selectedItem.item)"
                        size="sm"
                        color="primary"
                      />
                    </div>

                    <div v-if="transactionType === 'sell'" class="availability-info">
                      <div class="text-caption text-info">
                        {{ t('item.available') }}: {{ getItemQuantity(selectedItem.item) }}
                      </div>
                    </div>
                  </div>

                  <!-- Pricing Section -->
                  <div class="content-section">
                    <div class="section-header">
                      <q-icon name="attach_money" size="sm" class="q-mr-xs text-primary" />
                      <span class="section-title">{{ t('transaction.pricing') }}</span>
                    </div>

                    <div class="pricing-container">
                      <!-- For Purchase Transactions -->
                      <template v-if="transactionType === 'purchase'">
                        <div class="pricing-fields">
                          <q-input
                            v-model.number="selectedItem.solo_unit_price"
                            type="number"
                            min="0"
                            step="0.01"
                            outlined
                            dense
                            :label="t('item.soloUnitPrice')"
                            @update:model-value="updateItemTotal(index)"
                            prefix="$"
                            class="pricing-input"
                          />
                          <q-input
                            v-model.number="selectedItem.bulk_unit_price"
                            type="number"
                            min="0"
                            step="0.01"
                            outlined
                            dense
                            :label="t('item.bulkUnitPrice')"
                            @update:model-value="updateItemTotal(index)"
                            prefix="$"
                            class="pricing-input"
                          />
                          <q-input
                            v-model.number="selectedItem.unit_price"
                            type="number"
                            min="0"
                            step="0.01"
                            outlined
                            dense
                            :label="t('item.unitPrice')"
                            @update:model-value="updateItemTotal(index)"
                            prefix="$"
                            class="pricing-input"
                          />
                        </div>
                      </template>

                      <!-- For Sell Transactions -->
                      <template v-else>
                        <q-input
                          v-model.number="selectedItem.unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          outlined
                          dense
                          :label="t('item.unitPrice')"
                          @update:model-value="updateItemTotal(index)"
                          prefix="$"
                          :hint="t('transaction.editableUnitPrice')"
                          class="pricing-input single-price"
                        />
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Unit Information -->
                <div v-if="getItemPacketUnits(selectedItem.item) || getItemPackageUnits(selectedItem.item)" class="unit-info-section q-mt-md">
                  <div class="unit-info-header">
                    <q-icon name="info" size="xs" class="q-mr-xs" />
                    {{ t('itemTransaction.unitInfo') }}
                  </div>
                  <div class="units-chips">
                    <q-chip
                      v-if="getItemPacketUnits(selectedItem.item)"
                      color="blue-4"
                      text-color="white"
                      size="sm"
                      icon="inventory_2"
                      dense
                    >
                      {{ t('itemTransaction.packetUnits') }}: {{ getItemPacketUnits(selectedItem.item) }}
                    </q-chip>
                    <q-chip
                      v-if="getItemPackageUnits(selectedItem.item)"
                      color="purple-4"
                      text-color="white"
                      size="sm"
                      icon="category"
                      dense
                    >
                      {{ t('itemTransaction.packageUnits') }}: {{ getItemPackageUnits(selectedItem.item) }}
                    </q-chip>
                  </div>
                </div>

                <!-- Quantity Breakdown -->
                <div v-if="selectedItem.quantity > 0 && getItemPacketUnits(selectedItem.item) && getItemPackageUnits(selectedItem.item)" class="breakdown-section q-mt-md">
                  <div class="breakdown-header">
                    <q-icon name="analytics" size="sm" class="text-primary" />
                    <span class="breakdown-title">{{ t('itemTransaction.breakdown') }}</span>
                  </div>
                  <div class="breakdown-content">
                    <div class="breakdown-chips">
                      <template v-for="(part, index) in getBreakdownParts(calculateQuantityBreakdown(selectedItem.quantity, getItemPacketUnits(selectedItem.item), getItemPackageUnits(selectedItem.item)))" :key="index">
                        <q-chip
                          text-color="white"
                          :icon="getBreakdownChipIcon(part.type)"
                          class="breakdown-chip"
                          :color="getBreakdownChipColor(part.type)"
                        >
                          <span class="breakdown-value">{{ part.value }}</span>
                          <span class="breakdown-label">{{ part.label }}</span>
                        </q-chip>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Total Section -->
                <q-separator class="q-my-md" />
                <div class="total-section">
                  <div class="total-label">{{ t('transaction.itemTotal') }}:</div>
                  <div class="total-value">{{ formatCurrency(selectedItem.total || 0) }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="summary-section q-mt-lg">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="summarize" class="q-mr-sm" />
                {{ t('transaction.summary') }}
              </div>

              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-label">{{ t('transaction.totalItems') }}:</div>
                  <div class="summary-value">{{ totalItems }}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">{{ t('transaction.totalQuantity') }}:</div>
                  <div class="summary-value">{{ totalQuantity }}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">{{ t('transaction.subtotal') }}:</div>
                  <div class="summary-value">{{ formatCurrency(subtotal) }}</div>
                </div>
                <div v-if="transactionType === 'sell' && formData.discount_percentage > 0" class="summary-item">
                  <div class="summary-label">{{ t('transaction.discount') }} ({{ formData.discount_percentage }}%):</div>
                  <div class="summary-value text-negative">-{{ formatCurrency(discountAmount) }}</div>
                </div>
                <div class="summary-item total-item">
                  <div class="summary-label">{{ t('transaction.total') }}:</div>
                  <div class="summary-value total-value">{{ formatCurrency(finalTotal) }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-card flat bordered class="empty-state-card">
          <q-card-section class="text-center q-py-xl">
            <q-icon name="inventory" size="80px" class="text-grey-4 q-mb-md" />
            <div class="text-h6 text-grey-6 q-mb-sm">{{ t('transaction.noItemsSelected') }}</div>
            <div class="text-body2 text-grey-5 q-mb-lg">
              {{ t('transaction.goBackToSelectItems') }}
            </div>
            <q-btn
              color="primary"
              :label="t('common.previous')"
              no-caps
              :icon="backIcon"
              @click="$emit('previous')"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRTL } from 'src/composables/useRTL';

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
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const { backIcon } = useRTL();

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const isStepValid = computed(() => {
  // Check if all items have valid quantities and prices
  return formData.value.selectedItems.length > 0 &&
         formData.value.selectedItems.every((item: any) =>
           item.quantity > 0 && item.unit_price >= 0
         );
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

const getItemQuantity = (item: any): number => {
  if (props.transactionType === 'sell') {
    return item.total_quantity || item.quantity || 0;
  }
  return 999; // For purchase, quantity is not limited
};

const removeItem = (index: number) => {
  formData.value.selectedItems.splice(index, 1);
};

const increaseQuantity = (index: number) => {
  const selectedItem = formData.value.selectedItems[index];
  const maxQuantity = props.transactionType === 'sell' ? getItemQuantity(selectedItem.item) : 999;

  if (selectedItem.quantity < maxQuantity) {
    selectedItem.quantity++;
    updateItemTotal(index);
  }
};

const decreaseQuantity = (index: number) => {
  const selectedItem = formData.value.selectedItems[index];

  if (selectedItem.quantity > 1) {
    selectedItem.quantity--;
    updateItemTotal(index);
  }
};

const updateItemTotal = (index: number) => {
  const selectedItem = formData.value.selectedItems[index];
  selectedItem.total = selectedItem.quantity * selectedItem.unit_price;
};

// Helper functions for packet and package units
const getItemPacketUnits = (item: any): number => {
  return item.packet_units || item.pivot?.packet_units || 0;
};

const getItemPackageUnits = (item: any): number => {
  return item.package_units || item.pivot?.package_units || 0;
};

// Quantity breakdown calculation functions
const calculateQuantityBreakdown = (totalQuantity: number, packetUnits: number, packageUnits: number) => {
  if (!packetUnits || !packageUnits || totalQuantity <= 0) {
    return { packages: 0, packets: 0, pieces: totalQuantity || 0 };
  }

  const piecesPerPackage = packageUnits * packetUnits;

  // Calculate packages
  const packages = Math.floor(totalQuantity / piecesPerPackage);
  const remaining = totalQuantity - (packages * piecesPerPackage);

  // Calculate packets from remaining
  const packets = Math.floor(remaining / packetUnits);

  // Calculate pieces from remaining
  const pieces = remaining - (packets * packetUnits);

  return { packages, packets, pieces };
};

// Helper function to get breakdown parts as structured data
const getBreakdownParts = (breakdown: { packages: number; packets: number; pieces: number }) => {
  const parts: Array<{ type: string; value: number; label: string }> = [];

  if (breakdown.packages > 0) {
    const packageLabel = breakdown.packages === 1 ?
      t('itemTransaction.package') :
      t('itemTransaction.packages');
    parts.push({
      type: 'package',
      value: breakdown.packages,
      label: packageLabel
    });
  }

  if (breakdown.packets > 0) {
    const packetLabel = breakdown.packets === 1 ?
      t('itemTransaction.packet') :
      t('itemTransaction.packets');
    parts.push({
      type: 'packet',
      value: breakdown.packets,
      label: packetLabel
    });
  }

  if (breakdown.pieces > 0) {
    const pieceLabel = breakdown.pieces === 1 ?
      t('itemTransaction.piece') :
      t('itemTransaction.pieces');
    parts.push({
      type: 'piece',
      value: breakdown.pieces,
      label: pieceLabel
    });
  }

  // If no breakdown, show pieces only
  if (parts.length === 0) {
    parts.push({
      type: 'piece',
      value: breakdown.pieces,
      label: t('itemTransaction.pieces')
    });
  }

  return parts;
};

// Get appropriate icon for breakdown chip based on type
const getBreakdownChipIcon = (type: string) => {
  switch (type) {
    case 'package':
      return 'inventory_2';
    case 'packet':
      return 'redeem';
    case 'piece':
      return 'grain';
    default:
      return 'help';
  }
};

// Get appropriate color for breakdown chip based on type
const getBreakdownChipColor = (type: string) => {
  switch (type) {
    case 'package':
      return 'purple-5';
    case 'packet':
      return 'blue-5';
    case 'piece':
      return 'green-5';
    default:
      return 'grey-5';
  }
};

// Watch for validation changes
import { watch } from 'vue';
watch(isStepValid, (isValid) => {
  emit('validate', 3, isValid);
}, { immediate: true });
</script>

<style lang="scss" scoped>
.details-step {
  .step-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
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

  .items-details {
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .item-card-wrapper {
        width: 100%;
      }

      .item-detail-card {
        border-radius: 12px;
        border: 1px solid rgba($primary, 0.2);
        transition: all 0.3s ease;
        overflow: hidden;
        width: 100%;
        max-width: 100%;

        &:hover {
          box-shadow: 0 4px 12px rgba($primary, 0.15);
          border-color: rgba($primary, 0.4);
        }

        .q-card__section {
          padding: 1.5rem !important;
          width: 100%;
          box-sizing: border-box;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;

          .item-info {
            flex: 1;

            .item-name {
              font-weight: 600;
              font-size: 1.1rem;
              color: $dark;
              margin-bottom: 0.25rem;
            }

            .item-sku,
            .item-category {
              font-size: 0.875rem;
              color: $grey-6;
              margin-bottom: 0.125rem;
            }
          }

          .remove-btn {
            margin-left: 1rem;
          }
        }

        .item-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1rem;

          @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .content-section {
            .section-header {
              display: flex;
              align-items: center;
              margin-bottom: 1rem;

              .section-title {
                font-weight: 600;
                color: $primary;
                font-size: 0.95rem;
              }
            }

            .quantity-controls {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              margin-bottom: 0.75rem;

              .quantity-input {
                width: 100px;
                flex-shrink: 0;
              }
            }

            .availability-info {
              text-align: center;
              margin-top: 0.5rem;
            }

            .pricing-container {
              width: 100%;

              .pricing-fields {
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }

              .pricing-input {
                width: 100%;

                &.single-price {
                  max-width: 300px;
                }
              }
            }
          }
        }

        .total-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, rgba($primary, 0.1), rgba($primary, 0.05));
          border-radius: 8px;
          border: 1px solid rgba($primary, 0.2);

          .total-label {
            font-weight: 600;
            font-size: 1.05rem;
            color: $dark;
          }

          .total-value {
            font-weight: 700;
            font-size: 1.2rem;
            color: $primary;
          }
        }
      }
    }

    // Unit info and breakdown styles
    .unit-info-section {
      margin-top: 1rem;
      padding: 1rem;
      background: $grey-1;
      border-radius: 8px;

      .unit-info-header {
        font-size: 0.875rem;
        color: $grey-7;
        font-weight: 500;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
      }

      .units-chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    }

    .breakdown-section {
      margin-top: 1rem;
      padding: 1rem;
      background: linear-gradient(135deg, rgba($primary, 0.05), rgba($secondary, 0.05));
      border-radius: 8px;
      border: 1px solid rgba($primary, 0.1);

      .breakdown-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .breakdown-title {
          font-weight: 600;
          color: $primary;
          font-size: 0.875rem;
        }
      }

      .breakdown-content {
        .breakdown-chips {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;

          .breakdown-chip {
            font-size: 0.75rem;
            font-weight: 600;

            .breakdown-value {
              font-size: 0.875rem;
              font-weight: 700;
              margin-right: 0.25rem;
            }

            .breakdown-label {
              font-size: 0.75rem;
              opacity: 0.9;
            }
          }
        }
      }
    }

    .summary-section {
      .summary-card {
        border-radius: 12px;
        border: 2px solid $primary;

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;

          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: $grey-1;
            border-radius: 8px;

            .summary-label {
              font-weight: 500;
            }

            .summary-value {
              font-weight: 600;
            }

            &.total-item {
              background: $primary;
              color: white;
              grid-column: 1 / -1;

              .summary-label,
              .summary-value {
                font-size: 1.1rem;
                font-weight: 700;
              }
            }
          }
        }
      }
    }
  }

  .empty-state-card {
    border-radius: 12px;
    border: 2px dashed $grey-4;
  }
}

// Dark mode support
.body--dark {
  .details-step {
    .step-header {
      .step-title {
        color: $grey-1;
      }
    }

    .items-details {
      .unit-info-section {
        background: rgba(255, 255, 255, 0.05);
      }

      .breakdown-section {
        background: linear-gradient(135deg, rgba($primary, 0.1), rgba($secondary, 0.1));
        border-color: rgba($primary, 0.2);
      }

      .items-list {
        .item-detail-card {
          .item-header {
            .item-info {
              .item-name {
                color: $grey-1;
              }
            }
          }

          .total-section {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            border-color: rgba(255, 255, 255, 0.2);

            .total-label {
              color: $grey-1;
            }
          }
        }
      }

      .summary-section {
        .summary-card {
          .summary-grid {
            .summary-item {
              background: rgba(255, 255, 255, 0.05);
            }
          }
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .details-step {
    .step-header {
      margin-bottom: 1.5rem;

      .step-title {
        font-size: 1.25rem;
      }

      .step-description {
        font-size: 0.9rem;
      }
    }

    .items-details {
      .items-list {
        gap: 1rem;

        .item-detail-card {
          .item-content-grid {
            grid-template-columns: 1fr;
            gap: 1rem;

            .content-section {
              .pricing-container {
                .pricing-fields {
                  gap: 0.75rem;
                }

                .pricing-input {
                  &.single-price {
                    max-width: 100%;
                  }
                }
              }
            }
          }
        }
      }

      .summary-section {
        .summary-card {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }
}
</style>
