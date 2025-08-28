<!-- Admin Dashboard -->
<template>
  <q-page class="dashboard-page">
    <!-- Using the new reusable Header component -->
    <Header :title="$t('dashboard.title')" :subtitle="$t('dashboard.subtitle')" icon="dashboard" icon-size="3rem"
      icon-color="indigo" :show-waves="true" />

    <!-- USD ↔️ IQD Exchange Rate Display -->
    <div class="exchange-rate-section q-mb-xl">
      <div class="row justify-center">
        <div class="col-12 col-md-8 col-lg-6">
          <q-card flat bordered class="exchange-rate-card cute-card shadow-4 rounded-borders-xl">
            <q-card-section class="exchange-rate-content text-center">

              <!-- Cute Header -->
              <div class="cute-header q-mb-md">
                <div class="header-emoji text-h4">💱</div>
                <h5 class="rate-title q-mt-xs q-mb-none text-primary text-bold">
                  {{ $t('dashboard.exchangeRate') }}
                </h5>
                <div class="header-decoration flex justify-center q-mt-xs">
                  <div class="mini-sparkle">✨</div>
                  <div class="mini-sparkle q-ml-xs">💫</div>
                </div>
              </div>

              <!-- Currency Display -->
              <div class="currency-display row items-center justify-center q-my-md">

                <!-- From (USD) -->
                <div class="currency-side from-currency column items-center">
                  <div class="currency-circle usd-circle shadow-6">
                    <div class="flag-emoji big-flag">🇺🇸</div>
                    <q-icon name="attach_money" size="1.6rem" color="green-5" class="currency-icon-overlay" />
                    
                    <div class="pulse-ring usd-pulse"></div>
                  </div>
                  <div class="currency-info q-mt-sm text-bold">
                    <div class="currency-code text-primary">USD</div>
                    <div class="currency-amount text-h6">1</div>
                  </div>
                </div>

                <!-- Connector -->
                <div class="exchange-connector column items-center q-mx-lg">
                  <q-icon name="swap_horiz" size="2.2rem" color="primary" class="exchange-icon bounce-animation" />
                  <div class="connector-line q-mt-xs"></div>
                </div>

                <!-- To (IQD) -->
                <div class="currency-side to-currency column items-center">
                  <div class="currency-circle iqd-circle shadow-6">
                    <div class="flag-emoji big-flag">🇮🇶</div>
                    <q-icon name="account_balance" size="1.6rem" color="blue-5" class="currency-icon-overlay" />
                    <div class="pulse-ring iqd-pulse"></div>
                  </div>
                  <div class="currency-info q-mt-sm text-bold">
                    <div class="currency-code text-primary">IQD</div>
                    <div class="currency-amount text-h6">
                      {{ formatNumber(exchangeRate?.usd_iqd_rate) || 'ERROR' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Rate Information -->
              <div class="rate-info-section q-mt-md column items-center">
                <!-- <q-chip :color="dashboardStore.exchangeTrend === 'up' ? 'positive' : 'negative'" text-color="white"
                  :icon="dashboardStore.exchangeTrend === 'up' ? 'trending_up' : 'trending_down'" size="sm"
                  class="trend-chip text-bold">
                  <span class="trend-text">
                    {{ dashboardStore.exchangeTrend === 'up' ? '+' : '-' }}2.5% {{ $t('dashboard.today') }}
                  </span>
                </q-chip> -->

                <div class="last-updated-info row items-center q-mt-sm text-grey-7 text-caption">
                  <q-icon name="access_time" size="1rem" color="grey-6" class="q-mr-xs" />
                  <span>{{ exchangeRate?.created_at || 'Just now' }}</span>
                  <!-- <div class="live-indicator row items-center q-ml-sm">
                    <div class="live-dot"></div>
                    <span class="live-text text-positive text-bold"><q-icon name="fiber_manual_record" size="0.8rem" color="positive" /></span>
                  </div> -->
                </div>
              </div>

              <!-- Floating Decorations -->
              <!-- <div class="floating-decorations">
                <div class="floating-element money-1">💰</div>
                <div class="floating-element money-2">💸</div>
                <div class="floating-element star-1">⭐</div>
                <div class="floating-element star-2">✨</div>
                <div class="floating-element chart-1">📈</div>
              </div> -->

            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>


    <!-- Users Breakdown Card Section -->
    <div class="stats-section q-pb-lg">
      <div class="row justify-center">
        <div class="col-12">
          <q-card class="users-breakdown-card">
            <q-card-section class="q-pb-none">
              <div class="card-header">
                <div class="header-icon-wrapper">
                  <q-icon name="people" size="2rem" color="indigo" />
                  &nbsp;
                </div>
                <h6 class="card-title q-mb-none q-ml-md">{{ $t('dashboard.usersBreakdown') }}</h6>
                <q-space />
                <q-badge color="primary" outline rounded>
                  {{ t('dashboard.tagline') }}
                </q-badge>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="users-grid">
                <div v-for="(user, index) in dashboardStore.usersBreakdown" :key="user.type" class="user-type-item"
                  :class="`user-item-${index + 1}`">
                  <div class="user-icon-wrapper" :class="`icon-bg-${index + 1}`">
                    <q-icon :name="user.icon" size="2rem" color="red" />
                    <div class="pulse-ring"></div>
                  </div>
                  <div class="user-info">
                    <div class="user-count-wrapper">
                      <div class="user-count">{{ user.count }}</div>
                      <q-icon name="trending_up" size="1rem" color="positive" class="trend-icon" />
                    </div>
                    <div class="user-type">{{ $t(`dashboard.userTypes.${user.type}`) }}</div>
                  </div>
                  <div class="sparkle sparkle-1">✨</div>
                  <div class="sparkle sparkle-2">⭐</div>
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
      <!-- <div class="col-lg-7 col-md-12 gt-sm">
        <ExchangeRateChart :data="dashboardStore.exchangeRatesArray" :loading="dashboardStore.loading"
          @refresh="refreshDashboard" class="equal-height-card" />
      </div> -->

      <!-- Right column - Branch Performance (Full width on mobile) -->
      <div class="col-lg-5 col-md-12 col-sm-12 col-xs-12">
        <BranchesPerformance :branches="dashboardStore.branchesArray" :loading="dashboardStore.loading"
          @analytics="viewBranchAnalytics" class="equal-height-card" />
      </div>
    </div>

    <!-- Prices Overview - Full Width -->
    <div class="row q-mb-lg">
      <div class="col-12">
        <PricesOverview :prices="dashboardStore.prices" :loading="dashboardStore.loading" @refresh="refreshDashboard" />
      </div>
    </div>

    <!-- Activity Logs - Full Width -->
    <div class="row">
      <div class="col-12">
        <ActivityLogs :activities="dashboardStore.activityLogsArray" :loading="dashboardStore.loading" :max-items="8"
          @refresh="refreshDashboard" @view-all="viewAllActivities" />
      </div>
    </div>

    <!-- Loading overlay -->
    <q-inner-loading :showing="dashboardStore.loading" color="primary" size="lg" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Header from 'src/components/common/Header.vue';
import BranchesPerformance from 'src/components/dashboard/BranchesPerformance.vue';
import PricesOverview from 'src/components/dashboard/PricesOverview.vue';
import ActivityLogs from 'src/components/dashboard/ActivityLogs.vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import { showNotify } from 'src/composables/Notify';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { formatNumber } from 'src/composables/useFormat';

// Initialize i18n
const { t } = useI18n();

// Initialize dashboard store
const dashboardStore = useDashboardStore();

const exchangeRateStore = useExchangeRateStore();

const exchangeRate = computed(() => exchangeRateStore.activeRate);

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

.exchange-rate-content {
  box-shadow: -3px 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #e3e3ff 0%, #e3ffe3 100%);

  &:hover {
    transform: translate(-2px, 2px);
    box-shadow: -4px 4px 15px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #e3ffe3 0%, #e3e3ff 100%);
  }
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
  background: linear-gradient(135deg, #f5f5f5 0%, #e1e1e1 100%);
  border-radius: 12px;
  border: 1px solid #e3f2fd;
  transition: all 0.3s ease;
  box-shadow: -1px 1px 6px rgba(0, 0, 0, 0.25);

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
