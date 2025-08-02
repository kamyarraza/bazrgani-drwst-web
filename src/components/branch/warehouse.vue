<template>
  <div>
    <!-- Warehouses List View -->
    <div>
      <div class="warehouse-container" v-if="branch">
        <!-- Simple Header Section -->
        <div class="q-mb-md">
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-h6 text-weight-medium">
                <q-icon name="inventory" class="q-mr-sm" />
                {{ t('warehouse.branchWarehouses', 'Branch Warehouses') }}
              </div>
              <div class="text-subtitle2 text-grey-6">
                <b>{{ t('warehouse.branchName', 'Branch') }}: </b>
                <strong>{{ branch.name }}</strong>
                <q-chip color="primary" text-color="white" size="sm" class="q-ml-sm" icon="store">
                  {{ branch.code || 'N/A' }}
                </q-chip>
              </div>
            </div>

          </div>
        </div>

        <!-- Info Banner for Fast Navigation -->
        <q-banner inline-actions class="bg-blue-1 text-blue-8 q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="info" color="blue" />
          </template>
          <div class="text-weight-medium">{{ t('warehouse.fastNavigation', 'Fast Navigation') }}</div>
          <div class="text-caption">
            {{ t('warehouse.clickRowToViewItems', 'Click on any warehouse row to quickly view its items') }}
          </div>
        </q-banner>

        <div class="filter-container q-mb-md">
          <Filter @filter="handleFilter" class="warehouse-filter" />
        </div>

        <Qtable v-if="warehouseStore.branchWarehouses" :show-bottom="false" :menu-items="menuItems"
          :columns="warehouseColumns" :rows="warehouseStore.branchWarehouses.warehouses"
          :loading="warehouseStore.loading" row-key="id" class="warehouse-table" @menu-action="handleAction"
          :top-right="isAdmin || isUserBranch" :top-right-title="t('warehouse.addNew', 'Add Warehouse')"
          @top-right-action="handleAddWarehouse" :top-right-icon="'add_circle'" flat bordered>
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-chip :color="props.value ? 'positive' : 'negative'" text-color="white" size="sm">
                <q-icon :name="props.value ? 'check_circle' : 'cancel'" left />
                {{ props.value ? t('warehouse.active', 'Active') : t('warehouse.inactive', 'Inactive') }}
              </q-chip>
            </q-td>
          </template>
        </Qtable>

        <div class="warehouse-loading text-center q-pa-xl" v-else-if="warehouseStore.loading">
          <q-spinner color="primary" size="3rem" />
          <div class="text-subtitle1 q-mt-md">{{ t('common.loading', 'Loading...') }}</div>
        </div>

        <q-card v-else class="no-warehouses-card text-center q-pa-xl">
          <q-icon name="inventory_2" size="5rem" color="grey-4" />
          <div class="text-h6 q-mt-md">{{ t('warehouse.noWarehousesFound', 'No Warehouses Found') }}</div>
          <div class="text-subtitle1 q-mt-sm">
            {{ t('warehouse.createFirst', 'Create your first warehouse for this branch') }}
          </div>
          <q-btn v-if="isAdmin || isUserBranch" color="primary" class="q-mt-md" icon="add_circle"
            :label="t('warehouse.addNew', 'Add Warehouse')" @click="handleAddWarehouse" />
        </q-card>
      </div>

      <div class="warehouse-select-branch text-center q-pa-xl" v-if="!branch">
        <q-icon name="store" size="5rem" color="grey-4" />
        <div class="text-h6 q-mt-md">{{ t('warehouse.selectBranch', 'Select a Branch First') }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{ t('warehouse.selectBranchDesc', 'Please select a branch to view its warehouses') }}
        </div>
        <q-btn color="primary" class="q-mt-md" :icon="goBackIcon" :label="t('common.back', 'Go Back')"
          @click="$emit('go-back')" />
      </div>
    </div>

    <!-- Add Warehouse Modal -->
    <WarehouseAdd v-model="showAddWarehouseModal" :branch-id="branch?.id || 0" @submit="handleAddWarehouseSubmit" />

    <!-- Update Warehouse Modal -->
    <WarehouseUpdate v-if="warehouseToEdit" :branch_id="branch?.id || 0" v-model="showUpdateWarehouseModal"
      :warehouse="warehouseToEdit" @update="handleUpdateWarehouseSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { useMeStore } from 'src/stores/meStore';
