<template>
  <q-page class="q-pa-md">
    <!-- Sales Reports Header -->
    <Header
      :title="$t('report.salesReports')"
      :subtitle="$t('report.salesSubtitle')"
      icon="trending_up"
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
    <div class="row q-col-gutter-sm q-mb-lg">
      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="trending_up" size="1.5rem" color="primary" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">{{ reportStore.totalSells }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalSales') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="monetization_on" size="1.5rem" color="positive" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">${{ totalRevenue.toLocaleString() }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalRevenue') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="analytics" size="1.5rem" color="secondary" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">${{ averageSale.toLocaleString() }}</div>
              <div class="stat-label text-caption">{{ $t('report.averageSale') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="account_balance_wallet" size="1.5rem" color="accent" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">${{ totalProfit.toLocaleString() }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalProfit') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Sales Table -->
    <QtableB
      show-bottom
      :hasExpandableRows="false"
      :columns="salesColumns"
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
  { label: t('report.exportSale'), icon: 'download', value: 'export' }
];

const salesColumns: Column[] = [
  {
    name: 'code',
    label: t('report.columns.saleId'),
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
const totalRevenue = computed(() => {
  return (reportStore.sells || []).reduce((total, sale) => total + (sale.total_price || 0), 0);
});

const totalProfit = computed(() => {
  // Since profit is not available in Sell interface, calculate from total_price - paid_price
  return (reportStore.sells || []).reduce((total, sale) => total + ((sale.total_price || 0) - (sale.paid_price || 0)), 0);
});

const averageSale = computed(() => {
  const sales = reportStore.sells || [];
  if (sales.length === 0) return 0;
  return totalRevenue.value / sales.length;
});

const filteredData = computed(() => {
  return [...(reportStore.sells || [])];
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
    await reportStore.fetchSells(dateFilters.value);
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: white;
  border: none;
  height: 100px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .stat-card-content {
    padding: 1rem;
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
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: rgba(25, 118, 210, 0.1);
    flex-shrink: 0;
  }

  .stat-text {
    flex: 1;
    text-align: right;
    min-width: 0;

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.1rem;
      animation: countUp 0.5s ease-out forwards;
      line-height: 1.2;
    }

    .stat-label {
      color: #6c757d;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-size: 0.7rem;
      line-height: 1.2;
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
@media (max-width: 1024px) {
  .stat-card {
    height: 90px;

    .stat-card-content {
      padding: 0.8rem;
    }

    .stat-icon-wrapper {
      width: 40px;
      height: 40px;
    }

    .stat-text .stat-value {
      font-size: 1.3rem;
    }

    .stat-text .stat-label {
      font-size: 0.65rem;
    }
  }
}

@media (max-width: 768px) {
  .stat-card {
    height: 85px;

    .stat-card-content {
      padding: 0.7rem;
    }

    .stat-text .stat-value {
      font-size: 1.2rem;
    }
  }
}

@media (max-width: 599px) {
  .stat-card {
    height: 80px;

    .stat-card-content {
      padding: 0.6rem;
    }

    .stat-icon-wrapper {
      width: 35px;
      height: 35px;
    }

    .stat-text .stat-value {
      font-size: 1.1rem;
    }

    .stat-text .stat-label {
      font-size: 0.6rem;
    }
  }
}
</style>
