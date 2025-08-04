<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Branch Dashboard Header Card -->
      <Header :title="t('branch.title', 'Branches')" :subtitle="t('branch.subtitle', 'Manage all branch operations')"
        icon="store" icon-size="3rem" icon-color="white" :show-waves="true"
        background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />
      <!-- Main Content Card -->
      <q-card class="main-content-card q-mt-md">
        <q-card-section class="q-pa-none">
          <!-- Enhanced Tab Navigation -->
          <div class="tabs-container">
            <q-tabs v-model="activeTab" class="enhanced-tabs" active-color="primary" indicator-color="primary"
              align="justify" narrow-indicator no-caps>
              <q-tab name="branches" class="enhanced-tab">
                <div class="tab-content">
                  <q-icon name="store" size="20px" />
                  <span class="tab-label">{{ t('branch.allBranches', 'All Branches') }}</span>
                </div>
              </q-tab>

              <q-tab name="warehouse" class="enhanced-tab">
                <div class="tab-content">
                  <q-icon name="warehouse" size="20px" />
                  <span class="tab-label">{{ t('branch.warehouse', 'Warehouse') }}</span>
                </div>
              </q-tab>

              <q-tab name="warehouseItems" class="enhanced-tab">
                <div class="tab-content">
                  <q-icon name="inventory_2" size="20px" />
                  <span class="tab-label">{{ t('branch.warehouseItems', 'Warehouse Items') }}</span>
                </div>
              </q-tab>

              <q-tab name="cashbox" class="enhanced-tab">
                <div class="tab-content">
                  <q-icon name="account_balance_wallet" size="20px" />
                  <span class="tab-label">{{ t('branch.cashbox', 'Cashbox') }}</span>
                </div>
              </q-tab>
            </q-tabs>
          </div>

          <q-separator class="tab-separator" />

          <q-tab-panels v-model="activeTab" animated swipeable class="enhanced-tab-panels">
            <!-- Branches Tab -->
            <q-tab-panel name="branches" class="enhanced-tab-panel">
              <Main @edit-branch="openUpdateModal" @toggle-active="toggleBranchActive" @view-warehouses="viewWarehouses"
                @view-cashbox="viewCashbox" @add-branch="showAddModal = true" />
            </q-tab-panel>

            <!-- Warehouse Tab -->
            <q-tab-panel name="warehouse" class="enhanced-tab-panel">
              <WarehouseComponent :branch="selectedBranch" :selected-warehouse="selectedWarehouse"
                @view-items="handleViewItems" @go-back="activeTab = 'branches'" />
            </q-tab-panel>

            <!-- Warehouse Items Tab -->
            <q-tab-panel name="warehouseItems" class="enhanced-tab-panel">
              <WarehouseItemsTab :warehouse="selectedWarehouse" @go-back="activeTab = 'warehouse'" />
            </q-tab-panel>

            <!-- Cashbox Tab -->
            <q-tab-panel name="cashbox" class="enhanced-tab-panel">
              <CashboxComponent :branch="selectedBranch" @go-back="activeTab = 'branches'" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </div>

    <!-- Add Modal -->
    <Add v-model="showAddModal" @submit="handleAddSubmit" />

    <!-- Update Modal -->
    <Update v-if="selectedBranch" v-model="showUpdateModal" :branch-id="selectedBranch.id"
      :initial-data="selectedBranch" @update="handleUpdateSubmit" />
  </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Main from 'src/components/branch/Main.vue';
import WarehouseComponent from 'src/components/branch/warehouse.vue';
import WarehouseItemsTab from 'src/components/branch/WarehouseItemsTab.vue';
import CashboxComponent from 'src/components/cashbox/Main.vue';
import Add from 'src/components/branch/Add.vue';
import Update from 'src/components/branch/Update.vue';
import { useBranchStore } from 'src/stores/branchStore';
import type { Branch } from 'src/types/branch';
import type { Warehouse } from 'src/types/warehouse';

const { t } = useI18n();
const branchStore = useBranchStore();
// Removed warehouseStore since it's no longer used in this component
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const selectedBranch = ref<Branch | null>(null);
const activeTab = ref('branches');
const selectedWarehouse = ref<Warehouse | null>(null);

