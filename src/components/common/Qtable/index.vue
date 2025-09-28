<template>
  <!-- Show loading component when loading -->
  <div v-if="loading">
    <EnhancedLoading table-mode :show-dots="false" spinner-color="primary" spinner-size="3rem" />
  </div>

  <!-- Show table when not loading -->
  <q-table v-else :rows-per-page-options="[paginationNumber]" class="beautiful-table"
    :class="{ 'grid-mode': isGridMode }" :columns="(finalInternalColumns as any)" :rows="rows" :loading="false"
    :grid="isGridMode" :grid-header="isGridMode" :hide-header="isGridMode" separator="horizontal" hide-pagination flat
    bordered dense>

    <!-- Top Right Buttons -->
    <template #top-right>
      <TableHeader :top-right="!!topRight" :top-right-title="topRightTitle || ''" :top-right-icon="topRightIcon || ''"
        :top-right-secondary-title="topRightSecondaryTitle || ''"
        :top-right-secondary-icon="topRightSecondaryIcon || ''" :top-right-tertiary-title="topRightTertiaryTitle || ''"
        :top-right-tertiary-icon="topRightTertiaryIcon || ''" :can-view-top-right-action="canViewTopRightAction"
        @top-right-action="$emit('top-right-action')" @top-right-secondary-action="$emit('top-right-secondary-action')"
        @top-right-tertiary-action="$emit('top-right-tertiary-action')" />
    </template>

    <!-- Grid Mode - Custom Item Slot -->
    <template v-if="isGridMode" #item="props">
      <GridCard :row="props.row" :row-index="props.rowIndex" :columns="(columns as any)" :menu-items="menuItems"
        v-bind="extraItem ? { extraItem } : {}" :has-expandable-rows="hasExpandableRows"
        :is-expanded="expanded[getRowKey(props.row)]" :is-selected="selectedGridItems.includes(getRowKey(props.row))"
        :show-badge="!!pagination" :badge-value="getBadgeValue(props.rowIndex)" :pagination="pagination ?? null"
        @card-click="handleGridCardClick(props.row)" @action-click="handleGridAction(props.row)"
        @toggle-expand="toggleExpand(props.row)" @hide-menu="selectedRowId = null"
        @item-click="(data) => handleItemClick(data, props.row)" />
    </template>

    <!-- Table Body -->
    <template #body="props">
      <!-- 
      canceled_at will come from backend and it is belongs to the item-transactions only.
       -->
      <q-tr :props="props" :class="{ 'row-expanded': expanded[getRowKey(props.row)], 'table-row': true, 'canceled-row': props.row.canceled_at }"
        :style="props.rowIndex % 2 === 0 ? 'background-color: #e6e6e6;' : ''">
        <q-td v-for="col in props.cols" :key="col.name" :props="props" class="table-cell">
          <!-- Image Avatar -->
          <template v-if="col.name === 'image'">
            <q-avatar style="position: relative;">
              <img :src="props.row.image" alt="User Image" />

              <q-badge v-if="props.row.is_online" color="green" floating rounded transparent class="online-dot" />

            </q-avatar>
          </template>

          <!-- Expand Button -->
          <template v-else-if="col.name === 'expand' && hasExpandableRows">
            <q-btn flat round dense size="sm" color="primary" class="expand-button"
              @click.stop="toggleExpand(props.row)" :icon="expanded[getRowKey(props.row)] ? 'remove' : 'add'" />
          </template>

          <!-- Index Icon -->
          <template v-else-if="col.name === 'index'">
            <span>{{ typeof col.field === 'function' ? col.field(props.row, props.rowIndex) : props.rowIndex + 1
            }}</span>
          </template>

          <!-- warehouses Column -->
          <template v-else-if="col.name === 'warehouses'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-warehouses', props.row.id)" is-flat round btn-label=""
                btn-color="indigo">
                <q-icon name="warehouse" />
              </Qbutton>
            </slot>
          </template>

          <!-- cashbox Column -->
          <template v-else-if="col.name === 'cashbox'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-cashbox', props.row.id)" is-flat round btn-label="" btn-color="green"
                :disable="isEmployee && userBranchId !== props.row.id"
                :class="{ 'disabled-cashbox': isEmployee && userBranchId !== props.row.id }">
                <q-icon name="account_balance_wallet" />
              </Qbutton>
            </slot>
          </template>

          <!-- report Column -->
          <template v-else-if="col.name === 'report'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-report', props.row.id)" is-flat round btn-label=""
                btn-color="orange">
                <q-icon name="analytics" />
              </Qbutton>
            </slot>
          </template>

          <!-- items Column -->
          <template v-else-if="col.name === 'items'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-items', props.row.id)" is-flat round btn-label="" btn-color="grey">
                <q-icon name="inventory" />
              </Qbutton>
            </slot>
          </template>

          <!-- item-movements Column -->
          <template v-else-if="col.name === 'item-movements' && isAdmin">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-item-movements', props.row.id)" is-flat round btn-label=""
                btn-color="purple">
                <q-icon name="swap_horiz" />
              </Qbutton>
            </slot>
          </template>

          <!-- progress Column -->
          <template v-else-if="col.name === 'progress'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <div class="progress-container">
                <q-linear-progress :value="col.value / 100" color="primary" track-color="grey-3" rounded size="8px"
                  class="progress-bar cute-wave-progress" stripe />
                <span class="progress-label q-ml-sm">{{ col.value }}%</span>
              </div>
            </slot>
          </template>

          <!-- Expended USD Column -->
          <template v-else-if="col.name === 'expensed_usd'">
            <span :class="{
              'text-negative': col.value < 0,
              'text-positive': col.value > 0
            }">
              ${{ Math.abs(Number(col.value || 0)).toFixed(2) }}
            </span>
          </template>

          <!-- Expended IQD Column -->
          <template v-else-if="col.name === 'expensed_iqd'">
            <span :class="{
              'text-negative': col.value < 0,
              'text-positive': col.value > 0
            }">
              {{ Math.abs(Number(col.value || 0)).toLocaleString('en-IQ') }} IQD
            </span>
          </template>

          <!-- Custom cell for due_after -->
          <template v-else-if="col.name === 'due_after'">
            <div class="flex items-center justify-center">
              <!-- Colored chip, show if not null -->
              <q-chip v-if="props.row.due_after" dense square :style="{ backgroundColor: props.row.due_color, color: 'white' }">
                <small>
                  {{ props.row.due_after }}
                </small>

                <q-tooltip>
                  <small>{{ props.row.due_date }}</small>
                </q-tooltip>
              </q-chip>
              <span v-else>༄˖°.🍂.ೃ࿔*:･</span>
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="col.name === 'actions'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <div class="actions-container">
                <q-btn flat round icon="more_vert" size="sm" color="primary" class="actions-btn"
                  @click="handleActionClick(props.row)">
                  <q-tooltip class="bg-primary text-white shadow-2" anchor="top middle" self="bottom middle"
                    :offset="[0, 8]">
                    Actions
                  </q-tooltip>
                  <MenuDropdown @hide-menu="selectedRowId = null" :menu-items="getMenuItemsForRow(props.row, menuItems)"
                    v-bind="extraItem ? { extraItem } : {}" :min-width="'160px'" :has-separator="true"
                    @item-click="(data) => handleItemClick(data, props.row)" />
                </q-btn>
              </div>
            </slot>
          </template>

          <!-- View Action Column -->
          <template v-else-if="col.name === 'view_action'">
            <slot name="body-cell-view_action" :props="props" :row="props.row">
              <div class="view_action-container">
                <q-btn flat round icon="visibility" size="sm" color="primary" class="view_action-btn"
                  @click="handleViewActionClick(props.row)">
                  <q-tooltip class="bg-primary text-white shadow-2" anchor="top middle" self="bottom middle"
                    :offset="[0, 8]">
                    View
                  </q-tooltip>
                </q-btn>
              </div>
            </slot>
          </template>

          <!-- Default Column Rendering -->
          <template v-else>
            <slot name="body-cell" :props="props" :row="props.row" :col="col">
              <template v-if="col.format && typeof col.format === 'function'">
                {{ col.format(col.value, props.row) }}
              </template>
              <template v-else>
                {{ col.value || '-' }}
              </template>
            </slot>
          </template>
        </q-td>
      </q-tr>

      <!-- Inline expanded row rendering -->
      <q-tr v-if="hasExpandableRows && expanded[getRowKey(props.row)]">
        <q-td :colspan="props.cols.length">
          <slot name="expanded-row" :row="props.row">
            <div class="text-center q-pa-md text-grey-6">
              <q-icon name="info_outline" color="primary" size="sm" class="q-mr-sm" />
              <span>Expanded details for {{ getPrimaryText(props.row) }}</span>
            </div>
          </slot>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <!-- Pagination -->
  <TablePagination :show-bottom="showBottom" :current-page="pagination?.current_page || 1" :max-page="maxPage"
    :total="pagination?.total || 0" :is-rtl="isRTL" @page-change="handlePageChangeWrapper" />
