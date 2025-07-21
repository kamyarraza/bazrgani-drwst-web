<template>
    <q-page class="q-pa-md">
        <!-- Item Dashboard Header Card -->
        <Header
            :title="t('item.dashboardTitle')"
            :subtitle="t('item.managingItems')"
            icon="inventory_2"
            icon-size="3rem"
            icon-color="white"
            :show-waves="true"
            background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
        >

        </Header>

        <!-- Filters Section -->
        <Filter v-model:filters="filters" :filter-options="filterOptions"
            :search-label="t('item.searchLabel', 'Search by name or SKU')"
            :reset-label="t('item.resetFilters', 'Reset')" @filter-change="handleFilterChange" @reset="resetFilters" />

        <!-- Search Results Info -->
        <div v-if="isSearching" class="q-mb-md">
            <q-card flat class="bg-blue-1 q-pa-md">
                <div class="row items-center">
                    <q-icon name="search" color="primary" class="q-mr-sm" />
                    <span class="text-body2">
                        {{ t('item.searchResults', 'Search results for') }}:
                        <strong>"{{ filters.search }}"</strong>
                        ({{ items.length }} {{ t('item.itemsFound', 'items found') }})
                    </span>
                    <q-space />
                    <q-btn
                        flat
                        round
                        icon="close"
                        size="sm"
                        @click="clearSearch"
                        :title="t('item.clearSearch', 'Clear search')"
                    />
                </div>
            </q-card>
        </div>

        <!-- Item Table with Enhanced UI -->
        <QtableB
        :show-bottom="!isSearching"
        :hasExpandableRows="false" @menu-action="handleAction" :columns="columns" :rows="filteredItems"
            @top-right-action="() => showModal = !showModal" :top-right-title="t('item.addNew', 'Add New Item')"
            :menuItems="menuItems" :loading="itemStore.loading" :pagination="pagination" @page-change="handlePageChange">

        </QtableB>

        <!-- Item Add/Update Modal Components -->
        <Add v-model="showModal"></Add>
        <Update v-model="showUpdateModal" v-if="itemToUpdate" :item="itemToUpdate"></Update>
        <Update v-model="showUpdateModal" v-else></Update>

        <!-- Item Details Modal -->
        <ItemDetailsModal v-model="showDetailsModal" :item-data="itemToView" />
    </q-page>
</template>

<script setup lang="ts">
import QtableB from 'src/components/common/Qtable.vue'
import Header from 'src/components/common/Header.vue'
import Add from 'src/components/item/Add.vue'
import Update from 'src/components/item/Update.vue'
import ItemDetailsModal from 'src/components/item/ItemDetailsModal.vue'
import { useItemStore } from 'src/stores/itemStore'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { MenuItem } from 'src/types'
import type { Product } from 'src/types/item'
import { useI18n } from 'vue-i18n'
import Filter, { type FilterState } from 'src/components/common/Filter.vue'

// declarations
const itemStore = useItemStore()
const { t } = useI18n()

// variables
const items = computed<Product[]>(() => itemStore.items)
const pagination = computed(() => itemStore.pagination)
const currentPage = ref(1)
const showModal = ref(false)
const showUpdateModal = ref(false)
const showDetailsModal = ref(false)
const itemToUpdate = ref<Product>()
const itemToView = ref<Product | null>(null)

// Filter states
const filters = ref<FilterState>({
    search: '',
    category: null
})

// Debounce timer for search
let searchTimeout: NodeJS.Timeout | null = null

// Check if we're currently in search mode
const isSearching = computed(() => {
    return filters.value.search?.trim() !== ''
})

// Get color for category badge
function _getCategoryColor(categoryName?: string): string {
    if (!categoryName) return 'grey'

    const categoryColors = {
        'Electronics': 'blue',
        'Clothing': 'purple',
        'Food & Beverages': 'green',
        'Home & Garden': 'orange'
    }

    return categoryColors[categoryName] || 'grey'
}

// Get class for profit margin display
function _getProfitClass(margin: number): string {
    if (margin >= 30) return 'text-positive font-weight-bold'
    if (margin >= 20) return 'text-primary'
    if (margin >= 10) return 'text-warning'
    return 'text-negative'
}

// Sample statistics for dashboard

// Filter options for the Filter component
const filterOptions = computed(() => [
    {
        field: 'category',
        label: t('item.categoryFilter', 'Filter by category'),
        options: categoryOptions.value.map(option => ({
            label: option.label || '',
            value: option.value || ''
        })),
        icon: 'category'
    }
])

// Get unique categories for filter dropdown
const categoryOptions = computed(() => {
    const categories = new Set(items.value.map(item => item.category?.name).filter(Boolean))
    return Array.from(categories).map(name => ({
        label: name,
        value: name
    }))
})

// Menu items for row actions
const menuItems = [
    { label: t('item.update'), icon: 'edit', value: 'update' },
    { label: t('item.details'), icon: 'visibility', value: 'view' },
    // { label: t('item.delete'), icon: 'delete', value: 'delete' }
]

