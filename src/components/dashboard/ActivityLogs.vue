<template>
  <q-card class="dashboard-card activity-logs-card">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="section-header">
          <div class="text-h6">{{ $t('dashboard.recentActivities') }}</div>
          <div class="text-caption text-grey-6">{{ $t('dashboard.recentActivitiesSubtitle') }}</div>
        </div>
        <div class="header-actions">
          <q-btn
            flat
            round
            color="secondary"
            icon="refresh"
            size="sm"
            @click="refreshActivities"
            :loading="loading"
          >
            <q-tooltip>{{ $t('dashboard.refreshActivities') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            color="secondary"
            icon="visibility"
            size="sm"
            @click="viewAllActivities"
          >
            <q-tooltip>{{ $t('dashboard.viewAll') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <q-spinner-dots size="2rem" color="primary" />
        <div class="text-grey-6 q-mt-sm">{{ $t('dashboard.loadingActivities') }}</div>
      </div>

      <div v-else-if="activities.length === 0" class="empty-state">
        <q-icon name="event_note" size="3rem" color="grey-4" />
        <div class="text-grey-6 q-mt-md">{{ $t('dashboard.noActivities') }}</div>
      </div>

      <div v-else class="activities-grid">
        <div
          v-for="(activity, index) in displayedActivities"
          :key="activity.id"
          class="activity-card"
          :class="{ 'latest': index === 0 }"
        >
          <div class="activity-header">
            <div class="activity-icon" :class="getActivityIconClass(activity.title)">
              <q-icon :name="getActivityIcon(activity.title)" size="1.2rem" color="white" />
            </div>
            <div class="activity-time">
              <div class="time-ago">{{ formatTimeAgo(activity.humanTime) }}</div>
              <div class="date">{{ formatDate(activity.datetime) }}</div>
            </div>
          </div>

          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-status" :class="getActivityStatusClass(activity.title)">
              {{ getActivityStatus(activity.title) }}
            </div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-user">
              <q-icon name="person" size="0.9rem" class="q-mr-xs" />
              <span>{{ activity.user }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Summary -->
      <div v-if="activities.length > 0" class="activity-summary q-mt-lg">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-icon">
              <q-icon name="timeline" color="primary" size="1.2rem" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ activities.length }}</div>
              <div class="summary-label">Total Activities</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon">
              <q-icon name="today" color="secondary" size="1.2rem" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ todayActivities }}</div>
              <div class="summary-label">Today</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon">
              <q-icon name="people" color="accent" size="1.2rem" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ uniqueUsers }}</div>
              <div class="summary-label">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Activity {
  id: string;
  title: string;
  user: string;
  datetime: string;
  humanTime: string;
  description: string;
}

interface Props {
  activities: Activity[];
  loading?: boolean;
  maxItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  maxItems: 5
});

const emit = defineEmits<{
  refresh: [];
  viewAll: [];
}>();

// Computed properties
const displayedActivities = computed(() => {
  return props.activities.slice(0, props.maxItems);
});

const todayActivities = computed(() => {
  const today = new Date().toDateString();
  return props.activities.filter(activity => {
    const activityDate = new Date(activity.datetime).toDateString();
    return activityDate === today;
  }).length;
});

const uniqueUsers = computed(() => {
  const users = new Set(props.activities.map(activity => activity.user));
  return users.size;
});

// Methods
function getActivityIcon(title: string): string {
  const iconMap: Record<string, string> = {
    'Authentication': 'login',
    'Create': 'add_circle',
    'Update': 'edit',
    'Delete': 'delete',
    'Transfer': 'swap_horiz',
    'Payment': 'payment',
    'Export': 'download',
    'Import': 'upload',
    'Backup': 'backup',
    'System': 'settings'
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }

  return 'event';
}

function getActivityIconClass(title: string): string {
  const colorMap: Record<string, string> = {
    'Authentication': 'bg-primary',
    'Create': 'bg-positive',
    'Update': 'bg-warning',
    'Delete': 'bg-negative',
    'Transfer': 'bg-info',
    'Payment': 'bg-secondary',
    'Export': 'bg-accent',
    'Import': 'bg-accent',
    'Backup': 'bg-dark',
    'System': 'bg-grey'
  };

  for (const [key, className] of Object.entries(colorMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return className;
    }
  }

  return 'bg-primary';
}

