<template>
  <q-page class="q-pa-lg">
    <!-- Header with Date/Time -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-medium text-grey-8">
        {{ currentDateTime }}
      </div>
      <q-btn
        flat
        round
        color="primary"
        icon="refresh"
        @click="refreshDashboard"
        :loading="loading"
      >
        <q-tooltip>Refresh Dashboard</q-tooltip>
      </q-btn>
    </div>

    <!-- Branch Overview Card -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12">
        <q-card class="dashboard-card branch-overview">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="branch-info">
                <div class="text-h5 text-weight-bold text-white q-mb-sm">
                  {{ employeeData?.branch?.name || 'Branch Name' }}
                </div>
                <div class="text-subtitle1 text-grey-7">
                  Code: {{ employeeData?.branch?.code || 'N/A' }}
                </div>
              </div>
              <div class="branch-stats">
                <div class="stat-item">
                  <q-icon name="people" size="1.5rem" color="primary" />
                  <span class="stat-value">{{ employeeData?.branch?.users || 0 }}</span>
                  <span class="stat-label">Users</span>
                </div>
                <div class="stat-item">
                  <q-icon name="warehouse" size="1.5rem" color="secondary" />
                  <span class="stat-value">{{ employeeData?.branch?.warehouses || 0 }}</span>
                  <span class="stat-label">Warehouses</span>
                </div>
                <div class="stat-item">
                  <q-icon name="inventory" size="1.5rem" color="accent" />
                  <span class="stat-value">{{ formatNumber(employeeData?.branch?.capacity || 0) }}</span>
                  <span class="stat-label">Capacity</span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Items Count -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="category" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-primary">
              {{ formatNumber(employeeData?.branch?.items_count || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Total Items</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Items Quantity -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="inventory_2" size="3rem" color="secondary" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-secondary">
              {{ formatNumber(employeeData?.branch?.items_quantity || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Total Quantity</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Items Cost -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="attach_money" size="3rem" color="accent" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-accent">
              {{ formatCurrency(employeeData?.branch?.items_cost || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Total Cost</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Cashbox Balance -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="account_balance_wallet" size="3rem" color="positive" class="q-mb-md" />
            <div class="text-h6 text-weight-bold text-positive q-mb-xs">
              {{ formatCurrency(employeeData?.branch?.cashbox?.iqd_balance || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">IQD Balance</div>
            <div class="text-caption text-grey-6">
              USD: {{ formatCurrency(employeeData?.branch?.cashbox?.usd_balance || 0) }}
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
              Recent Expenses
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="!employeeData?.last_expenses || Object.keys(employeeData?.last_expenses || {}).length === 0" class="text-center q-pa-md text-grey-6">
              No recent expenses
            </div>
            <div v-else class="expenses-list">
              <div
                v-for="(expense, id) in employeeData.last_expenses"
                :key="id"
                class="expense-item"
              >
                <div class="expense-info">
                  <div class="expense-title">{{ expense.title }}</div>
                  <div class="expense-category">{{ expense.category }}</div>
                  <div class="expense-date">{{ expense.paid_at }}</div>
                </div>
                <div class="expense-amount">
                  <div v-if="expense.total_usd > 0" class="amount-usd">
                    ${{ formatNumber(expense.total_usd) }}
                  </div>
                  <div v-if="expense.total_iqd > 0" class="amount-iqd">
                    {{ formatNumber(expense.total_iqd) }} IQD
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
              Recent Purchases
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="!employeeData?.last_purchases || Object.keys(employeeData?.last_purchases || {}).length === 0" class="text-center q-pa-md text-grey-6">
              No recent purchases
            </div>
            <div v-else class="purchases-list">
              <div
                v-for="(purchase, id) in employeeData.last_purchases"
                :key="id"
                class="purchase-item"
              >
                <div class="purchase-info">
                  <div class="purchase-branch">{{ purchase.branch }}</div>
                  <div class="purchase-payment">{{ purchase.payment_type }}</div>
                  <div class="purchase-date">{{ purchase.created_at }}</div>
                </div>
                <div class="purchase-details">
                  <div class="purchase-items">{{ purchase.items }} items</div>
                  <div class="purchase-amount">${{ formatNumber(purchase.total_usd) }}</div>
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
              Recent Sales
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="!employeeData?.last_sells || Object.keys(employeeData?.last_sells || {}).length === 0" class="text-center q-pa-md text-grey-6">
              No recent sales
            </div>
            <div v-else class="sells-list">
              <div
                v-for="(sell, id) in employeeData.last_sells"
                :key="id"
                class="sell-item"
              >
                <div class="sell-info">
                  <div class="sell-branch">{{ sell.branch }}</div>
                  <div class="sell-payment">{{ sell.payment_type }}</div>
                  <div class="sell-date">{{ sell.created_at }}</div>
                </div>
                <div class="sell-details">
                  <div class="sell-items">{{ sell.items }} items</div>
                  <div class="sell-amount">${{ formatNumber(sell.total_usd) }}</div>
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
              <q-icon name="history" size="1.2rem" color="info" class="q-mr-sm" />
              Recent Activities
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="!employeeData?.last_activity_logs || Object.keys(employeeData?.last_activity_logs || {}).length === 0" class="text-center q-pa-md text-grey-6">
              No recent activities
            </div>
            <div v-else class="activities-list">
              <div
                v-for="(activity, id) in employeeData.last_activity_logs"
                :key="id"
                class="activity-item"
              >
                <div class="activity-info">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-details">
                    <span class="activity-platform">{{ activity.platform }}</span>
                    <span class="activity-browser">{{ activity.browser }}</span>
                  </div>
                  <div class="activity-date">{{ activity.created_at }}</div>
                </div>
                <div class="activity-icon">
                  <q-icon name="fiber_manual_record" size="0.5rem" color="primary" />
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
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

// Initialize i18n
const { t } = useI18n();

// Mock data - replace with actual API call
const loading = ref(false);
const employeeData = ref<any>(null);

// Current date/time
const currentDateTime = computed(() => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
});

// Methods
async function refreshDashboard() {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Here you would call your actual API endpoint
    // const response = await api.get('/employee-dashboard');
    // employeeData.value = response.data.data;
  } catch (error) {
    console.error('Failed to refresh dashboard:', error);
  } finally {
    loading.value = false;
  }
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

// Lifecycle
onMounted(async () => {
  // Load mock data for now - replace with actual API call
  loading.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data structure based on your JSON
    employeeData.value = {
      branch: {
        id: 1,
        name: "مەجید بەگ",
        code: "MJ-01",
        users: 3,
        warehouses: 1,
        capacity: 200,
        items_count: 50,
        items_quantity: 230490,
        items_cost: 233191.1,
        cashbox: {
          iqd_balance: 308000,
          usd_balance: "100.00"
        }
      },
      last_expenses: {
        "2": {
          category: "ڕێکخستنی ناو کۆگا",
          title: "ژاڵە",
          total_usd: 0,
          total_iqd: 4000,
          paid_at: "پێش ڕۆژێک"
        },
        "1": {
          category: "بەنزین",
          title: "سلێمانی",
          total_usd: 0,
          total_iqd: 25000,
          paid_at: "پێش ڕۆژێک"
        }
      },
      last_purchases: {
        "1": {
          branch: "مەجید بەگ",
          payment_type: "حەواسە",
          items: 50,
          total_usd: "233354.00",
          created_at: "پێش ڕۆژێک"
        }
      },
      last_sells: {
        "3": {
          branch: "مەجید بەگ",
          payment_type: "حەواسە",
          items: 2,
          total_usd: "172.00",
          created_at: "پێش ڕۆژێک"
        },
        "4": {
          branch: "مەجید بەگ",
          payment_type: "حەواسە",
          items: 1,
          total_usd: "130.00",
          created_at: "پێش ڕۆژێک"
        }
      },
      last_activity_logs: {
        "1645": {
          title: "Expense Created",
          ip_address: "127.0.0.1",
          platform: "Windows",
          browser: "Edge",
          created_at: "پێش دوو کاتژمێر"
        },
        "1644": {
          title: "Expense Created",
          ip_address: "127.0.0.1",
          platform: "Windows",
          browser: "Edge",
          created_at: "پێش دوو کاتژمێر"
        },
        "1643": {
          title: "Authentication",
          ip_address: "127.0.0.1",
          platform: "Windows",
          browser: "Edge",
          created_at: "پێش 4 کاتژمێر"
        }
      }
    };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
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
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.expenses-list, .purchases-list, .sells-list, .activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item, .purchase-item, .sell-item, .activity-item {
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

  .expense-info, .purchase-info, .sell-info, .activity-info {
    flex: 1;

    .expense-title, .purchase-branch, .sell-branch, .activity-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .expense-category, .purchase-payment, .sell-payment, .activity-details {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .expense-date, .purchase-date, .sell-date, .activity-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  .expense-amount, .purchase-details, .sell-details {
    text-align: right;

    .amount-usd, .amount-iqd, .purchase-amount, .sell-amount {
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .purchase-items, .sell-items {
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

  .expense-item, .purchase-item, .sell-item, .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    .expense-amount, .purchase-details, .sell-details {
      text-align: left;
      width: 100%;
    }
  }
}
</style>
