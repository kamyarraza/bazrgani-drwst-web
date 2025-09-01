<template>
  <q-page class="q-pa-lg">
    <!-- Header with Date/Time -->
    <div class="row items-center justify-between q-mb-lg">
      <!-- spacer -->
      <div></div>

      <!-- Current Date/Time -->
      <q-card flat bordered class="q-pa-md flex flex-center column clock-box" style="max-width: 250px;">
        <q-icon name="schedule" size="2.5rem" color="primary" class="q-mb-sm" />

        <!-- Time -->
        <div class="text-h6 text-weight-bold text-primary">
          {{ time }}
        </div>

        <!-- Date -->
        <div class="text-caption text-grey-7">
          {{ date }}
        </div>
      </q-card>

      <!-- refresh button -->
      <q-btn flat round color="primary" icon="refresh" @click="refreshDashboard" :loading="loading">
        <q-tooltip>{{ t('branch.employeeDashboard.refreshDashboard') }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Branch Overview Card -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12">
        <q-card class="dashboard-card branch-overview">
          <q-card-section>
            <div class="row items-center justify-between">
              <!-- Main details -->
              <div class="branch-info">
                <div class="text-h5 text-weight-bold text-white q-mb-sm">
                  {{ branch?.name || 'Branch Name' }}
                </div>
                <div class="text-subtitle1 text-yellow-7">
                  <q-icon name="tag" size="1.5rem" color="indigo" />
                  {{ branch?.code || 'N/A' }}
                </div>
              </div>
              <!-- Branch Stats -->
              <div class="branch-stats">
                <div class="stat-item">
                  <q-icon name="account_balance_wallet" size="1.5rem" color="orange" />
                  <span class="stat-value">{{ formatCurrency(branch?.items_cost || 0) }}</span>
                  <span class="stat-label">{{ t('branch.employeeDashboard.itemsCost') }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="inventory_2" size="1.5rem" color="orange" />
                  <span class="stat-value">{{ formatNumber(branch?.items_quantity || 0) }}</span>
                  <span class="stat-label">{{ t('branch.employeeDashboard.itemsQuantity') }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="format_list_numbered" size="1.5rem" color="orange" />
                  <span class="stat-value">{{ formatNumber(branch?.items_count || 0) }}</span>
                  <span class="stat-label">{{ t('branch.employeeDashboard.itemsCount') }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="people" size="1.5rem" color="orange" />
                  <span class="stat-value">{{ formatNumber(branch?.users || 0) }}</span>
                  <span class="stat-label">{{ t('branch.employeeDashboard.users') }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="warehouse" size="1.5rem" color="brown" />
                  <span class="stat-value">{{ formatNumber(branch?.warehouses || 0) }}</span>
                  <span class="stat-label">{{ t('branch.employeeDashboard.warehouses') }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="inventory" size="1.5rem" color="accent" />
                  <span class="stat-value">{{ formatNumber(branch?.capacity || 0) }}</span>
                  <span class="stat-label">{{ t('branch.employeeDashboard.capacity') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Cashbox Balance and session -->
    <div class="row q-col-gutter-lg q-mb-lg justify-center">
      <!-- Cashbox Balance -->
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center" @dblclick="showCashbox = !showCashbox">

            <!-- Icon -->
            <q-icon name="account_balance_wallet" size="4rem" color="positive" />

            <br>

            <!-- Status Badge -->
            <q-badge :color="branch?.cashbox.is_opened ? 'teal-5' : 'grey-5'" class="q-mt-sm cute-cashbox-badge"
              :label="cashboxSession" rounded :outline="!branch?.cashbox.is_opened">
              <q-tooltip :delay="300" class="bg-deep-purple text-white">
                <div class="text-center">
                  <div class="text-weight-bold">
                    {{ cashboxSession }}
                  </div>
                  <div class="text-caption q-mt-xs">
                    {{ branch?.cashbox.is_opened ? '' : t('transactionAlpha.cashboxMustBeOpened') }}
                  </div>
                </div>
              </q-tooltip>
            </q-badge>

            <br><br>

            <!-- IQD Balance -->
            <div class="text-h6 text-weight-bold text-positive q-mb-xs"
              :style="{ filter: showCashbox ? 'none' : 'blur(4px)' }" dir="ltr">
              IQD: {{ formatCurrency(branch?.cashbox?.iqd_balance || 0, 'د.ع') }}
            </div>

            <!-- USD Balance -->
            <div class="text-caption text-grey-6 q-mb-xs" :style="{ filter: showCashbox ? 'none' : 'blur(2px)' }"
              dir="ltr">
              USD: {{ formatCurrency(branch?.cashbox?.usd_balance || 0) }}
            </div>

            <!-- Labels -->
            <div class="text-subtitle2 text-grey-7">
              {{ t('branch.employeeDashboard.cashboxBalance') }}
            </div>

            <!-- Tooltip for revealing cashbox -->
            <q-tooltip anchor="top middle">
              {{ showCashbox ?
                t('branch.employeeDashboard.useDoubleClickForHide') : t('branch.employeeDashboard.useDoubleClickForShow')
              }}
            </q-tooltip>

          </q-card-section>
        </q-card>

      </div>

      <!-- Exchange Rate Of IQD vs USD Card -->
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card class="dashboard-card exchange-rates-card">
          <q-card-section class="text-center">

            <!-- Icon -->
            <q-icon name="currency_exchange" size="3rem" color="amber-8" />

            <br><br>

            <!-- Exchange Rates -->
            <div class="exchange-rates-container">
              <!-- USD to IQD -->
              <div class="exchange-rate-item">
                <div class="currency-pair">
                  <q-avatar size="24px" class="currency-flag">
                    <q-icon name="attach_money" color="green-7" />
                  </q-avatar>
                  <q-icon name="arrow_forward" size="1rem" color="grey-6" class="q-mx-xs" />
                  <q-avatar size="24px" class="currency-flag">
                    <q-icon name="account_balance" color="blue-7" />
                  </q-avatar>
                </div>
                <div class="exchange-value text-body1 text-weight-bold text-green-7" dir="ltr">
                  1 USD = {{ formatCurrency(exchangeRates.usd_iqd_rate, "IQD") }}
                </div>
                <div class="exchange-label text-caption text-grey-6">
                  {{ t('branch.employeeDashboard.usdToIqdRate') }}
                </div>
              </div>
            </div>

            <!-- Last Updated -->
            <div class="text-caption text-grey-5 q-mt-md">
              <q-icon name="update" size="0.8rem" class="q-mr-xs" />
              {{ t('branch.employeeDashboard.lastUpdated') }}: {{ exchangeRates.created_at || 'N/A' }}
            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- Exchange Rate Of EUR vs USD Card -->
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card class="dashboard-card exchange-rates-card">
          <q-card-section class="text-center">

            <!-- Icon -->
            <q-icon name="autorenew" size="3rem" color="amber-8" />

            <br><br>

            <!-- Exchange Rates -->
            <div class="exchange-rates-container">
              <!-- EUR to USD -->
              <div class="exchange-rate-item">
                <div class="currency-pair">
                  <q-avatar size="24px" class="currency-flag">
                    <q-icon name="euro" color="blue-8" />
                  </q-avatar>
                  <q-icon name="arrow_forward" size="1rem" color="grey-6" class="q-mx-xs" />
                  <q-avatar size="24px" class="currency-flag">
                    <q-icon name="attach_money" color="green-7" />
                  </q-avatar>
                </div>
                <div class="exchange-value text-body1 text-weight-bold text-blue-7" dir="ltr">
                  1 EUR = {{ formatCurrency(exchangeRates.eur_usd_rate) }}
                </div>
                <div class="exchange-label text-caption text-grey-6">
                  {{ t('branch.employeeDashboard.euroToUsdRate') }}
                </div>
              </div>
            </div>

            <!-- Last Updated -->
            <div class="text-caption text-grey-5 q-mt-md">
              <q-icon name="update" size="0.8rem" class="q-mr-xs" />
              {{ t('branch.employeeDashboard.lastUpdated') }}: {{ exchangeRates.created_at || 'N/A' }}
            </div>

          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activities Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Recent Expenses -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="receipt" size="1.2rem" color="orange" class="q-mr-sm" />
              {{ t('branch.employeeDashboard.recentExpenses') }}
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="expensesArray.length === 0" class="text-center q-pa-md text-grey-6">
              {{ t('branch.employeeDashboard.noExpenses') }}
            </div>
            <div v-else class="row">
              <div v-for="expense in expensesArray" :key="expense.id" class="expense-item col-12">
                <div class="expense-info">
                  <div class="expense-title">{{ expense.title }}</div>
                  <div class="expense-category">{{ expense.category }}</div>
                  <div class="expense-date">{{ expense.paid_at }}</div>
                </div>
                <div class="expense-amount">
                  <div v-if="expense.total_usd > 0" class="amount-usd" style="color: red;">
                    {{ formatCurrency(expense.total_usd) }}
                  </div>
                  <div v-if="expense.total_iqd > 0" class="amount-iqd" style="color: red;">
                    {{ formatCurrency(expense.total_iqd, ' د.ع') }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Purchases -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="shopping_cart" size="1.2rem" color="primary" class="q-mr-sm" />
              {{ t('branch.employeeDashboard.recentPurchases') }}
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="purchasesArray.length === 0" class="text-center q-pa-md text-grey-6">
              {{ t('branch.employeeDashboard.noPurchases') }}
            </div>
            <div v-else class="purchases-list">
              <div v-for="purchase in purchasesArray" :key="purchase.id" class="purchase-item">
                <div class="purchase-info">
                  <div class="purchase-branch">{{ purchase.branch }}</div>
                  <div class="purchase-payment">{{ purchase.payment_type }}</div>
                  <div class="purchase-date">{{ purchase.created_at }}</div>
                </div>
                <div class="purchase-details">
                  <div class="purchase-items">{{ purchase.items }} {{ t('branch.employeeDashboard.item') }}</div>
                  <div class="purchase-amount" style="color: indigo;">${{ formatNumber(purchase.total_usd) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Sells and Activity Logs Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Recent Sells -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="point_of_sale" size="1.2rem" color="positive" class="q-mr-sm" />
              {{ t('branch.employeeDashboard.recentSales') }}
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="sellsArray.length === 0" class="text-center q-pa-md text-grey-6">
              {{ t('branch.employeeDashboard.noSales') }}
            </div>
            <div v-else class="sells-list">
              <div v-for="sell in sellsArray" :key="sell.id" class="sell-item">
                <div class="sell-info">
                  <div class="sell-branch">{{ sell.branch }}</div>
                  <div class="sell-payment">{{ sell.payment_type }}</div>
                  <div class="sell-date">{{ sell.created_at }}</div>
                </div>
                <div class="sell-details">
                  <div class="sell-items">{{ sell.items }} {{ t('branch.employeeDashboard.item') }}</div>
                  <div class="sell-amount" style="color: teal;">${{ formatNumber(sell.total_usd) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity Logs -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="timeline" size="1.2rem" color="purple" class="q-mr-sm" />
              {{ t('branch.employeeDashboard.recentActivities') }}
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="purple" />
            </div>
            <div v-else-if="activityLogsArray.length === 0" class="text-center q-pa-md">
              <q-icon name="mood" size="3rem" color="grey-4" class="q-mb-sm" />
              <div class="text-grey-6">{{ t('branch.employeeDashboard.noActivities') }}</div>
              <div class="text-caption text-grey-5">{{ t('branch.employeeDashboard.comeBackLater') }}</div>
            </div>
            <div v-else class="activities-list">
              <div v-for="activity in activityLogsArray" :key="activity.id" class="activity-item">
                <div class="activity-avatar">
                  <q-avatar size="40px" color="purple-2" text-color="purple-8">
                    <q-icon name="history" size="1.2rem" />
                  </q-avatar>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-details">
                    <q-chip dense size="sm" color="blue-1" text-color="blue-8" icon="computer">
                      {{ activity.platform }}
                    </q-chip>
                    <q-chip dense size="sm" color="orange-1" text-color="orange-8" icon="web">
                      {{ activity.browser }}
                    </q-chip>
                  </div>
                  <div class="activity-date">
                    <q-icon name="schedule" size="0.8rem" class="q-mr-xs" />
                    {{ activity.created_at }}
                  </div>
                </div>
                <div class="activity-status">
                  <q-badge color="indigo" rounded>
                    <q-icon name="receipt_long" size="1rem" />
                  </q-badge>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading overlay -->
    <q-inner-loading :showing="loading" color="primary" size="lg" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEmployeeDashboardStore } from 'src/stores/employeeDashboardStore';
import { formatNumber, formatCurrency } from 'src/composables/useFormat';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';

// Initialize i18n
const { t } = useI18n();

const showCashbox = ref(false);

// Use the employee dashboard store
const employeeStore = useEmployeeDashboardStore();

const exchangeRateStore = useExchangeRateStore();

// Destructure store properties
const {
  loading,
  fetchDashboard,
  refreshDashboard,
  startAutoRefresh,
  stopAutoRefresh
} = employeeStore;

// Computed getters
const branch = computed(() => employeeStore.dashboardData?.branch || null);
const cashboxSession = computed(() => {
  const is_opened = employeeStore.dashboardData?.branch?.cashbox.is_opened || false;

  if (is_opened) {
    return t('transactionAlpha.cashboxOpened') + " 🔓";
  } else {
    return t('transactionAlpha.cashboxClosed') + " 🔒";
  }
});
//...
const lastExpenses = computed(
  () => employeeStore.dashboardData?.last_expenses || {}
);
// Computed arrays for easier iteration
const expensesArray = computed(() => {
  return Object.entries(lastExpenses.value).map(([id, expense]) => ({
    id,
    ...expense,
  }));
});
//...
const lastPurchases = computed(
  () => employeeStore.dashboardData?.last_purchases || {}
);
// Computed arrays for easier iteration
const purchasesArray = computed(() => {
  return Object.entries(lastPurchases.value).map(([id, purchase]) => ({
    id,
    ...purchase,
  }));
});
//...
const lastSells = computed(() => employeeStore.dashboardData?.last_sells || {});
const sellsArray = computed(() => {
  return Object.entries(lastSells.value).map(([id, sell]) => ({
    id,
    ...sell,
  }));
});
//...
const lastActivityLogs = computed(() => employeeStore.dashboardData?.last_activity_logs || {});
const activityLogsArray = computed(() => {
  return Object.entries(lastActivityLogs.value).map(([id, activity]) => ({
    id,
    ...activity,
  }));
});

const exchangeRates: any = computed(() => exchangeRateStore.activeRate || {});

// Current date/time
const time = ref('')
const date = ref('')


function updateClock() {
  const now = new Date()

  // Format time (HH:MM:SS)
  time.value = now.toLocaleTimeString(['ku-IQ'], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Format date (Day, Month Date, Year)
  date.value = now.toLocaleDateString(['ku-IQ'], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

// Lifecycle
onMounted(async () => {
  updateClock()
  setInterval(updateClock, 1000) // update every second

  await fetchDashboard();
  startAutoRefresh(5); // Auto-refresh every 5 minutes

});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style lang="scss" scoped>
.dashboard-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  background: white;
  height: 100%;
}

.branch-overview {
  background: linear-gradient(135deg, #667eea 0%, #1768e2 100%);
  color: white;

  .branch-info {
    .text-h5 {
      color: white;
    }

    .text-subtitle1 {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .branch-stats {
    display: flex;
    gap: 2rem;

    .stat-item {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
      }

      .stat-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
      }
    }
  }
}

.stat-card {
  transition: all 1s ease;

  ::selection {
    background: transparent;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.cute-cashbox-badge {
  font-size: 0.8rem;
  padding: 0.55rem 1.5rem;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: -2px 6px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
  }
}

.expenses-list,
.purchases-list,
.sells-list,
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item,
.purchase-item,
.sell-item,
.activity-item {
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .expense-info,
  .purchase-info,
  .sell-info,
  .activity-info {
    flex: 1;

    .expense-title,
    .purchase-branch,
    .sell-branch,
    .activity-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .expense-category,
    .purchase-payment,
    .sell-payment,
    .activity-details {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .expense-date,
    .purchase-date,
    .sell-date,
    .activity-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  .expense-amount,
  .purchase-details,
  .sell-details {
    text-align: right;

    .amount-usd,
    .amount-iqd,
    .purchase-amount,
    .sell-amount {
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .purchase-items,
    .sell-items {
      font-size: 0.8rem;
      color: #6c757d;
    }
  }

  .activity-icon {
    margin-left: 1rem;
  }
}

.expense-item {
  border-left-color: #ff6b6b;
}

.purchase-item {
  border-left-color: #3498db;
}

.sell-item {
  border-left-color: #2ecc71;
}

.activity-item {
  border-left-color: #9b59b6;
}

// Responsive adjustments
@media (max-width: 768px) {
  .branch-overview {
    .branch-stats {
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
  }

  .expense-item,
  .purchase-item,
  .sell-item,
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    .expense-amount,
    .purchase-details,
    .sell-details {
      text-align: left;
      width: 100%;
    }
  }
}

.clock-box {
  background: linear-gradient(135deg, #f6d36555 0%, #fda08555 100%);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
    transform: translate(0, -2px);
  }
}
</style>
