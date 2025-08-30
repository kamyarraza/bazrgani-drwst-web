<template>
  <q-card class="prices-card">
    <q-card-section class="card-header">
      <div class="header-content">
        <div class="header-title">
          <q-icon name="account_balance_wallet" size="1.5rem" color="white" />
          <h6 class="title">{{ $t('dashboard.pricesOverview.title') }}</h6>
        </div>
        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="white"
          @click="$emit('refresh')"
          :loading="loading"
          class="refresh-btn"
        >
          <q-tooltip>{{ $t('dashboard.pricesOverview.refresh') }}</q-tooltip>
        </q-btn>
      </div>
      <p class="subtitle">{{ $t('dashboard.pricesOverview.subtitle') }}</p>
    </q-card-section>

    <q-card-section class="prices-content">
      <div v-if="loading" class="loading-container">
        <q-skeleton height="100px" />
        <q-skeleton height="100px" />
      </div>

      <div v-else-if="prices" class="prices-grid">
        <!-- Business Performance Section -->
        <div class="price-section business-performance">
          <div class="section-header">
            <q-icon name="trending_up" size="1.2rem" color="primary" />
            <h6>{{ $t('dashboard.pricesOverview.businessPerformance.title') }}</h6>
          </div>
          <div class="price-items">
            <div class="price-item purchased">
              <div class="price-info">
                <div class="price-label">
                  <q-icon name="shopping_cart" size="1rem" />
                  {{ $t('dashboard.pricesOverview.businessPerformance.totalPurchased') }}
                </div>
                <div class="price-value purchased-value">
                  {{ formatCurrency(prices.totals.purchased) }}
                </div>
              </div>
              <div class="price-indicator purchased-indicator">
                <q-icon name="arrow_downward" size="0.8rem" />
              </div>
            </div>

            <div class="price-item sold">
              <div class="price-info">
                <div class="price-label">
                  <q-icon name="point_of_sale" size="1rem" />
                  {{ $t('dashboard.pricesOverview.businessPerformance.totalSold') }}
                </div>
                <div class="price-value sold-value">
                  {{ formatCurrency(prices.totals.sold) }}
                </div>
              </div>
              <div class="price-indicator sold-indicator">
                <q-icon name="arrow_upward" size="0.8rem" />
              </div>
            </div>


          </div>
        </div>

        <!-- Debt Management Section -->
        <div class="price-section debt-management">
          <div class="section-header">
            <q-icon name="account_balance" size="1.2rem" color="orange" />
            <h6>{{ $t('dashboard.pricesOverview.debtManagement.title') }}</h6>
          </div>
          <div class="price-items">
            <div class="price-item debt-owed">
              <div class="price-info">
                <div class="price-label">
                  <q-icon name="payment" size="1rem" />
                  {{ $t('dashboard.pricesOverview.debtManagement.weOweSuppliers') }}
                </div>
                <div class="price-value debt-value">
                  {{ formatCurrency(prices.borrows.supplier) }}
                </div>
              </div>
              <div class="debt-status" :class="prices.borrows.supplier > 0 ? 'has-debt' : 'no-debt'">
                <q-icon :name="prices.borrows.supplier > 0 ? 'warning' : 'check_circle'" size="0.8rem" />
              </div>
            </div>

            <div class="price-item debt-owed-to-us">
              <div class="price-info">
                <div class="price-label">
                  <q-icon name="request_quote" size="1rem" />
                  {{ $t('dashboard.pricesOverview.debtManagement.customersOweUs') }}
                </div>
                <div class="price-value receivable-value">
                  {{ formatCurrency(prices.borrows.customer) }}
                </div>
              </div>
              <div class="debt-status" :class="prices.borrows.customer > 0 ? 'has-receivable' : 'no-receivable'">
                <q-icon :name="prices.borrows.customer > 0 ? 'schedule' : 'check_circle'" size="0.8rem" />
              </div>
            </div>


          </div>
        </div>
      </div>

      <div v-else class="no-data">
        <q-icon name="info" size="2rem" color="grey-5" />
        <p>{{ $t('common.noDataAvailable') }}</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PriceSummary } from 'src/types/dashboard';