</template>

<script setup lang="ts">
import EnhancedLoading from '../EnhancedLoading.vue';
import Qbutton from '../Qbtn.vue';
import MenuDropdown from '../Qmenu.vue';
import TableHeader from './TableHeader.vue';
import GridCard from './GridCard.vue';
import TablePagination from './TablePagination.vue';
import { useTableLogic } from 'src/composables/useTableLogic';
import type { Column, MenuItem } from 'src/composables/useTableLogic';
import { useMeStore } from 'src/stores/meStore';
import { computed } from 'vue';

// Props
const props = withDefaults(defineProps<{
  menuItems: Array<MenuItem> | ((_row: any) => Array<MenuItem>);
  extraItem?: MenuItem;
  topRightTitle?: string;
  topRightIcon?: string;
  topRightSecondaryTitle?: string;
  topRightSecondaryIcon?: string;
  topRightTertiaryTitle?: string;
  topRightTertiaryIcon?: string;
  columns: Array<Column>;
  rows: Array<unknown>;
  hasExpandableRows?: boolean;
  rowsPerPageOptions?: number[];
  loading?: boolean;
  maxPages?: number;
  topRight?: boolean;
  showBottom: boolean;
  userType?: string;
  allowedTypes?: Array<string>;
  userBranchId?: number | null;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}>(), {
  topRight: true,
  userType: '',
  allowedTypes: () => [],
  userBranchId: null
});

