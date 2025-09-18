<template>
  <div>
    <div class=" q-mb-md">
      <Filter @filter="handleFilter" class="branch-filter" />
    </div>

    <Qtable show-bottom :top-right="true" :menu-items="menuItems" :columns="columns" :rows="enhancedBranches"
      :loading="branchStore.loading" row-key="id" class="branch-table" @menu-action="handleAction"
      :top-right-title="t('branch.addNew', 'Add Branch')" :top-right-icon="'add_business'"
      @top-right-action="$emit('add-branch')" @handle-cashbox="ViewCashbox" @handle-warehouses="handleViewWarehouses"
      @handle-report="handleViewReport" :top-right-secondary-title="employeeCashboxTitle"
      @top-right-secondary-action="isEmployee ? handleViewCashbox : undefined"
      :top-right-secondary-icon="employeeCashboxIcon" :pagination="pagination" @page-change="handlePageChange" flat
      bordered :user-type="userType" :allowed-types="['admin']" :user-branch-id="userBranchId">
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
import { useRoute } from 'vue-router';
import { formatCurrency } from 'src/composables/useFormat';

const emit = defineEmits(['edit-branch', 'toggle-active', 'view-warehouses', 'add-branch', 'view-cashbox', 'view-report']);

const { t } = useI18n();
const branchStore = useBranchStore();
const meStore = useMeStore();
const filter = ref('');
const currentPage = ref(1);
const perPage = ref(10);

// Check if user is admin to show top-right button
const isAdmin = computed(() => meStore.me?.type === 'admin');

// Check if user is employee
const isEmployee = computed(() => meStore.me?.type === 'employee');

// Get user type for Qtable permissions
const userType = computed(() => meStore.me?.type || '');

// Get user's branch ID for cashbox access control
const userBranchId = computed(() => meStore.me?.branch?.id || null);

// Computed properties for employee cashbox button
const employeeCashboxTitle = computed(() => isEmployee.value ? t('branch.viewCashbox', 'View Cashbox') : '');
const employeeCashboxIcon = computed(() => isEmployee.value ? 'account_balance_wallet' : '');

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
  return () => {
    const baseItems = [
      {
        label: t('warehouse.viewWarehouses', 'View Warehouses'),
        icon: 'warehouse',
        value: 'viewWarehouses',
      },
      {
        label: t('branch.viewCashbox', 'View Cashbox'),
        icon: 'account_balance_wallet',
        value: 'viewCashbox',
      }
    ];

    // Only admins can view reports
    if (isAdmin.value) {
      baseItems.push({
        label: t('branch.viewReport', 'View Report'),
        icon: 'analytics',
        value: 'viewReport',
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
  {
    name: 'purchase_borrow',
    required: true,
    label: t('branch.purchaseBorrow', 'Purchase Borrow'),
    align: 'left' as const,
    field: (row: any) => parseFloat(row.purchase_borrow) > 0 ? formatCurrency(row.purchase_borrow) : '🌱',
    sortable: true,
    style: (val: any) => ({
      color: val.purchase_borrow > 0 ? '#dc2626' : '#374151',
      fontWeight: val.purchase_borrow > 0 ? '600' : '400',
      textShadow: val.purchase_borrow > 0 ? '0 0 8px rgba(239, 68, 68, 0.3)' : 'none'
    })
  },
  {
    name: 'sell_borrow',
    required: true,
    label: t('branch.sellBorrow', 'Sell Borrow'),
    align: 'center' as const,
    field: (row: any) => parseFloat(row.sell_borrow) > 0 ? formatCurrency(row.sell_borrow) : '🌷',
    sortable: true,
    style: (val: any) => ({
      color: val.sell_borrow > 0 ? '#8b5cf6' : '#374151',
      fontWeight: val.sell_borrow > 0 ? '600' : '400',
      textShadow: val.sell_borrow > 0 ? '0 0 6px rgba(139, 92, 246, 0.4)' : 'none'
    })
  },
  {
    name: 'warehouses',
    required: true,
    label: t('common.warehouses', 'Warehouses'),
    align: 'center' as const,
    field: 'warehouse',
    sortable: false,
  },
  {
    name: 'cashbox',
    required: true,
    label: t('common.cashbox', 'Cashbox'),
    align: 'center' as const,
    field: 'cashbox',
    sortable: false,
  },
  {
    name: 'report',
    required: true,
    label: t('branch.report', 'Report'),
    align: 'center' as const,
    field: 'report',
    sortable: false,
  },
  {
    name: 'actions',
    required: true,
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
].filter(col => {
  // Only show actions column for admins
  if (col.name === 'actions') {
    return isAdmin.value;
  }
  // Only show report column for admins
  if (col.name === 'report') {
    return isAdmin.value;
  }
  return true;
});


const ViewCashbox = (rowId: number) => {
  const branch = branches.value.find(b => b.id === rowId);
  if (!branch) return;

  // Security check for cashbox access
  const isEmployee = meStore.me?.type === 'employee';
  const userBranchId = meStore.me?.branch?.id;
  const isUserBranch = isEmployee && userBranchId === branch.id;

  // Employees can only access their own branch's cashbox
  if (isEmployee && !isUserBranch) {
    console.warn('Employee attempted to access cashbox of another branch');
    return;
  }

  emit('view-cashbox', branch);
}
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

// Handle view cashbox button click (for employee top-right button)
function handleViewCashbox() {
  // Find the user's branch to view its cashbox
  const userBranchId = meStore.me?.branch?.id;
  if (userBranchId) {
    const userBranch = branches.value.find(b => b.id === userBranchId);
    if (userBranch) {
      emit('view-cashbox', userBranch);
    }
  }
}

// Handle view warehouses button click (for employee top-right button)
function handleViewWarehouses(branchId: number) {
  const userBranch = branches.value.find(b => b.id === branchId);
  if (userBranch) {
    emit('view-warehouses', userBranch);
  }
}

// Handle view report button click
function handleViewReport(branchId: number) {
  const branch = branches.value.find(b => b.id === branchId);
  if (branch) {
    emit('view-report', branch);
  }
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

  // Security check for report access - only admins
  if (payload.item.value === 'viewReport') {
    if (!isAdmin.value) {
      console.warn('Non-admin user attempted to access branch report');
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
  } else if (payload.item.value === 'viewReport') {
    emit('view-report', branch);
  }
}


const route = useRoute()

function checkRouteParam() {
  // Only for non-admin users
  if (!isAdmin.value) {
    // Look for the query parameter to show cashbox
    if (route.query['show-my-cashbox'] === 'true') {
      // Show cashbox for employee's branch
      handleViewCashbox();
    }

    // Show warehouses for employee's branch
    if (route.query['show-my-warehouses'] === 'true') {
      handleViewWarehouses(meStore.me?.branch?.id || 0);
    }
  }
}

// Run immediately when component is created
checkRouteParam()

// React every time route (or query params) change
watch(
  () => route.query,
  () => checkRouteParam()
)
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
