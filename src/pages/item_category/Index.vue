<template>
  <q-page class="q-pa-md">
    <!-- Item Category Header -->
    <Header
      :title="t('itemCategory.title')"
      :subtitle="t('itemCategory.subtitle')"
      icon="category"
      icon-size="3rem"
      icon-color="white"
      :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
    />

    <!-- Sticky Notes Overlay -->
    <div class="sticky-notes-overlay">
      <div v-for="(note, idx) in notes" :key="note.id" style="margin-bottom: 12px;">
        <Note :model-value="note" @update:model-value="val => { notes[idx] = { ...notes[idx], ...val } }" @close="removeNote(note.id)" />
      </div>
    </div>

    <!-- Filters Section -->
    <Filter v-model:filters="filters" :filter-options="filterOptions"
      :search-label="t('itemCategory.searchLabel', 'Search by name')"
      :reset-label="t('itemCategory.resetFilters', 'Reset')"
      @filter-change="handleFilterChange"
      @reset="resetFilters" />

    <!-- Search Results Info -->
    <div v-if="isSearching" class="q-mb-md">
      <q-card flat class="bg-blue-1 q-pa-md">
        <div class="row items-center">
          <q-icon name="search" color="primary" class="q-mr-sm" />
          <span class="text-body2">
            {{ t('itemCategory.searchResults', 'Search results for') }}:
            <strong>"{{ filters.search }}"</strong>
            ({{ categories.length }} {{ t('itemCategory.categoriesFound', 'categories found') }})
          </span>
          <q-space />
          <q-btn
            flat
            round
            icon="close"
            size="sm"
            @click="clearSearch"
            :title="t('itemCategory.clearSearch', 'Clear search')"
          />
        </div>
      </q-card>
    </div>

    <!-- Categories Table -->
    <QtableB
    :show-bottom="!isSearching"
      :columns="columns"
      :rows="filteredData"
      :loading="categoryStore.loading"
      :menuItems="menuItems"
      @menu-action="handleAction"
      @top-right-action="() => showAddModal = true"
      :top-right-title="t('itemCategory.addNew')"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.is_active ? 'positive' : 'negative'">
            {{ props.row.is_active ? t('common.active') : t('common.inactive') }}
          </q-badge>
        </q-td>
      </template>
    </QtableB>

    <Add v-model="showAddModal" @submit="handleCreated" />
    <Update v-model="showUpdateModal" v-if="selectedCategory" :category="selectedCategory" @submit="handleUpdated" />
    <Update v-model="showUpdateModal" v-else />
  </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import Add from 'components/item_category/Add.vue'
import Update from 'components/item_category/Update.vue'
import Filter from 'src/components/common/Filter.vue'
import Note from 'src/components/common/Note.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItemCategoryStore } from 'src/stores/itemCategoryStore'
import type { Category } from 'src/types/category'
import type { MenuItem, Column } from 'src/types'

const { t } = useI18n();
const categoryStore = useItemCategoryStore();

const showAddModal = ref(false);
const showUpdateModal = ref(false);
const selectedCategory = ref<Category | null>(null);

// Pagination
const pagination = computed(() => categoryStore.pagination || {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
});

// Notes functionality
const notes = ref<Array<{ id: number; title: string; content: string }>>([]);

function removeNote(id: number) {
  const idx = notes.value.findIndex(n => n.id === id);
  if (idx !== -1) notes.value.splice(idx, 1);
}

const currentPage = ref(1);
const filters = ref({
  search: '',
  status: null
});

// Debounce timer for search
let searchTimeout: NodeJS.Timeout | null = null;

// Check if we're currently in search mode
const isSearching = computed(() => {
  return filters.value.search?.trim() !== '';
});

const filterOptions = [
  {
    field: 'status',
    label: t('common.status'),
    options: [
      { label: t('common.active'), value: 'active' },
      { label: t('common.inactive'), value: 'inactive' }
    ],
    icon: 'toggle_on'
  }
];

