<template>
  <q-page class="q-pa-md">
    <!-- Expense Categories Dashboard Header Card -->
    <Header :title="t('expenseCategory.dashboardTitle')" :subtitle="t('expenseCategory.managingCategories')"
      icon="category" icon-size="3rem" icon-color="white" :show-waves="true"
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
      :search-label="t('expenseCategory.searchLabel', 'Search by name or description')"
      :reset-label="t('expenseCategory.resetFilters', 'Reset')" @filter-change="handleFilterChange"
      @reset="resetFilters" />

    <!-- Search Results Info -->
    <div v-if="isSearching" class="q-mb-md">
      <q-card flat class="bg-blue-1 q-pa-md">
        <div class="row items-center">
          <q-icon name="search" color="primary" class="q-mr-sm" />
          <span class="text-body2">
            {{ t('expenseCategory.searchResults', 'Search results for') }}:
            <strong>"{{ filters.search }}"</strong>
            ({{ filteredData.length }} {{ t('expenseCategory.categoriesFound', 'categories found') }})
          </span>
          <q-space />
          <q-btn flat round icon="close" size="sm" @click="clearSearch"
            :title="t('expenseCategory.clearSearch', 'Clear search')" />
        </div>
      </q-card>
    </div>

    <!-- Expense Categories Table -->
    <Qtable show-bottom :user-type="me?.type!" :allowed-types="['admin', 'employee']" :hasExpandableRows="false"
      @menu-action="handleAction" :columns="columns" :rows="filteredData" :loading="expenseCategoryStore.loading"
      :menuItems="menuItems" :pagination="pagination" @page-change="handlePageChange"
      @top-right-action="() => showModal = !showModal" :top-right-title="t('expenseCategory.addNew')">

      <!-- Actions Column Slot -->
      <template #body-cell-actions="{ row }">
        <q-td class="text-center">
          <q-btn flat round color="primary" icon="edit" size="sm" :title="t('expenseCategory.update')"
            @click="openUpdateModal(row)" />
        </q-td>
      </template>
    </Qtable>

    <Add v-model="showModal"></Add>
    <Update v-model="showUpdateModal" v-if="categoryToUpdate" :category="categoryToUpdate"></Update>
    <Update v-model="showUpdateModal" v-else></Update>
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
import Add from 'src/components/expense_category/Add.vue';
import Update from 'src/components/expense_category/Update.vue';
import { useExpenseCategoryStore } from 'src/stores/expenseCategoryStore';
import { useMeStore } from 'src/stores/meStore';
import type { ExpenseCategory } from 'src/types/expense';

const { t } = useI18n();
const expenseCategoryStore = useExpenseCategoryStore();
const meStore = useMeStore();

// Reactive variables
const showModal = ref(false);
const showUpdateModal = ref(false);
const categoryToUpdate = ref<ExpenseCategory | null>(null);
const currentPage = ref(1);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Get data from stores
const { me } = storeToRefs(meStore);
const { categories: data, pagination } = storeToRefs(expenseCategoryStore);

// Computed for notes (if they exist on the user)
const notes = computed(() => me.value?.sticky_notes || []);

// Filters
const filters = ref({
  search: ''
});

// Computed properties
const isSearching = computed(() => filters.value.search && filters.value.search.length > 0);

// Table columns
const columns = computed(() => [
  {
    name: 'name',
    label: t('expenseCategory.name'),
    field: 'name',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'description',
    label: t('expenseCategory.description'),
    field: 'description',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'created_at',
    label: t('expenseCategory.createdAt'),
    field: 'created_at',
    sortable: true,
    align: 'left' as const,
    // format: (val: unknown) => val ? new Date(val as string).toLocaleDateString() : ''
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'actions',
    sortable: false,
    align: 'center' as const
  }
]);

// Filter options for the Filter component
const filterOptions = computed(() => []);

// Menu items for row actions - expense category menu actions
const menuItems = [
  { label: t('expenseCategory.update'), icon: 'edit', value: 'update' }
];

// Filtered data based on search and filters
const filteredData = computed(() => {
  if (!filters.value.search || filters.value.search.trim() === '') {
    return data.value;
  }

  // Client-side filtering for better UX while API call is in progress
  const query = filters.value.search.toLowerCase().trim();
  return data.value.filter(category =>
    category.name.toLowerCase().includes(query) ||
    (category.description && category.description.toLowerCase().includes(query))
  );
});

// Methods
function resetFilters() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = null;
  }

  filters.value = {
    search: ''
  };

  currentPage.value = 1;
  void expenseCategoryStore.fetchCategories(1);
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
    if (filters.value.search.trim()) {
      void expenseCategoryStore.searchCategories(filters.value.search, 1);
    } else {
      void expenseCategoryStore.fetchCategories(1);
    }
  }, 500);
}

function handlePageChange(page: number) {
  currentPage.value = page;
  if (isSearching.value) {
    void expenseCategoryStore.searchCategories(filters.value.search, page);
  } else {
    void expenseCategoryStore.fetchCategories(page);
  }
}

function handleAction(action: string, category: ExpenseCategory) {
  switch (action) {
    case 'update':
      categoryToUpdate.value = category;
      showUpdateModal.value = true;
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

function openUpdateModal(category: ExpenseCategory) {
  categoryToUpdate.value = category;
  showUpdateModal.value = true;
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
    void expenseCategoryStore.fetchCategories(currentPage.value);
  }
});

watch(showUpdateModal, (newVal) => {
  if (!newVal) {
    categoryToUpdate.value = null;
    void expenseCategoryStore.fetchCategories(currentPage.value);
  }
});

// Lifecycle
onMounted(async () => {
  await expenseCategoryStore.fetchCategories(1);
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

.action-btn-hover {
  transition: all 0.2s ease;
  opacity: 0.7;
}

.action-btn-hover:hover {
  background-color: rgba(25, 118, 210, 0.1);
  transform: scale(1.1);
  opacity: 1;
}

.action-btn-hover:active {
  transform: scale(0.95);
}

/* Show button on row hover */
.q-table tbody tr:hover .action-btn-hover {
  opacity: 1;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.q-ml-md {
  margin-left: 16px;
}
</style>