// Since we're using server-side search, we'll display items directly from the store
// The filteredItems computed property is no longer needed for search filtering
const filteredItems = computed(() => {
    // Only apply client-side filters that aren't handled by the server
    return items.value.filter(item => {
        // Category filter (if not handled server-side)
        const categoryMatch = !filters.value.category ||
            item.category?.name === filters.value.category

        return categoryMatch
    })
})

// Handle filter changes from Filter component
function handleFilterChange(newFilters: { search?: string; category?: string | null }) {
    // Handle search with debouncing for better performance
    if (newFilters.search !== undefined) {
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        // Set new timeout for search
        searchTimeout = setTimeout(() => {
            void handleSearch()
        }, 500) // 500ms delay
    }
}

async function handleSearch() {
    const searchQuery = filters.value.search?.trim()

    if (searchQuery) {
        // Use dedicated search function for queries
        await itemStore.searchItems(searchQuery)
    } else {
        // If search is empty, fetch normal paginated items
        currentPage.value = 1
        await itemStore.fetchItems(1)
    }
}

function resetFilters() {
    // Clear any pending search
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

    filters.value = {
        search: '',
        category: null
    }

    // Reset to first page and fetch normal items (not search)
    currentPage.value = 1;
    void itemStore.fetchItems(1)
}

function clearSearch() {
    // Clear any pending search
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

    filters.value.search = ''

    // Reset to first page and fetch normal items
    currentPage.value = 1;
    void itemStore.fetchItems(1)
}

const columns = [{
    name: 'image',
    label: t('item.image', 'Image'),
    align: "center" as const,
    field: 'image',
    sortable: false
},
{
    name: 'name',
    label: t('item.name', 'Name'),
    align: "left" as const,
    field: 'name',
    sortable: true
},
{
    name: 'sku',
    label: t('item.sku', 'SKU'),
    align: "left" as const,
    field: 'sku',
    sortable: true
},
{
  name: 'category',
  label: t('item.category', 'Category'),
  align: 'center' as const,
  field: (row: Record<string, unknown>) =>
    (row.category as { name?: string })?.name || '',
  sortable: true
},

{
    name: 'unit_cost',
    label: t('item.cost', 'Cost'),
    align: "right" as const,
    field: 'unit_cost',
    format: val => `$${val}`,
    sortable: true
},

{
    name: 'total_quantity',
    label: t('item.totalQuantity', 'Total Quantity'),
    align: "center" as const,
    field: 'total_quantity',
    sortable: true
},
{
    name: 'actions',
    label: t('item.actions', 'Actions'),
    align: "center" as const,
    field: 'actions',
    sortable: false
}]

// Find selected item by ID
const selectedItem = (id: number) => {
    return items.value.find((item) => item.id === id)
}

// Handle menu actions for a row
const handleAction = (payload: { item: MenuItem; rowId: number }) => {
    const selectedAction = payload.item.value

    switch (selectedAction) {
        case 'update':
            itemToUpdate.value = selectedItem(payload.rowId)
            showUpdateModal.value = true
            break

        case 'delete':
            if (confirm(t('item.deleteConfirm', 'Are you sure you want to delete this item?'))) {
                try {
                    void itemStore.deleteItem(payload.rowId);
                    // You could also wait for it to complete:
                    // await itemStore.deleteItem(payload.rowId);
                } catch (error) {
                    console.error('Error deleting item:', error);
                }
            }
            break

        case 'view':
            itemToView.value = selectedItem(payload.rowId) || null
            showDetailsModal.value = true
            break
    }
}

// Fetch data when component is mounted
onMounted(async () => {
    await itemStore.fetchItems()

    // Set current page from pagination if available
    if (itemStore.pagination) {
        currentPage.value = itemStore.pagination.current_page;
    }
})

// Cleanup timeout on component unmount
onUnmounted(() => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
})

// Handle page change for pagination
async function handlePageChange(page: number) {
    // Only allow pagination if we're not in search mode
    const searchQuery = filters.value.search?.trim()

    if (searchQuery) {
        // If we're in search mode, don't paginate
        // You could show a message or disable pagination during search
        return
    }

    currentPage.value = page;
    await itemStore.fetchItems(page);

    // Scroll to top when changing pages for better UX
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
</script>

<style lang="scss" scoped>
.q-card {
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
}

.bg-primary {
    background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 92, 170, 1) 100%) !important;
}

.text-h4 {
    font-size: 2.2rem;
    font-weight: 700;
}

.text-caption {
    opacity: 0.9;
}

:deep(.q-table) {
    border-radius: 8px;
}

:deep(.q-table th) {
    font-weight: 600;
    background-color: rgba(0, 0, 0, 0.03);
}

:deep(.q-table tbody tr:hover) {
    background-color: rgba(25, 118, 210, 0.05);
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

.text-h4 {
    animation: countUp 0.5s ease-out forwards;
}
</style>
