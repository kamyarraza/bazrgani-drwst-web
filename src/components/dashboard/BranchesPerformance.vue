<template>
  <q-card class="dashboard-card branches-performance-card shadow-2 rounded-borders q-pa-md">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="section-header">
          <div class="text-h6 text-primary text-weight-bold">
            {{ $t('dashboard.branchPerformance') }}
          </div>
          <div class="text-caption text-grey-6">
            {{ $t('dashboard.branchPerformanceSubtitle') }}
          </div>
        </div>

        <q-btn flat round color="primary" icon="analytics" size="sm" @click="showAnalytics">
          <q-tooltip>{{ $t('dashboard.viewAnalytics') }}</q-tooltip>
        </q-btn>

        <!-- view all : goto page -->
        <q-btn flat round color="primary" icon="visibility" size="sm" @click="showAllBranches">
          <q-tooltip>{{ $t('dashboard.viewAllBranches') }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex flex-center column q-pa-lg">
        <q-spinner-dots size="2rem" color="primary" />
        <div class="text-grey-6 q-mt-sm">{{ $t('dashboard.loadingBranches') }}</div>
      </div>

      <!-- Empty state -->
      <div v-else-if="branches.length === 0" class="flex flex-center column q-pa-lg">
        <q-icon name="business" size="3rem" color="grey-5" />
        <div class="text-grey-6 q-mt-md">{{ $t('dashboard.noBranches') }}</div>
      </div>

      <!-- Branches list -->
      <div v-else class="column q-gutter-md">
        <q-card v-for="(branch) in topBranches" :key="branch.id" class="branch-item q-pa-md rounded-borders" flat>
          <div class="row items-center justify-between q-gutter-sm">
            <!-- Branch info -->
            <div class="col">
              <div class="text-subtitle1 text-weight-bold text-dark">{{ branch.name }}</div>
              <div class="text-caption text-grey-6">{{ branch.code }}</div>

              <div class="row items-center q-gutter-md q-mt-xs text-caption text-grey-7 gt-xs">
                <div class="row items-center">
                  <q-icon name="warehouse" size="0.9rem" class="q-mr-xs text-primary" />
                  {{ branch.warehouses }}
                </div>
                <div class="row items-center">
                  <q-icon name="people" size="0.9rem" class="q-mr-xs text-positive" />
                  {{ branch.users }}
                </div>
                <div class="row items-center">
                  <q-icon name="inventory" size="0.9rem" class="q-mr-xs text-accent" />
                  {{ formatNumber(branch.items_count) }}
                </div>
              </div>
            </div>

            <!-- Branch metrics -->
            <div class="branch-metrics-container" style="width: 200px;">
              <!-- All metrics in a single line -->
              <div class="metrics-row">
                <!-- Capacity -->
                <div class="metric-inline capacity-inline">
                  <q-icon name="storage" size="14px" color="primary" class="q-mr-xs" />
                  <span class="metric-label-inline">{{ $t('branch.capacity') }}</span>
                  <q-linear-progress :value="branch.capacity / totalCapacity"
                    :color="getCapacityColor(branch.capacity / totalCapacity)" size="4px" rounded
                    class="capacity-bar-inline q-mx-xs" />
                  <span class="metric-value-inline">{{ formatCapacity(branch.capacity) }}</span>
                </div>

                <!-- Cashbox -->
                <div class="metric-inline cashbox-inline">
                  <q-icon name="account_balance_wallet" size="15px" color="blue" class="q-mr-xs" />
                  <q-chip size="xs" color="orange" text-color="white" dense class="q-mr-xs metric-chip">
                    {{ formatCurrency(branch.cashbox.iqd_balance, ' IQD') }}
                  </q-chip>
                  <q-chip size="xs" color="teal" text-color="white" dense class="metric-chip">
                    {{ formatCurrency(branch.cashbox.usd_balance, ' USD') }}
                  </q-chip>
                </div>

                <!-- Performance -->
                <div class="metric-inline performance-inline">
                  <q-icon name="analytics" size="15px" color="info" class="q-mr-xs" />
                  <q-chip size="xs" :color="getPerformanceTrendColor(branch.performance)" text-color="white" dense
                    :icon="getPerformanceTrendIcon(branch.performance)" class="performance-chip metric-chip">
                    {{ formatPerformance(branch.performance) }}
                  </q-chip>
                </div>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { formatCurrency, formatNumber } from 'src/composables/useFormat';
import { computed } from 'vue';

interface Branch {
  id: number;
  name: string;
  code: string;
  users: number;
  warehouses: number;
  capacity: number;
  items_count: number;
  items_quantity: number;
  items_cost: number;
  cashbox: {
    iqd_balance: number;
    usd_balance: string | number;
  };
  performance: number;
}

interface Props {
  branches: Branch[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  analytics: [];
  gotoBranches: [];
}>();

// Computed properties
const topBranches = computed(() => {
  return props.branches.slice(0, 4); // Show only top 3 branches to limit height
});

const totalCapacity = computed(() => {
  if (props.branches.length === 0) return 100;
  return props.branches.reduce((sum, branch) => sum + branch.capacity, 0);
});



// Methods
function getCapacityColor(ratio: number): string {
  if (ratio >= 0.8) return 'positive';
  if (ratio >= 0.6) return 'warning';
  return 'negative';
}

function getPerformanceTrendIcon(performance: number): string {
  if (performance >= 80) return 'trending_up';
  if (performance >= 60) return 'trending_flat';
  return 'trending_down';
}

function getPerformanceTrendColor(performance: number): string {
  if (performance >= 80) return 'positive';
  if (performance >= 60) return 'warning';
  return 'negative';
}

function formatCapacity(capacity: number): string {
  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)}k`;
  }
  return capacity.toString();
}

function formatPerformance(performance: number): string {
  return `${performance.toFixed(2)}%`;
}

function showAnalytics() {
  emit('analytics');
}

function showAllBranches() {
  emit('gotoBranches');
}
</script>

<style lang="scss" scoped>
.branches-performance-card {
  border-radius: 16px;
  overflow: scroll;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  background: white;
  height: 100%;
  max-height: 750px;
  display: flex;
  flex-direction: column;

  .section-header {
    .text-h6 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .text-caption {
      color: #6c757d;
      font-size: 0.85rem;
    }
  }

  .branches-list {
    flex: 1;
    overflow-y: auto;
    max-height: 350px;

    .branch-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #f1f3f4;
      transition: all 0.3s ease;
      position: relative;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: rgba(52, 152, 219, 0.02);
        transform: translateX(2px);
        border-radius: 8px;
      }
    }
  }
}

.branch-item {
  // background: linear-gradient(175deg, #ff9a9e, #fad0c4);
  background: linear-gradient(175deg, #fbc2eb, #a6c1ee);
  border: 1px solid #d1d9e6;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(105deg, #fbc2eb, #a6c1ee);
    border: 1px solid #6c757d;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .branches-performance-card {
    max-height: none;

    .section-header {
      .text-h6 {
        font-size: 1.1rem;
      }

      .text-caption {
        font-size: 0.75rem;
      }
    }

    .branches-list {
      max-height: none;

      .branch-item {
        padding: 0.75rem;
      }
    }
  }
}

@media (max-width: 599px) {
  .branches-performance-card {
    .branches-list {
      .branch-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  }
}


.metric-chip {
  padding: 7px;
  padding-top: 9px;
  font-size: 100px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px) scale(1.2);
    z-index: 9999;
  }
}
</style>
