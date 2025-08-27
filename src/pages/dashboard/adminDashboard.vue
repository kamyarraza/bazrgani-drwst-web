<!-- Admin Dashboard -->
<template>
  <q-page class="dashboard-page">
    <!-- Using the new reusable Header component -->
    <Header
      :title="$t('dashboard.title')"
      :subtitle="$t('dashboard.subtitle')"
      icon="dashboard"
      icon-size="3rem"
      icon-color="indigo"
      :show-waves="true"
    />

    <!-- Users Breakdown Card Section -->
    <div class="stats-section q-pb-lg">
      <div class="row justify-center">
        <div class="col-12">
          <q-card class="users-breakdown-card">
            <q-card-section class="q-pb-none">
              <div class="card-header">
                <q-icon name="people" size="2rem" color="primary" />
                <h6 class="card-title q-mb-none q-ml-sm">{{ $t('dashboard.usersBreakdown') }}</h6>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="users-grid">
                <div
                  v-for="user in dashboardStore.usersBreakdown"
                  :key="user.type"
                  class="user-type-item"
                >
                  <div class="user-icon-wrapper">
                    <q-icon :name="user.icon" size="1.8rem" :color="user.color" />
                  </div>
                  <div class="user-info">
                    <div class="user-count">{{ user.count }}</div>
                    <div class="user-type">{{ $t(`dashboard.userTypes.${user.type}`) }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Left column - Exchange Rate Chart (Hidden on mobile) -->
      <div class="col-lg-7 col-md-12 gt-sm">
        <ExchangeRateChart
          :data="dashboardStore.exchangeRatesArray"
          :loading="dashboardStore.loading"
          @refresh="refreshDashboard"
          class="equal-height-card"
        />
      </div>

      <!-- Right column - Branch Performance (Full width on mobile) -->
      <div class="col-lg-5 col-md-12 col-sm-12 col-xs-12">
        <BranchesPerformance
          :branches="dashboardStore.branchesArray"
          :loading="dashboardStore.loading"
          @analytics="viewBranchAnalytics"
          class="equal-height-card"
        />
      </div>
    </div>

    <!-- Prices Overview - Full Width -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <PricesOverview
          :prices="dashboardStore.prices"
          :loading="dashboardStore.loading"
          @refresh="refreshDashboard"
        />
      </div>
    </div>

    <!-- Activity Logs - Full Width -->
    <div class="row">
      <div class="col-12">
        <ActivityLogs
          :activities="dashboardStore.activityLogsArray"
          :loading="dashboardStore.loading"
          :max-items="8"
          @refresh="refreshDashboard"
          @view-all="viewAllActivities"
        />
      </div>
    </div>

    <!-- Loading overlay -->
    <q-inner-loading :showing="dashboardStore.loading" color="primary" size="lg" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Header from 'src/components/common/Header.vue';
import ExchangeRateChart from 'src/components/dashboard/ExchangeRateChart.vue';
import BranchesPerformance from 'src/components/dashboard/BranchesPerformance.vue';
import PricesOverview from 'src/components/dashboard/PricesOverview.vue';
import ActivityLogs from 'src/components/dashboard/ActivityLogs.vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import { showNotify } from 'src/composables/Notify';

// Initialize i18n
const { t } = useI18n();

// Initialize dashboard store
const dashboardStore = useDashboardStore();

// Methods for component events
async function refreshDashboard() {
  try {
    await dashboardStore.refreshDashboard();
    showNotify({
      type: 'positive',
      message: t('dashboard.refreshSuccess'),
      position: 'top',
      duration: 2000,
    });
  } catch {
    showNotify({
      type: 'negative',
      message: t('dashboard.refreshError'),
      position: 'top',
      duration: 3000,
    });
  }
}

function viewBranchAnalytics() {
  showNotify({
    type: 'info',
    message: 'Branch analytics feature coming soon!',
    position: 'top',
    duration: 2000,
  });
}

function viewAllActivities() {
  showNotify({
    type: 'info',
    message: 'Redirecting to activities page...',
    position: 'top',
    duration: 2000,
  });
  // TODO: Navigate to activities page
  // router.push('/logs-section');
}

// Lifecycle hooks
onMounted(async () => {
  // Fetch dashboard data when component mounts
  await dashboardStore.fetchDashboard();

  // Start auto-refresh every 5 minutes
  dashboardStore.startAutoRefresh(5);
});

onUnmounted(() => {
  // Stop auto-refresh when component unmounts
  dashboardStore.stopAutoRefresh();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 1.5rem;
  background-color: #f7f9fc;
  min-height: 100vh;
}

// Enhanced Stats Cards
.stats-section {
  margin-bottom: 1.5rem;
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: white;
  border: none;
  height: 120px;
  display: flex;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .stat-card-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    position: relative;
    height: 100%;
  }

  .stat-icon-wrapper {
    margin-bottom: 0;
    margin-right: 1.2rem;
    flex-shrink: 0;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 0;
    flex: 1;
    min-width: 0;
  }

  .stat-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #202124;
    line-height: 1.2;
    white-space: nowrap;
  }

  .stat-title {
    font-size: 0.9rem;
    color: #5f6368;
    margin-top: 0.25rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .stat-trend {
    position: static;
    margin-left: 1.2rem;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 16px;
    height: fit-content;
    white-space: nowrap;
  }

  // Custom colors for each stat card
  &.stat-card-1 {
    .stat-icon-wrapper {
      background-color: rgba(42, 123, 155, 0.1);
      .stat-icon-circle {
        background-color: var(--q-primary);
      }
    }
  }

  &.stat-card-2 {
    .stat-icon-wrapper {
      background-color: rgba(87, 199, 133, 0.1);
      .stat-icon-circle {
        background-color: var(--q-secondary);
      }
    }
  }

  &.stat-card-3 {
    .stat-icon-wrapper {
      background-color: rgba(237, 221, 83, 0.1);
      .stat-icon-circle {
        background-color: var(--q-accent);
      }
    }
  }

  &.stat-card-4 {
    .stat-icon-wrapper {
      background-color: rgba(87, 199, 133, 0.1);
      .stat-icon-circle {
        background-color: var(--q-positive);
      }
    }
  }
}

// Equal height cards
.equal-height-card {
  height: 500px;
  display: flex;
  flex-direction: column;

  .q-card__section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

// Users Breakdown Card Styles
.users-breakdown-card {
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #202124;
  margin: 0; // Remove any margin that could misalign
  line-height: 1.2; // Ensure vertical centering
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.user-type-item {
  display: flex;
  align-items: center;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e3f2fd;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #bbdefb;
  }
}

.user-icon-wrapper {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-count {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a73e8;
  line-height: 1.2;
}

.user-type {
  font-size: 0.95rem;
  color: #5f6368;
  font-weight: 500;
  margin-top: 0.2rem;
}

// Dashboard Cards
.dashboard-card {
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
}

// Right column layout
.dashboard-right-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
}

// Responsive Adjustments
@media (max-width: 1023px) {
  .equal-height-card {
    height: auto;
    min-height: 400px;
  }

  .stat-card {
    height: 110px;

    .stat-value {
      font-size: 1.4rem;
    }
  }
}

@media (max-width: 599px) {
  .dashboard-page {
    padding: 1rem;
  }

  .stat-card {
    height: 100px;

    .stat-card-content {
      padding: 1rem;
    }

    .stat-value {
      font-size: 1.3rem;
    }
  }

  .dashboard-right-column {
    gap: 1rem;
  }
}
</style>
