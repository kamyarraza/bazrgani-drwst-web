<template>
    <q-page class="q-pa-md">
        <!-- Admin Dashboard Header Card -->
        <Header :title="t('admin.dashboardTitle')" :subtitle="t('admin.managingAdmins')" icon="admin_panel_settings"
            icon-size="3rem" icon-color="white" :show-waves="true"
            background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />

        <!-- Sticky Notes Overlay (absolute, not in normal flow) -->
        <div class="sticky-notes-overlay">
            <div v-for="(note, idx) in notes" :key="note.id" style="margin-bottom: 12px;">
                <Note :model-value="note" @update:model-value="val => { notes[idx] = { ...notes[idx], ...val } }"
                    @close="removeNote(note.id)" />
            </div>
        </div>
        <!-- Filters Section -->
        <Filter v-model:filters="filters" :filter-options="filterOptions"
            :search-label="t('admin.searchLabel', 'Search by name or username')"
            :reset-label="t('admin.resetFilters', 'Reset')" @filter-change="handleFilterChange" @reset="resetFilters" />

        <!-- Search Results Info -->
        <div v-if="isSearching" class="q-mb-md">
            <q-card flat class="bg-blue-1 q-pa-md">
                <div class="row items-center">
                    <q-icon name="search" color="primary" class="q-mr-sm" />
                    <span class="text-body2">
                        {{ t('admin.searchResults', 'Search results for') }}:
                        <strong>"{{ filters.search }}"</strong>
                        ({{ data.length }} {{ t('admin.adminsFound', 'admins found') }})
                    </span>
                    <q-space />
                    <q-btn flat round icon="close" size="sm" @click="clearSearch"
                        :title="t('admin.clearSearch', 'Clear search')" />
                </div>
            </q-card>
        </div>

        <!-- Admin Table with Enhanced UI -->
        <QtableB show-bottom :user-type="me?.type!" :allowed-types="['admin']" :hasExpandableRows="false"
            @menu-action="handleAction" :columns="columns" :rows="filteredData" :loading="adminStore.loading"
            :menuItems="menuItems" :pagination="pagination" @page-change="handlePageChange"
            @top-right-action="() => showModal = !showModal" :top-right-title="t('admin.addNew')">

        </QtableB>



        <Add v-model="showModal"></Add>
        <Update v-model="showUpdateModal" v-if="userToUpdate" :admin="userToUpdate"></Update>
        <Update v-model="showUpdateModal" v-else></Update>
    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import Add from 'src/components/admin/Add.vue'
import Update from 'src/components/admin/Update.vue'
import { useAdminStore } from 'src/stores/adminStore'
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import type { MenuItem } from 'src/types'
import { useI18n } from 'vue-i18n'
import Filter, { type FilterState } from 'src/components/common/Filter.vue'
import Note from 'src/components/common/Note.vue'
import type { AdminForm } from 'src/types/admin'
import { useMeStore } from 'src/stores/meStore'
import { formatPhoneNumber } from 'src/composables/useFormat'
const { me } = useMeStore()
// decleration
const adminStore = useAdminStore()
const { t } = useI18n()

// variables
const data = computed<AdminForm[]>(() => adminStore.admins)
const pagination = computed(() => adminStore.pagination)
const currentPage = ref(1)
const showModal = ref(false)
const showUpdateModal = ref(false)
const userToUpdate = ref<AdminForm>()

// Filter states
const filters = ref<FilterState>({
    search: ''
})

// Debounce timer for search
let searchTimeout: NodeJS.Timeout | null = null

// Check if we're currently in search mode
const isSearching = computed(() => {
    return filters.value.search?.trim() !== ''
})

// Filter options for the Filter component
const filterOptions = computed(() => [])

// Menu items for row actions
const menuItems = [
    { label: t('admin.update'), icon: 'edit', value: 'update' },

]

// Filtered data based on search and filters
const filteredData = computed(() => {
    return data.value
})