// Fetch branches on component mount
onMounted(async () => {
  // Data fetching is now handled by the Main component with pagination
  // No need to fetch here to avoid conflicts
});

// Watch for tab changes to load warehouses if needed
watch(activeTab, (_newTab) => {
  // All fetching is now handled by component watchers
  // No manual fetching needed here
});

// View warehouses - Switch to warehouse tab and load warehouses for selected branch
function viewWarehouses(branch: Branch) {
  selectedBranch.value = branch;
  activeTab.value = 'warehouse';
  // Removed manual fetch - handled by activeTab watcher and warehouse component watcher
}

// View cashbox - Switch to cashbox tab and load cashbox for selected branch
function viewCashbox(branch: Branch) {
  selectedBranch.value = branch;
  activeTab.value = 'cashbox';
}

// Handle viewing warehouse items - takes user to the warehouse items tab
function handleViewItems(warehouse: Warehouse) {
  selectedWarehouse.value = warehouse;
  activeTab.value = 'warehouseItems';
}

// Toggle branch active status
async function toggleBranchActive(branchId: number) {
  try {
    await branchStore.toggleBranchActive(branchId);
  } catch (error) {
    console.error('Error toggling branch status:', error);
  }
}

// Open update modal with the selected branch
function openUpdateModal(branch: Branch) {
  selectedBranch.value = branch;
  showUpdateModal.value = true;
}

// Handle add submit
function handleAddSubmit() {
  showAddModal.value = false;
}

// Handle update submit
function handleUpdateSubmit() {
  showUpdateModal.value = false;
}
</script>

<style lang="scss" scoped>
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

// Main content card styling
.main-content-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

// Enhanced tabs container
.tabs-container {
  background: transparent;
  padding: 16px 16px 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

// Enhanced tab styling
.enhanced-tabs {
  .q-tabs__content {
    gap: 0;
  }

  .q-tab__indicator {
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  }
}

.enhanced-tab {
  border-radius: 12px 12px 0 0;
  margin: 0 2px;
  padding: 14px 24px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: #64748b;
  font-weight: 500;
  min-height: 52px;
  position: relative;
  border: none;

  &:hover:not(.q-tab--active) {
    background: rgba(var(--q-primary-rgb), 0.04);
    color: var(--q-primary);
    transform: translateY(-1px);

    .tab-content .q-icon {
      color: var(--q-primary);
      transform: scale(1.05);
    }
  }

  &.q-tab--active {
    background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.08) 0%, rgba(var(--q-primary-rgb), 0.12) 100%);
    color: var(--q-primary);
    font-weight: 600;
    box-shadow:
      inset 0 -3px 0 var(--q-primary),
      0 2px 8px rgba(var(--q-primary-rgb), 0.15);

    .tab-content .q-icon {
      color: var(--q-primary);
    }
  }
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  white-space: nowrap;
  position: relative;
  z-index: 1;

  .q-icon {
    transition: all 0.25s ease;
    font-size: 18px;
  }

  .tab-label {
    transition: all 0.25s ease;
    font-weight: inherit;
  }
}

.tab-separator {
  display: none; // Remove the separator for cleaner look
}

// Enhanced tab panels
.enhanced-tab-panels {
  background: transparent;
  min-height: 500px;
}

.enhanced-tab-panel {
  padding: 24px;
  animation: fadeInUp 0.4s ease;
  background: rgba(248, 250, 252, 0.3);
  border-radius: 0 0 16px 16px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 767px) {
  .tabs-container {
    padding: 12px 8px 0;
  }

  .enhanced-tab {
    padding: 12px 16px;
    margin: 0 1px;
    min-height: 48px;
    border-radius: 8px 8px 0 0;

    .tab-content {
      font-size: 12px;
      gap: 6px;

      .q-icon {
        font-size: 16px;
      }

      .tab-label {
        display: none;
      }
    }

    &.q-tab--active {
      background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.08) 0%, rgba(var(--q-primary-rgb), 0.12) 100%);
      box-shadow:
        inset 0 -2px 0 var(--q-primary),
        0 1px 4px rgba(var(--q-primary-rgb), 0.15);
    }
  }

  .enhanced-tab-panel {
    padding: 16px;
  }
}

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
