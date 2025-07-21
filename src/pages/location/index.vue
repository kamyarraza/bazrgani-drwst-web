<template>
    <q-page class="q-pa-md">
        <!-- Location Dashboard Header Card -->
        <Header
            :title="t('location.title', 'Location Management')"
            :subtitle="t('location.subtitle', 'Manage geographical locations in the system')"
            icon="place"
            icon-size="3rem"
            icon-color="white"
            :show-waves="true"
            background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
        />

        <!-- Filters Section -->
        <Filter v-model:filters="filters" :filter-options="filterOptions"
            :search-label="t('location.searchLabel', 'Search by name')"
            :reset-label="t('location.resetFilters', 'Reset')"
            @filter-change="handleFilterChange"
            @reset="resetFilters" />

        <!-- Location Table -->
        <QtableB
        show-bottom
            :hasExpandableRows="false"
            @menu-action="handleAction"
            :columns="columns"
            :rows="filteredData"
            @top-right-action="() => showModal = !showModal"
            :top-right-title="t('location.addNew', 'Add New Location')"
            :menuItems="menuItems"
            :loading="locationStore.loading"
            :pagination="pagination"
            @page-change="handlePageChange">
        </QtableB>

        <!-- Add/Update Modals -->
        <Add v-model="showModal"></Add>
        <Update v-model="showUpdateModal" v-if="locationToUpdate" :location="locationToUpdate"></Update>
        <Update v-model="showUpdateModal" v-else></Update>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Header from 'src/components/common/Header.vue';
import QtableB from 'src/components/common/Qtable.vue';
import Add from 'src/components/location/Add.vue';
import Update from 'src/components/location/Update.vue';
import { useLocationStore } from 'src/stores/locationStore';
import Filter, { type FilterState } from 'src/components/common/Filter.vue';
import type { Location } from 'src/types/Location';
import type { MenuItem } from 'src/types';
import type { Column } from 'src/types';

const { t } = useI18n();
const locationStore = useLocationStore();

// Variables
const showModal = ref(false);
const showUpdateModal = ref(false);
const locationToUpdate = ref<Location | undefined>();
const currentPage = ref(1);

// Computed values
const locationData = computed(() => locationStore.locations);
const pagination = computed(() => locationStore.pagination);

// Filter states
const filters = ref<FilterState>({
    search: ''
})

// Filter options
const filterOptions = computed(() => []);

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
    ] as MenuItem[];
});

// Table columns
const columns = computed(() => [
    {
        name: 'name',
        align: 'left' as const,
        label: t('location.name', 'Name'),
        field: 'name',
        sortable: true
    },
    {
        name: 'type',
        align: 'left' as const,
        label: t('location.type', 'Type'),
        field: 'type',
        sortable: true
    },
    {
        name: 'parent',
        align: 'left' as const,
        label: t('location.parent', 'Parent'),
        field: (row: Location) => row.parent && typeof row.parent === 'object' && 'name' in row.parent ? row.parent.name : 'N/A',
        sortable: false
    },
    {
        name: 'phone_code',
        align: 'left' as const,
        label: t('location.phoneCode', 'Phone Code'),
        field: 'phone_code',
        sortable: false
    },
    {
        name: 'timezone',
        align: 'left' as const,
        label: t('location.timezone', 'Timezone'),
        field: 'timezone',
        sortable: false
    },
    {
        name: 'actions',
        align: 'right' as const,
        label: t('location.actions', 'Actions'),
        field: 'actions',
        sortable: false
    }
] as Column[]);

// Lifecycle hooks
onMounted(async () => {
    try {
        await locationStore.fetchLocations();
    } catch (error) {
        console.error(t('location.fetchError'), error);
    }
});



// Action handlers
function handleAction({ item, rowId }: { item: MenuItem; rowId: number }) {
    if (item.value === 'edit') {
        locationToUpdate.value = locationData.value.find(a => a.id === rowId);
        showUpdateModal.value = true;
    } else if (item.value === 'delete') {
        // TODO: Implement delete functionality
    }
}

function handlePageChange(page: number) {
    currentPage.value = page;
    // We're not resetting filters to maintain the user's filter state when paging
    void locationStore.fetchLocations(page);

    // Scroll to top when changing pages for better UX
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleFilterChange() {
    // Filter is applied in the filteredData computed property
}

function resetFilters() {
    filters.value = {
        search: ''
    };
}

// Load locations when the component is mounted
onMounted(async () => {
    try {
        await locationStore.fetchLocations();

        // Set current page from pagination if available
        if (locationStore.pagination) {
            currentPage.value = locationStore.pagination.current_page;
        }
    } catch (error) {
        console.error(t('location.fetchError'), error);
    }
});

// Filter handling
const filteredData = computed(() => {
    let result = [...locationData.value];

    // Apply search filter only
    if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase();
        result = result.filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );
    }
    return result;
});
</script>

<style lang="scss" scoped>
.sticky-notes-overlay {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 1000;
    max-width: 300px;
    pointer-events: none;

    > div {
        pointer-events: auto;
    }
}
</style>
