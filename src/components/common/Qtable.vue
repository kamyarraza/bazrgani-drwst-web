<template>
  <!-- Show loading component when loading -->
  <div v-if="loading">
    <EnhancedLoading table-mode :show-dots="false" spinner-color="primary" spinner-size="3rem" />
  </div>

  <!-- Show table when not loading -->
  <q-table v-else :rows-per-page-options="[paginationNumber]" class="beautiful-table"
    :class="{ 'grid-mode': isGridMode }" :columns="internalColumns" :rows="rows" :loading="false" :grid="isGridMode"
    :grid-header="isGridMode" :hide-header="isGridMode" separator="horizontal" hide-pagination flat bordered dense>
    <!-- Top Right Buttons -->
    <template v-if="topRight && canViewTopRightAction" #top-right>
      <div class="top-right-buttons">
        <!-- Primary Action Button -->
        <Qbutton v-if="topRightTitle" :isFlat="true" :btn-color="'primary'" :btn-label="topRightTitle" :no-caps="true"
          @click="$emit('top-right-action')" class="table-top-action">
          <q-icon v-if="topRightIcon" :name="topRightIcon" class="q-mr-xs" />
        </Qbutton>

        <!-- Secondary Action Button -->
        <Qbutton v-if="topRightSecondaryTitle" :isFlat="true" :btn-color="'secondary'"
          :btn-label="topRightSecondaryTitle" :no-caps="true" @click="$emit('top-right-secondary-action')"
          class="table-top-action secondary-action">
          <q-icon v-if="topRightSecondaryIcon" :name="topRightSecondaryIcon" class="q-mr-xs" />
        </Qbutton>

        <!-- Tertiary Action Button -->
        <Qbutton v-if="topRightTertiaryTitle" :isFlat="true" :btn-color="'tertiary'" :btn-label="topRightTertiaryTitle"
          :no-caps="true" @click="$emit('top-right-tertiary-action')" class="table-top-action tertiary-action">
          <q-icon v-if="topRightTertiaryIcon" :name="topRightTertiaryIcon" class="q-mr-xs" />
        </Qbutton>
      </div>
    </template>

    <!-- Grid Mode - Custom Item Slot -->
    <template v-if="isGridMode" #item="props">
      <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 q-pa-sm">
        <q-card class="grid-card cursor-pointer transition-all" @click="handleGridCardClick(props.row)"
          :class="{ 'selected-card': selectedGridItems.includes(getRowKey(props.row)), 'mobile-grid-card': $q.screen.lt.sm }">
          <q-card-section :class="$q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md'">
            <!-- Card Header with Image or Icon -->
            <div class="grid-card-header q-mb-md" :class="$q.screen.lt.sm ? 'mobile-grid-card-header' : ''">
              <div class="flex items-center justify-between" :class="$q.screen.lt.sm ? 'mobile-header-row' : ''">
                <div class="flex items-center flex-grow" :class="$q.screen.lt.sm ? 'mobile-header-main' : ''">
                  <q-avatar v-if="hasImageColumn()" size="$q.screen.lt.sm ? '36px' : '48px'"
                    class="q-mr-sm grid-avatar">
                    <img v-if="getImageColumn(props.row)" :src="getImageColumn(props.row)!"
                      :alt="getPrimaryText(props.row)" />
                    <q-icon v-else name="image" :size="$q.screen.lt.sm ? '20px' : '28px'" color="grey-5" />
                  </q-avatar>
                  <q-icon v-else :name="getCardIcon(props.row)" :size="$q.screen.lt.sm ? '36px' : '48px'"
                    color="primary" class="q-mr-sm grid-avatar" />
                  <div class="grid-card-title flex-grow">
                    <div class="text-h6 text-primary ellipsis grid-title"
                      :class="$q.screen.lt.sm ? 'mobile-title' : ''">{{ getPrimaryText(props.row) }}</div>
                    <div class="text-caption text-grey-6 grid-description"
                      :class="$q.screen.lt.sm ? 'mobile-description' : ''">{{ getSecondaryText(props.row) }}</div>
                  </div>
                  <q-badge color="primary" class="q-ml-sm grid-badge" v-if="pagination">
                    {{ (pagination && pagination.per_page ? (pagination.current_page - 1) * pagination.per_page : 0) +
                      props.rowIndex + 1 }}
                  </q-badge>
                </div>
                <!-- Enhanced Actions Menu -->
                <div class="grid-actions-container" :class="$q.screen.lt.sm ? 'mobile-actions' : ''">
                  <q-btn flat round icon="more_vert" :size="$q.screen.lt.sm ? 'lg' : 'md'" class="grid-actions-btn"
                    @click.stop="handleGridAction(props.row)">
                    <q-tooltip class="bg-primary text-white shadow-2" anchor="top middle" self="bottom middle"
                      :offset="[0, 8]">
                      Actions
                    </q-tooltip>
                    <MenuDropdown @hide-menu="selectedRowId = null" :menu-items="getMenuItemsForRow(props.row)"
                      v-bind="extraItem ? { extraItem } : {}" :min-width="'160px'" :has-separator="true"
                      @item-click="(data) => handleItemClick(data, props.row)" />
                  </q-btn>
                </div>
              </div>
            </div>
            <!-- Card Body with Key Information -->
            <div class="grid-card-body" :class="$q.screen.lt.sm ? 'mobile-grid-card-body' : ''">
              <div class="row q-col-gutter-sm">
                <div v-for="col in $q.screen.lt.sm ? getDisplayColumns(props.row, 2) : getDisplayColumns(props.row)"
                  :key="col.name" class="col-6">
                  <div class="grid-field" :class="$q.screen.lt.sm ? 'mobile-grid-field' : ''">
                    <div class="grid-field-label text-caption text-grey-6"
                      :class="$q.screen.lt.sm ? 'mobile-grid-field-label' : ''">{{ col.label }}</div>
                    <div class="grid-field-value text-body2 text-weight-medium"
                      :class="$q.screen.lt.sm ? 'mobile-grid-field-value' : ''">
                      <template v-if="col.name === 'status' || col.name === 'is_active'">
                        <q-badge :color="getStatusColor(col.value)" :label="String(col.value || '')" rounded
                          class="grid-status-badge" />
                      </template>
                      <template v-else-if="col.format && typeof col.format === 'function'">
                        <span class="grid-formatted-value">{{ col.format(col.value, props.row) }}</span>
                      </template>
                      <template v-else>
                        <span class="grid-default-value">{{ col.value || '-' }}</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Expandable Content for Grid -->
            <div v-if="hasExpandableRows && expanded[getRowKey(props.row)]"
              class="grid-expanded-content q-mt-md q-pt-md">
              <q-separator class="q-mb-md" />
              <slot name="expanded-row" :row="props.row">
                <div class="text-center q-pa-md text-grey-6">
                  <q-icon name="info_outline" color="primary" size="sm" class="q-mr-sm" />
                  <span>Expanded details for {{ getPrimaryText(props.row) }}</span>
                </div>
              </slot>
            </div>
          </q-card-section>
          <!-- Expand Button for Grid -->
          <q-card-actions v-if="hasExpandableRows" align="center" class="q-pt-none grid-expand-section">
            <q-btn flat :size="$q.screen.lt.sm ? 'md' : 'md'" color="primary"
              :icon="expanded[getRowKey(props.row)] ? 'expand_less' : 'expand_more'"
              :label="expanded[getRowKey(props.row)] ? 'Show Less' : 'Show More'" @click.stop="toggleExpand(props.row)"
              class="grid-expand-btn" no-caps />
          </q-card-actions>
        </q-card>
      </div>
    </template>

    <!-- Table Body -->
    <template #body="props">
      <q-tr :props="props" :class="{ 'row-expanded': expanded[getRowKey(props.row)], 'table-row': true }">
        <q-td v-for="col in props.cols" :key="col.name" :props="props" class="table-cell">
          <!-- Expand Button -->
          <template v-if="col.name === 'expand' && hasExpandableRows">
            <q-btn flat round dense size="sm" color="primary" class="expand-button"
              @click.stop="toggleExpand(props.row)" :icon="expanded[getRowKey(props.row)] ? 'remove' : 'add'" />
          </template>
          <!-- Index Icon -->
          <template v-else-if="col.name === 'index'">
            <span>{{ typeof col.field === 'function' ? col.field(props.row, props.rowIndex) : props.rowIndex + 1
              }}</span>
          </template>

          <!-- warehouses Column -->
          <template v-if="col.name === 'warehouses'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-warehouses', props.row.id)" is-flat round btn-label=""
                btn-color="indigo">
                <q-icon name="warehouse" />
              </Qbutton>
            </slot>
          </template>

          <!-- cashbox Column -->
          <template v-if="col.name === 'cashbox'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-cashbox', props.row.id)" is-flat round btn-label="" btn-color="green"
                :disable="isEmployee && userBranchId !== props.row.id"
                :class="{ 'disabled-cashbox': isEmployee && userBranchId !== props.row.id }">
                <q-icon name="account_balance_wallet" />
              </Qbutton>
            </slot>
          </template>

          <!-- items Column -->
          <template v-if="col.name === 'items'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('handle-items', props.row.id)" is-flat round btn-label="" btn-color="grey">
                <q-icon name="inventory" />
              </Qbutton>
            </slot>
          </template>

          <!-- progress Column -->
          <template v-if="col.name === 'progress'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <div class="progress-container">
                <q-linear-progress :value="col.value / 100" color="primary" track-color="grey-3" rounded size="8px"
                  class="progress-bar cute-wave-progress" animation-speed="800" stripe />
                <span class="progress-label q-ml-sm">{{ col.value }}%</span>
              </div>
            </slot>
          </template>

          <!-- Expended USD Column -->
          <template v-if="col.name === 'expensed_usd'">
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

          <!-- View Action Column -->
          <template v-else-if="col.name === 'view_action'">
            <slot name="body-cell-view-action" :props="props" :row="props.row">
              <Qbutton @click="() => $emit('view-action', props.row)" is-flat round btn-label="" btn-color="primary"
                size="sm" class="view-action-btn">
                <q-icon name="visibility" />
                <q-tooltip class="bg-primary text-white shadow-2" anchor="top middle" self="bottom middle"
                  :offset="[0, 8]">
                  View Details
                </q-tooltip>
              </Qbutton>
            </slot>
          </template>

          <!-- Actions Slot -->
          <template v-else-if="col.name === 'actions'">
            <slot name="body-cell-actions" :props="props" :row="props.row">
              <Qbutton @click="() => { selectedRowId = props.row.id }" is-flat round btn-label="">
                <template #default>
                  <q-spinner-gears v-if="selectedRowId === props.row.id" color="primary" size="24px" />
                  <q-icon v-else name="more_vert" />
                  <MenuDropdown @hide-menu="selectedRowId = null" :menu-items="getMenuItemsForRow(props.row)"
                    v-bind="extraItem ? { extraItem } : {}" :min-width="'150px'" :has-separator="true"
                    @item-click="(data) => handleItemClick(data, props.row)" />
                </template>
              </Qbutton>
            </slot>
          </template>

          <!-- Image Column -->
          <template v-else-if="col.name === 'image'">
            <q-avatar size="42px" class="table-image">
              <img v-if="col.value" :src="col.value" alt="row image" />
              <q-icon v-else name="image" size="24px" color="grey-5" />
            </q-avatar>
          </template>
          <!-- Default Column -->
          <template v-else>
            <span class="table-cell-content">{{ col.value }}</span>
          </template>
        </q-td>
      </q-tr>

      <!-- Expanded Row -->
      <q-tr v-show="expanded[getRowKey(props.row)]" :props="props" class="expanded-content-row">
        <q-td colspan="100%" class="expanded-content">
          <div class="expanded-content-wrapper">
            <slot name="expanded-row" :row="props.row">
              <div class="text-center q-pa-md expanded-content-placeholder">
                <q-icon name="info_outline" color="primary" size="sm" class="q-mr-sm" />
                <span>Expanded details for row {{ props.row.id || 'item' }}</span>
              </div>
            </slot>
          </div>
        </q-td>
      </q-tr>
    </template>

    <!-- Bottom Row with Pagination aligned to the right -->
    <template v-if="showBottom" #bottom>
      <div class="row full-width pagination-container">
        <div class="col"></div>
        <div class="col-auto q-pa-sm flex justify-end items-center">
          <slot name="pagination">
            <div class="pagination-wrapper flex flex-center">
              <q-pagination v-model="currentPage" :max="maxPage" :input="true" direction-links boundary-links
                input-class="text-center pagination-input" color="primary" active-color="primary" :ripple="true"
                :max-pages="6" :boundary-numbers="true" padding="sm" @update:model-value="handlePageChange"
                :disable="loading" :icon-first="isRTL ? 'last_page' : 'first_page'"
                :icon-last="isRTL ? 'first_page' : 'last_page'" :icon-prev="isRTL ? 'chevron_right' : 'chevron_left'"
                :icon-next="isRTL ? 'chevron_left' : 'chevron_right'" class="beautiful-pagination" />
              <span v-if="pagination" class="q-ml-md text-caption text-grey-6 pagination-info">
                {{ pagination.current_page }} / {{ pagination.last_page }}
              </span>
              <q-spinner-dots v-if="loading" color="primary" size="20px" class="q-ml-sm" />
            </div>
          </slot>
        </div>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import Qbutton from 'src/components/common/Qbtn.vue';
