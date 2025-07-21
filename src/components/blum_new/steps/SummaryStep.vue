<template>
  <div class="summary-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="summarize" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('blumTransaction.steps.summary') }}</span>
        </div>
        <div class="step-description">
          {{ t('blumTransaction.steps.summaryDesc') }}
        </div>
      </div>

      <!-- Transaction Summary -->
      <div class="summary-content">

        <!-- Transaction Overview -->
        <div class="summary-section overview-section">
          <q-card flat bordered class="section-card overview-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="receipt_long" class="q-mr-sm" />
                {{ t('blumTransaction.transactionOverview') }}
              </div>

              <div class="overview-grid">
                <div class="overview-item">
                  <div class="overview-label">{{ t('blumTransaction.transactionType') }}</div>
                  <div class="overview-value">
                    <q-chip
                      :color="transactionType === 'sell' ? 'positive' : 'primary'"
                      text-color="white"
                      :icon="transactionType === 'sell' ? 'sell' : 'shopping_cart'"
                    >
                      {{ transactionType === 'sell' ? t('blumTransaction.sale') : t('blumTransaction.purchase') }}
                    </q-chip>
                  </div>
                </div>

                <div class="overview-item">
                  <div class="overview-label">
                    {{ transactionType === 'sell' ? t('customer.customer') : t('customer.supplier') }}
                  </div>
                  <div class="overview-value">{{ formData.customer_name || 'N/A' }}</div>
                </div>

                <div class="overview-item">
                  <div class="overview-label">{{ t('warehouse.warehouse') }}</div>
                  <div class="overview-value">{{ formData.warehouse_name || 'N/A' }}</div>
                </div>

                <div v-if="formData.branch_name" class="overview-item">
                  <div class="overview-label">{{ t('common.branch') }}</div>
                  <div class="overview-value">{{ formData.branch_name }}</div>
                </div>

                <div class="overview-item">
                  <div class="overview-label">{{ t('blumTransaction.paymentType') }}</div>
                  <div class="overview-value">
                    <q-chip
                      :color="formData.payment_type === 'cash' ? 'positive' : 'orange'"
                      text-color="white"
                      :icon="formData.payment_type === 'cash' ? 'money' : 'credit_card'"
                      size="sm"
                    >
                      {{ formData.payment_type === 'cash' ? t('blumTransaction.cash') : t('blumTransaction.borrow') }}
                    </q-chip>
                  </div>
                </div>

                <div class="overview-item">
                  <div class="overview-label">{{ t('blumTransaction.itemsCount') }}</div>
                  <div class="overview-value">
                    {{ formData.details.length }} {{ formData.details.length === 1 ? 'item' : 'items' }}
                  </div>
                </div>
              </div>

              <!-- Note -->
              <div v-if="formData.note" class="note-display q-mt-lg">
                <div class="note-label">
                  <q-icon name="note" class="q-mr-xs" />
                  {{ t('blumTransaction.note') }}
                </div>
                <div class="note-content">{{ formData.note }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Exchange Rates -->
        <div class="summary-section exchange-rates-section">
          <q-card flat bordered class="section-card exchange-rates-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="currency_exchange" class="q-mr-sm" />
                {{ t('blumTransaction.exchangeRates') }}
              </div>

              <div class="exchange-rates-grid">
                <div class="rate-item">
                  <div class="rate-label">
                    <q-icon name="attach_money" size="sm" class="q-mr-xs" />
                    USD → IQD
                  </div>
                  <div class="rate-value">{{ formData.usd_iqd_rate?.toLocaleString() || 'N/A' }}</div>
                </div>

                <div class="rate-item">
                  <div class="rate-label">
                    <q-icon name="euro_symbol" size="sm" class="q-mr-xs" />
                    EUR → USD
                  </div>
                  <div class="rate-value">{{ formData.eur_usd_rate || 'N/A' }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Items/Sets Details -->
        <div class="summary-section items-details-section">
          <q-card flat bordered class="section-card items-details-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="inventory_2" class="q-mr-sm" />
                {{ t('blumTransaction.itemsDetails') }}
              </div>

              <div class="items-summary">
                <!-- Individual Items -->
                <div v-if="individualItems.length > 0" class="items-group">
                  <div class="group-header">
                    <q-chip size="sm" color="primary" text-color="white" icon="inventory_2">
                      {{ individualItems.length }} {{ t('blumTransaction.items') }}
                    </q-chip>
                  </div>
                  <div class="items-list">
                    <div v-for="(detail, index) in individualItems" :key="index" class="item-row">
                      <div class="item-info">
                        <span class="item-name">{{ detail.item?.name }}</span>
                        <span class="item-code">{{ detail.item?.code }}</span>
                      </div>
                      <div class="item-pricing">
                        <span class="quantity">{{ detail.quantity }}x</span>
                        <span class="unit-price">${{ formatDecimal(detail.unit_price) }}</span>
                        <span class="total">${{ formatDecimal(detail.quantity * detail.unit_price) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sets -->
                <div v-if="setItems.length > 0" class="items-group">
                  <div class="group-header">
                    <q-chip size="sm" color="secondary" text-color="white" icon="folder">
                      {{ setItems.length }} {{ t('blumTransaction.sets') }}
                    </q-chip>
                  </div>
                  <div class="sets-list">
                    <div v-for="(detail, index) in setItems" :key="index" class="set-row">
                      <div class="set-main">
                        <div class="set-info">
                          <span class="set-name">{{ detail.set?.name || detail.set?.title }}</span>
                          <div class="set-pricing">
                            <span class="set-cost">{{ t('blumTransaction.setCost') }}: ${{ formatDecimal(detail.set?.set_cost || 0) }}</span>
                            <span class="set-price">{{ detail.quantity }}x ${{ formatDecimal(detail.unit_price) }} = ${{ formatDecimal(detail.quantity * detail.unit_price) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Set Items -->
                      <div v-if="detail.set_items?.length" class="set-items">
                        <div class="set-items-header">
                          <q-icon name="list" size="xs" class="q-mr-xs" />
                          {{ t('blumTransaction.components') }}:
                        </div>
                        <div class="set-items-grid">
                          <div v-for="setItem in detail.set_items" :key="setItem.id" class="set-item">
                            <span class="set-item-name">{{ setItem.name }}</span>
                            <span class="set-item-quantity">{{ setItem.quantity }}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Final Totals -->
        <div class="summary-section final-totals-section">
          <q-card flat bordered class="section-card final-totals-card">
            <q-card-section>
              <div class="section-title">
                <q-icon name="calculate" class="q-mr-sm" />
                {{ t('blumTransaction.finalTotals') }}
              </div>

              <div class="final-totals-grid">
                <div class="final-total-item iqd-total">
                  <div class="final-total-label">
                    <q-icon name="currency_exchange" size="md" class="q-mr-sm" />
                    {{ t('blumTransaction.totalIqd') }}
                  </div>
                  <div class="final-total-value">
                    {{ formatCurrency(formData.total_price) }} IQD
                  </div>
                </div>

                <div class="final-total-item usd-total">
                  <div class="final-total-label">
                    <q-icon name="attach_money" size="md" class="q-mr-sm" />
                    {{ t('blumTransaction.totalUsd') }}
                  </div>
                  <div class="final-total-value">
                    ${{ formatDecimal(formData.total_usd) }}
                  </div>
                </div>

                <div class="final-total-item eur-total">
                  <div class="final-total-label">
                    <q-icon name="euro_symbol" size="md" class="q-mr-sm" />
                    {{ t('blumTransaction.totalEur') }}
                  </div>
                  <div class="final-total-value">
                    €{{ formatDecimal(formData.total_eur) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Confirmation -->
        <div class="summary-section confirmation-section">
          <q-card flat bordered class="section-card confirmation-card">
            <q-card-section class="text-center">
              <q-icon name="check_circle" size="3rem" color="positive" class="q-mb-md" />
              <div class="text-h6 q-mb-sm">{{ t('blumTransaction.readyToSubmit') }}</div>
              <div class="text-body2 text-grey-6">
                {{ t('blumTransaction.reviewAndSubmit') }}
              </div>
            </q-card-section>
          </q-card>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

// Props & Emits
interface Props {
  formData: any;
  transactionType: 'sell' | 'purchase';
  validationErrors: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const isStepValid = computed(() => {
  // Summary step is always valid if we reached here
  return true;
});

// Split details into individual items and sets
const individualItems = computed(() => {
  return formData.value.details?.filter((detail: any) =>
    detail.item_id && !detail.set_id
  ) || [];
});

const setItems = computed(() => {
  return formData.value.details?.filter((detail: any) =>
    detail.set_id && !detail.item_id
  ) || [];
});

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(amount || 0);
};

const formatDecimal = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

const validateStep = () => {
  emit('validate', 3, isStepValid.value);
};

// Lifecycle
onMounted(() => {
  validateStep();
});
</script>

<style scoped lang="scss">
@import "src/css/quasar.variables.scss";

.summary-step {
  .step-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .step-header {
    margin-bottom: 2rem;
    text-align: center;

    .step-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: $grey-8;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .step-description {
      color: $grey-6;
      font-size: 0.95rem;
      line-height: 1.4;
    }
  }

  .summary-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;

    .summary-section {
      width: 100%;

      .section-card {
        border-radius: 12px;
        border: 1px solid $grey-3;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.2s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
      }
    }

    // Remove old grid system
    .summary-grid {
      display: none;
    }

    .left-column,
    .right-column {
      display: none;
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

  // Transaction Overview Section
  .overview-section {
    .overview-card {
      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .overview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: $grey-1;
          border-radius: 8px;
          border: 1px solid $grey-2;
          transition: all 0.2s ease;

          &:hover {
            background: $blue-1;
            border-color: $blue-3;
          }

          .overview-label {
            font-size: 0.9rem;
            color: $grey-6;
            font-weight: 500;
            display: flex;
            align-items: center;
          }

          .overview-value {
            font-weight: 600;
            font-size: 0.95rem;
            color: $grey-8;
          }
        }
      }

      .note-display {
        background: $blue-1;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid $blue-3;
        border-left: 4px solid $blue;

        .note-label {
          font-size: 0.85rem;
          color: $grey-6;
          margin-bottom: 0.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .note-content {
          font-size: 0.95rem;
          color: $grey-8;
          line-height: 1.4;
        }
      }
    }
  }

  // Exchange Rates Section
  .exchange-rates-section {
    .exchange-rates-card {
      .exchange-rates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .rate-item {
          background: $grey-1;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          border: 1px solid $grey-3;
          transition: all 0.2s ease;

          &:hover {
            background: $green-1;
            border-color: $green-3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .rate-label {
            font-size: 0.9rem;
            color: $grey-6;
            margin-bottom: 0.75rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .rate-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: $primary;
          }
        }
      }
    }
  }

  // Items Details Section
  .items-details-section {
    .items-details-card {
      .items-summary {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        .items-group {
          .group-header {
            margin-bottom: 1rem;
          }

          .items-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;

            .item-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem;
              background: $grey-1;
              border-radius: 8px;
              border: 1px solid $grey-3;
              transition: all 0.2s ease;

              &:hover {
                background: $blue-1;
                border-color: $blue-3;
              }

              .item-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;

                .item-name {
                  font-weight: 600;
                  color: $grey-8;
                  font-size: 0.95rem;
                }

                .item-code {
                  font-size: 0.8rem;
                  color: $grey-6;
                }
              }

              .item-pricing {
                display: flex;
                align-items: center;
                gap: 1rem;
                font-size: 0.9rem;

                .quantity {
                  color: $grey-6;
                  font-weight: 500;
                }

                .unit-price {
                  color: $grey-7;
                }

                .total {
                  font-weight: 700;
                  color: $primary;
                  font-size: 1rem;
                }
              }
            }
          }

          .sets-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            .set-row {
              background: $grey-1;
              border-radius: 8px;
              border: 1px solid $grey-3;
              overflow: hidden;
              transition: all 0.2s ease;

              &:hover {
                background: $purple-1;
                border-color: $purple-3;
              }

              .set-main {
                padding: 1rem;

                .set-info {
                  .set-name {
                    font-weight: 600;
                    color: $grey-8;
                    font-size: 0.95rem;
                    display: block;
                    margin-bottom: 0.5rem;
                  }

                  .set-pricing {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    font-size: 0.85rem;

                    .set-cost {
                      color: $grey-6;
                    }

                    .set-price {
                      font-weight: 600;
                      color: $secondary;
                    }
                  }
                }
              }

              .set-items {
                background: rgba(255, 255, 255, 0.7);
                padding: 0.75rem 1rem;
                border-top: 1px solid $grey-3;

                .set-items-header {
                  font-size: 0.8rem;
                  color: $grey-6;
                  margin-bottom: 0.5rem;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                }

                .set-items-grid {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.5rem;

                  .set-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid $grey-3;
                    font-size: 0.8rem;

                    .set-item-name {
                      color: $grey-7;
                    }

                    .set-item-quantity {
                      color: $grey-6;
                      font-weight: 500;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .items-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

        .item-detail-card {
          background: white;
          border: 1px solid $grey-3;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
            border-color: $blue-3;
          }

          .item-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid $grey-3;

            .item-name {
              font-size: 1.1rem;
              font-weight: 600;
              color: $grey-9;
              flex: 1;
            }
          }

          .item-details {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;

            .item-info {
              .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
                padding: 0.5rem 0;

                &:not(:last-child) {
                  border-bottom: 1px solid $grey-2;
                }

                .info-label {
                  font-size: 0.9rem;
                  color: $grey-6;
                  font-weight: 500;
                }

                .info-value {
                  font-weight: 600;
                  color: $grey-8;
                  font-size: 0.95rem;
                }
              }
            }

            .set-items {
              .set-items-label {
                font-size: 0.9rem;
                color: $grey-6;
                margin-bottom: 0.75rem;
                font-weight: 500;
              }

              .set-items-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                max-height: 120px;
                overflow-y: auto;
                padding: 0.5rem;
                background: $grey-1;
                border-radius: 6px;
                border: 1px solid $grey-3;
              }
            }

            .pricing-info {
              background: $blue-1;
              padding: 1rem;
              border-radius: 8px;
              border: 1px solid $blue-3;

              .pricing-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;

                &:last-child {
                  margin-bottom: 0;
                }

                .pricing-label {
                  font-size: 0.9rem;
                  color: $grey-7;
                  font-weight: 500;
                }

                .pricing-value {
                  font-weight: 600;
                  color: $grey-8;
                  font-size: 0.95rem;
                }

                &.total-row {
                  border-top: 2px solid $blue-4;
                  padding-top: 0.75rem;
                  margin-top: 0.75rem;

                  .pricing-label {
                    font-weight: 700;
                    color: $grey-8;
                    font-size: 1rem;
                  }

                  .total-value {
                    font-weight: 700;
                    color: $primary;
                    font-size: 1.1rem;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Final Totals Section
  .final-totals-section {
    .final-totals-card {
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
      border: 2px solid $positive;

      .final-totals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .final-total-item {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .final-total-label {
            font-size: 0.95rem;
            color: $grey-6;
            font-weight: 500;
            display: flex;
            align-items: center;
          }

          .final-total-value {
            font-size: 1.4rem;
            font-weight: 700;
            color: $grey-9;
          }

          &.iqd-total {
            border-color: $primary;
            .final-total-value {
              color: $primary;
            }
          }

          &.usd-total {
            border-color: $positive;
            .final-total-value {
              color: $positive;
            }
          }

          &.eur-total {
            border-color: $secondary;
            .final-total-value {
              color: $secondary;
            }
          }
        }
      }
    }
  }

  // Confirmation Section
  .confirmation-section {
    .confirmation-card {
      border: 2px solid $positive;
      background: $green-1;
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

    .financial-summary {
      .final-totals-card {
        background: rgba(76, 175, 80, 0.1);
      }
    }

    .final-actions {
      .confirmation-card {
        background: rgba(76, 175, 80, 0.1);
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .summary-step {
    .step-container {
      padding: 0 0.5rem;
    }

    .step-header {
      margin-bottom: 1.5rem;

      .step-title {
        font-size: 1.25rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .step-description {
        font-size: 0.9rem;
      }
    }

    .summary-content {
      gap: 1.5rem;

      .summary-section {
        .section-card {
          border-radius: 8px;
        }
      }
    }

    .overview-section {
      .overview-card {
        .overview-grid {
          .overview-item {
            padding: 0.75rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;

            .overview-label {
              font-size: 0.85rem;
            }

            .overview-value {
              font-size: 0.9rem;
            }
          }
        }
      }
    }

    .exchange-rates-section {
      .exchange-rates-card {
        .exchange-rates-grid {
          .rate-item {
            padding: 1rem;

            .rate-label {
              font-size: 0.85rem;
            }

            .rate-value {
              font-size: 1.1rem;
            }
          }
        }
      }
    }

    .items-details-section {
      .items-details-card {
        .items-summary {
          gap: 1rem;

          .items-group {
            .items-list {
              gap: 0.5rem;

              .item-row {
                padding: 0.75rem;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;

                .item-info {
                  width: 100%;

                  .item-name {
                    font-size: 0.9rem;
                  }

                  .item-code {
                    font-size: 0.75rem;
                  }
                }

                .item-pricing {
                  width: 100%;
                  justify-content: space-between;
                  font-size: 0.85rem;

                  .total {
                    font-size: 0.95rem;
                  }
                }
              }
            }

            .sets-list {
              gap: 0.75rem;

              .set-row {
                .set-main {
                  padding: 0.75rem;

                  .set-info {
                    .set-name {
                      font-size: 0.9rem;
                      margin-bottom: 0.25rem;
                    }

                    .set-pricing {
                      font-size: 0.8rem;
                    }
                  }
                }

                .set-items {
                  padding: 0.5rem 0.75rem;

                  .set-items-header {
                    font-size: 0.75rem;
                  }

                  .set-items-grid {
                    .set-item {
                      font-size: 0.75rem;
                      padding: 0.2rem 0.4rem;
                    }
                  }
                }
              }
            }
          }
        }

        .items-list {
          gap: 1rem;

          .item-detail-card {
            padding: 1rem;

            .item-header {
              margin-bottom: 1rem;
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;

              .item-name {
                font-size: 1rem;
              }
            }

            .item-details {
              gap: 1rem;

              .pricing-info {
                padding: 0.75rem;

                .pricing-row {
                  &.total-row {
                    .pricing-label {
                      font-size: 0.95rem;
                    }

                    .total-value {
                      font-size: 1rem;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .final-totals-section {
      .final-totals-card {
        .final-totals-grid {
          .final-total-item {
            padding: 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;

            .final-total-label {
              font-size: 0.85rem;
            }

            .final-total-value {
              font-size: 1.2rem;
            }
          }
        }
      }
    }
  }
}
</style>
