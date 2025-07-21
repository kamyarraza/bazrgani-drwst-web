<template>
  <q-page class="q-pa-md">
    <!-- Header Card -->
    <Header
      title="Blum Sets"
      subtitle="Manage and configure sets of Blum components"
      icon="category"
      icon-size="3rem"
      icon-color="white"
      :show-waves="true"
      background-color="linear-gradient(135deg, #3949ab 0%, #1976d2 100%)"
    />

    <!-- Filters Section -->
    <Filter
      v-model:filters="filters"
      :filter-options="filterOptions"
      :search-label="t('blum.searchSetLabel')"
      :reset-label="t('blum.resetFilters')"
      @filter-change="handleFilterChange"
      @reset="resetFilters"
    />

    <!-- Sets Table -->
    <QtableB
      show-bottom
      :user-type="me?.type!"
      :allowed-types="['admin', 'employee', 'accountant']"
      :hasExpandableRows="false"
      @menu-action="handleAction"
      :columns="columns"
      :rows="filteredData"
      :loading="blumStore.blumSetsLoading"
      :menuItems="menuItems"
      :pagination="pagination"
      @page-change="handlePageChange"
      @top-right-action="() => showAddModal = true"
      :top-right-title="t('blum.addNewSet')"
    />

    <!-- Modals -->
    <AddSet
      v-model="showAddModal"
      @set-added="handleSetAdded"
    />

    <UpdateSet
      v-model="showUpdateModal"
      :set="selectedSet"
      @set-updated="handleSetUpdated"
    />

    <ViewSet
      v-if="selectedSetId"
      v-model="showViewModal"
      :set-id="selectedSetId"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumStore } from 'src/stores/blumStore';
import { useMeStore } from 'src/stores/meStore';
import Header from 'src/components/common/Header.vue';
import QtableB from 'src/components/common/Qtable.vue';
import Filter, { type FilterState } from 'src/components/common/Filter.vue';
import AddSet from 'src/components/blum/AddSet.vue';
import UpdateSet from 'src/components/blum/UpdateSet.vue';
import ViewSet from 'src/components/blum/ViewSet.vue';
import type { BlumSet } from 'src/types/blumTypes';
import type { MenuItem } from 'src/types';

// Stores
const blumStore = useBlumStore();
const { me } = useMeStore();
const { t } = useI18n();

// State
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showViewModal = ref(false);
const selectedSet = ref<BlumSet | undefined>(undefined);
const selectedSetId = ref<number | undefined>(undefined);
const currentPage = ref(1);

// Filter state
const filters = ref<FilterState>({
  search: ''
});

// Filter options
const filterOptions = computed(() => []);

// Menu items for row actions
const menuItems = [
  { label: t('blum.viewDetails'), icon: 'visibility', value: 'view' },
  { label: t('blum.update'), icon: 'edit', value: 'update' },
  { label: t('common.delete'), icon: 'delete', value: 'delete' },
];

// Table columns
const columns = [

  { name: 'name', align: 'left' as const, label: t('blum.setName'), field: 'name', sortable: true },
  {
    name: 'description',
    align: 'left' as const,
    label: t('blum.setDescription'),
    field: 'description',
    format: (val: unknown) => typeof val === 'string' && val ? (val.length > 50 ? val.substring(0, 50) + '...' : val) : '-',
    sortable: false
  },
  {
    name: 'item_count',
    align: 'center' as const,
    label: t('blum.itemCount'),
    field: (row: Record<string, unknown>) => {
      const blumSet = row as unknown as BlumSet;
      return blumSet.items?.length || 0;
    },
    sortable: true
  },
  {
    name: 'image',
    align: 'center' as const,
    label: t('blum.setImage'),
    field: 'image',

    sortable: false
  },

  {
    name: 'actions',
    label: t('common.actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false
  },
];

// Computed values
const data = computed<BlumSet[]>(() => blumStore.blumSets);
const pagination = computed(() => {
  // Don't show pagination when searching since search returns all results
  if (filters.value.search && filters.value.search.trim()) {
    return null;
  }
  return blumStore.blumSetsPagination;
});

// No client-side filtering since we're doing server-side search
const filteredData = computed(() => data.value);

// Methods
async function handlePageChange(page: number) {
  currentPage.value = page;
  // Only use pagination for fetch, not for search
  if (filters.value.search && filters.value.search.trim()) {
    // Search doesn't use pagination, so just re-search
    await blumStore.searchBlumSets(filters.value.search);
  } else {
    await blumStore.fetchBlumSets(page);
  }
}

async function handleFilterChange() {
  // Reset to first page when searching
  currentPage.value = 1;
  // Use search method when we have a query (no pagination for search)
  if (filters.value.search && filters.value.search.trim()) {
    await blumStore.searchBlumSets(filters.value.search);
  } else {
    await blumStore.fetchBlumSets(1);
  }
}

async function resetFilters() {
  filters.value.search = '';
  currentPage.value = 1;
  // Use clean fetch method (no search)
  await blumStore.fetchBlumSets(1);
}

function handleAction({ item, rowId }: { item: MenuItem; rowId: string | number }) {
  if (item.value === 'update') {
    const setToUpdate = data.value.find(blumSet => blumSet.id === Number(rowId));
    if (setToUpdate) {
      selectedSet.value = setToUpdate;
      // Use setTimeout to ensure the set is set before opening the modal
      setTimeout(() => {
        showUpdateModal.value = true;
      }, 0);
    }
  } else if (item.value === 'view') {
    selectedSetId.value = Number(rowId);
    showViewModal.value = true;
  } else if (item.value === 'delete') {
    const setToDelete = data.value.find(blumSet => blumSet.id === Number(rowId));
    if (setToDelete) {
      void handleDeleteSet(setToDelete);
    }
  }
}

async function handleSetAdded() {
  // Refresh sets after adding a new one, maintaining current search
  if (filters.value.search && filters.value.search.trim()) {
    await blumStore.searchBlumSets(filters.value.search);
  } else {
    await blumStore.fetchBlumSets(currentPage.value);
  }
}

async function handleSetUpdated() {
  // Clear selected set and close modal
  selectedSet.value = undefined;
  showUpdateModal.value = false;

  // Refresh sets after updating, maintaining current search
  if (filters.value.search && filters.value.search.trim()) {
    await blumStore.searchBlumSets(filters.value.search);
  } else {
    await blumStore.fetchBlumSets(currentPage.value);
  }
}

async function handleDeleteSet(set: BlumSet) {
  // Show confirmation dialog before deleting
  const confirmed = confirm(t('blum.confirmDeleteSet', { name: set.name }));
  if (confirmed) {
    const success = await blumStore.deleteBlumSet(set.id);
    if (success) {
      // Refresh sets after deleting, maintaining current search
      if (filters.value.search && filters.value.search.trim()) {
        await blumStore.searchBlumSets(filters.value.search);
      } else {
        await blumStore.fetchBlumSets(currentPage.value);
      }
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Fetch both sets and items (items needed for dropdown in add/edit)
  if (blumStore.blumItems.length === 0) {
    await blumStore.fetchBlumItems();
  }
  await blumStore.fetchBlumSets();
});
</script>