import MenuDropdown from 'src/components/common/Qmenu.vue';
import EnhancedLoading from 'src/components/common/EnhancedLoading.vue';
import type { Column, MenuItem } from 'src/types';

const $q = useQuasar();
const selectedRowId = ref<number | null>(null);
const expanded = ref<Record<string | number, boolean>>({});
const currentPage = ref(1);
const selectedGridItems = ref<Array<number | string>>([]);

const emit = defineEmits(['handle-cashbox', 'handle-warehouses', 'handle-items', 'menu-action', 'top-right-action', 'top-right-secondary-action', 'top-right-tertiary-action', 'row-expand', 'update:pagination', 'page-change', 'view-action']);

// Determine if the current language direction is RTL
const isRTL = computed(() => {
  return document.documentElement.dir === 'rtl';
});

// Determine if we should use grid mode (responsive)
const isGridMode = computed(() => {
  return $q.screen.lt.md; // Activate grid mode for tablets and smaller
});

// Check if user has permission to see top-right button
const canViewTopRightAction = computed(() => {
  if (!props.userType || !props.allowedTypes.length) return true; // Show by default if no permissions set
  return props.allowedTypes.includes(props.userType);
});

// Check if current user is an employee
const isEmployee = computed(() => {
  return props.userType === 'employee';
});

