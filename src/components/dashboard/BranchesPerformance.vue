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
        <q-card v-for="(branch, index) in topBranches" :key="branch.id" class="branch-item q-pa-md rounded-borders"
          :class="{ 'bg-indigo-1': index < 3 }" flat>
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
                  {{ branch.items_count }}
                </div>
              </div>
            </div>

            <!-- Branch metrics -->
            <div class="col-auto text-right gt-xs">
              <!-- Capacity -->
              <div class="capacity-metric q-mb-sm">
                <div class="text-caption text-grey-7">{{ $t('branch.capacity') }}</div>
                <q-linear-progress :value="branch.capacity / totalCapacity"
                  :color="getCapacityColor(branch.capacity / totalCapacity)" size="6px" rounded />
                <div class="text-caption text-grey-8 q-mt-xs">
                  {{ formatCapacity(branch.capacity) }}
                </div>
              </div>

              <!-- Cashbox -->
              <div class="cashbox-section q-mb-sm">
                <div class="text-caption text-grey-7 q-mb-xs">{{ $t('branch.cashbox') }}</div>
                <div class="cashbox-container q-pa-sm rounded-borders bg-gradient-to-r">
                  <div class="currency-item iqd-currency q-mb-xs">
                    <div class="currency-badge">
                      <q-avatar size="18px" color="positive" text-color="white" class="q-mr-xs">
                        <q-icon name="wallet" size="10px" />
                      </q-avatar>
                      <!-- <span class="currency-label">IQD</span> -->
                    </div>
                    <div class="currency-value text-weight-bold text-positive">
                      {{ formatCurrency(branch.cashbox.iqd_balance, ' IQD') }}
                    </div>
                  </div>
                  
                  <div class="currency-item usd-currency">
                    <div class="currency-badge">
                      <q-avatar size="18px" color="warning" text-color="white" class="q-mr-xs">
                        <q-icon name="attach_money" size="10px" />
                      </q-avatar>
                      <!-- <span class="currency-label">USD</span> -->
                    </div>
                    <div class="currency-value text-weight-bold text-warning">
                      {{ formatCurrency(branch.cashbox.usd_balance) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance -->
            <div class="col-auto branch-performance text-center">
              <div class="performance-container q-pa-sm rounded-borders" 
                 :class="`bg-${getPerformanceTrendColor(branch.performance)}-1`">
              <div class="text-caption text-grey-7 q-mb-xs">{{ $t('branch.performance') }}</div>
              <div class="performance-score text-weight-bold" 
                 :class="`text-${getPerformanceTrendColor(branch.performance)}`">
                {{ formatPerformance(branch.performance) }}
              </div>
              <div class="performance-trend q-mt-xs">
                <q-icon :name="getPerformanceTrendIcon(branch.performance)" 
                    :color="getPerformanceTrendColor(branch.performance)" 
                    size="1rem" />
                <q-tooltip>
                {{ (branch.performance) }}
                </q-tooltip>
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
import { formatCurrency } from 'src/composables/useFormat';
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
}>();

// Computed properties
const topBranches = computed(() => {
  return props.branches.slice(0, 3); // Show only top 3 branches to limit height
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

// function getPerformanceClass(performance: number): string {
//   if (performance >= 80) return 'excellent';
//   if (performance >= 60) return 'good';
//   if (performance >= 40) return 'average';
//   return 'poor';
// }

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

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #6c757d;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: #6c757d;
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

      &.top-performer {
        background: linear-gradient(90deg, rgba(52, 152, 219, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
        border-radius: 8px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #3498db;
          border-radius: 0 2px 2px 0;
        }
      }

      &:hover {
        background-color: rgba(52, 152, 219, 0.02);
        transform: translateX(2px);
        border-radius: 8px;
      }

      .branch-info {
        flex: 1;
        min-width: 0;
        margin-right: 1rem;

        .branch-name {
          font-weight: 600;
          font-size: 1rem;
          color: #2c3e50;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .branch-details {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: #6c757d;
          gap: 0.5rem;

          .detail-item {
            display: flex;
            align-items: center;
            white-space: nowrap;
          }

          .detail-separator {
            color: #dee2e6;
          }
        }

        .branch-details-mobile {
          display: none;
        }
      }

      .branch-metrics {
        margin-right: 1rem;
        min-width: 120px;
        flex-shrink: 0;

        .capacity-metric {
          .metric-label {
            font-size: 0.7rem;
            color: #6c757d;
            margin-bottom: 2px;
            text-transform: uppercase;
            font-weight: 500;
          }

          .metric-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .capacity-bar {
            border-radius: 2px;
          }
        }
      }

      .branch-metrics-mobile {
        display: none;
      }

      .branch-performance {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .performance-score {
          font-size: 1.1rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          min-width: 40px;
          text-align: center;

          &.excellent {
            background-color: rgba(39, 174, 96, 0.1);
            color: #27ae60;
          }

          &.good {
            background-color: rgba(52, 152, 219, 0.1);
            color: #3498db;
          }

          &.average {
            background-color: rgba(241, 196, 15, 0.1);
            color: #f1c40f;
          }

          &.poor {
            background-color: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
          }
        }

        .performance-trend {
          display: flex;
          align-items: center;
        }
      }
    }
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

        .branch-info {
          .branch-details {
            display: none;
          }

          .branch-details-mobile {
            display: flex;
            gap: 1rem;
            margin-top: 0.25rem;

            .detail-mobile {
              display: flex;
              align-items: center;
              font-size: 0.75rem;
              color: #6c757d;
            }
          }
        }

        .branch-metrics {
          display: none;
        }

        .branch-metrics-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 0.5rem;
        }

        .branch-performance {
          .performance-score {
            font-size: 0.8rem;
            padding: 2px 4px;
            min-width: 30px;
          }

          .performance-trend {
            margin-left: 0.25rem;

            .q-icon {
              font-size: 0.9rem;
            }
          }
        }
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

        .branch-info {
          width: 100%;

          .branch-details-mobile {
            justify-content: space-between;
            width: 100%;
          }
        }

        .branch-metrics-mobile {
          align-self: flex-end;
          margin: 0;
        }

        .branch-performance {
          align-self: flex-end;
          margin-top: -2rem;
          margin-right: 0.5rem;
        }
      }
    }
  }
}
</style>
