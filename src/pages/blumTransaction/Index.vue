<template>
  <q-page class="q-pa-md">
    <!-- Header Card -->
    <Header
      :title="t('blumTransaction.title')"
      :subtitle="t('blumTransaction.subtitle')"
      icon="swap_horiz"
      icon-size="3rem"
      icon-color="white"
      :show-waves="true"
      background-color="linear-gradient(135deg, #e91e63 0%, #ad1457 100%)"
    />

    <!-- Transaction Type Toggle -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-pa-lg">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-btn-toggle
              v-model="transactionType"
              toggle-color="primary"
              :options="[
                { label: t('blumTransaction.purchase'), value: 'purchase' },
                { label: t('blumTransaction.sell'), value: 'sell' }
              ]"
              @update:model-value="handleTypeChange"
              class="q-mr-md"
            />
          </div>
          <q-btn
            :label="t('blumTransaction.addNew', { type: transactionType === 'purchase' ? t('blumTransaction.purchase') : t('blumTransaction.sell') })"
            icon="add"
            color="primary"
            @click="showAddModal = true"
            no-caps
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters Section -->
    <Filter
      v-model:filters="filters"
      :filter-options="filterOptions"
      :search-label="t('blumTransaction.searchLabel')"
      :reset-label="t('common.resetFilters')"
      @filter-change="handleFilterChange"
      @reset="resetFilters"
    />

    <!-- Transactions Table -->
    <QtableB
    :top-right="false"
      show-bottom
      :user-type="me?.type!"
      :allowed-types="['admin', 'employee', 'accountant']"
      :hasExpandableRows="true"
      @menu-action="handleAction"
      :columns="columns"
      :rows="filteredData"
      :loading="blumTransactionStore.loading"
      :menuItems="menuItems"
      :pagination="pagination"
      @page-change="handlePageChange"


    >
<template #expanded-row="{ row }">
  <div class="q-pa-md full-width">
    <div class="row">
      <div class="col-12">
        <div class="text-h6 text-primary q-mb-md text-left">
          {{ t('blumTransaction.transactionItems') }}
        </div>
        <div v-if="row.items?.length">
          <q-list separator>
            <q-item
              v-for="item in row.items"
              :key="item.id"
              class="q-mb-sm rounded-borders no-hover"
              style="background: #f8f9fa;"
            >
              <q-item-section>
                <div class="text-body1 text-weight-bold">
                  {{ item.name }}
                </div>
                <div class="text-caption text-grey-6">
                  ID: {{ item.id }}
                </div>
              </q-item-section>
              <q-item-section side>
                <div class="q-gutter-sm">
                  <q-badge
                    color="blue-4"
                    text-color="white"
                    class="q-pa-sm"
                    rounded
                  >
                    {{ t('blumTransaction.quantity') }}: {{ item.quantity }}
                  </q-badge>
                  <q-badge
                    color="green-4"
                    text-color="white"
                    class="q-pa-sm"
                    rounded
                  >
                    {{ t('blumTransaction.unitPrice') }}: ${{ item.unit_price.toFixed(2) }}
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-else class="text-grey text-center q-mt-md">
          <q-icon name="info" size="md" class="q-mr-xs" />
          {{ t('noItems') || 'No items available for this row.' }}
        </div>
      </div>
    </div>
  </div>
</template>


  </QtableB>

    <!-- Modals -->
    <!-- New Blum Transaction Modal (Redesigned) -->
    <BlumTransactionModal
      v-model="showAddModal"
      :transaction-type="transactionType"
      @transaction-added="handleTransactionAdded"
    />

    <!-- Old Blum Transaction Modal (commented out) -->
    <!-- <AddTransaction
      v-model="showAddModal"
      :transaction-type="transactionType"
      @transaction-added="handleTransactionAdded"
    /> -->

    <ViewTransaction
      v-if="selectedTransactionId"
      v-model="showViewModal"
      :transaction-id="selectedTransactionId"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumTransactionStore } from 'src/stores/blumTransactionStore';
import { useMeStore } from 'src/stores/meStore';
import Header from 'src/components/common/Header.vue';
import QtableB from 'src/components/common/Qtable.vue';
import Filter, { type FilterState } from 'src/components/common/Filter.vue';
import BlumTransactionModal from 'src/components/blum_new/BlumTransactionModal.vue';
import ViewTransaction from 'src/components/blumTransaction/ViewTransaction.vue';
import type { ListTransactionType } from 'src/types/blumTypes';
import type { MenuItem } from 'src/types';

// Stores
const blumTransactionStore = useBlumTransactionStore();
const { me } = useMeStore();
const { t } = useI18n();

// State
const transactionType = ref<'purchase' | 'sell'>('purchase');
const showAddModal = ref(false);
const showViewModal = ref(false);
const selectedTransactionId = ref<number | undefined>(undefined);
const currentPage = ref(1);