// Get user's branch ID for cashbox access control
const userBranchId = computed(() => {
  return props.userBranchId;
});

const props = withDefaults(defineProps<{
  menuItems: Array<MenuItem> | ((_row: any) => Array<MenuItem>),
  extraItem?: MenuItem,
  topRightTitle?: string,
  topRightIcon?: string,
  topRightSecondaryTitle?: string,
  topRightSecondaryIcon?: string,
  topRightTertiaryTitle?: string,
  topRightTertiaryIcon?: string,
  columns: Array<Column>,
  rows: Array<unknown>,
  hasExpandableRows?: boolean,
  rowsPerPageOptions?: number[],
  loading?: boolean,
  maxPages?: number,
  topRight?: boolean,
  showBottom: boolean,
  userType?: string,
  allowedTypes?: Array<string>,
  userBranchId?: number | null,
  pagination?: {
    current_page: number,
    last_page: number,
    per_page: number,
    total: number,
  } | null,
}>(), {
  topRight: true,
  userType: '',
  allowedTypes: () => [],
  userBranchId: null
});

const paginationNumber = computed(() => {
  return props.pagination?.per_page ? Number(props.pagination?.per_page) : 10
})
const maxPage = computed(() => {
  return props.pagination?.last_page || props.maxPages || 5;
});

