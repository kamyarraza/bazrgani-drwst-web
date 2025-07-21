<template>
  <div class="details-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="description" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('blumTransaction.steps.details') }}</span>
        </div>
        <div class="step-description">
          {{ t('blumTransaction.steps.detailsDesc') }}
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <div class="content-grid">
          <!-- Left Column -->
          <div class="left-column">

            <!-- Exchange Rate Section -->
            <div class="exchange-rate-section">
              <div class="section-title">
                <q-icon name="currency_exchange" class="q-mr-sm" />
                {{ t('blumTransaction.exchangeRates') }}
              </div>

              <q-card flat bordered class="exchange-rate-card">
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        v-model.number="formData.usd_iqd_rate"
                        :label="t('blumTransaction.usdIqdRate')"
                        type="number"
                        min="0"
                        step="0.01"
                        outlined
                        readonly
                        :rules="[val => val > 0 || t('validation.required')]"
                        @update:model-value="updateExchangeRate"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_money" />
                        </template>
                        <template v-slot:append>
                          <q-btn
                            flat
                            round
                            dense
                            icon="refresh"
                            @click="refreshExchangeRate"
                            :loading="refreshingRate"
                          >
                            <q-tooltip>{{ t('blumTransaction.refreshRate') }}</q-tooltip>
                          </q-btn>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model.number="formData.eur_usd_rate"
                        :label="t('blumTransaction.eurUsdRate')"
                        type="number"
                        min="0"
                        step="0.01"
                        outlined
                        readonly
                        :rules="[val => val > 0 || t('validation.required')]"
                        @update:model-value="updateExchangeRate"
                      >
                        <template v-slot:prepend>
                          <q-icon name="euro_symbol" />
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <div class="exchange-info q-mt-md">
                    <div class="text-caption text-grey-6">
                      {{ t('blumTransaction.lastUpdated') }}:
                      {{ exchangeRateStore.activeRate?.created_at ? formatDate(exchangeRateStore.activeRate.created_at) : 'N/A' }}
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
                rows="4"
                outlined
                :placeholder="t('blumTransaction.notePlaceholder')"
                counter
                maxlength="500"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" />
                </template>
              </q-input>
            </div>

          </div>

          <!-- Right Column -->
          <div class="right-column">

            <!-- Total Summary -->
            <div class="total-summary-section">
              <div class="section-title">
                <q-icon name="calculate" class="q-mr-sm" />
                {{ t('blumTransaction.transactionSummary') }}
              </div>

              <q-card flat bordered class="total-summary-card">
                <q-card-section>
                  <div class="totals-grid">
                    <!-- IQD Total -->
                    <div class="total-item iqd-total">
                      <div class="total-label">
                        <q-icon name="currency_exchange" size="sm" class="q-mr-xs" />
                        {{ t('blumTransaction.totalIqd') }}
                      </div>
                      <div class="total-value">
                        {{ formatCurrency(formData.total_price) }}
                      </div>
                    </div>

                    <!-- USD Total -->
                    <div class="total-item usd-total">
                      <div class="total-label">
                        <q-icon name="attach_money" size="sm" class="q-mr-xs" />
                        {{ t('blumTransaction.totalUsd') }}
                      </div>
                      <div class="total-value">
                        ${{ formatDecimal(calculatedUsdTotal) }}
                      </div>
                    </div>

                    <!-- EUR Total -->
                    <div class="total-item eur-total">
                      <div class="total-label">
                        <q-icon name="euro_symbol" size="sm" class="q-mr-xs" />
                        {{ t('blumTransaction.totalEur') }}
                      </div>
                      <div class="total-value">
                        €{{ formatDecimal(calculatedEurTotal) }}
                      </div>
                    </div>

                    <!-- Items Count -->
                    <div class="total-item items-count">
                      <div class="total-label">
                        <q-icon name="inventory_2" size="sm" class="q-mr-xs" />
                        {{ t('blumTransaction.totalItems') }}
                      </div>
                      <div class="total-value">
                        {{ formData.details.length }} {{ formData.details.length === 1 ? 'item' : 'items' }}
                      </div>
                    </div>
                  </div>

                  <!-- Items Breakdown -->
                  <div v-if="formData.details.length > 0" class="items-breakdown q-mt-lg">
                    <div class="text-subtitle2 q-mb-sm">{{ t('blumTransaction.itemsBreakdown') }}</div>
                    <q-list dense class="breakdown-list">
                      <q-item
                        v-for="(detail, index) in formData.details"
                        :key="index"
                        class="breakdown-item"
                      >
                        <q-item-section avatar>
                          <q-avatar size="32px" color="blue-grey-2" text-color="dark">
                            <q-icon :name="detail.type === 'item' ? 'inventory_2' : 'folder'" size="16px" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">
                            {{ detail.type === 'item' ? detail.item?.name : detail.set?.title }}
                          </q-item-label>
                          <q-item-label caption>
                            {{ detail.quantity }} × {{ formatCurrency(detail.unit_price) }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <div class="text-weight-bold text-primary">
                            {{ formatCurrency(detail.quantity * detail.unit_price) }}
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-card-section>
              </q-card>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { useQuasar } from 'quasar';

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
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const exchangeRateStore = useExchangeRateStore();

// Local state
const refreshingRate = ref(false);

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const isStepValid = computed(() => {
  return !!(
    formData.value.usd_iqd_rate > 0 &&
    formData.value.eur_usd_rate > 0
  );
});

const calculatedUsdTotal = computed(() => {
  return formData.value.total_price / (formData.value.usd_iqd_rate || 1500);
});

const calculatedEurTotal = computed(() => {
  return calculatedUsdTotal.value / (formData.value.eur_usd_rate || 1.1);
});

// Methods
const updateExchangeRate = () => {
  // Recalculate totals when exchange rates change
  calculateTotals();
  validateStep();
};

const calculateTotals = () => {
  const usdTotal = formData.value.total_price / (formData.value.usd_iqd_rate || 1500);
  const eurTotal = usdTotal / (formData.value.eur_usd_rate || 1.1);

  formData.value.total_usd = usdTotal;
  formData.value.total_eur = eurTotal;
};

const refreshExchangeRate = async () => {
  refreshingRate.value = true;
  try {
    await exchangeRateStore.fetchActiveExchangeRate();
    if (exchangeRateStore.activeRate) {
      formData.value.usd_iqd_rate = exchangeRateStore.activeRate.usd_iqd_rate;
      formData.value.eur_usd_rate = exchangeRateStore.activeRate.eur_usd_rate;
      calculateTotals();

      $q.notify({
        type: 'positive',
        message: t('blumTransaction.exchangeRateRefreshed'),
        position: 'top-right'
      });
    }
  } catch (error) {
    console.error('Error refreshing exchange rate:', error);
    $q.notify({
      type: 'negative',
      message: t('blumTransaction.exchangeRateRefreshError'),
      position: 'top-right'
    });
  } finally {
    refreshingRate.value = false;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(amount || 0);
};

const formatDecimal = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const validateStep = () => {
  emit('validate', 3, isStepValid.value);
};

// Watchers
watch(isStepValid, (newValue) => {
  emit('validate', 3, newValue);
}, { immediate: true });

watch(() => [formData.value.usd_iqd_rate, formData.value.eur_usd_rate], () => {
  calculateTotals();
}, { deep: true });

// Lifecycle
onMounted(() => {
  calculateTotals();
  validateStep();
});
</script>

<style scoped lang="scss">
@import "src/css/quasar.variables.scss";

.details-step {
  .step-container {
    max-width: 1000px;
    margin: 0 auto;
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

  .form-content {
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .left-column,
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

  .exchange-rate-section {
    .exchange-rate-card {
      background: white;
      border: 1px solid $grey-3;
      border-radius: 8px;

      .exchange-info {
        text-align: center;
        padding-top: 0.5rem;
        border-top: 1px solid $grey-3;
      }
    }
  }

  .summary-section,
  .total-summary-section {
    .total-summary-card {
      background: white;
      border: 1px solid $grey-3;
      border-radius: 12px;

      .totals-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;

        .total-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: $grey-1;
          border-radius: 8px;
          border: 1px solid $grey-3;

          .total-label {
            font-weight: 500;
            font-size: 0.9rem;
            color: $grey-6;
            display: flex;
            align-items: center;
          }

          .total-value {
            font-weight: 700;
            font-size: 1.1rem;
            color: $grey-9;
          }

          &.iqd-total {
            border-left: 4px solid $primary;
            .total-value {
              color: $primary;
            }
          }

          &.usd-total {
            border-left: 4px solid $positive;
            .total-value {
              color: $positive;
            }
          }

          &.eur-total {
            border-left: 4px solid $secondary;
            .total-value {
              color: $secondary;
            }
          }

          &.items-count {
            border-left: 4px solid $orange;
            .total-value {
              color: $orange;
            }
          }
        }
      }

      .items-breakdown {
        .breakdown-list {
          background: white;
          border-radius: 8px;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid $grey-3;

          .breakdown-item {
            padding: 0.75rem;
            border-bottom: 1px solid $grey-2;

            &:last-child {
              border-bottom: none;
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

    .exchange-rate-section {
      .exchange-rate-card {
        background: rgba(33, 150, 243, 0.1);
        border-color: rgba(33, 150, 243, 0.3);
      }
    }

    .summary-section {
      .total-summary-card {
        .totals-grid {
          .total-item {
            background: rgba(255, 255, 255, 0.05);
          }
        }

        .breakdown-section {
          .breakdown-list {
            background: rgba(255, 255, 255, 0.05);
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

    .summary-section {
      .total-summary-card {
        .totals-grid {
          grid-template-columns: 1fr;

          .total-item {
            padding: 0.75rem;

            .total-value {
              font-size: 1rem;
            }
          }
        }
      }
    }
  }
}
</style>
