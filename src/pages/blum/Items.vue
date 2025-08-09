<template>
  <q-page class="q-pa-md">
    <!-- Header Card -->
    <Header :title="t('blum.title')" :subtitle="t('blum.sub')" icon="inventory_2" icon-size="3rem" icon-color="white"
      :show-waves="true" background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />

    <!-- Filters Section -->
    <Filter v-model:filters="filters" :filter-options="filterOptions" :search-label="t('blum.searchItemLabel')"
      :reset-label="t('blum.resetFilters')" @filter-change="handleFilterChange" @reset="resetFilters" />

    <!-- Items Table -->
    <QtableB show-bottom :user-type="me?.type!" :allowed-types="['admin', 'employee', 'accountant']"
      :hasExpandableRows="false" @menu-action="handleAction" :columns="columns" :rows="filteredData"
      :loading="blumStore.blumItemsLoading" :menuItems="menuItems" :pagination="pagination"
      @page-change="handlePageChange" @top-right-action="() => showAddModal = true"
      :top-right-title="t('blum.addNewItem')" />

    <!-- Modals -->
    <AddItem v-model="showAddModal" @item-added="handleItemAdded" />

    <UpdateItem v-model="showUpdateModal" :item="selectedItem" @item-updated="handleItemUpdated" @update:model-value="(value) => {
      showUpdateModal = value;
      if (!value) selectedItem = undefined;
    }" />

    <BlumItemDetailsModal v-model="showDetailsModal" :item-data="selectedItem || null" @update:model-value="(value) => {
      showDetailsModal = value;
      if (!value) selectedItem = undefined;
    }" />
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
import AddItem from 'src/components/blum/AddItem.vue';
import UpdateItem from 'src/components/blum/UpdateItem.vue';
import BlumItemDetailsModal from 'src/components/blum/BlumItemDetailsModal.vue';
import type { BlumItem } from 'src/types/blumTypes';
import type { MenuItem } from 'src/types';

// Stores
const blumStore = useBlumStore();
const { me } = useMeStore();
const { t } = useI18n();

// State
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showDetailsModal = ref(false);
const selectedItem = ref<BlumItem | undefined>(undefined);
const currentPage = ref(1);

// Filter state
const filters = ref<FilterState>({
  search: ''
});

// Filter options
const filterOptions = computed(() => []);

// Menu items for row actions
const menuItems = [
  { label: t('common.details'), icon: 'visibility', value: 'details' },
  { label: t('blum.update'), icon: 'edit', value: 'update' },

];

// Table columns
const columns = [

  { name: 'code', align: 'left' as const, label: t('blum.item'), field: 'code', sortable: true },
  { name: 'part_no', align: 'left' as const, label: t('blum.partNumber'), field: 'part_no', sortable: true },
  { name: 'name', align: 'left' as const, label: t('blum.itemName'), field: 'name', sortable: true },
  {
    name: 'image',
    align: 'center' as const,
    label: t('blum.itemImage'),
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
const data = computed<BlumItem[]>(() => blumStore.blumItems);
const pagination = computed(() => {
  // Don't show pagination when searching since search returns all results
  if (filters.value.search && filters.value.search.trim()) {
    return null;
  }
  return blumStore.blumItemsPagination;
});

// No client-side filtering since we're doing server-side search
const filteredData = computed(() => data.value);

// Methods
async function handlePageChange(page: number) {
  currentPage.value = page;
  // Only use pagination for fetch, not for search
  if (filters.value.search && filters.value.search.trim()) {
    // Search doesn't use pagination, so just re-search
    await blumStore.searchBlumItems(filters.value.search);
  } else {
    await blumStore.fetchBlumItems(page);
  }
}

async function handleFilterChange() {
  // Reset to first page when searching
  currentPage.value = 1;
  // Use search method when we have a query (no pagination for search)
  if (filters.value.search && filters.value.search.trim()) {
    await blumStore.searchBlumItems(filters.value.search);
  } else {
    await blumStore.fetchBlumItems(1);
  }
}

async function resetFilters() {
  filters.value.search = '';
  currentPage.value = 1;
  // Use clean fetch method (no search)
  await blumStore.fetchBlumItems(1);
}

function handleAction({ item, rowId }: { item: MenuItem; rowId: string | number }) {
  if (item.value === 'details') {
    const itemToView = data.value.find(blumItem => blumItem.id === Number(rowId));
    if (itemToView) {
      selectedItem.value = itemToView;
      showDetailsModal.value = true;
    }
  } else if (item.value === 'update') {
    const itemToUpdate = data.value.find(blumItem => blumItem.id === Number(rowId));
    if (itemToUpdate) {
      selectedItem.value = itemToUpdate;
      // Use nextTick to ensure the item is set before opening the modal
      setTimeout(() => {
        showUpdateModal.value = true;
      }, 0);
    }
  } else if (item.value === 'delete') {
    const itemToDelete = data.value.find(blumItem => blumItem.id === Number(rowId));
    if (itemToDelete) {
      void handleDeleteItem(itemToDelete);
    }
  }
}

async function handleItemAdded() {
  // Refresh items after adding a new one, maintaining current search
  if (filters.value.search && filters.value.search.trim()) {
    await blumStore.searchBlumItems(filters.value.search);
  } else {
    await blumStore.fetchBlumItems(currentPage.value);
  }
}

async function handleItemUpdated() {
  // Clear selected item and close modal
  selectedItem.value = undefined;
  showUpdateModal.value = false;

  // Refresh items after updating, maintaining current search
  if (filters.value.search && filters.value.search.trim()) {
    await blumStore.searchBlumItems(filters.value.search);
  } else {
    await blumStore.fetchBlumItems(currentPage.value);
  }
}

async function handleDeleteItem(item: BlumItem) {
  // Show confirmation dialog before deleting
  const confirmed = confirm(t('blum.confirmDeleteItem', { name: item.name }));
  if (confirmed) {
    const success = await blumStore.deleteBlumItem(item.id);
    if (success) {
      // Refresh items after deleting, maintaining current search
      if (filters.value.search && filters.value.search.trim()) {
        await blumStore.searchBlumItems(filters.value.search);
      } else {
        await blumStore.fetchBlumItems(currentPage.value);
      }
    }
  }
}

// Lifecycle
onMounted(async () => {
  await blumStore.fetchBlumItems();
});
</script>