// Set currentPage from props when pagination changes
if (props.pagination?.current_page) {
  currentPage.value = props.pagination.current_page;
}

const internalColumns = computed(() => {
  const columns = [...props.columns];

  // Add index column if not present (only for table mode)
  if (!columns.some(col => col.name === 'index')) {
    columns.unshift({
      name: 'index',
      label: '#', // Show # for index column header
      field: 'index',
      // field: (row: any, rowIndex: number) => rowIndex + 1 + ((props.pagination?.current_page - 1 || 0) * (props.pagination?.per_page || 0)),
      align: 'center',
      sortable: false
    } as Column);
  }

  // Add expand column if expandable rows are enabled (only for table mode)
  if (props.hasExpandableRows && !isGridMode.value) {
    columns.unshift({
      name: 'expand',
      label: '',
      field: 'expand',
      align: 'center',
      sortable: false
    } as Column);
  }

  // Ensure actions column has proper header if it exists
  const actionsColumnIndex = columns.findIndex(col => col.name === 'actions');
  if (actionsColumnIndex !== -1 && columns[actionsColumnIndex]) {
    const actionsCol = columns[actionsColumnIndex];
    columns[actionsColumnIndex] = {
      name: actionsCol.name,
      label: actionsCol.label || 'Actions',
      field: actionsCol.field || 'actions',
      align: actionsCol.align || 'center',
      sortable: false
    } as Column;
  }

  return columns;
});

