<template>
  <div>
    <div class=" q-mb-md">
      <Filter @filter="handleFilter" class="branch-filter" />
    </div>

    <Qtable show-bottom :top-right="isAdmin" :menu-items="menuItems" :columns="columns" :rows="branches"
      :loading="branchStore.loading" row-key="id" class="branch-table" @menu-action="handleAction"
      :top-right-title="t('branch.addNew', 'Add Branch')" :top-right-icon="'add_business'"
      @top-right-action="$emit('add-branch')" :pagination="pagination" @page-change="handlePageChange" flat bordered
      :user-type="userType" :allowed-types="['admin']">
      <template #body-cell-is_active="props">
        <q-td :props="props">
          <q-chip :color="props.value ? 'positive' : 'negative'" text-color="white" size="sm">
            <q-icon :name="props.value ? 'check_circle' : 'cancel'" left />
            {{ props.value ? t('branch.active', 'Active') : t('branch.inactive', 'Inactive') }}
          </q-chip>
        </q-td>
      </template>
    </Qtable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Qtable from 'src/components/common/Qtable.vue';
import Filter from 'src/components/common/Filter.vue';
import { useBranchStore } from 'src/stores/branchStore';
import { useMeStore } from 'src/stores/meStore';

const emit = defineEmits(['edit-branch', 'toggle-active', 'view-warehouses', 'add-branch', 'view-cashbox']);

const { t } = useI18n();
const branchStore = useBranchStore();
const meStore = useMeStore();
const filter = ref('');
const currentPage = ref(1);
const perPage = ref(10);

// Check if user is admin to show top-right button
const isAdmin = computed(() => meStore.me?.type === 'admin');

// Get user type for Qtable permissions
const userType = computed(() => meStore.me?.type || '');

// Add pagination computed property
const pagination = computed(() => branchStore.pagination);

// Watch for filter changes
watch(filter, () => {
  currentPage.value = 1; // Reset to first page when filter changes
  void fetchBranches();
});

// Watch for pagination changes to sync currentPage
watch(() => branchStore.pagination, (newPagination) => {
  if (newPagination && newPagination.current_page !== currentPage.value) {
    currentPage.value = newPagination.current_page;
  }
}, { immediate: true });

// Fetch branches with filter
async function fetchBranches() {
  await branchStore.fetchBranches(currentPage.value);
}

// Menu items for branch actions - different for admin vs employee
const menuItems = computed(() => {
  const baseItems = [
    {
      label: t('warehouse.viewWarehouses', 'View Warehouses'),
      icon: 'inventory',
      value: 'viewWarehouses',
    },
    {
      label: t('branch.viewCashbox', 'View Cashbox'),
      icon: 'account_balance_wallet',
      value: 'viewCashbox',
    },
  ];

  // Only admins can edit and toggle active status
  if (isAdmin.value) {
    baseItems.unshift(
      { label: t('common.edit', 'Edit'), icon: 'edit', value: 'edit' },
      {
        label: t('branch.toggleActive', 'Activate/Deactivate'),
        icon: 'swap_horiz',
        value: 'toggleActive',
      }
    );
  }

  return baseItems;
});

// Get branches from the store with filter applied
const branches = computed(() => branchStore.branches);

// Table columns definition
const columns = [

  {
    name: 'name',
    required: true,
    label: t('branch.name', 'Branch Name'),
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    required: true,
    label: t('branch.code', 'Branch Code'),
    align: 'left' as const,
    field: 'code',
    sortable: true,
  },
  {
    name: 'location',
    required: true,
    label: t('branch.location', 'Location'),
    align: 'left' as const,
    field: (row: any) => row.location?.name || 'N/A',
    sortable: true,
  },
  {
    name: 'phone',
    required: true,
    label: t('branch.phone', 'Phone Number'),
    align: 'left' as const,
    field: 'phone',
    sortable: true,
  },
  {
    name: 'is_active',
    required: true,
    label: t('branch.status', 'Status'),
    align: 'center' as const,
    field: 'is_active',
    sortable: true,
    format: (_value: unknown, _row: Record<string, unknown>) => _value ? '✓' : '✗'
  },
  {
    name: 'actions',
    required: true,
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];

// Set pagination values on component mount and fetch data
onMounted(async () => {
  // Ensure user data is loaded first
  if (!meStore.me) {
    await meStore.fetchMe();
  }

  // Fetch branches when the component is mounted
  await fetchBranches();

  // Set current page from pagination if available
  if (branchStore.pagination) {
    currentPage.value = branchStore.pagination.current_page;
    perPage.value = branchStore.pagination.per_page;
  }
});

// Handle page change for pagination
async function handlePageChange(page: number) {
  currentPage.value = page;
  await fetchBranches();

  // Scroll to top when changing pages for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Handle filter changes
function handleFilter(filterText: string) {
  filter.value = filterText;
}

// Handle menu actions from Qtable
function handleAction(payload: { item: { value: string }, rowId: number }) {
  const branch = branches.value.find(b => b.id === payload.rowId);
  if (!branch) return;

  if (payload.item.value === 'edit') {
    emit('edit-branch', branch);
  } else if (payload.item.value === 'toggleActive') {
    emit('toggle-active', branch.id);
  } else if (payload.item.value === 'viewWarehouses') {
    emit('view-warehouses', branch);
  } else if (payload.item.value === 'viewCashbox') {
    emit('view-cashbox', branch);
  }
}
</script>

<style lang="scss" scoped>
// Filter container
.filter-container {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 12px;
}

// Table styling
.branch-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.q-table th) {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.03);
}

:deep(.q-table tr:hover) {
  background: rgba(0, 0, 0, 0.02);
}
</style>
