<template>
  <q-card class="dashboard-card exchange-rate-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="chart-header">
          <div class="text-h6">{{ $t('dashboard.exchangeRate') }}</div>
          <div class="text-caption text-grey-6">{{ $t('dashboard.exchangeRateSubtitle') }}</div>
        </div>
        <div class="chart-actions">
          <q-btn
            flat
            round
            color="secondary"
            icon="refresh"
            @click="refreshData"
            :loading="loading"
            size="sm"
          >
            <q-tooltip>{{ $t('dashboard.refreshData') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Modern Exchange Rate Display -->
      <div class="modern-exchange-container">
        <!-- Loading State -->
        <div v-if="loading" class="chart-loading">
          <q-spinner-dots size="3rem" color="primary" />
          <div class="text-grey-6 q-mt-md">{{ $t('dashboard.exchangeRateComponent.loadingExchangeRateData') }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="chartData.length === 0" class="chart-empty">
          <q-icon name="currency_exchange" size="3rem" color="grey-4" />
          <div class="text-grey-6 q-mt-md">{{ $t('dashboard.exchangeRateComponent.noExchangeRateData') }}</div>
        </div>

        <!-- Current Rate Display -->
        <div v-else class="rate-display-container">
          <!-- Main Current Rate -->
          <div class="current-rate-card">
            <div class="rate-header">
              <q-icon name="paid" size="2rem" color="white" />
              <div class="rate-title">
                <div class="rate-label">{{ $t('dashboard.exchangeRateComponent.currentExchangeRate') }}</div>
                <div class="rate-description">{{ $t('dashboard.exchangeRateComponent.usdToIqd') }}</div>
              </div>
            </div>

            <div class="rate-value-container">
              <div class="rate-main">
                <span class="currency-symbol">$</span>
                <span class="rate-number">1</span>
                <span class="equals">=</span>
                <span class="rate-value">{{ formatMainRate(currentRate) }}</span>
                <span class="currency-unit">IQD</span>
              </div>

              <div class="rate-trend" v-if="trendPercentage !== null">
                <q-icon
                  :name="trendIcon"
                  :color="trendColor"
                  size="1rem"
                />
                <span :class="`text-${trendColor}`">
                  {{ Math.abs(trendPercentage).toFixed(1) }}%
                </span>
                <span class="trend-label">{{ trendLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Rate Comparison Cards -->
          <div class="rate-comparison" v-if="chartData.length >= 2">
            <div class="comparison-cards">
              <!-- Previous Rate -->
              <div class="comparison-card previous-rate">
                <div class="comparison-header">
                  <q-icon name="history" size="1.2rem" color="grey-6" />
                  <div class="comparison-title">
                    <div class="comparison-label">{{ $t('dashboard.exchangeRateComponent.previousRate') }}</div>
                    <div class="comparison-date">{{ previousRateData?.label || 'N/A' }}</div>
                  </div>
                </div>
                <div class="comparison-value">
                  {{ formatMainRate(previousRate) }} IQD
                </div>
              </div>

              <!-- Current Rate -->
              <div class="comparison-card current-rate">
                <div class="comparison-header">
                  <q-icon name="schedule" size="1.2rem" color="primary" />
                  <div class="comparison-title">
                    <div class="comparison-label">{{ $t('dashboard.exchangeRateComponent.currentRate') }}</div>
                    <div class="comparison-date">{{ currentRateData?.label || $t('dashboard.exchangeRateComponent.today') }}</div>
                  </div>
                </div>
                <div class="comparison-value primary">
                  {{ formatMainRate(currentRate) }} IQD
                </div>
              </div>
            </div>

            <!-- Rate Change Indicator -->
            <div class="rate-change-indicator" v-if="rateDifference !== 0">
              <div class="change-container" :class="changeClass">
                <q-icon :name="changeIcon" size="1.5rem" />
                <div class="change-info">
                  <div class="change-amount">
                    {{ Math.abs(rateDifference).toFixed(1) }} IQD
                  </div>
                  <div class="change-label">
                    {{ rateDifference > 0 ? $t('dashboard.exchangeRateComponent.increase') : $t('dashboard.exchangeRateComponent.decrease') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EUR Exchange Info -->
          <div class="eur-exchange-info" v-if="eurRate > 0">
            <div class="eur-card">
              <div class="eur-header">
                <q-icon name="euro_symbol" size="1.5rem" color="amber-8" />
                <div class="eur-title">{{ $t('dashboard.exchangeRateComponent.eurToUsd') }}</div>
              </div>
              <div class="eur-rate">
                <span class="eur-value">€1 = ${{ eurRate.toFixed(3) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface ExchangeRateData {
  date: string;
  rate: number;
  label: string;
  value: number;
}

interface Props {
  data: ExchangeRateData[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  refresh: [];
}>();

const { t } = useI18n();

// Computed properties for chart data processing
const chartData = computed(() => {
  return props.data.slice(-2); // Show last 2 data points
});

// Helper function to safely convert value to number
const safeToNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;

  // Handle both old object structure and new number structure
  if (typeof value === 'object' && value.usd_iqd_rate) {
    const numValue = parseFloat(value.usd_iqd_rate.toString());
    return isNaN(numValue) ? 0 : numValue;
  }

  // Handle simple number or string
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(numValue) ? 0 : numValue;
};

// Current and previous rates
const currentRate = computed(() => {
  if (chartData.value.length === 0) return 0;
  const lastItem = chartData.value[chartData.value.length - 1];
  return lastItem ? safeToNumber(lastItem.value) : 0;
});

const previousRate = computed(() => {
  if (chartData.value.length < 2) return 0;
  const previousItem = chartData.value[chartData.value.length - 2];
  return previousItem ? safeToNumber(previousItem.value) : 0;
});

const currentRateData = computed(() => {
  if (chartData.value.length === 0) return null;
  return chartData.value[chartData.value.length - 1];
});

const previousRateData = computed(() => {
  if (chartData.value.length < 2) return null;
  return chartData.value[chartData.value.length - 2];
});

// EUR rate - since current data structure only provides USD/IQD rates,
// we'll return 0 for now (can be enhanced later if EUR data becomes available)
const eurRate = computed(() => {
  // For now, the data only contains USD/IQD rates
  // EUR rate would need to be provided separately in the data structure
  return 0;
});

// Rate difference and trend calculations
const rateDifference = computed(() => {
  return currentRate.value - previousRate.value;
});

const trendPercentage = computed(() => {
  if (previousRate.value === 0 || chartData.value.length < 2) return null;
  return ((currentRate.value - previousRate.value) / previousRate.value) * 100;
});

const trendColor = computed(() => {
  if (trendPercentage.value === null) return 'grey-6';
  return trendPercentage.value > 0 ? 'positive' : trendPercentage.value < 0 ? 'negative' : 'grey-6';
});

const trendIcon = computed(() => {
  if (trendPercentage.value === null) return 'remove';
  return trendPercentage.value > 0 ? 'trending_up' : trendPercentage.value < 0 ? 'trending_down' : 'remove';
});

const trendLabel = computed(() => {
  if (trendPercentage.value === null) return '';
  if (trendPercentage.value > 0) return t('dashboard.exchangeRateComponent.fromYesterday');
  if (trendPercentage.value < 0) return t('dashboard.exchangeRateComponent.fromYesterday');
  return t('dashboard.exchangeRateComponent.noChange');
});

const changeClass = computed(() => {
  if (rateDifference.value > 0) return 'rate-increase';
  if (rateDifference.value < 0) return 'rate-decrease';
  return 'rate-neutral';
});

const changeIcon = computed(() => {
  if (rateDifference.value > 0) return 'north';
  if (rateDifference.value < 0) return 'south';
  return 'remove';
});

// Methods
function formatMainRate(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '0';

  // Convert to number and format with commas
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';

  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
}

function refreshData() {
  emit('refresh');
}

onMounted(() => {
  // Component mounted
});
</script>

<style lang="scss" scoped>
.exchange-rate-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  background: white;

  .chart-header {
    .text-h6 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 4px;
    }
  }
}

.modern-exchange-container {
  .chart-loading, .chart-empty {
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .rate-display-container {
    .current-rate-card {
      background: linear-gradient(135deg, $primary 0%, #3C8FB3 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(42, 123, 155, 0.15);

      .rate-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;

        .rate-title {
          .rate-label {
            font-size: 1.1rem;
            font-weight: 600;
            opacity: 0.9;
          }
          .rate-description {
            font-size: 0.9rem;
            opacity: 0.7;
          }
        }
      }

      .rate-value-container {
        .rate-main {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 12px;

          .currency-symbol {
            font-size: 2rem;
            opacity: 0.8;
          }
          .rate-number {
            font-size: 2.5rem;
          }
          .equals {
            font-size: 2rem;
            opacity: 0.6;
          }
          .rate-value {
            color: #ffd700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .currency-unit {
            font-size: 1.8rem;
            opacity: 0.8;
          }
        }

        .rate-trend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;

          .trend-label {
            opacity: 0.7;
          }
        }
      }
    }

    .rate-comparison {
      margin-bottom: 24px;

      .comparison-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;

        .comparison-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          border: 2px solid #f1f3f4;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          }

          &.current-rate {
            border-color: $primary;
            background: linear-gradient(135deg, #B8D4E0 0%, #A8CED8 100%);
          }

          .comparison-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;

            .comparison-title {
              .comparison-label {
                font-size: 0.9rem;
                font-weight: 600;
                color: #2c3e50;
              }
              .comparison-date {
                font-size: 0.8rem;
                color: #6c757d;
              }
            }
          }

          .comparison-value {
            font-size: 1.4rem;
            font-weight: 700;
            color: #2c3e50;

            &.primary {
              color: $primary;
            }
          }
        }
      }

      .rate-change-indicator {
        display: flex;
        justify-content: center;

        .change-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 16px;
          font-weight: 600;

          &.rate-increase {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            color: #155724;
            border: 2px solid #b8daff;
          }

          &.rate-decrease {
            background: linear-gradient(135deg, #f8d7da 0%, #f1b0b7 100%);
            color: #721c24;
            border: 2px solid #f5c6cb;
          }

          &.rate-neutral {
            background: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
            color: #383d41;
            border: 2px solid #d1ecf1;
          }

          .change-info {
            .change-amount {
              font-size: 1.1rem;
              font-weight: 700;
            }
            .change-label {
              font-size: 0.85rem;
              opacity: 0.8;
            }
          }
        }
      }
    }

    .eur-exchange-info {
      .eur-card {
        background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
        border-radius: 16px;
        padding: 20px;
        color: white;
        text-align: center;

        .eur-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;

          .eur-title {
            font-size: 1rem;
            font-weight: 600;
          }
        }

        .eur-rate {
          .eur-value {
            font-size: 1.3rem;
            font-weight: 700;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .modern-exchange-container {
    .rate-display-container {
      .current-rate-card {
        padding: 20px;

        .rate-value-container {
          .rate-main {
            font-size: 2rem;

            .currency-symbol, .rate-number {
              font-size: 1.8rem;
            }
            .equals {
              font-size: 1.6rem;
            }
            .rate-value {
              font-size: 2rem;
            }
            .currency-unit {
              font-size: 1.4rem;
            }
          }
        }
      }

      .rate-comparison {
        .comparison-cards {
          grid-template-columns: 1fr;
          gap: 12px;

          .comparison-card {
            padding: 16px;

            .comparison-value {
              font-size: 1.2rem;
            }
          }
        }
      }
    }
  }
}
</style>
