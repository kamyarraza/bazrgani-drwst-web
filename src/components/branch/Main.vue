<template>
  <div>
    <div class=" q-mb-md">
      <Filter @filter="handleFilter" class="branch-filter" />
    </div>

    <Qtable show-bottom :top-right="isAdmin" :menu-items="menuItems" :columns="columns" :rows="enhancedBranches"
      :loading="branchStore.loading" row-key="id" class="branch-table" @menu-action="handleAction"
      :top-right-title="t('branch.addNew', 'Add Branch')" :top-right-icon="'add_business'"
      @top-right-action="$emit('add-branch')" :pagination="pagination" @page-change="handlePageChange" flat bordered
      :user-type="userType" :allowed-types="['admin']">
    </Qtable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
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
watch(filter, async () => {
  currentPage.value = 1; // Reset to first page when filter changes
  await fetchBranches();
  await applyBranchHighlighting();
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
  return (row: any) => {
    const baseItems = [
      {
        label: t('warehouse.viewWarehouses', 'View Warehouses'),
        icon: 'inventory',
        value: 'viewWarehouses',
      }
    ];

    // Cashbox access rules:
    // - Admin: Can access all branches' cashboxes
    // - Employee: Can only access their own branch's cashbox
    const isEmployee = meStore.me?.type === 'employee';
    const userBranchId = meStore.me?.branch?.id;
    const isUserBranch = isEmployee && userBranchId === row.id;

    if (isAdmin.value || isUserBranch) {
      baseItems.push({
        label: t('branch.viewCashbox', 'View Cashbox'),
        icon: 'account_balance_wallet',
        value: 'viewCashbox',
      });
    }

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
  };
});

// Get branches from the store with filter applied
const branches = computed(() => branchStore.branches);

// Enhanced branches with highlighting metadata
const enhancedBranches = computed(() => {
  const isEmployee = meStore.me?.type === 'employee';
  const userBranchId = meStore.me?.branch?.id;

  return branches.value.map(branch => {
    const isUserBranch = isEmployee && userBranchId === branch.id;
    return {
      ...branch,
      name: isUserBranch ? `🏠 ${branch.name}` : branch.name,
      _isUserBranch: isUserBranch,
      _originalName: branch.name
    };
  });
});

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
  // {
  //   name: 'location',
  //   required: true,
  //   label: t('branch.location', 'Location'),
  //   align: 'left' as const,
  //   field: (row: any) => row.location?.name || 'N/A',
  //   sortable: true,
  // },
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

// Function to apply highlighting to user's branch row
const applyBranchHighlighting = async () => {
  await nextTick();
  const tableRows = document.querySelectorAll('.branch-table tbody tr');
  tableRows.forEach((row) => {
    const nameCell = row.querySelector('td:nth-child(2)'); // Assuming name is second column after index
    if (nameCell && nameCell.textContent?.includes('🏠')) {
      (row as HTMLElement).style.background = 'rgba(76, 175, 80, 0.1)';
      (row as HTMLElement).style.borderLeft = '4px solid #4caf50';
      row.classList.add('employee-branch-highlight');
    }
  });
};

// Watch for changes in enhancedBranches and apply highlighting
watch(enhancedBranches, applyBranchHighlighting, { flush: 'post' });

// Also apply highlighting after component mounts and fetch data
onMounted(async () => {
  // Ensure user data is loaded first
  if (!meStore.me) {
    await meStore.fetchMe();
  }

  // Fetch branches when the component is mounted
  await fetchBranches();
  await applyBranchHighlighting();

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
  await applyBranchHighlighting();

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

  // Security check for cashbox access
  if (payload.item.value === 'viewCashbox') {
    const isEmployee = meStore.me?.type === 'employee';
    const userBranchId = meStore.me?.branch?.id;
    const isUserBranch = isEmployee && userBranchId === branch.id;

    // Employees can only access their own branch's cashbox
    if (isEmployee && !isUserBranch) {
      console.warn('Employee attempted to access cashbox of another branch');
      return;
    }
  }

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

// Highlighting for employee's branch
:deep(.employee-branch-highlight) {
  background: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
}

:deep(.employee-branch-highlight:hover) {
  background: rgba(76, 175, 80, 0.15);
}

// Target rows containing the house emoji (user's branch)
:deep(.q-table tbody tr:has(td:first-child:contains("🏠"))) {
  background: rgba(76, 175, 80, 0.1) !important;
  border-left: 4px solid #4caf50 !important;
}

:deep(.q-table tbody tr:has(td:first-child:contains("🏠")):hover) {
  background: rgba(76, 175, 80, 0.15) !important;
}

// Alternative CSS selector for browsers that don't support :has()
:deep(.q-table tbody tr td:contains("🏠")) {
  background: rgba(76, 175, 80, 0.05);
}

:deep(.q-table tbody tr:contains("🏠")) {
  background: rgba(76, 175, 80, 0.1) !important;
  border-left: 4px solid #4caf50 !important;
}
</style>
