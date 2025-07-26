<template>
  <q-card class="dashboard-card branches-performance-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="section-header">
          <div class="text-h6">{{ $t('dashboard.branchPerformance') }}</div>
          <div class="text-caption text-grey-6">{{ $t('dashboard.branchPerformanceSubtitle') }}</div>
        </div>
        <q-btn
          flat
          round
          color="secondary"
          icon="analytics"
          size="sm"
          @click="showAnalytics"
        >
          <q-tooltip>{{ $t('dashboard.viewAnalytics') }}</q-tooltip>
        </q-btn>
      </div>

      <div v-if="loading" class="loading-state">
        <q-spinner-dots size="2rem" color="primary" />
        <div class="text-grey-6 q-mt-sm">{{ $t('dashboard.loadingBranches') }}</div>
      </div>

      <div v-else-if="branches.length === 0" class="empty-state">
        <q-icon name="business" size="3rem" color="grey-4" />
        <div class="text-grey-6 q-mt-md">{{ $t('dashboard.noBranches') }}</div>
      </div>

      <div v-else class="branches-list">
        <div
          v-for="(branch, index) in topBranches"
          :key="branch.id"
          class="branch-item"
          :class="{ 'top-performer': index < 3 }"
        >
          <!-- <div class="branch-ranking">
            <q-avatar
              :color="getRankingColor(index)"
              text-color="white"
              size="2.5rem"
              class="ranking-avatar"
            >
              <div class="ranking-content">
                <q-icon v-if="index === 0" name="emoji_events" size="1.2rem" />
                <span v-else class="ranking-number">{{ index + 1 }}</span>
              </div>
            </q-avatar>
          </div> -->

          <div class="branch-info">
            <div class="branch-name">{{ branch.name }}</div>
            <div class="branch-details gt-xs">
              <span class="detail-item">
                <q-icon name="warehouse" size="0.9rem" class="q-mr-xs" />
                {{ branch.warehouses }} warehouses
              </span>
              <span class="detail-separator">•</span>
              <span class="detail-item">
                <q-icon name="people" size="0.9rem" class="q-mr-xs" />
                {{ branch.users }} users
              </span>
            </div>
            <div class="branch-details-mobile lt-sm">
              <div class="detail-mobile">
                <q-icon name="warehouse" size="0.8rem" class="q-mr-xs" />
                {{ branch.warehouses }}
              </div>
              <div class="detail-mobile">
                <q-icon name="people" size="0.8rem" class="q-mr-xs" />
                {{ branch.users }}
              </div>
            </div>
          </div>

          <div class="branch-metrics gt-xs">
            <div class="capacity-metric">
              <div class="metric-label">Capacity</div>
              <div class="metric-value">{{ formatCapacity(branch.capacity) }}</div>
              <q-linear-progress
                :value="branch.capacity / maxCapacity"
                :color="getCapacityColor(branch.capacity / maxCapacity)"
                size="4px"
                class="capacity-bar"
              />
            </div>
          </div>

          <div class="branch-metrics-mobile lt-sm">
            <div class="metric-mobile">
              <q-circular-progress
                :value="(branch.capacity / maxCapacity) * 100"
                :color="getCapacityColor(branch.capacity / maxCapacity)"
                size="40px"
                :thickness="0.2"
                show-value
                class="q-ma-xs"
              >
                <span class="text-caption">{{ Math.round((branch.capacity / maxCapacity) * 100) }}%</span>
              </q-circular-progress>
            </div>
          </div>

          <div class="branch-performance">
            <div class="performance-score" :class="getPerformanceClass(branch.performance)">
              {{ formatPerformance(branch.performance) }}
            </div>
            <div class="performance-trend">
              <q-icon
                :name="getPerformanceTrendIcon(index)"
                :color="getPerformanceTrendColor(index)"
                size="1rem"
              />
            </div>
          </div>
        </div>
      </div>


    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Branch {
  id: number;
  name: string;
  capacity: number;
  warehouses: number;
  users: number;
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
  return props.branches.slice(0, 5); // Show top 5 branches
});

const maxCapacity = computed(() => {
  if (props.branches.length === 0) return 100;
  return Math.max(...props.branches.map(branch => branch.capacity));
});



// Methods
function _getRankingColor(index: number): string {
  const colors = ['amber', 'orange', 'deep-orange', 'red', 'pink'];
  return colors[index] || 'grey';
}

function getCapacityColor(ratio: number): string {
  if (ratio >= 0.8) return 'positive';
  if (ratio >= 0.6) return 'warning';
  return 'negative';
}

function getPerformanceClass(performance: number): string {
  if (performance >= 80) return 'excellent';
  if (performance >= 60) return 'good';
  if (performance >= 40) return 'average';
  return 'poor';
}

function getPerformanceTrendIcon(index: number): string {
  // Mock trend data based on position
  return index < 2 ? 'trending_up' : index === 2 ? 'trending_flat' : 'trending_down';
}

function getPerformanceTrendColor(index: number): string {
  return index < 2 ? 'positive' : index === 2 ? 'warning' : 'negative';
}

function formatCapacity(capacity: number): string {
  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)}k`;
  }
  return capacity.toString();
}

function formatPerformance(performance: number): string {
  return `${Math.round(performance)}`;
}

function showAnalytics() {
  emit('analytics');
}
</script>

<style lang="scss" scoped>
.branches-performance-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  background: white;

  .section-header {
    .text-h6 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 4px;
    }
  }

  .loading-state, .empty-state {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
  }
  .branches-list {
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
      }      .branch-ranking {
        margin-right: 1.2rem;
        flex-shrink: 0;

        .ranking-avatar {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          .ranking-content {
            display: flex;
            align-items: center;
            justify-content: center;

            .ranking-number {
              font-size: 1.1rem;
              font-weight: 700;
            }
          }
        }
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
    .section-header {
      .text-h6 {
        font-size: 1.1rem;
      }
      .text-caption {
        font-size: 0.75rem;
      }
    }

    .branch-item {
      padding: 0.75rem;

      .branch-ranking {
        .ranking-avatar {
          width: 35px;
          height: 35px;
          font-size: 0.75rem;
        }
      }

      .branch-info {
        flex: 1;

        .branch-name {
          font-size: 0.9rem;
          font-weight: 600;
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

@media (max-width: 599px) {
  .branches-performance-card {
    .branch-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;

      .branch-ranking {
        align-self: flex-start;
      }

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
</style>