// Grid Mode Helper Functions
function getRowKey(row: Record<string, unknown>): string {
  const id = row.id;
  if (id && (typeof id === 'string' || typeof id === 'number')) {
    return String(id);
  }
  return `row_${Math.random().toString(36).substr(2, 9)}`;
}

function getPrimaryText(row: Record<string, unknown>): string {
  // Try to find name, title, or first non-id field
  const nameFields = ['name', 'title', 'label', 'username'];
  for (const field of nameFields) {
    const value = row[field];
    if (value && typeof value === 'string') return value;
    if (value && typeof value === 'number') return String(value);
  }
  // Fallback to first column that's not id or actions
  const firstCol = props.columns.find(col => col.name !== 'id' && col.name !== 'actions' && col.name !== 'expand');
  if (firstCol && typeof firstCol.field === 'string') {
    const value = row[firstCol.field];
    if (value && typeof value === 'string') return value;
    if (value && typeof value === 'number') return String(value);
  }
  return 'Item';
}

function getSecondaryText(row: Record<string, unknown>): string {
  // Try to find description, subtitle, or second meaningful field
  const secondaryFields = ['description', 'subtitle', 'phone', 'email', 'code', 'category'];
  for (const field of secondaryFields) {
    const value = row[field];
    if (value && typeof value === 'string') return value;
    if (value && typeof value === 'number') return String(value);
  }
  return '';
}

function getImageColumn(row: Record<string, unknown>): string | null {
  const imageFields = ['image', 'avatar', 'photo', 'picture'];
  for (const field of imageFields) {
    const value = row[field];
    if (value && typeof value === 'string' && value.trim() !== '') return value;
  }
  return null;
}

