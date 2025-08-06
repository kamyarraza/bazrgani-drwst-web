<template>
  <q-page class="q-pa-md">
    <!-- Expenses Dashboard Header Card -->
    <Header :title="t('expense.dashboardTitle')" :subtitle="t('expense.managingExpenses')" icon="receipt_long"
      icon-size="3rem" icon-color="white" :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />

    <!-- Sticky Notes Overlay (absolute, not in normal flow) -->
    <div class="sticky-notes-overlay">
      <div v-for="(note, idx) in notes" :key="note.id || `note-${idx}`" style="margin-bottom: 12px;">
        <Note :model-value="note" @update:model-value="updateNote(idx, $event)"
          @close="note.id && removeNote(note.id)" />
      </div>
    </div>

    <!-- Filters Section -->
    <Filter v-model:filters="filters" :filter-options="filterOptions"
      :search-label="t('expense.searchLabel', 'Search by title, payee or reference number')"
      :reset-label="t('expense.resetFilters', 'Reset')" @filter-change="handleFilterChange" @reset="resetFilters" />

    <!-- Search Results Info -->
    <div v-if="isSearching" class="q-mb-md">
      <q-card flat class="bg-blue-1 q-pa-md">
        <div class="row items-center">
          <q-icon name="search" color="primary" class="q-mr-sm" />
          <span class="text-body2">
            {{ t('expense.searchResults', 'Search results for') }}:
            <strong>"{{ filters.query }}"</strong>
            ({{ data.length }} {{ t('expense.expensesFound', 'expenses found') }})
          </span>
          <q-space />
          <q-btn flat round icon="close" size="sm" @click="clearSearch"
            :title="t('expense.clearSearch', 'Clear search')" />
        </div>
      </q-card>
    </div>

    <!-- Expenses Table -->
    <Qtable show-bottom :user-type="me?.type!" :allowed-types="['admin', 'employee']" :hasExpandableRows="false"
      @menu-action="handleAction" :columns="columns" :rows="filteredData" :loading="expenseStore.loading"
      :menuItems="menuItems" :pagination="pagination" @page-change="handlePageChange"
      @top-right-action="() => showModal = !showModal" :top-right-title="t('expense.addNew')">
    </Qtable>

    <Add v-model="showModal"></Add>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import Qtable from 'src/components/common/Qtable.vue';
import Header from 'src/components/common/Header.vue';
import Filter from 'src/components/common/Filter.vue';
import Note from 'src/components/common/Note.vue';
import Add from 'src/components/expense/Add.vue';
import { useExpenseStore } from 'src/stores/expenseStore';
import { useMeStore } from 'src/stores/meStore';
import type { Expense } from 'src/types/expense';

const { t } = useI18n();
const expenseStore = useExpenseStore();
const meStore = useMeStore();

// Reactive variables
const showModal = ref(false);
const currentPage = ref(1);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Get data from stores
const { me } = storeToRefs(meStore);
const { expenses: data, pagination } = storeToRefs(expenseStore);

// Computed for notes (if they exist on the user)
const notes = computed(() => me.value?.sticky_notes || []);

// Filters
const filters = ref({
  query: ''
});

// Computed properties
const isSearching = computed(() => filters.value.query.length > 0);

// Table columns
const columns = computed(() => [
  {
    name: 'title',
    label: t('expense.title'),
    field: 'title',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'category',
    label: t('expense.category'),
    field: (row: Record<string, unknown>) => {
      const expense = row as unknown as Expense;
      return expense.category?.name || 'N/A';
    },
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'expensed_usd',
    label: t('expense.expensedUsd'),
    field: 'expensed_usd',
    sortable: true,
    align: 'left' as const,
    // format: (val: unknown) => {
    //   const amount = val as number;
    //   return amount ? `$${amount.toFixed(2)}` : '$0.00';
    // }
  },
  {
    name: 'expensed_iqd',
    label: t('expense.expensedIqd'),
    field: 'expensed_iqd',
    sortable: true,
    align: 'left' as const,
    // format: (val: unknown) => {
    //   const amount = val as number;
    //   return amount ? `${amount.toLocaleString()} IQD` : '0 IQD';
    // }
  },
  {
    name: 'paid_at',
    label: t('expense.paidAt'),
    field: 'paid_at',
    sortable: true,
    align: 'left' as const,
    // format: (val: unknown) => val ? new Date(val as string).toLocaleDateString() : ''
  },
]);

// Filter options for the Filter component
const filterOptions = computed(() => []);

// Menu items for row actions - expense menu actions (only create for expenses)
const menuItems = [
  { label: t('expense.view'), icon: 'visibility', value: 'view' }
];

// Filtered data based on search and filters
const filteredData = computed(() => {
  return data.value;
});

// Methods
function resetFilters() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = null;
  }

  filters.value = {
    query: ''
  };

  currentPage.value = 1;
  void expenseStore.fetchExpenses(1);
}

function clearSearch() {
  resetFilters();
}

function handleFilterChange() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    if (filters.value.query.trim()) {
      void expenseStore.searchExpenses(filters.value.query, 1);
    } else {
      void expenseStore.fetchExpenses(1);
    }
  }, 500);
}

function handlePageChange(page: number) {
  currentPage.value = page;
  if (isSearching.value) {
    void expenseStore.searchExpenses(filters.value.query, page);
  } else {
    void expenseStore.fetchExpenses(page);
  }
}

function handleAction(action: string, expense: Expense) {
  switch (action) {
    case 'view':
      console.log('View expense:', expense);
      // Implement view logic here
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

function removeNote(noteId: string) {
  void meStore.deleteStickyNote(noteId);
}

function updateNote(index: number, updatedNote: any) {
  // Handle note update logic if needed
  console.log('Note updated:', index, updatedNote);
}

// Watchers
watch(showModal, (newVal) => {
  if (!newVal) {
    void expenseStore.fetchExpenses(currentPage.value);
  }
});

// Lifecycle
onMounted(async () => {
  await expenseStore.fetchExpenses(1);
  await meStore.fetchMe();
});
</script>

<style scoped>
.sticky-notes-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}
</style>
