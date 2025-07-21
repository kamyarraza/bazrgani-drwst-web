<template>
  <q-page class="q-pa-md">
    <!-- Purchase Reports Header -->
    <Header
      :title="$t('report.purchaseReports')"
      :subtitle="$t('report.purchaseSubtitle')"
      icon="shopping_cart"
      icon-size="3rem"
      icon-color="white"
      :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
    />

    <!-- Date Range Filter -->
    <div class="q-mb-lg">
      <DateRangeFilter
        v-model="dateFilters"
        @filter-applied="onDateFilterChanged"
      />
    </div>

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="shopping_cart" size="2rem" color="primary" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h4">{{ reportStore.totalPurchases }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalPurchases') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="attach_money" size="2rem" color="positive" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h4">${{ totalValue.toLocaleString() }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalValue') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="trending_up" size="2rem" color="secondary" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h4">${{ averageValue.toLocaleString() }}</div>
              <div class="stat-label text-caption">{{ $t('report.averageValue') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="pending" size="2rem" color="warning" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h4">{{ pendingPurchases }}</div>
              <div class="stat-label text-caption">{{ $t('report.creditPurchases') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Purchase Table -->
    <QtableB
      show-bottom
      :hasExpandableRows="false"
      :columns="purchaseColumns"
      :rows="filteredData"
      :loading="loading"
      :menuItems="menuItems"
      @menu-action="handleAction"
      :pagination="pagination"
      @page-change="handlePageChange"
      :top-right="false"
    >
      <template v-slot:body-cell-payment_type="props">
        <q-td :props="props">
          <q-badge
            :color="getStatusColor(props.row.payment_type)"
            :label="props.row.payment_type"
            rounded
          />
        </q-td>
      </template>
    </QtableB>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useReportStore } from 'src/stores/reportStore';
import Header from 'src/components/common/Header.vue';
import QtableB from 'src/components/common/Qtable.vue';
import DateRangeFilter from 'src/components/common/DateRangeFilter.vue';
import { useI18n } from 'vue-i18n';
import type { MenuItem, Column } from 'src/types';

const reportStore = useReportStore();
const { t } = useI18n();
const loading = ref(false);
const currentPage = ref(1);
const dateFilters = ref<{ fromDate?: string | undefined; toDate?: string | undefined }>({});

// Menu items for row actions
const menuItems: MenuItem[] = [
  { label: t('report.viewDetails'), icon: 'visibility', value: 'view' },
  { label: t('report.viewInvoice'), icon: 'receipt', value: 'invoice' },
  { label: t('report.exportPurchase'), icon: 'download', value: 'export' }
];

const purchaseColumns: Column[] = [
  {
    name: 'code',
    label: t('report.columns.purchaseId'),
    align: 'left',
    field: 'code',
    sortable: true
  },
  {
    name: 'supplier',
    label: t('report.columns.supplier'),
    align: 'left',
    field: 'supplier',
    sortable: true
  },
  {
    name: 'warehouse',
    label: t('report.columns.warehouse'),
    align: 'left',
    field: 'warehouse',
    sortable: true
  },
  {
    name: 'created_at',
    label: t('report.columns.date'),
    align: 'center',
    field: 'created_at',
    sortable: true,
    format: (val: unknown) => new Date(val as string).toLocaleDateString()
  },
  {
    name: 'total_price',
    label: t('report.columns.totalAmount'),
    align: 'right',
    field: 'total_price',
    sortable: true,
    format: (val: unknown) => `$${Number(val).toLocaleString()}`
  },
  {
    name: 'paid_price',
    label: t('report.columns.paidAmount'),
    align: 'right',
    field: 'paid_price',
    sortable: true,
    format: (val: unknown) => `$${Number(val).toLocaleString()}`
  },
  {
    name: 'payment_type',
    label: t('report.columns.payment'),
    align: 'center',
    field: 'payment_type',
    sortable: true
  }
];

// Computed properties
const totalValue = computed(() => {
  return (reportStore.purchases || []).reduce((total, purchase) => total + (purchase.total_price || 0), 0);
});

const averageValue = computed(() => {
  const purchases = reportStore.purchases || [];
  if (purchases.length === 0) return 0;
  return totalValue.value / purchases.length;
});

const pendingPurchases = computed(() => {
  return (reportStore.purchases || []).filter(p => p.payment_type === 'credit').length;
});

const filteredData = computed(() => {
  return [...(reportStore.purchases || [])];
});

const pagination = computed(() => ({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
}));

// Methods
const getStatusColor = (paymentType: string) => {
  switch (paymentType) {
    case 'cash': return 'positive';
    case 'credit': return 'warning';
    default: return 'grey';
  }
};

const handleAction = ({ item, rowId: _rowId }: { item: MenuItem; rowId: number }) => {
  if (item.value === 'view') {
    // Implement view details functionality
  } else if (item.value === 'invoice') {
    // Implement view invoice functionality
  } else if (item.value === 'export') {
    // Implement export functionality
  }
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await refreshData();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const refreshData = async () => {
  loading.value = true;
  try {
    await reportStore.fetchPurchases(dateFilters.value);
  } finally {
    loading.value = false;
  }
};

const onDateFilterChanged = async (filters: { fromDate?: string | undefined; toDate?: string | undefined }) => {
  dateFilters.value = filters;
  currentPage.value = 1; // Reset to first page when filtering
  await refreshData();
};

// Lifecycle hooks
onMounted(async () => {
  await refreshData();
});
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: white;
  border: none;
  height: 120px;

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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(25, 118, 210, 0.1);
  }

  .stat-text {
    flex: 1;
    text-align: right;

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
      animation: countUp 0.5s ease-out forwards;
    }

    .stat-label {
      color: #6c757d;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

@keyframes countUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .stat-card {
    height: 100px;

    .stat-card-content {
      padding: 1rem;
    }

    .stat-text .stat-value {
      font-size: 1.5rem;
    }
  }
}
</style>
