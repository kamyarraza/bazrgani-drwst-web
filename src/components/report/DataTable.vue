<template>
  <q-card class="data-table-card">
    <q-card-section class="table-header">
      <div class="table-title">
        <q-icon :name="tableIcon" size="24px" color="primary" />
        <span>{{ tableTitle }}</span>
      </div>

      <div class="table-actions">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          :placeholder="$t('common.search')"
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat
          round
          icon="filter_list"
          color="primary"
          @click="showFilters = !showFilters"
        >
          <q-tooltip>{{ $t('common.toggleFilters') }}</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <q-slide-transition>
      <q-card-section v-show="showFilters" class="filter-section">
        <div class="filter-grid">
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            :label="$t('report.columns.status')"
            outlined
            dense
            clearable
            emit-value
            map-options
          />

          <q-input
            v-model="dateFromFilter"
            type="date"
            :label="$t('report.fromDate')"
            outlined
            dense
            clearable
          />

          <q-input
            v-model="dateToFilter"
            type="date"
            :label="$t('report.toDate')"
            outlined
            dense
            clearable
          />
        </div>
      </q-card-section>
    </q-slide-transition>

    <q-separator />

    <div class="table-container">
      <q-table
        :rows="filteredData"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        binary-state-sort
        class="beautiful-table"
        :rows-per-page-options="[10, 25, 50, 100]"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.is_active ? 'positive' : 'negative'"
              :text-color="props.row.is_active ? 'white' : 'white'"
              size="sm"
              class="status-chip"
            >
              {{ props.row.is_active ? $t('common.active') : $t('common.inactive') }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            <div class="date-cell">
              <q-icon name="schedule" size="16px" color="grey-6" />
              <span>{{ formatDate(props.row.created_at) }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="primary"
              size="sm"
              @click="$emit('view', props.row)"
            >
              <q-tooltip>{{ $t('report.viewDetails') }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="no-data-container">
            <div class="no-data-content">
              <q-icon name="inbox" size="64px" color="grey-4" />
              <div class="no-data-text">{{ $t('common.noDataAvailable') }}</div>
              <div class="no-data-subtitle">{{ $t('report.tryAdjustingFilters') }}</div>
            </div>
          </div>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { date } from 'quasar';

interface Props {
  data: any[];
  columns: any[];
  loading?: boolean;
  tableTitle: string;
  tableIcon: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  view: [row: any];
}>();

// Local state
const searchTerm = ref('');
const showFilters = ref(false);
const statusFilter = ref<boolean | null>(null);
const dateFromFilter = ref('');
const dateToFilter = ref('');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const statusOptions = [
  { label: t('common.active'), value: true },
  { label: t('common.inactive'), value: false }
];

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

// Computed
const filteredData = computed(() => {
  let filtered = [...props.data];

  // Search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search)
      )
    );
  }

  // Status filter
  if (statusFilter.value !== null) {
    filtered = filtered.filter(item => item.is_active === statusFilter.value);
  }

  // Date filters
  if (dateFromFilter.value) {
    filtered = filtered.filter(item =>
      item.created_at && new Date(item.created_at) >= new Date(dateFromFilter.value)
    );
  }

  if (dateToFilter.value) {
    filtered = filtered.filter(item =>
      item.created_at && new Date(item.created_at) <= new Date(dateToFilter.value)
    );
  }

  return filtered;
});

// Methods
const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'YYYY/MM/DD HH:mm');
};

// Use the correct type provided by Quasar's QTable for request events
interface QTableRequestProps {
  pagination: {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
    rowsNumber?: number;
  };
  filter?: unknown;
  getCellValue: (_col: unknown, _row: unknown) => unknown;
}

const onRequest = (requestProp: QTableRequestProps) => {
  pagination.value = requestProp.pagination as typeof pagination.value;
};

// Update pagination when data changes
watch(() => props.data, (newData) => {
  pagination.value.rowsNumber = newData.length;
}, { immediate: true });
</script>

<style scoped>
.data-table-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.table-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  min-width: 250px;
}

.filter-section {
  background: rgba(42, 123, 155, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.table-container {
  overflow: hidden;
}

.beautiful-table {
  border: none;
}

.beautiful-table :deep(.q-table__top) {
  padding: 0;
}

/* Ensure no-data content is always centered */
.beautiful-table :deep(.q-table__bottom),
.beautiful-table :deep(.q-table__middle) {
  .q-table__control {
    justify-content: center;
    align-items: center;
    text-align: center;
  }
}

.beautiful-table :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #2A7B9B 0%, #2A9B8F 100%);
}

.beautiful-table :deep(.q-table thead th) {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 16px 12px;
  border: none;
}

.beautiful-table :deep(.q-table tbody tr) {
  transition: background-color 0.2s ease;
}

.beautiful-table :deep(.q-table tbody tr:hover) {
  background-color: rgba(42, 123, 155, 0.04);
}

.beautiful-table :deep(.q-table tbody td) {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.status-chip {
  border-radius: 8px;
  font-weight: 500;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.no-data-container {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 48px 24px !important;
  text-align: center !important;
  width: 100% !important;
  min-height: 200px !important;
}

.no-data-content {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 16px !important;
  text-align: center !important;
}

/* Override Quasar's default table no-data styles with higher specificity */
.beautiful-table :deep(.q-table__bottom) {
  .no-data-container {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
  }
}

/* Ensure the no-data template wrapper is centered */
.beautiful-table :deep(.q-table__middle) {
  .no-data-container {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
  }
}

/* Force center alignment on the table's no-data row */
.beautiful-table :deep(.q-table tbody tr td) {
  &.q-table--no-data {
    text-align: center !important;

    .no-data-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      width: 100% !important;
    }
  }
}

.no-data-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 16px;
  text-align: center;
}

.no-data-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .table-actions {
    justify-content: space-between;
  }

  .search-input {
    min-width: auto;
    flex: 1;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