function getActivityStatus(title: string): string {
  const statusMap: Record<string, string> = {
    'Authentication': 'Logged In',
    'Create': 'Created',
    'Update': 'Modified',
    'Delete': 'Removed',
    'Transfer': 'Transferred',
    'Payment': 'Processed',
    'Export': 'Downloaded',
    'Import': 'Uploaded',
    'Backup': 'Backed Up',
    'System': 'Configured'
  };

  for (const [key, status] of Object.entries(statusMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return status;
    }
  }

  return 'Completed';
}

function getActivityStatusClass(title: string): string {
  const classMap: Record<string, string> = {
    'Authentication': 'status-info',
    'Create': 'status-success',
    'Update': 'status-warning',
    'Delete': 'status-danger',
    'Transfer': 'status-info',
    'Payment': 'status-success',
    'Export': 'status-info',
    'Import': 'status-info',
    'Backup': 'status-success',
    'System': 'status-warning'
  };

  for (const [key, className] of Object.entries(classMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return className;
    }
  }

  return 'status-success';
}

function formatTimeAgo(humanTime: string): string {
  return humanTime;
}

function formatDate(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function refreshActivities() {
  emit('refresh');
}

function viewAllActivities() {
  emit('viewAll');
}
</script>

<style lang="scss" scoped>
.activity-logs-card {
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

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .loading-state, .empty-state {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
  }

  .activities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 0.5rem 0;

    .activity-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      &:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        transform: translateY(-3px);
        border-color: #3498db;
      }

      &.latest {
        background: linear-gradient(135deg, rgba(52, 152, 219, 0.05) 0%, rgba(255, 255, 255, 1) 100%);
        border-left: 4px solid #3498db;
        box-shadow: 0 4px 20px rgba(52, 152, 219, 0.15);
      }

      .activity-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;

          &.bg-primary { background-color: #3498db; }
          &.bg-positive { background-color: #27ae60; }
          &.bg-warning { background-color: #f39c12; }
          &.bg-negative { background-color: #e74c3c; }
          &.bg-info { background-color: #17a2b8; }
          &.bg-secondary { background-color: #6c757d; }
          &.bg-accent { background-color: #9b59b6; }
          &.bg-dark { background-color: #343a40; }
          &.bg-grey { background-color: #95a5a6; }
        }

        .activity-time {
          flex: 1;

          .time-ago {
            font-size: 0.85rem;
            font-weight: 600;
            color: #3498db;
            line-height: 1.2;
          }

          .date {
            font-size: 0.75rem;
            color: #6c757d;
            margin-top: 2px;
          }
        }
      }

      .activity-content {
        flex: 1;

        .activity-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .activity-status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;

          &.status-success {
            background-color: rgba(39, 174, 96, 0.1);
            color: #27ae60;
          }

          &.status-warning {
            background-color: rgba(243, 156, 18, 0.1);
            color: #f39c12;
          }

          &.status-error {
            background-color: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
          }

          &.status-info {
            background-color: rgba(52, 152, 219, 0.1);
            color: #3498db;
          }

          &.status-pending {
            background-color: rgba(149, 165, 166, 0.1);
            color: #95a5a6;
          }
        }

        .activity-description {
          font-size: 0.85rem;
          color: #6c757d;
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }

        .activity-user {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: #95a5a6;
          font-weight: 500;

          .q-icon {
            opacity: 0.7;
          }
        }
      }
    }
  }

  .activity-summary {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 1rem;

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;

      .summary-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(52, 152, 219, 0.1);
          border-radius: 6px;
        }

        .summary-content {
          flex: 1;
          min-width: 0;

          .summary-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
            line-height: 1;
          }

          .summary-label {
            font-size: 0.65rem;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 500;
            margin-top: 2px;
          }
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .activity-logs-card {
    .activities-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;

      .activity-card {
        padding: 1rem;

        .activity-header {
          gap: 0.5rem;

          .activity-icon {
            width: 36px;
            height: 36px;
          }
        }

        .activity-content {
          .activity-title {
            font-size: 0.9rem;
          }

          .activity-description {
            font-size: 0.8rem;
          }

          .activity-user {
            font-size: 0.75rem;
          }
        }
      }
    }

    .activity-summary {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;

        .summary-item {
          padding: 0.4rem;

          .summary-icon {
            width: 28px;
            height: 28px;
          }

          .summary-content {
            .summary-value {
              font-size: 1rem;
            }

            .summary-label {
              font-size: 0.6rem;
            }
          }
        }
      }
    }
  }
}
</style>