const columns: Column[] = [
  {
    name: 'name',
    label: t('itemCategory.name'),
    field: 'name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'description',
    label: t('itemCategory.description'),
    field: 'description',
    sortable: true,
    align: 'left'
  },
    {
    name: 'status',
    label: t('common.status'),
    field: 'is_active',
    align: 'center' as const,
    sortable: true,
    format: (_value: unknown, _row: Record<string, unknown>) => _value ? '✓' : '✗'
  },
  {
    name: 'created_at',
    label: t('common.createdAt'),
    field: 'created_at_humans',
    sortable: true,
    align: 'left'
  },
  {
    name: 'actions',
    label: t('common.actions'),
    field: 'actions',
    align: 'center',
    sortable: false
  }
];

const menuItems: MenuItem[] = [
  { label: t('common.edit'), icon: 'edit', value: 'edit' },
    { label: t('itemCategory.toggleStatus', 'Toggle Active'), icon: 'toggle_on', value: 'toggleStatus' }
];

const categories = computed(() => categoryStore.itemCategories);

// For category filtering (only applied client-side)
const filteredData = computed(() => {
  let filtered = [...categories.value];

  // Status filter is handled on the client-side
  if (filters.value.status !== null) {
    if (filters.value.status === 'active') {
      filtered = filtered.filter(item => item.is_active === true);
    } else if (filters.value.status === 'inactive') {
      filtered = filtered.filter(item => item.is_active === false);
    }
  }
  return filtered;
});

// Handle filter changes from Filter component
function handleFilterChange(newFilters: { search?: string; status?: string | null }) {
  // Handle search with debouncing for better performance
  if (newFilters.search !== undefined) {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    searchTimeout = setTimeout(() => {
      void handleSearch();
    }, 500); // 500ms delay
  }
}

async function handleSearch() {
  const searchQuery = filters.value.search?.trim();

  if (searchQuery) {
    // Use dedicated search function for queries
    await categoryStore.searchItemCategories(searchQuery);
  } else {
    // If search is empty, fetch normal paginated items
    currentPage.value = 1;
    await categoryStore.fetchItemCategories(1);
  }
}

function resetFilters() {
  // Clear any pending search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  filters.value = {
    search: '',
    status: null
  };

  // Reset to first page and fetch normal items (not search)
  currentPage.value = 1;
  void categoryStore.fetchItemCategories(1);
}

function clearSearch() {
  // Clear any pending search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }

  filters.value.search = '';

  // Reset to first page and fetch normal items
  currentPage.value = 1;
  void categoryStore.fetchItemCategories(1);
}

function handleAction({ item, rowId }: { item: { label: string; icon: string; value: string }, rowId: number }) {
  if (item.value === 'edit') {
    const found = categories.value.find(cat => cat.id === rowId);
    selectedCategory.value = found || null;
    showUpdateModal.value = true;
  } else if (item.value === 'toggleStatus') {
    void categoryStore.toggleItemCategoryStatus(rowId);
  }
}

async function handleCreated() {
  await categoryStore.fetchItemCategories(currentPage.value);
}

async function handleUpdated() {
  await categoryStore.fetchItemCategories(currentPage.value);
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  // Only allow pagination if we're not in search mode
  const searchQuery = filters.value.search?.trim();

  if (searchQuery) {
    // If we're in search mode, don't paginate
    return;
  }

  currentPage.value = page;
  // We're not resetting filters to maintain the user's filter state when paging
  await categoryStore.fetchItemCategories(page);

  // Scroll to top when changing pages for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

onMounted(async () => {
  await categoryStore.fetchItemCategories();
  if (categoryStore.pagination) {
    currentPage.value = categoryStore.pagination.current_page;
  }
});

// Cleanup timeout on component unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.q-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Sticky notes overlay style */
.sticky-notes-overlay {
  position: fixed;
  top: 100px; /* adjust as needed to be below header */
  right: 32px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}
.sticky-notes-overlay > div {
  pointer-events: auto;
}
</style>