// Emits
const emit = defineEmits<{
  'handle-cashbox': [id: number];
  'handle-warehouses': [id: number];
  'handle-report': [id: number];
  'handle-items': [id: number];
  'handle-item-movements': [id: number];
  'menu-action': [data: { item: MenuItem; rowId: string | null; row: any }];
  'top-right-action': [];
  'top-right-secondary-action': [];
  'top-right-tertiary-action': [];
  'row-expand': [data: { row: any; expanded: boolean }];
  'update:pagination': [page: number];
  'page-change': [page: number];
  'view-action': [data: { item: any; rowId: string | null }];
}>();

// Use table logic composable
const {
  // currentPage,
  expanded,
  selectedGridItems,
  selectedRowId,
  isRTL,
  isGridMode,
  canViewTopRightAction,
  isEmployee,
  userBranchId,
  paginationNumber,
  maxPage,
  internalColumns,
  getRowKey,
  getPrimaryText,
  handleGridCardClick,
  handleGridAction,
  toggleExpand,
  handlePageChange,
  getMenuItemsForRow
} = useTableLogic(props);

// Remove index column from internal columns
const filteredColumns = computed(() => {
  return internalColumns.value.filter(col => col.name !== 'index');
});

// Override internalColumns to use filtered version
const finalInternalColumns = computed(() => filteredColumns.value);

const meStore = useMeStore();

// Check if user is admin
const isAdmin = computed(() => meStore.me?.type === 'admin');

// Helper functions
function getBadgeValue(rowIndex: number): string {
  if (!props.pagination) return '';
  return String((props.pagination.current_page - 1) * props.pagination.per_page + rowIndex + 1);
}

function handleActionClick(row: any) {
  selectedRowId.value = row.id;
}

function handleItemClick(data: any, row?: any) {
  const currentRow = row || (selectedRowId.value ? props.rows.find((r: any) => r.id === selectedRowId.value) : null);
  emit('menu-action', { item: data.item, rowId: selectedRowId.value, row: currentRow });
  selectedRowId.value = null;
}

function handleViewActionClick(row: any) {
  selectedRowId.value = row.id;
  emit('view-action', { item: row, rowId: selectedRowId.value });
  selectedRowId.value = null;
}

// Handle page change
function handlePageChangeWrapper(page: number) {
  const result = handlePageChange(page);
  emit('page-change', result);
  emit('update:pagination', result);
}
</script>

<style scoped>
/* Table Styles - neutral, clean */
.beautiful-table {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.beautiful-table :deep(.q-table thead tr) {
  background: #f9fafb;
}

.beautiful-table :deep(.q-table thead th) {
  color: #111827;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
}

/* Body */
.beautiful-table :deep(.q-table tbody td) {
  padding: 12px 10px;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
}

/* Hover */
.beautiful-table :deep(.q-table tbody tr:hover) {
  background: #f8fafc;
}

/* RTL header rounding handled by Quasar; avoid forcing radii */

/* Minimal helpers */
.actions-btn,
.expand-button {
  border-radius: 6px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-label {
  font-weight: 600;
  color: #374151;
  min-width: 40px;
  text-align: right;
}

.text-negative {
  color: #ef4444;
  font-weight: 600;
}

.text-positive {
  color: #10b981;
  font-weight: 600;
}

.disabled-cashbox {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}

.disabled-cashbox:deep(.q-icon) {
  color: #9ca3af !important;
}

.online-dot {
  width: 0px;
  min-height: 0px;
  padding: 0.25rem;
  bottom: 0;
  top: 100%;
  transform: translate(-40%, -160%);
  box-shadow: 1px 1px 7px #33ff33cc;
  opacity: 0.89;
  border: 1px solid #bfbfbf;
  z-index: 999;
}

.canceled-row {
  text-decoration: line-through !important;
  opacity: 0.7 !important;
  background: linear-gradient(135deg, #ffeef3 0%, #ffe0e9 100%) !important;
  position: relative !important;
  overflow: hidden !important;
}
</style>
