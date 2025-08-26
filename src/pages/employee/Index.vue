<template>
    <q-page class="q-pa-md">
        <!-- Employee Dashboard Header Card -->
        <Header :title="t('employee.dashboardTitle', 'Employee Dashboard')"
            :subtitle="t('employee.managingUsers', 'Managing system employees')" icon="people" icon-size="3rem"
            icon-color="white" :show-waves="true"
            background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />

        <!-- Filters Section -->
        <Filter v-model:filters="filters" :filter-options="filterOptions"
            :search-label="t('employee.searchLabel', 'Search by name or username')"
            :reset-label="t('employee.resetFilters', 'Reset')" @filter-change="handleFilterChange"
            @reset="resetFilters" />

        <!-- Employee Table with Enhanced UI -->
        <QtableB show-bottom :hasExpandableRows="false" @menu-action="handleAction" :columns="columns"
            :rows="filteredData" :loading="employeeStore.loading" :menuItems="menuItems"
            @top-right-action="() => showModal = !showModal" :top-right-title="t('employee.addNew')"
            :pagination="pagination" @page-change="handlePageChange">
        </QtableB>
        <Add v-model="showModal"></Add>
        <Update v-model="showUpdateModal" :employee="userToUpdate!"></Update>
    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import Add from 'src/components/employee/Add.vue'
import Update from 'src/components/employee/Update.vue'
import Filter, { type FilterState } from 'src/components/common/Filter.vue'

import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore } from 'src/stores/employeeStore'

import { useI18n } from 'vue-i18n'
import type { MenuItem } from 'src/types'
import type { Employee } from 'src/types/employee'

// declarations
const employeeStore = useEmployeeStore()

const { t } = useI18n()

// variables
const data = computed<Employee[]>(() => employeeStore.employees)
const pagination = computed(() => employeeStore.pagination)
const currentPage = ref(1)
const showModal = ref(false)
const showUpdateModal = ref(false)
const userToUpdate = ref<Employee>()

// Filter states
const filters = ref<FilterState>({
    search: ''
})

// Filter options for the Filter component
const filterOptions = computed(() => [])

// Menu items for row actions
const menuItems = computed<MenuItem[]>(() => [
    { label: t('common.edit'), icon: 'edit', value: 'edit' },
    { label: t('common.delete'), icon: 'delete', value: 'delete' }
])

// Table columns definition
const columns = computed(() => [
    { name: 'image', align: 'left' as const, label: t('employee.image'), field: 'image', sortable: true },
    { name: 'name', align: 'left' as const, label: t('employee.name'), field: 'name', sortable: true },
    { name: 'username', align: 'left' as const, label: t('employee.username'), field: 'username', sortable: true },
    // { name: 'role', align: 'left' as const, label: t('employee.role'), field: 'role', sortable: true },
    { name: 'phone', align: 'left' as const, label: t('employee.phone'), field: 'phone', sortable: true },
    {
        name: 'branch',
        align: 'left' as const,
        label: t('employee.branch'),
        field: (row: Record<string, unknown>) => {
            const employee = row as unknown as Employee
            return employee.branch ? employee.branch.name : '-'
        },
        sortable: true
    },
    {
        name: 'gender',
        align: 'left' as const,
        label: t('employee.gender'),
        field: (row: Record<string, unknown>) => row.gender === 'Male' ? t('employee.male') : t('employee.female'),
        sortable: true
    },
    { name: 'actions', align: 'right' as const, label: t('common.actions'), field: () => '', sortable: false }
])

// Filtered data based on filters
const filteredData = computed(() => {
    return data.value.filter(employee => {
        // Search filter
        const searchMatch = !filters.value.search ||
            employee.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
            employee.username.toLowerCase().includes(filters.value.search.toLowerCase())

        return searchMatch
    })
})

// Lifecycle hooks
onMounted(async () => {
    await employeeStore.fetchEmployees()
})

// Methods
const handlePageChange = async (page: number) => {
    currentPage.value = page
    await employeeStore.fetchEmployees(page)
}

const handleAction = ({ item, rowId }: { item: MenuItem, rowId: string }) => {
    if (item.value === 'edit') {
        try {
            // Find the employee in the existing list (which already has branch data)
            const employeeData = employeeStore.employees.find(emp => emp.id === rowId);
            if (employeeData) {
                userToUpdate.value = employeeData;
                showUpdateModal.value = true;
            } else {
                console.error('Employee not found in the list');
            }
        } catch (error) {
            console.error(t('employee.fetchError', 'Failed to get employee details:'), error);
        }
    } else if (item.value === 'delete') {
        // Implement delete functionality if needed
    }
}


const handleFilterChange = (newFilters: FilterState) => {
    filters.value = newFilters
}

const resetFilters = () => {
    filters.value = {
        search: ''
    }
}

</script>

<style scoped>
.sticky-notes-overlay {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
</style>