// Reset all filters
function resetFilters() {
    // Clear any pending search
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

    filters.value = {
        search: ''
    }

    // Reset to first page and fetch normal items (not search)
    currentPage.value = 1;
    void adminStore.fetchAdmins(1)
}

// Clear search and reset to regular view
function clearSearch() {
    // Clear any pending search
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

    filters.value.search = ''

    // Reset to first page and fetch normal items
    currentPage.value = 1;
    void adminStore.fetchAdmins(1)
}

// Handle filter changes from Filter component
function handleFilterChange(newFilters: { search?: string }) {
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
        await adminStore.searchAdmins(searchQuery)
    } else {
        // If search is empty, fetch normal paginated items
        currentPage.value = 1
        await adminStore.fetchAdmins(1)
    }
}

const columns = [
    {
    name: 'image',
    label: t('admin.columns.profile'),
    align: "center" as const,
    field: 'image',
    sortable: false
},
{
    name: 'name',
    label: t('admin.columns.name'),
    align: "left" as const,
    field: 'name',
    sortable: true
},
{
    name: 'username',
    label: t('admin.columns.username'),
    align: "left" as const,
    field: 'username',
    sortable: true
},
    { name: 'last_activity', align: 'left' as const, label: t('employee.lastActivity'), field: 'last_activity', sortable: true },
{
    name: 'phone',
    label: t('admin.columns.phone'),
    align: "left" as const,
    field: (row: any) => formatPhoneNumber(row.phone) || 'N/A',
    sortable: true,
    style: "direction: ltr;"
},
{
    name: 'actions',
    label: t('admin.columns.actions'),
    align: "center" as const,
    field: 'actions',
    sortable: false
},
]

// computed
const selectedUser = (id: string | number) => {
    return adminStore.admins.find((item) => item.id === id)
}

// methods
const handleAction = (payload: { item: MenuItem; rowId: string | number }) => {
    showUpdateModal.value = !showUpdateModal.value
    const user = selectedUser(payload.rowId)
    userToUpdate.value = user
}

// Notes state
const notes = reactive<Array<{ id: number; title: string; content: string }>>([])

function removeNote(id: number) {
    const idx = notes.findIndex(n => n.id === id)
    if (idx !== -1) notes.splice(idx, 1)
}

// Handle page change for pagination
async function handlePageChange(page: number) {
    // Only allow pagination if we're not in search mode
    const searchQuery = filters.value.search?.trim()

    if (searchQuery) {
        // If we're in search mode, don't paginate
        return
    }

    currentPage.value = page;
    // We're not resetting filters to maintain the user's filter state when paging
    await adminStore.fetchAdmins(page);

    // Scroll to top when changing pages for better UX
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// hooks
onMounted(async () => {
    // Fetch admin data when the component is mounted
    await adminStore.fetchAdmins();

    // Set current page from pagination if available
    if (adminStore.pagination) {
        currentPage.value = adminStore.pagination.current_page;
    }
})

// Cleanup timeout on component unmount
onUnmounted(() => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
})
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

// Animation for statistics
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

.text-h2,
.text-h5.text-weight-bold.countup {
    font-size: 2rem !important;
    font-weight: 700;
    animation: countUp 0.5s ease-out forwards;
    margin-bottom: 0;
}

.q-card-section {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
}

// Sticky notes overlay style
.sticky-notes-overlay {
    position: fixed;
    top: 100px; // adjust as needed to be below header
    right: 32px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
}

.sticky-notes-overlay>div {
    pointer-events: auto;
}

// Pagination styles
.q-pagination {
    margin-top: 16px;

    .q-btn {
        min-width: 36px;
        min-height: 36px;
        font-weight: 500;
        border-radius: 6px;
        margin: 0 3px;
        color: var(--q-primary);

        &.q-btn--active {
            background: var(--q-primary) !important;
            color: white !important;
            transform: scale(1.05);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }

        &:hover:not(.q-btn--active) {
            background: rgba(var(--q-primary-rgb), 0.1) !important;
        }
    }
}
</style>
