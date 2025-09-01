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

    <!-- Selected Branch Badge for Admin -->
    <div v-if="me?.type === 'admin' && hasSelectedBranch && selectedBranch" class="q-mb-md">
      <q-card flat class="bg-green-1 q-pa-md">
        <div class="row items-center">
          <q-icon name="business" color="green" class="q-mr-sm" />
          <span class="text-body2">
            {{ t('expense.viewingExpensesFor', 'Viewing expenses for') }}:
            <q-chip color="green" text-color="white" icon="store" :label="selectedBranch.name" size="sm" />
          </span>
          <q-space />
          <q-btn flat color="green" :label="t('expense.changeBranch', 'Change Branch')" @click="changeBranch" size="sm"
            icon="swap_horiz" />
        </div>
      </q-card>
    </div>

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

    <!-- Branch Selection Required Message for Admin -->
    <div v-if="me?.type === 'admin' && !hasSelectedBranch" class="q-mb-md">
      <q-card flat class="bg-orange-1 q-pa-md">
        <div class="row items-center">
          <q-icon name="info" color="orange" class="q-mr-sm" />
          <span class="text-body2">
            {{ t('expense.selectBranchFirst', 'Please select a branch first') }}
          </span>
          <q-space />
          <q-btn color="orange" :label="t('expense.selectBranch', 'Select Branch')" @click="showBranchSelector = true"
            size="sm" unelevated />
        </div>
      </q-card>
    </div>

    <!-- Expenses Table -->
    <Qtable show-bottom :user-type="me?.type!" :allowed-types="['admin', 'employee']" :hasExpandableRows="false"
      @menu-action="handleAction" @view-action="handleViewAction" :columns="columns" :rows="filteredData"
      :loading="expenseStore.loading" :menuItems="menuItems" :pagination="pagination" @page-change="handlePageChange"
      @top-right-action="handleAddExpense" :top-right-title="me?.type === 'employee' ? t('expense.addNew') : ''">
    </Qtable>

    <!-- Branch Selector Modal for Admin (for viewing expenses) -->
    <BranchSelector v-model="showBranchSelector" @branch-selected="onBranchSelectedForViewing" />

    <!-- Add Expense Modal -->
    <Add v-model="showModal"></Add>

    <!-- View Expense Modal -->
    <View v-if="selectedExpense" v-model="showViewModal" :expense="selectedExpense" @edit="handleEditExpense" />
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
import View from 'src/components/expense/View.vue';
import BranchSelector from 'src/components/expense/BranchSelector.vue';
import { useExpenseStore } from 'src/stores/expenseStore';
import { useMeStore } from 'src/stores/meStore';
import type { Expense } from 'src/types/expense';
import type { Branch } from 'src/types/branch';

const { t } = useI18n();
const expenseStore = useExpenseStore();
const meStore = useMeStore();

// Reactive variables
const showModal = ref(false);
const showViewModal = ref(false);
const selectedExpense = ref<Expense | undefined>(undefined);
const showBranchSelector = ref(false);
const selectedBranchId = ref<number | undefined>(undefined);
const selectedBranch = ref<Branch | undefined>(undefined); // Store the full branch object
const currentPage = ref(1);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const hasSelectedBranch = ref(false); // Track if admin has selected a branch for viewing

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
    name: 'reference_number',
    label: t('expense.referenceNumber', 'Reference Number'),
    field: 'reference_number',
    sortable: true,
    align: 'left' as const
  },{
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
    name: 'payee',
    label: t('expense.payee'),
    field: 'payee',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'paid_at',
    label: t('expense.paidAt'),
    field: 'paid_at',
    sortable: true,
    align: 'left' as const,
    // format: (val: unknown) => val ? new Date(val as string).toLocaleDateString() : ''
  },
  {
    name: 'view_action',
    label: t('expense.quickView', 'Quick View'),
    field: 'view_action',
    sortable: false,
    align: 'center' as const
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
  void loadExpenses(1);
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
      void expenseStore.searchExpenses(filters.value.query, 1, selectedBranchId.value);
    } else {
      void loadExpenses(1);
    }
  }, 500);
}

function handleAddExpense() {
  // For users (employee) only, open expense modal directly
  showModal.value = (me.value?.type === 'employee');
}

function onBranchSelectedForViewing(branch: Branch) {
  selectedBranchId.value = branch.id!;
  selectedBranch.value = branch; // Store the full branch object
  hasSelectedBranch.value = true;
  showBranchSelector.value = false;

  // Load expenses for the selected branch
  void loadExpenses(1);
}

function changeBranch() {
  // Reset current selection and show branch selector
  selectedBranchId.value = undefined;
  selectedBranch.value = undefined;
  hasSelectedBranch.value = false;
  currentPage.value = 1;

  // Clear current expenses data
  expenseStore.expenses = [];

  // Show branch selector
  showBranchSelector.value = true;
}

function handlePageChange(page: number) {
  currentPage.value = page;
  if (isSearching.value) {
    void expenseStore.searchExpenses(filters.value.query, page, selectedBranchId.value);
  } else {
    void loadExpenses(page);
  }
}

// Helper method to load expenses with proper branch filtering
function loadExpenses(page: number) {
  void expenseStore.fetchExpenses(page, selectedBranchId.value);
}

function handleAction(action: any, expense: Expense) {
  switch (action.item.value) {
    case 'view':
      selectedExpense.value = expense;
      showViewModal.value = true;
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

function handleViewAction(data: any) {
  selectedExpense.value = data.item as Expense;
  showViewModal.value = true;
}

function handleEditExpense(expense: Expense) {
  // For now, we'll just close the view modal and open the add modal
  // In the future, this could be enhanced to pass the expense data to an edit modal
  selectedExpense.value = expense;
  showViewModal.value = false;
  showModal.value = true;
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
    // Refresh expenses when modal closes
    void loadExpenses(currentPage.value);
  }
});

// Lifecycle
onMounted(async () => {
  await meStore.fetchMe();

  // If admin, show branch selector first. If employee, load expenses directly
  if (me.value?.type === 'admin') {
    showBranchSelector.value = true;
  } else {
    // For employees, load expenses directly without branch filtering
    void loadExpenses(1);
  }
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