import type { Branch } from 'src/types/branch';
import type { Warehouse } from 'src/types/warehouse';
import Qtable from 'src/components/common/Qtable.vue';
import Filter from 'src/components/common/Filter.vue';
import WarehouseAdd from './WarehouseAdd.vue';
import WarehouseUpdate from './WarehouseUpdate.vue';

const props = defineProps<{
  branch: Branch | null;
  selectedWarehouse: Warehouse | null;
}>();

const emit = defineEmits(['view-items', 'go-back', 'add-warehouse', 'edit-warehouse', 'toggle-active']);

const { t, locale } = useI18n();
const warehouseStore = useWarehouseStore();
const meStore = useMeStore();
const filter = ref('');
const showAddWarehouseModal = ref(false);
const showUpdateWarehouseModal = ref(false);
const warehouseToEdit = ref<Warehouse | null>(null);

// Check if user is admin
const isAdmin = computed(() => meStore.me?.type === 'admin');

// Check if current branch belongs to the employee user
const isUserBranch = computed(() => {
  const isEmployee = meStore.me?.type === 'employee';
  const userBranchId = meStore.me?.branch?.id;
  return isEmployee && userBranchId === props.branch?.id;
});

// Check if current locale is RTL
const isRTL = computed(() => {
  return locale.value === 'ckb' || locale.value === 'ar';
});

// Go back icon based on RTL direction
const goBackIcon = computed(() => {
  return isRTL.value ? 'arrow_forward' : 'arrow_back';
});

// Watch for branch changes to load warehouses
watch(() => props.branch, (newBranch) => {
  if (newBranch) {
    void loadWarehousesForBranch(newBranch.id);
  }
}, { immediate: true });

// Watch for filter changes
watch(filter, () => {
  if (props.branch) {
    void loadWarehousesForBranch(props.branch.id);
  }
});

// Load warehouses for a specific branch
async function loadWarehousesForBranch(branchId: number) {
  try {
    await warehouseStore.fetchBranchWarehouses(branchId);
  } catch (error) {
    console.error('Error loading warehouses:', error);
  }
}

// Handle filter changes
function handleFilter(filterText: string) {
  filter.value = filterText;
}

// Handle add warehouse button click
function handleAddWarehouse() {
  // Security check - only admin or employee of the current branch can add warehouses
  if (!isAdmin.value && !isUserBranch.value) {
    console.warn('Employee attempted to add warehouse to another branch');
    return;
  }

  if (props.branch) {
    showAddWarehouseModal.value = true;
  }
}

// Handle add warehouse submit
function handleAddWarehouseSubmit() {
  showAddWarehouseModal.value = false;
  // Refresh the warehouse list
  if (props.branch) {
    void loadWarehousesForBranch(props.branch.id);
  }
}

// Handle update warehouse submit
function handleUpdateWarehouseSubmit() {
  showUpdateWarehouseModal.value = false;
  warehouseToEdit.value = null;
  // Refresh the warehouse list
  if (props.branch) {
    void loadWarehousesForBranch(props.branch.id);
  }
}

// Menu items for warehouse actions - conditional based on user permissions
const menuItems = computed(() => {
  const baseItems = [
    {
      label: t('warehouse.viewItems', 'View Items'),
      icon: 'inventory',
      value: 'viewItems',
    }
  ];

  // Admin or employee can edit/manage warehouses only for their own branch
  if (isAdmin.value || isUserBranch.value) {
    baseItems.unshift(
      { label: t('common.edit', 'Edit'), icon: 'edit', value: 'edit' },
      {
        label: t('warehouse.toggleActive', 'Activate/Deactivate'),
        icon: 'swap_horiz',
        value: 'toggleActive',
      }
    );
  }

  return baseItems;
});