// Props
interface Props {
  prices: PriceSummary | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// Emits
defineEmits<{
  refresh: [];
}>();

// Computed values
const netProfit = computed(() => {
  if (!props.prices) return 0;
  return props.prices.totals.sold - props.prices.totals.purchased;
});

const netDebtPosition = computed(() => {
  if (!props.prices) return 0;
  return props.prices.borrows.customer - props.prices.borrows.supplier;
});

// Profit styling
const _profitClass = computed(() => {
  const profit = netProfit.value;
  if (profit > 0) return 'profit-positive';
  if (profit < 0) return 'profit-negative';
  return 'profit-neutral';
});

const _profitValueClass = computed(() => {
  const profit = netProfit.value;
  if (profit > 0) return 'positive-value';
  if (profit < 0) return 'negative-value';
  return 'neutral-value';
});

const _profitIndicatorClass = computed(() => {
  const profit = netProfit.value;
  if (profit > 0) return 'positive-indicator';
  if (profit < 0) return 'negative-indicator';
  return 'neutral-indicator';
});

const _profitIcon = computed(() => {
  const profit = netProfit.value;
  if (profit > 0) return 'trending_up';
  if (profit < 0) return 'trending_down';
  return 'trending_flat';
});

const _profitTrendIcon = computed(() => {
  const profit = netProfit.value;
  if (profit > 0) return 'arrow_upward';
  if (profit < 0) return 'arrow_downward';
  return 'remove';
});

// Debt balance styling
const _debtBalanceClass = computed(() => {
  const balance = netDebtPosition.value;
  if (balance > 0) return 'debt-positive';
  if (balance < 0) return 'debt-negative';
  return 'debt-neutral';
});

const _debtBalanceValueClass = computed(() => {
  const balance = netDebtPosition.value;
  if (balance > 0) return 'positive-value';
  if (balance < 0) return 'negative-value';
  return 'neutral-value';
});

const _debtBalanceIndicatorClass = computed(() => {
  const balance = netDebtPosition.value;
  if (balance > 0) return 'positive-indicator';
  if (balance < 0) return 'negative-indicator';
  return 'neutral-indicator';
});

const _debtBalanceIcon = computed(() => {
  const balance = netDebtPosition.value;
  if (balance > 0) return 'account_balance_wallet';
  if (balance < 0) return 'credit_card';
  return 'account_balance';
});

const _debtBalanceTrendIcon = computed(() => {
  const balance = netDebtPosition.value;
  if (balance > 0) return 'arrow_upward';
  if (balance < 0) return 'arrow_downward';
  return 'remove';
});

// Helper function
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toLocaleString()}`;
}
</script>

<style lang="scss" scoped>
.prices-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  background: white;
  border: none;
  height: 100%;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, var(--q-color-primary, #2A7B9B) 0%, #1565c0 100%);
  color: white;
  padding: 1.5rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
  }

  .refresh-btn {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
}

.prices-content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prices-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .prices-card {
    max-height: none;
    
    .prices-content {
      max-height: none;
    }
  }
}

.price-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;

    h6 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }
  }

  .price-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .price-info {
    flex: 1;
  }

  .price-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  .price-value {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .price-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    margin-left: 1rem;
  }

  .debt-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    margin-left: 1rem;
  }

  // Business Performance Styling
  &.purchased {
    border-left-color: #ff6b6b;
    .purchased-value { color: #ff6b6b; }
    .purchased-indicator {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }
  }

  &.sold {
    border-left-color: #51cf66;
    .sold-value { color: #51cf66; }
    .sold-indicator {
      background: rgba(81, 207, 102, 0.1);
      color: #51cf66;
    }
  }

  // Profit Styling
  &.profit-positive {
    border-left-color: #51cf66;
    background: rgba(81, 207, 102, 0.05);
  }

  &.profit-negative {
    border-left-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.05);
  }

  &.profit-neutral {
    border-left-color: #868e96;
    background: rgba(134, 142, 150, 0.05);
  }

  // Debt Styling
  &.debt-owed {
    border-left-color: #ffa726;
    .debt-value { color: #ffa726; }
    .has-debt {
      background: rgba(255, 167, 38, 0.1);
      color: #ffa726;
    }
    .no-debt {
      background: rgba(81, 207, 102, 0.1);
      color: #51cf66;
    }
  }

  &.debt-owed-to-us {
    border-left-color: #42a5f5;
    .receivable-value { color: #42a5f5; }
    .has-receivable {
      background: rgba(66, 165, 245, 0.1);
      color: #42a5f5;
    }
    .no-receivable {
      background: rgba(81, 207, 102, 0.1);
      color: #51cf66;
    }
  }

  // Debt Balance Styling
  &.debt-positive {
    border-left-color: #51cf66;
    background: rgba(81, 207, 102, 0.05);
  }

  &.debt-negative {
    border-left-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.05);
  }

  &.debt-neutral {
    border-left-color: #868e96;
    background: rgba(134, 142, 150, 0.05);
  }
}

// Value styling
.positive-value { color: #51cf66; }
.negative-value { color: #ff6b6b; }
.neutral-value { color: #868e96; }

// Indicator styling
.positive-indicator {
  background: rgba(81, 207, 102, 0.1);
  color: #51cf66;
}
.negative-indicator {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}
.neutral-indicator {
  background: rgba(134, 142, 150, 0.1);
  color: #868e96;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;

  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
  }
}

// Responsive adjustments
@media (max-width: 599px) {
  .prices-content {
    padding: 1rem;
  }

  .price-item {
    padding: 0.75rem;

    .price-value {
      font-size: 1.1rem;
    }

    .price-indicator,
    .debt-status {
      width: 1.5rem;
      height: 1.5rem;
      margin-left: 0.5rem;
    }
  }
}
</style>
