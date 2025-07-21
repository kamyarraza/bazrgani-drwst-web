<template>
    <q-page class="q-pa-md">
        <!-- Permission Check -->
        <UnauthorizedAccess
            v-if="!canAccessAccountantSection()"
            :message="$t('error.unauthorized.accountantSection')"
        />

        <template v-else>
            <!-- Accountant Dashboard Header Card -->
            <Header
                :title="t('accountant.dashboardTitle')"
                :subtitle="t('accountant.managingUsers')"
                icon="account_balance_wallet"
                icon-size="3rem"
                icon-color="white"
                :show-waves="true"
                background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
            />

            <!-- Filters Section -->
            <Filter v-model:filters="filters" :filter-options="filterOptions"
                :search-label="t('accountant.searchLabel', 'Search by name or username')"
                :reset-label="t('accountant.resetFilters', 'Reset')" @filter-change="handleFilterChange"
                @reset="resetFilters" />

            <!-- Accountant Table -->
            <QtableB show-bottom :hasExpandableRows="true" @menu-action="handleAction" :columns="columns" :rows="filteredData"
                @top-right-action="() => showModal = !showModal" :top-right-title="t('accountant.addNew')"
                :menuItems="menuItems" :loading="accountantStore.loading" :pagination="pagination" @page-change="handlePageChange">
            </QtableB>

            <!-- Add/Update Modals -->
            <Add v-model="showModal"></Add>
            <Update v-model="showUpdateModal" v-if="accountantToUpdate" :accountant="accountantToUpdate"></Update>
            <Update v-model="showUpdateModal" v-else></Update>
        </template>
    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import Add from 'src/components/accountant/Add.vue'
import Update from 'src/components/accountant/Update.vue'
import Filter, { type FilterState } from 'src/components/common/Filter.vue'
import UnauthorizedAccess from 'src/components/common/UnauthorizedAccess.vue'
import { ref, computed, onMounted } from 'vue'
import type { MenuItem } from 'src/types'
import { usePermissions } from 'src/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import { useAccountantStore } from 'src/stores/accountantStore'
import type { Accountant } from 'src/types/accountant'
import type { Column } from 'src/types'

const { t } = useI18n()
const accountantStore = useAccountantStore()
const { canAccessAccountantSection } = usePermissions()

const showModal = ref(false)
const showUpdateModal = ref(false)
const accountantToUpdate = ref<Accountant | undefined>()

// Use accountantStore's data instead of sample data
const accountantData = computed(() => accountantStore.accountants)
const pagination = computed(() => accountantStore.pagination)
const currentPage = ref(1)

// Filter states
const filters = ref<FilterState>({
    search: ''
})

// Filter options
const filterOptions = computed(() => [])

// Table columns
const columns = computed(() => [
    {
        name: 'name',
        align: 'left' as const,
        label: t('accountant.name', 'Name'),
        field: 'name',
        sortable: true
    },
    {
        name: 'username',
        align: 'left' as const,
        label: t('accountant.username', 'Username'),
        field: 'username',
        sortable: true
    },
    {
        name: 'phone',
        align: 'left' as const,
        label: t('accountant.phone', 'Phone'),
        field: 'phone',
        sortable: false
    },
    {
        name: 'gender',
        align: 'left' as const,
        label: t('accountant.gender', 'Gender'),
        field: 'gender',
        sortable: true
    },
    {
        name: 'actions',
        align: 'right' as const,
        label: t('accountant.actions', 'Actions'),
        field: 'actions',
        sortable: false
    }
] as Column[])

// Menu items for row actions
const menuItems = computed(() => {
    return [
        {
            label: t('common.edit', 'Edit'),
            icon: 'edit',
            value: 'edit'
        },
        {
            label: t('common.delete', 'Delete'),
            icon: 'delete',
            value: 'delete'
        }
    ] as MenuItem[]
})

// Filter handling
const filteredData = computed(() => {
    let result = [...accountantData.value]

    // Apply search filter only
    if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        result = result.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.username.toLowerCase().includes(searchTerm)
        )
    }
    return result
})

// Action handlers
 function handleAction({ item, rowId }: { item: MenuItem; rowId: number }) {
    if (item.value === 'edit') {
        accountantToUpdate.value = accountantData.value.find(a => a.id === rowId)
        showUpdateModal.value = true
    } else if (item.value === 'delete') {
        // TODO: Implement delete functionality
    }
}

// Load accountants when the component is mounted
onMounted(async () => {
    await accountantStore.fetchAccountants()

    // Set current page from pagination if available
    if (accountantStore.pagination) {
        currentPage.value = accountantStore.pagination.current_page;
    }
})

// Handle page change for pagination
async function handlePageChange(page: number) {
    currentPage.value = page;
    // We're not resetting filters to maintain the user's filter state when paging
    await accountantStore.fetchAccountants(page);

    // Scroll to top when changing pages for better UX
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleFilterChange() {
    // This function will be triggered when filter changes
    // Nothing special to do here as the filteredData computed property handles it automatically
}

function resetFilters() {
    filters.value = {
        search: ''
    }
}
</script>