// Handle menu actions from Qtable
async function handleAction(payload: { item: { value: string }, rowId: number }) {
  const warehouse = warehouseStore.branchWarehouses?.warehouses.find(w => w.id === payload.rowId);
  if (!warehouse) return;

  // Security check for edit and toggle actions
  if (payload.item.value === 'edit' || payload.item.value === 'toggleActive') {
    // Only admin or employee of the current branch can edit/toggle warehouses
    if (!isAdmin.value && !isUserBranch.value) {
      console.warn('Employee attempted to edit warehouse of another branch');
      return;
    }
  }

  if (payload.item.value === 'edit') {
    warehouseToEdit.value = warehouse;
    showUpdateWarehouseModal.value = true;
  } else if (payload.item.value === 'toggleActive') {
    await handleToggleActive(warehouse.id);
  } else if (payload.item.value === 'viewItems') {
    emit('view-items', warehouse);
  }
}

// Handle toggle active
async function handleToggleActive(warehouseId: number) {
  try {
    void await warehouseStore.toggleWarehouseActive(warehouseId);
  } catch (error) {
    console.error('Error toggling warehouse status:', error);
  }
}

// Warehouse columns
const warehouseColumns = [
  {
    name: 'name',
    required: true,
    label: t('warehouse.name', 'Warehouse Name'),
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'code',
    required: true,
    label: t('warehouse.code', 'Code'),
    align: 'left' as const,
    field: 'code',
    sortable: true,
  },
  // {
  //   name: 'address',
  //   required: true,
  //   label: t('warehouse.address', 'Address'),
  //   align: 'left' as const,
  //   field: 'address',
  //   sortable: true,
  // },
  {
    name: 'capacity',
    required: true,
    label: t('warehouse.capacity', 'Capacity'),
    align: 'right' as const,
    field: 'capacity',
    sortable: true,
  },


  {
    name: 'is_active',
    required: true,
    label: t('common.status', 'Status'),
    align: 'center' as const,
    field: 'is_active',
    sortable: true,
    format: (_value: unknown, _row: Record<string, unknown>) => _value ? '✓' : '✗'
  },
  // {
  //   name: 'created_at',
  //   required: true,
  //   label: t('common.createdAt', 'Created At'),
  //   align: 'left' as const,
  //   field: 'created_at',
  //   format: (val: unknown, _row: Record<string, unknown>) =>
  //     date.formatDate(val as string, 'MMM YYYY'),
  //   sortable: true,
  // },
  {
    name: 'actions',
    required: true,
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];
</script>

<style lang="scss" scoped>
.warehouse-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
}

// Enhanced content styling
.filter-container {
  border-radius: 4px;
  padding: 12px;
}

// Table styling
.warehouse-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.q-table th) {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.03);
}

:deep(.q-table tr:hover) {
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
}

:deep(.q-table tbody tr) {
  transition: background 0.2s ease;
}

:deep(.q-table tbody tr:hover) {
  background: rgba(25, 118, 210, 0.04);
  cursor: pointer;
}

// Enhanced loading and empty states
.warehouse-loading,
.no-warehouses-card,
.warehouse-select-branch {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
  transition: all 0.3s ease;

  &:hover {
    border-color: #94a3b8;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}

.warehouse-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  .text-subtitle1 {
    color: #64748b;
    font-weight: 500;
  }
}

// Responsive design
@media (max-width: 768px) {
  .warehouse-container {
    gap: 16px;
  }

  .warehouse-header {
    padding: 24px 20px;
  }

  .header-title {
    font-size: 24px;
  }

  .header-subtitle {
    font-size: 14px;
  }
}
</style>