function hasImageColumn(): boolean {
  return internalColumns.value.some(col =>
    col.name === 'image' ||
    col.name === 'avatar' ||
    col.name === 'photo' ||
    col.name === 'picture'
  );
}

function getCardIcon(row: Record<string, unknown>): string {
  // Return appropriate icon based on the data type or content
  const rowType = row.type;
  if (rowType && typeof rowType === 'string') {
    const iconMap: Record<string, string> = {
      'user': 'person',
      'admin': 'admin_panel_settings',
      'employee': 'badge',
      'customer': 'people',
      'product': 'inventory_2',
      'item': 'inventory',
      'warehouse': 'warehouse',
      'branch': 'business',
      'location': 'place',
      'category': 'category'
    };
    return iconMap[rowType] || 'folder';
  }

  // Default icons based on common fields
  if (row.username || row.email) return 'person';
  if (row.price || row.cost) return 'inventory_2';
  if (row.address) return 'place';
  return 'folder';
}

function getDisplayColumns(row: Record<string, unknown>, maxFields = 6) {
  // Get the most important columns for grid display (max N fields)
  return props.columns
    .filter(col =>
      col.name !== 'actions' &&
      col.name !== 'expand' &&
      col.name !== 'image' &&
      col.name !== 'avatar' &&
      col.name !== 'name' &&
      col.name !== 'title'
    )
    .slice(0, maxFields)
    .map(col => ({
      name: col.name,
      label: col.label,
      align: col.align,
      field: col.field,
      sortable: col.sortable,
      format: col.format,
      value: typeof col.field === 'function' ? col.field(row) : row[col.field]
    }));
}

function getStatusColor(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'positive' : 'negative';
  }
  if (typeof value === 'string') {
    const lowerVal = value.toLowerCase();
    if (lowerVal.includes('active') || lowerVal.includes('enabled') || lowerVal === 'true') return 'positive';
    if (lowerVal.includes('inactive') || lowerVal.includes('disabled') || lowerVal === 'false') return 'negative';
    if (lowerVal.includes('pending') || lowerVal.includes('warning')) return 'warning';
  }
  return 'primary';
}

function handleGridCardClick(row: Record<string, unknown>) {
  // Handle card selection in grid mode
  const rowId = getRowKey(row);
  const index = selectedGridItems.value.indexOf(rowId);

  if (index > -1) {
    selectedGridItems.value.splice(index, 1);
  } else {
    selectedGridItems.value.push(rowId);
  }
}

function handleGridAction(row: Record<string, unknown>) {
  // @ts-expect-error thsi line is ok to have error
  selectedRowId.value = row.id;
}

function toggleExpand(row: unknown) {
  const rowKey = getRowKey(row as Record<string, unknown>);
  expanded.value = expanded.value[rowKey] ? {} : { [rowKey]: true };
  emit('row-expand', { row, expanded: expanded.value[rowKey] || false });
}

function handleItemClick({ item }: { item: MenuItem; index?: number }, row?: Record<string, unknown>) {
  const currentRow = row || (selectedRowId.value ? props.rows.find((r: any) => r.id === selectedRowId.value) : null);
  emit('menu-action', { item, rowId: selectedRowId.value, row: currentRow });
  selectedRowId.value = null;
}

/**
 * Handle page change in the pagination component
 * @param {number} page - The new page number
 * Emits:
 * - page-change: Emitted when the page is changed, with the new page number
 * - update:pagination: For backward compatibility with v-model:pagination
 */
function handlePageChange(page: number) {
  currentPage.value = page;
  emit('page-change', page);
  emit('update:pagination', page);
}

// Helper function to get menu items for a specific row
function getMenuItemsForRow(row: any): Array<MenuItem> {
  if (typeof props.menuItems === 'function') {
    return props.menuItems(row);
  }
  return props.menuItems;
}
</script>

