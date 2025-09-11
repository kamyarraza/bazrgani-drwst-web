<template>
  <q-page class="q-pa-md">
    <!-- Branch Reports Header -->
    <Header :title="$t('report.branchReports')" :subtitle="$t('report.branchSubtitle')" icon="store" icon-size="3rem"
      icon-color="white" :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />

    <!-- Date Range Filter -->
    <!-- <div class="q-mb-lg">
      <DateRangeFilter
        v-model="dateFilters"
        @filter-applied="onDateFilterChanged"
      />
    </div> -->

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-sm q-mb-lg">
      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="store" size="1.5rem" color="primary" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">{{ reportStore.totalBranches }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalBranches') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="check_circle" size="1.5rem" color="positive" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">{{ reportStore.activeBranches }}</div>
              <div class="stat-label text-caption">{{ $t('report.activeBranches') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="warehouse" size="1.5rem" color="secondary" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">{{ totalWarehouses }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalWarehouses') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-3">
        <q-card class="stat-card">
          <q-card-section class="stat-card-content">
            <div class="stat-icon-wrapper">
              <q-icon name="people" size="1.5rem" color="accent" />
            </div>
            <div class="stat-text">
              <div class="stat-value text-h5">{{ totalUsers }}</div>
              <div class="stat-label text-caption">{{ $t('report.totalUsers') }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Branch Table -->
    <QtableB show-bottom :hasExpandableRows="false" :columns="branchColumns" :rows="filteredData" :loading="loading"
      :menuItems="menuItems" @menu-action="handleAction" :pagination="pagination" @page-change="handlePageChange"
      :top-right="false">
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.is_active ? 'positive' : 'negative'"
            :label="props.row.is_active ? $t('common.active') : $t('common.inactive')" rounded />
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
import { useI18n } from 'vue-i18n';
import type { MenuItem } from 'src/types';
import { formatPhoneNumber } from 'src/composables/useFormat';

const reportStore = useReportStore();
const { t } = useI18n();
const loading = ref(false);
const currentPage = ref(1);

// Menu items for row actions
const menuItems: MenuItem[] = [
  { label: t('report.viewDetails'), icon: 'visibility', value: 'view' },
  { label: t('report.exportBranch'), icon: 'download', value: 'export' }
];

const branchColumns: any[] = [
  {
    name: 'code',
    label: t('report.columns.branchCode'),
    align: 'left',
    field: 'code',
    sortable: true
  },
  {
    name: 'name',
    label: t('report.columns.branchName'),
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'location',
    label: t('report.columns.location'),
    align: 'left',
    field: 'location',
    sortable: false
  },
  {
    name: 'phone',
    label: t('report.columns.phone'),
    align: 'left',
    field: (row: any) => formatPhoneNumber(row.phone) || 'N/A',
    sortable: true,
    style: "direction: ltr;"
  },
  {
    name: 'warehouse_count',
    label: t('report.columns.warehouses'),
    align: 'center',
    field: 'warehouses',
    sortable: true
  },
  {
    name: 'user_count',
    label: t('report.columns.users'),
    align: 'center',
    field: 'users',
    sortable: true
  },
  // {
  //   name: 'status',
  //   label: t('report.columns.status'),
  //   align: 'center',
  //   field: 'is_active',
  //   sortable: true,
  //   format: (_value: unknown, _row: Record<string, unknown>) => _value ? '✓' : '✗'
  // },
  // {
  //   name: 'created_at',
  //   label: t('report.columns.created'),
  //   align: 'center',
  //   field: 'created_at',
  //   sortable: true,
  //   format: (val: unknown) => new Date(val as string).toLocaleDateString()
  // }
];

// Computed properties
const totalWarehouses = computed(() => {
  return (reportStore.branches || []).reduce((total, branch) => total + (branch.warehouses || 0), 0);
});

const totalUsers = computed(() => {
  return (reportStore.branches || []).reduce((total, branch) => total + (branch.users || 0), 0);
});

const filteredData = computed(() => {
  return [...(reportStore.branches || [])];
});

const pagination = computed(() => ({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
}));

// Methods
const handleAction = ({ item, rowId: _rowId }: { item: MenuItem; rowId: number }) => {
  if (item.value === 'view') {
    // Implement view details functionality
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
    await reportStore.fetchBranches();
  } finally {
    loading.value = false;
  }
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

// Responsive adjustments for smaller cards
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