// Filter state
const filters = ref<FilterState>({
  search: ''
});

// Filter options
const filterOptions = computed(() => []);

// Menu items for row actions
const menuItems = [
  { label: t('common.view'), icon: 'visibility', value: 'view' },
];

// Table columns
const columns = computed(() => [
  {
    name: 'customer',
    align: 'left' as const,
    label: t('blumTransaction.customer'),
    field: (row: Record<string, unknown>) => {
      const transaction = row as unknown as ListTransactionType;
      // API provides customer object directly
      return transaction.customer?.name || 'Unknown Customer';
    },
    sortable: true
  },
  {
    name: 'warehouse',
    align: 'left' as const,
    label: t('blumTransaction.warehouse'),
    field: (row: Record<string, unknown>) => {
      const transaction = row as unknown as ListTransactionType;
      // API provides warehouse object directly
      return transaction.warehouse?.name || 'Unknown Warehouse';
    },
    sortable: true
  },
  {
    name: 'payment_type',
    align: 'center' as const,
    label: t('blumTransaction.paymentType'),
    field: 'payment_type',
    format: (val: unknown) => t(`blumTransaction.paymentTypes.${String(val)}`),
    sortable: true
  },
  {
    name: 'total_price',
    align: 'right' as const,
    label: t('blumTransaction.totalPrice'),
    field: 'total_price',
    format: (val: unknown) => `$${Number(val).toFixed(2)}`,
    sortable: true
  },
  {
    name: 'paid_price',
    align: 'right' as const,
    label: t('blumTransaction.paidPrice'),
    field: 'paid_price',
    format: (val: unknown) => `$${Number(val).toFixed(2)}`,
    sortable: true
  },
  {
    name: 'unpaid_price',
    align: 'right' as const,
    label: t('blumTransaction.unpaidPrice'),
    field: 'unpaid_price',
    format: (val: unknown) => `$${Number(val).toFixed(2)}`,
    sortable: true
  },
  {
    name: 'is_fully_paid',
    align: 'center' as const,
    label: t('blumTransaction.paid'),
    field: 'is_fully_paid',
 format: (_value: unknown, _row: Record<string, unknown>) => _value ? '✓' : '✗',
    sortable: true
  },
  {
    name: 'created_at',
    align: 'left' as const,
    label: t('common.createdAt'),
    field: 'created_at',
    format: (val: unknown) => new Date(String(val)).toLocaleDateString(),
    sortable: true
  },
  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false
  },
]);

// Computed values
const data = computed<ListTransactionType[]>(() => blumTransactionStore.transactions);
const pagination = computed(() => {
  // Don't show pagination when searching since search returns all results
  if (filters.value.search && filters.value.search.trim()) {
    return null;
  }
  return blumTransactionStore.pagination;
});

// No client-side filtering since we're doing server-side search
const filteredData = computed(() => data.value);

// Methods
async function handleTypeChange() {
  currentPage.value = 1;
  await resetFilters();
  await blumTransactionStore.fetchBlumTransactions(transactionType.value, 1);
}

async function handlePageChange(page: number) {
  currentPage.value = page;
  // Only use pagination for fetch, not for search
  if (filters.value.search && filters.value.search.trim()) {
    // Search doesn't use pagination, so just re-search
    await blumTransactionStore.searchBlumTransactions(transactionType.value, filters.value.search);
  } else {
    await blumTransactionStore.fetchBlumTransactions(transactionType.value, page);
  }
}

async function handleFilterChange() {
  // Reset to first page when searching
  currentPage.value = 1;
  // Use search method when we have a query (no pagination for search)
  if (filters.value.search && filters.value.search.trim()) {
    await blumTransactionStore.searchBlumTransactions(transactionType.value, filters.value.search);
  } else {
    await blumTransactionStore.fetchBlumTransactions(transactionType.value, 1);
  }
}

async function resetFilters() {
  filters.value.search = '';
  currentPage.value = 1;
  // Use clean fetch method (no search)
  await blumTransactionStore.fetchBlumTransactions(transactionType.value, 1);
}

function handleAction({ item, rowId }: { item: MenuItem; rowId: string | number }) {
  if (item.value === 'view') {
    selectedTransactionId.value = Number(rowId);
    showViewModal.value = true;
  }
}

async function handleTransactionAdded() {
  // Refresh transactions after adding a new one, maintaining current search
  if (filters.value.search && filters.value.search.trim()) {
    await blumTransactionStore.searchBlumTransactions(transactionType.value, filters.value.search);
  } else {
    await blumTransactionStore.fetchBlumTransactions(transactionType.value, currentPage.value);
  }
}

// Lifecycle
onMounted(async () => {
  await blumTransactionStore.fetchBlumTransactions(transactionType.value);
});
</script>

<style scoped>
.q-btn-toggle {
  border-radius: 8px;
}
</style>