<style scoped>
/* Grid Mode Styles */
.beautiful-table.grid-mode {
  border: none;
  background: transparent;
}

.beautiful-table.grid-mode :deep(.q-table__container) {
  border: none;
  box-shadow: none;
}

.beautiful-table.grid-mode :deep(.q-table__middle) {
  border: none;
}

.beautiful-table.grid-mode :deep(.q-table__grid-content) {
  padding: 0;
}

.grid-card {
  border-radius: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.grid-card:hover {
  transform: translateY(-6px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(59, 130, 246, 0.08);
  background: rgba(255, 255, 255, 1);
}

.grid-card.selected-card {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.18);
}

.grid-card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 12px;
}

.grid-avatar {
  border: 2px solid rgba(59, 130, 246, 0.1);
  background: rgba(59, 130, 246, 0.05);
}

.grid-card-title {
  min-width: 0;
  /* Allow text truncation */
}

.grid-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1e293b;
}

.grid-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.grid-actions-container {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.grid-actions-btn {
  background: rgba(59, 130, 246, 0.08);
  border: 1.5px solid rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.grid-actions-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.grid-description {
  max-height: 100px;
  overflow-y: auto;
  line-height: 1.4;
  word-wrap: break-word;
  padding-right: 4px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.grid-card-body {
  flex: 1;
  padding: 8px 0;
}

.grid-field {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.grid-field:hover {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(59, 130, 246, 0.1);
}

.grid-field-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
  opacity: 0.9;
  color: #475569;
}

.grid-field-value {
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  font-weight: 500;
  color: #1e293b;
}

.grid-status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
}

.grid-formatted-value,
.grid-default-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-expand-section {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(248, 250, 252, 0.4);
  padding: 8px 16px;
}

.grid-expand-btn {
  font-weight: 600;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  transition: all 0.25s ease;
  min-height: 40px;
}

.grid-expand-btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.15);
}

.grid-expanded-content {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(249, 250, 251, 0.5);
  border-radius: 0 0 12px 12px;
  animation: fadeInDown 0.3s ease forwards;
}

/* Table Styling - Quasar recommended modern look */
.beautiful-table {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  background: #fff;
}

.beautiful-table :deep(.q-table__top) {
  padding: 0;
  background: none;
  border-bottom: none;
}

.beautiful-table :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #2A7B9B 0%, #2A9B8F 100%);
}

.beautiful-table :deep(.q-table thead th) {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 16px 12px;
  border: none;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.beautiful-table :deep(.q-table tbody tr) {
  transition: background-color 0.2s ease;
}

.beautiful-table :deep(.q-table tbody tr:hover) {
  background-color: rgba(42, 123, 155, 0.04);
}

.beautiful-table :deep(.q-table tbody td) {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  font-size: 0.97rem;
  color: #1a202c;
}

/* Status chip for boolean/status columns */
.status-chip {
  border-radius: 8px;
  font-weight: 500;
}

/* Date cell for date columns */
.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

/* No data state */
.no-data-container {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 48px 24px !important;
  text-align: center !important;
  width: 100% !important;
  min-height: 200px !important;
}

.no-data-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 16px;
}

.no-data-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 8px;
}

