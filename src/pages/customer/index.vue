<template>
    <q-page class="q-pa-md">
        <!-- Customer Dashboard Header Card -->
        <Header
            :title="t('customer.dashboardTitle')"
            :subtitle="t('customer.managingCustomers')"
            icon="people"
            icon-size="3rem"
            icon-color="white"
            :show-waves="true"
            background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
        />
        <!-- Sticky Notes Overlay (absolute, not in normal flow) -->
        <div class="sticky-notes-overlay">
            <div v-for="(note, idx) in notes" :key="note.id" style="margin-bottom: 12px;">
                <Note :model-value="note" @update:model-value="val => { notes[idx] = { ...notes[idx], ...val } }" @close="removeNote(note.id)" />
            </div>
        </div>
        <!-- Filters Section -->
        <Filter v-model:filters="filters" :filter-options="filterOptions"
            :search-label="t('customer.searchLabel', 'Search by name or phone')"
            :reset-label="t('customer.resetFilters', 'Reset')" @filter-change="handleFilterChange" @reset="resetFilters" />

        <!-- Customer Table with Enhanced UI -->
        <QtableB
        show-bottom
            :hasExpandableRows="true"
            @menu-action="handleAction"
            :columns="columns"
            :rows="filteredData"
            :loading="customerStore.loading"
            :menuItems="menuItems"
            @top-right-action="() => showModal = !showModal"
            :top-right-title="t('customer.addNew')"
            :pagination="pagination"
            @page-change="handlePageChange"
        >
        </QtableB>

        <Add v-model="showModal"></Add>
        <Update v-model="showUpdateModal" v-if="customerToUpdate" :customer="customerToUpdate"></Update>
        <Update v-model="showUpdateModal" v-else></Update>

        <!-- New User Account Modal -->
        <NewUserComponent
            v-model="showNewUserModal"
            :userData="newUserData"
        />
    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import Add from 'src/components/customer/Add.vue'
import Update from 'src/components/customer/Update.vue'
import NewUserComponent from 'src/components/customer/NewUserComponent.vue'
import { useCustomerStore } from 'src/stores/customerStore'
import { ref, computed, onMounted, reactive } from 'vue'
import type { MenuItem } from 'src/types'
import type { Customer } from 'src/types/customer'
import { useI18n } from 'vue-i18n'
import Filter, { type FilterState } from 'src/components/common/Filter.vue'
import Note from 'src/components/common/Note.vue'
import { date } from 'quasar'

// declaration
const customerStore = useCustomerStore()
const { t } = useI18n()

// variables
const data = computed<Customer[]>(() => customerStore.customers)
const pagination = computed(() => customerStore.pagination)
const currentPage = ref(1)
const showModal = ref(false)
const showUpdateModal = ref(false)
const customerToUpdate = ref<Customer>()

// New user modal state
const showNewUserModal = ref(false)
const newUserData = ref<{
  user: {
    id: number;
    name: string;
    username: string;
    password: string;
  };
  customer: Customer;
} | null>(null)

// Filter states
const filters = ref<FilterState>({
    search: '',
    type: null
})

// Filter options for the Filter component
const filterOptions = computed(() => [
    {
        field: 'type',
        label: t('customer.typeFilter'),
        options: [
            { label: t('customer.customer'), value: 'customer' },
            { label: t('customer.supplier'), value: 'supplier' }
        ],
        icon: 'filter_list'
    }
])

// Menu items for row actions
const menuItems = [
    { label: t('customer.update'), icon: 'edit', value: 'update' },
    { label: t('customer.viewDetails'), icon: 'visibility', value: 'view' },
    { label: t('customer.createAccount'), icon: 'person_add', value: 'createAccount' },
]

// Filtered data based on search and filters
const filteredData = computed(() => {
    return data.value.filter(customer => {
        // Search filter - search in combined name and phone
        const fullName = `${customer.fname} ${customer.sname}`.toLowerCase();
        const searchMatch = !filters.value.search ||
            fullName.includes(filters.value.search.toLowerCase()) ||
            customer.fphone.toLowerCase().includes(filters.value.search.toLowerCase())

        // Type filter
        const typeMatch = !filters.value.type || customer.type === filters.value.type

        return searchMatch && typeMatch
    })
})

// Reset all filters
function resetFilters() {
    filters.value = {
        search: '',
        type: ''
    }
}

// Handle filter changes from Filter component
function handleFilterChange(_newFilters: { search?: string; type?: string | null }) {
}

const columns = [{
    name: 'fname',
    label: t('customer.columns.name'),
    align: "left" as const,
    field: 'fname',
    sortable: true
},
{
    name: 'type',
    label: t('customer.columns.type'),
    align: "center" as const,
    field: 'type',
    sortable: true
},
{
    name: 'phone',
    label: t('customer.columns.phone'),
    align: "left" as const,
    field: 'fphone',
    sortable: false
},
{
    name: 'place',
    label: t('customer.columns.place'),
    align: "left" as const,
    field: 'place',
    sortable: false
},
{
    name: 'location',
    label: t('customer.columns.location'),
    align: "left" as const,
    field: (row: Record<string, unknown>) => (row.location as { name?: string })?.name || 'N/A',
    sortable: false
},
{
    name: 'created_at',
    label: t('customer.columns.createdAt'),
    align: "center" as const,
    field: 'created_at',
format: (val: unknown, _row: Record<string, unknown>) =>
 date.formatDate(val as string, 'dddd, MMMM D, YYYY • h:mm A'),

    sortable: true
},
{
    name: 'actions',
    label: t('common.actions'),
    align: "center" as const,
    field: 'actions',
    sortable: false
}]

// computed
const selectedCustomer = (id: string | number) => {
    return customerStore.customers.find((item) => item.id === Number(id))
}

// methods
const handleAction = async (payload: { item: MenuItem; rowId: string | number }) => {
    try {
        const customer = selectedCustomer(payload.rowId)

        if (!customer) return

        if (payload.item.value === 'update') {
            customerToUpdate.value = customer
            showUpdateModal.value = true
        } else if (payload.item.value === 'createAccount') {
           await handleCreateAccount(payload.rowId.toString())
        }
    } catch (error) {
        console.error(t('customer.fetchError'), error)
    }
}

async function handleCreateAccount(customerId: string) {
    const result = await customerStore.createCustomerAccount(customerId)
    if (result) {
        // The API now returns { user, password } instead of user.password
        const { user, password, customer } = result
        // Attach password to user for NewUserComponent
        newUserData.value = { user: { ...user, password }, customer }
        showNewUserModal.value = true
    }
}

// Notes state
const notes = reactive<Array<{ id: number; title: string; content: string }>>([])


function removeNote(id: number) {
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) notes.splice(idx, 1)
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  currentPage.value = page;
  // We're not resetting filters to maintain the user's filter state when paging
  await customerStore.fetchCustomers(page);

  // Scroll to top when changing pages for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// hooks
onMounted(async () => {
    // Fetch customer data when the component is mounted
    await customerStore.fetchCustomers()

    // Set current page from pagination if available
    if (customerStore.pagination) {
        currentPage.value = customerStore.pagination.current_page
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

.text-h2, .text-h5.text-weight-bold.countup {
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
.sticky-notes-overlay > div {
    pointer-events: auto;
}

// Pagination styles
.q-pagination {
    margin-top: 16px;
    .q-btn {
        min-width: 36px;
        min-height: 36px;
        font-weight: 500;
    }
}
</style>
