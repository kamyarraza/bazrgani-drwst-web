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

    <!-- Customer Profile Card -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12">
        <q-card class="dashboard-card customer-profile">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="customer-info">
                <div class="text-h5 text-weight-bold text-white q-mb-sm">
                  {{ customerInfo?.name || 'Customer Name' }}
                </div>
                <div class="text-subtitle1 text-grey-7 q-mb-xs">
                  Phone: {{ customerInfo?.phone || 'N/A' }}
                </div>
                <div class="text-subtitle1 text-grey-7">
                  Member Since: {{ customerInfo?.member_since || 'N/A' }}
                </div>
              </div>
              <div class="customer-avatar">
                <q-avatar size="80px" color="primary">
                  <q-icon name="person" size="3rem" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Total Orders -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="shopping_bag" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-primary">
              {{ formatNumber(stats?.total_orders || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Total Orders</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Spent -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="attach_money" size="3rem" color="secondary" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-secondary">
              {{ formatCurrency(stats?.total_spent || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Total Spent</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pending Orders -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="pending" size="3rem" color="warning" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-warning">
              {{ formatNumber(stats?.pending_orders || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Pending Orders</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loyalty Points -->
      <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <q-card class="dashboard-card stat-card">
          <q-card-section class="text-center">
            <q-icon name="stars" size="3rem" color="accent" class="q-mb-md" />
            <div class="text-h4 text-weight-bold text-accent">
              {{ formatNumber(stats?.loyalty_points || 0) }}
            </div>
            <div class="text-subtitle2 text-grey-7">Loyalty Points</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activities Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Recent Orders -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="receipt_long" size="1.2rem" color="primary" class="q-mr-sm" />
              Recent Orders
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="recentOrders.length === 0" class="text-center q-pa-md text-grey-6">
              No recent orders
            </div>
            <div v-else class="orders-list">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="order-item"
              >
                <div class="order-info">
                  <div class="order-id">Order #{{ order.id }}</div>
                  <div class="order-status" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </div>
                  <div class="order-date">{{ order.created_at }}</div>
                </div>
                <div class="order-details">
                  <div class="order-items">{{ order.items_count }} items</div>
                  <div class="order-amount">{{ formatCurrency(order.total_amount) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Transactions -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="account_balance_wallet" size="1.2rem" color="secondary" class="q-mr-sm" />
              Recent Transactions
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="lastTransactions.length === 0" class="text-center q-pa-md text-grey-6">
              No recent transactions
            </div>
            <div v-else class="transactions-list">
              <div
                v-for="transaction in lastTransactions"
                :key="transaction.id"
                class="transaction-item"
              >
                <div class="transaction-info">
                  <div class="transaction-type">{{ transaction.type }}</div>
                  <div class="transaction-description">{{ transaction.description }}</div>
                  <div class="transaction-date">{{ transaction.created_at }}</div>
                </div>
                <div class="transaction-amount" :class="getAmountClass(transaction.amount)">
                  {{ formatCurrency(Math.abs(transaction.amount)) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Offers and Notifications Row -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Special Offers -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="local_offer" size="1.2rem" color="positive" class="q-mr-sm" />
              Special Offers
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="specialOffers.length === 0" class="text-center q-pa-md text-grey-6">
              No special offers available
            </div>
            <div v-else class="offers-list">
              <div
                v-for="offer in specialOffers"
                :key="offer.id"
                class="offer-item"
              >
                <div class="offer-info">
                  <div class="offer-title">{{ offer.title }}</div>
                  <div class="offer-description">{{ offer.description }}</div>
                  <div class="offer-validity">Valid until: {{ offer.valid_until }}</div>
                </div>
                <div class="offer-discount">
                  <div class="discount-value">{{ offer.discount }}% OFF</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Notifications -->
      <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="notifications" size="1.2rem" color="info" class="q-mr-sm" />
              Notifications
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner-dots size="2rem" color="primary" />
            </div>
            <div v-else-if="notifications.length === 0" class="text-center q-pa-md text-grey-6">
              No notifications
            </div>
            <div v-else class="notifications-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="getNotificationClass(notification.type)"
              >
                <div class="notification-icon">
                  <q-icon :name="getNotificationIcon(notification.type)" size="1.2rem" />
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ notification.created_at }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activity Logs -->
    <div class="row q-col-gutter-lg q-mb-lg" v-if="activityLogsArray.length > 0">
      <div class="col-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="history" size="1.2rem" color="info" class="q-mr-sm" />
              Recent Activities
            </div>
            <div class="activities-list">
              <div
                v-for="activity in activityLogsArray"
                :key="activity.id"
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
import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCustomerDashboardStore } from 'src/stores/customerDashboardStore';

// Initialize i18n
const { t } = useI18n();

// Use the customer dashboard store
const customerStore = useCustomerDashboardStore();

// Destructure store properties
const {
  loading,
  customerInfo,
  stats,
  recentOrders,
  lastTransactions,
  specialOffers,
  notifications,
  activityLogsArray,
  fetchDashboard,
  refreshDashboard,
  startAutoRefresh,
  stopAutoRefresh
} = customerStore;

// Current date/time
const currentDateTime = computed(() => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
});

// Utility functions
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

function getStatusClass(status: string): string {
  const statusClasses: Record<string, string> = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return statusClasses[status] || 'status-default';
}

function getAmountClass(amount: number): string {
  return amount >= 0 ? 'amount-positive' : 'amount-negative';
}

function getNotificationClass(type: string): string {
  const notificationClasses: Record<string, string> = {
    'info': 'notification-info',
    'success': 'notification-success',
    'warning': 'notification-warning',
    'error': 'notification-error'
  };
  return notificationClasses[type] || 'notification-default';
}

function getNotificationIcon(type: string): string {
  const notificationIcons: Record<string, string> = {
    'info': 'info',
    'success': 'check_circle',
    'warning': 'warning',
    'error': 'error'
  };
  return notificationIcons[type] || 'notifications';
}

// Lifecycle
onMounted(async () => {
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

.customer-profile {
  background: linear-gradient(135deg, #667eea 0%, #0c8dc0 100%);
  color: white;

  .customer-info {
    .text-h5 {
      color: white;
    }
    .text-subtitle1 {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .customer-avatar {
    .q-avatar {
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.3);
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

.orders-list, .transactions-list, .offers-list, .notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item, .transaction-item, .offer-item, .notification-item {
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
}

.order-item {
  .order-info {
    flex: 1;

    .order-id {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .order-status {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 0.25rem;

      &.status-pending {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
      }

      &.status-processing {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
      }

      &.status-shipped {
        background: rgba(155, 89, 182, 0.2);
        color: #9b59b6;
      }

      &.status-delivered {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }

      &.status-cancelled {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
    }

    .order-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  .order-details {
    text-align: right;

    .order-items {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .order-amount {
      font-weight: 700;
      color: #2c3e50;
    }
  }
}

.transaction-item {
  .transaction-info {
    flex: 1;

    .transaction-type {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .transaction-description {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .transaction-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  .transaction-amount {
    font-weight: 700;
    font-size: 1.1rem;

    &.amount-positive {
      color: #2ecc71;
    }

    &.amount-negative {
      color: #e74c3c;
    }
  }
}

.offer-item {
  .offer-info {
    flex: 1;

    .offer-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .offer-description {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .offer-validity {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  .offer-discount {
    .discount-value {
      background: #e74c3c;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.9rem;
    }
  }
}

.notification-item {
  .notification-icon {
    margin-right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(52, 152, 219, 0.1);
    color: #3498db;
  }

  .notification-content {
    flex: 1;

    .notification-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  &.notification-success .notification-icon {
    background: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
  }

  &.notification-warning .notification-icon {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  }

  &.notification-error .notification-icon {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #9b59b6;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .activity-info {
    flex: 1;

    .activity-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .activity-details {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;

      .activity-platform {
        margin-right: 0.5rem;
      }
    }

    .activity-date {
      font-size: 0.75rem;
      color: #adb5bd;
    }
  }

  .activity-icon {
    margin-left: 1rem;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .customer-profile {
    .customer-avatar {
      margin-top: 1rem;
      text-align: center;
    }
  }

  .order-item, .transaction-item, .offer-item, .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    .order-details, .transaction-amount, .offer-discount {
      text-align: left;
      width: 100%;
    }
  }
}
</style>