/* Grid Mode Responsive Adjustments */
@media (max-width: 1024px) {
  .grid-card {
    margin-bottom: 16px;
  }

  .grid-field-value {
    font-size: 0.88rem;
  }

  .grid-title {
    font-size: 1.05rem;
  }

  .grid-actions-btn {
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 768px) {
  .grid-card {
    margin-bottom: 12px;
  }

  .grid-title {
    font-size: 1rem;
  }

  .grid-field-label {
    font-size: 0.7rem;
  }

  .grid-field-value {
    font-size: 0.85rem;
  }

  .grid-field {
    margin-bottom: 10px;
    padding: 6px;
  }

  .grid-actions-btn {
    width: 40px;
    height: 40px;
  }

  .grid-avatar {
    width: 44px !important;
    height: 44px !important;
  }
}

@media (max-width: 600px) {
  .grid-card {
    margin-bottom: 10px;
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    padding: 0;
  }

  .mobile-grid-card-header {
    padding-bottom: 6px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .mobile-header-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 4px;
  }

  .mobile-header-main {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .mobile-title {
    font-size: 1rem !important;
    font-weight: 600;
  }

  .mobile-description {
    font-size: 0.85rem !important;
    color: #64748b !important;
  }

  .mobile-actions {
    margin-left: 0 !important;
    margin-top: 4px;
    align-self: flex-end;
  }

  .mobile-grid-card-body {
    padding: 0 !important;
  }

  .mobile-grid-field {
    padding: 6px !important;
    margin-bottom: 8px !important;
    border-radius: 6px !important;
  }

  .mobile-grid-field-label {
    font-size: 0.7rem !important;
    margin-bottom: 2px !important;
  }

  .mobile-grid-field-value {
    font-size: 0.85rem !important;
  }

  .grid-actions-btn {
    width: 40px !important;
    height: 40px !important;
    font-size: 1.2rem !important;
  }

  .grid-expand-btn {
    font-size: 0.8rem;
    padding: 6px 12px;
    min-height: 36px;
  }

  .grid-avatar {
    width: 40px !important;
    height: 40px !important;
  }
}

/* Top Right Buttons Container */
.top-right-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Top Right Button - add spacing and fix alignment */
.table-top-action {
  font-weight: 500;
  background: #2A7B9B !important;
  border: none !important;
  transition: all 0.3s ease !important;
  letter-spacing: 0.3px;
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 0 16px !important;
  border-radius: 4px;
  min-height: 36px;
  display: flex;
  align-items: center;
  color: #fff !important;
  /* Ensure label is visible on colored background */
}

.table-top-action.secondary-action {
  background: #6c757d !important;
}

.table-top-action.tertiary-action {
  background: #28a745 !important;
}

.table-top-action :deep(.q-btn__content) {
  color: #fff !important;
  /* Ensure label is visible on colored background */
  padding: 0 8px;
}



/* Bottom Row with Pagination aligned to the right */
.pagination-container {
  margin-top: 0;
  background: none !important;
  border-radius: 0 0 12px 12px;
}

.pagination-wrapper {
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.beautiful-pagination {
  :deep(.q-btn) {
    min-width: 32px;
    min-height: 32px;
    border-radius: 6px;
    margin: 0 3px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);
    color: #6b7280;
    border: 1px solid rgba(0, 0, 0, 0.08);

    &:hover {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.2);
      transform: translateY(-1px);
    }

    &.q-btn--active {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      border-color: transparent;
      transform: scale(1.05);
    }
  }
}

.pagination-input {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 4px 8px;
  color: #374151;
  font-weight: 500;
}

.pagination-info {
  background: rgba(107, 114, 128, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
  color: #6b7280;
}

/* Smooth Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Row Animation - kept for smooth appearance */
:deep(.q-table tbody tr) {
  animation: fadeInUp 0.4s ease forwards;
  animation-delay: calc(0.03s * var(--q-tr-index, 0));
  opacity: 0;
}

/* Empty State */
:deep(.q-table__bottom--nodata) {
  padding: 40px;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
}



/* Print Styles */
@media print {
  .pagination-container {
    display: none;
  }

  .beautiful-table {
    box-shadow: none;
  }

  :deep(.q-table thead th) {
    background: #f9fafb !important;
    color: #000 !important;
    border-bottom: 2px solid #ddd !important;
  }

  .table-row:hover {
    transform: none !important;
    background: transparent !important;
  }
}

/* Disabled cashbox button styling */
.disabled-cashbox {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}

.disabled-cashbox:deep(.q-icon) {
  color: #9ca3af !important;
}
</style>
style
