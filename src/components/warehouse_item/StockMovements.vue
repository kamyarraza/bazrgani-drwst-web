<template>
  <div class="warehouse-items-container" v-if="selectedWarehouse">
    <!-- Simple Header Section -->
    <div class="q-mb-md">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h6 text-weight-medium">
            <q-icon name="swap_horiz" class="q-mr-sm" />
            {{ t('StockMovement.title', 'Stock Movement') }}
          </div>
          <div class="text-subtitle2 text-grey-6">
            <b>{{ t('warehouseItem.warehouseName', 'Warehouse') }}: </b>
            <strong>{{ selectedWarehouse.name }}</strong>
            <q-chip color="primary" text-color="white" size="sm" class="q-ml-sm" icon="inventory">
              {{ selectedWarehouse.code || 'N/A' }}
            </q-chip>
          </div>
        </div>
      </div>

    </div> <!-- Data Table -->
    <div class="warehouse-items-content">
      <QtableB v-if="hasCurrentItems" show-bottom :columns="currentColumns" :rows="currentItems"
        :loading="warehouseStore.loading" :top-right="false" :menuItems="menuItems"
        :pagination="warehouseStore.pagination" @page-change="handlePageChange" class="warehouse-items-table" flat
        bordered>
        <template #body-cell-id="props">
          <q-td :props="props" class="text-center">
            <q-chip color="grey-6" text-color="white" size="sm" square class="id-chip">
              #{{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="item-name-cell">
              <q-icon name="inventory_2" color="primary" size="20px" class="item-icon" />
              <span class="item-name">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-code="props">
          <q-td :props="props">
            <q-chip color="blue-grey" text-color="white" size="sm" class="code-chip">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-part_no="props">
          <q-td :props="props">
            <q-chip color="indigo" text-color="white" size="sm" class="part-no-chip">
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-unit_cost="props">
          <q-td :props="props" class="text-right">
            <q-badge color="positive" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-unit_price="props">
          <q-td :props="props" class="text-right">
            <q-badge color="primary" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-solo_unit_price="props">
          <q-td :props="props" class="text-right">
            <q-badge color="primary" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-bulk_unit_price="props">
          <q-td :props="props" class="text-right">
            <q-badge color="orange" text-color="white" :label="`$${parseFloat(props.value || '0').toFixed(2)}`"
              class="price-badge" />
          </q-td>
        </template>

        <template #body-cell-quantity="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.value > 100 ? 'positive' : props.value > 50 ? 'warning' : 'negative'"
              :label="formatQuantity(props.value)" class="quantity-badge" />
          </q-td>
        </template>

        <template #body-cell-pieces="props">
          <q-td :props="props" class="text-center">
            <q-chip color="teal" text-color="white" size="sm" icon="inventory" class="pieces-chip">
              {{ props.value || 0 }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-reservations="props">
          <q-td :props="props" class="text-center">
            <q-badge color="info" text-color="white" :label="String(props.value || 0)" class="reservations-badge" />
          </q-td>
        </template>

        <template #body-cell-position="props">
          <q-td :props="props" class="text-center">
            <q-chip color="purple" text-color="white" size="sm" icon="place" class="position-chip">
              {{ props.value || 'N/A' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-volume="props">
          <q-td :props="props" class="text-center">
            <q-chip color="teal" text-color="white" size="sm" icon="straighten" class="volume-chip">
              {{ parseFloat(props.value || 0).toFixed(2) }}%
            </q-chip>
          </q-td>
        </template>

      </QtableB>

      <!-- Loading State -->
      <div class="warehouse-items-loading text-center q-pa-xl" v-else-if="warehouseStore.loading">
        <q-spinner color="primary" size="3rem" />
        <div class="text-subtitle1 q-mt-md">{{ t('common.loading', 'Loading...') }}</div>
      </div>

      <!-- Empty State -->
      <q-card v-else-if="warehouseStore.warehouseItems && !hasCurrentItems" class="no-items-card text-center q-pa-xl">
        <q-icon name="inventory_2" size="5rem" color="grey-4" />
        <div class="text-h6 q-mt-md">{{ t('warehouseItem.noItemsFound', 'No Items Found') }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{
            selectedRelationType === 'items'
              ? t('warehouseItem.noRegularItems', 'No regular items found in this warehouse')
              : t('warehouseItem.noBlumItems', 'No blum items found in this warehouse')
          }}
        </div>
      </q-card>

      <!-- Fallback Empty State (when warehouseItems is null) -->
      <q-card v-else class="no-items-card text-center q-pa-xl">
        <q-icon name="inventory_2" size="5rem" color="grey-4" />
        <div class="text-h6 q-mt-md">{{ t('warehouseItem.noData', 'No Data Available') }}</div>
        <div class="text-subtitle1 q-mt-sm">
          {{ t('warehouseItem.loadDataFirst', 'Please wait while we load the warehouse items') }}
        </div>
        <q-btn color="primary" icon="refresh" :label="t('common.refresh', 'Refresh')"
          @click="props.selectedWarehouse && loadStockMovements(props.selectedWarehouse.id)" class="q-mt-md" />
      </q-card>
    </div>
  </div>
  <div class="warehouse-select-prompt text-center q-pa-xl" v-else>
    <q-icon name="inventory" size="5rem" color="grey-4" />
    <div class="text-h6 q-mt-md">{{ t('warehouseItem.selectWarehouse', 'Select a Warehouse First') }}</div>
    <div class="text-subtitle1 q-mt-sm">
      {{ t('warehouseItem.selectWarehouseDesc', 'Please select a warehouse to view its items') }}
    </div>
    <q-btn color="primary" class="q-mt-md" :icon="goBackIcon" :label="t('common.back', 'Go Back')" @click="goBack" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { useRTL } from 'src/composables/useRTL';
import type { Warehouse } from 'src/types/warehouse';
import QtableB from 'src/components/common/Qtable.vue';
import type { MenuItem } from 'src/types';

const props = defineProps<{
  selectedWarehouse: Warehouse | null;
  showItemsTab: boolean;
}>();

const emit = defineEmits(['back', 'update:showItemsTab']);

const { t } = useI18n();
const { isRTL } = useRTL();
const warehouseStore = useWarehouseStore();

// RTL-aware back icon
const goBackIcon = computed(() => isRTL.value ? 'arrow_forward' : 'arrow_back');

// Relation type filter state
const selectedRelationType = ref<'items' | 'blum_items'>('items');

// Computed property to get current items based on selected type
const currentItems = computed(() => {
  return warehouseStore.stockMovements || [];
});

// Check if we have any data for the current selection
const hasCurrentItems = computed(() => {
  return currentItems.value && currentItems.value.length > 0;
});

// Get current columns based on selected type
const currentColumns = [
  {
    name: 'item.name',
    label: t('StockMovement.name', 'Item Name'),
    align: 'left' as const,
    field: (row: any) => row.item?.name || 'N/A',
    sortable: true,
  },
  {
    name: 'old_quantity',
    label: t('StockMovement.oldQuantity', 'Old Quantity'),
    align: 'center' as const,
    field: 'old_quantity',
    sortable: true,
    format: (val: any) => formatQuantity(val),
  },
  {
    name: 'quantity_change',
    label: t('StockMovement.quantityChange', 'Quantity Change'),
    align: 'center' as const,
    field: 'quantity_change',
    sortable: true,
    format: (val: any) => formatQuantity(val),
    style: (row: any) =>
      `font-weight: bold; background: ${row.quantity_change > 0 ? '#27ae6012' : '#e74c3c12'}; color: ${row.quantity_change > 0 ? '#27ae60' : '#e74c3c'};`,
  },
  {
    name: 'new_quantity',
    label: t('StockMovement.newQuantity', 'New Quantity'),
    align: 'center' as const,
    field: 'new_quantity',
    sortable: true,
    format: (val: any) => formatQuantity(val),
  },
  {
    name: 'reason',
    label: t('StockMovement.reason', 'Reason'),
    align: 'left' as const,
    field: 'reason',
    sortable: false,
  },
  {
    name: 'created_at',
    label: t('StockMovement.createdAt', 'Created At'),
    align: 'center' as const,
    field: 'created_at',
    sortable: true,
  },
  // {
  //   name: 'actions',
  //   label: t('common.actions', 'Actions'),
  //   align: 'center' as const,
  //   field: 'actions',
  //   sortable: false,
  // },
];

// Menu items for row actions - now includes adjust stock
const menuItems: MenuItem[] = [
  { label: t('common.details', 'View Item'), icon: 'visibility', value: 'view' },
  { label: t('warehouseItem.adjust', 'Adjust Stock'), icon: 'tune', value: 'adjust' }
];

// Combined watcher for warehouse selection and tab visibility changes
watch(() => [props.selectedWarehouse, props.showItemsTab] as const, ([newWarehouse, showItems]) => {
  if (newWarehouse && showItems && typeof newWarehouse === 'object') {
    void loadStockMovements(newWarehouse.id);
  }
}, { immediate: true });

// Load items for the selected warehouse
async function loadStockMovements(warehouseId: number) {
  try {
    await warehouseStore.fetchStockMovements(warehouseId, 1);
  } catch (error) {
    console.error('Error loading warehouse items:', error);
  }
}

// Navigate back to previous screen
function goBack() {
  emit('back');
  emit('update:showItemsTab', false);
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  if (props.selectedWarehouse) {
    try {
      await warehouseStore.fetchStockMovements(props.selectedWarehouse.id, page);
    } catch (error) {
      console.error('Error loading warehouse items:', error);
    }
  }
}

function formatQuantity(value: any): string {
  // const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : 0;
  if (typeof value === "string") {
    value = value.replace(/[^\d.-]/g, "");
    value = parseFloat(value);
  }
  return (isNaN(value) ? 0 : value).toLocaleString();
}
</script>

<style lang="scss" scoped>
.warehouse-items-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
}

// Enhanced content styling
.warehouse-items-content {
  display: flex;
  flex-direction: column;
}

.warehouse-items-table {
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-table th) {
    font-weight: 600;
    background: rgba(0, 0, 0, 0.03);
  }

  :deep(.q-table tr:hover) {
    background: rgba(0, 0, 0, 0.02);
  }
}

// Item table cell styling
.item-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .item-name {
    font-weight: 500;
    color: #333;
  }
}

.price-badge {
  font-weight: 600;
  min-width: 80px;
}

.quantity-badge {
  font-weight: 600;
  min-width: 60px;
}

.pieces-chip {
  font-weight: 500;
}

.reservations-badge {
  font-weight: 500;
  min-width: 50px;
}

.position-chip {
  font-weight: 500;
}

.code-chip,
.part-no-chip {
  font-weight: 500;
  font-family: monospace;
}

.id-chip {
  font-weight: 600;
  font-family: monospace;
}

// Modal badge styling
.quantity-badge-small,
.reservations-badge-small {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 8px;
  min-width: 35px;
  text-align: center;
}

// Loading and empty states
.warehouse-items-loading {
  text-align: center;
  padding: 60px 40px;
}

.no-items-card {
  text-align: center;
  padding: 60px 40px;
}

// Warehouse select prompt (when no warehouse selected)
.warehouse-select-prompt {
  text-align: center;
  padding: 60px 40px;
}

// Relation type toggle styling
.relation-type-toggle {
  border-radius: 8px;
  overflow: hidden;
}

// Filter buttons styling
.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  min-width: 120px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:not(.q-btn--flat) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

// Floating Action Button styling
.fixed-bottom-center {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

// Stock adjustment dialog styling
.q-dialog .q-card {
  border-radius: 12px;
}

// Responsive design
@media (max-width: 768px) {
  .warehouse-items-container {
    gap: 16px;
  }

  .filter-buttons {
    width: 100%;

    .filter-btn {
      min-width: auto;
      flex: 1;
    }
  }

  .fixed-bottom-center {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }
}

// Enhanced Modal Styles - Item Details Modal
.item-details-modal {
  max-width: 95vw;
  max-height: 95vh;
  width: 1200px;
  border-radius: 12px;
  overflow: hidden;

  &.full-screen-mobile {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
}

.modal-scroll-area {
  max-height: calc(95vh - 140px);
  overflow-y: auto;
}

.modal-content-padding {
  padding: 24px;
}

.item-header {
  margin-bottom: 32px;
}

.item-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.2;
}

.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.id-chip {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.content-card {
  min-height: 200px;
}

.responsive-card {
  transition: all 0.2s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.section-spacing {
  margin-bottom: 24px;
}

.card-header {
  padding: 16px 20px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-summary-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.status-avatar {
  flex-shrink: 0;
}

.status-text {
  flex: 1;
}

.status-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.status-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 2px;
}

.status-badge {
  flex-shrink: 0;
}

.modal-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;

  .close-btn {
    min-width: 100px;

    &.mobile-close-btn {
      width: 100%;
      min-height: 48px;
      font-size: 1rem;
      font-weight: 600;
    }
  }
}

.pricing-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pricing-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.pricing-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.pricing-value {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 4px;

  &.cost {
    color: #10b981;
  }

  &.solo {
    color: #3b82f6;
  }

  &.bulk {
    color: #f59e0b;
  }

  &.unit {
    color: #8b5cf6;
  }
}

.pricing-desc {
  font-size: 0.8rem;
  color: #6b7280;
  font-style: italic;
}

.stock-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stock-metric-large {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  border: 2px solid #3b82f6;
}

.metric-icon {
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;

  &.total {
    color: #1d4ed8;
  }
}

.metric-desc {
  font-size: 0.8rem;
  color: #6b7280;
}

.stock-metric {
  padding: 8px 0;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;

  &.highlight {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
}

.metric-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.config-item {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.config-title {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.config-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d9488;
}

.config-desc {
  font-size: 0.85rem;
  color: #6b7280;
  font-style: italic;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.breakdown-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(251, 146, 60, 0.05);
  border: 1px solid rgba(251, 146, 60, 0.2);
  border-radius: 8px;
}

.breakdown-icon {
  flex-shrink: 0;
}

.breakdown-content {
  flex: 1;
}

.breakdown-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ea580c;
  line-height: 1;
  margin-bottom: 4px;
}

.breakdown-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.breakdown-calculation {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.3;
}

.verification-formula {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.formula-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #1d4ed8;
}

.formula-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.formula-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.formula-part {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;

  &.packages {
    background: rgba(16, 185, 129, 0.1);
    color: #065f46;
  }

  &.packets {
    background: rgba(59, 130, 246, 0.1);
    color: #1e3a8a;
  }

  &.pieces {
    background: rgba(251, 146, 60, 0.1);
    color: #9a3412;
  }
}

.formula-operator {
  font-weight: 600;
  color: #374151;
}

.formula-result {
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.2);
  color: #065f46;
  border-radius: 4px;
  font-weight: 700;
}

.status-summary {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #d1d5db;
}

// Additional utility classes for better responsiveness
.h-full {
  height: 100%;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {

  .pricing-item,
  .config-item,
  .breakdown-item {
    border-width: 2px;
    border-color: currentColor;
  }

  .status-summary {
    border-width: 3px;
  }
}

// Print styles
@media print {
  .item-details-modal {
    width: 100% !important;
    max-width: none !important;
    max-height: none !important;
    box-shadow: none !important;
  }

  .modal-actions {
    display: none !important;
  }

  .card-header {
    background: #f3f4f6 !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .main-content-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}

// Focus management for better keyboard navigation
.q-btn:focus,
.q-chip:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

// Scrollbar styling for webkit browsers
.modal-scroll-area::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll-area::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.modal-scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

// Mobile landscape orientation adjustments
@media (max-width: 767px) and (orientation: landscape) {
  .item-details-modal {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
  }

  .modal-scroll-area {
    max-height: calc(100vh - 100px);
  }

  .modal-content-padding {
    padding: 8px 16px;
  }

  .main-content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .item-header {
    margin-bottom: 12px;
  }

  .item-title {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  .section-spacing {
    margin-bottom: 8px;
  }

  .breakdown-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .breakdown-item {
    padding: 6px;
  }

  .stock-metric-large {
    padding: 8px;
    flex-direction: row;
    text-align: left;
  }
}

// Comprehensive Responsive Design

// Large Desktop (1200px+)
@media (min-width: 1200px) {
  .item-details-modal {
    width: 1200px;
  }

  .main-content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .breakdown-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .config-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Desktop (992px - 1199px)
@media (max-width: 1199px) and (min-width: 992px) {
  .item-details-modal {
    width: 95vw;
    max-width: 1000px;
  }

  .main-content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .breakdown-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

// Tablet (768px - 991px)
@media (max-width: 991px) and (min-width: 768px) {
  .item-details-modal {
    width: 95vw;
    max-width: 900px;
  }

  .modal-content-padding {
    padding: 20px;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .item-title {
    font-size: 1.6rem;
  }

  .item-chips {
    justify-content: center;
  }

  .breakdown-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .stock-metric-large {
    padding: 12px;
  }

  .status-summary-content {
    gap: 12px;
  }

  .formula-line {
    justify-content: center;
    text-align: center;
  }
}

// Mobile Large (576px - 767px)
@media (max-width: 767px) and (min-width: 576px) {
  .item-details-modal {
    width: 98vw;
    max-height: 98vh;
  }

  .modal-scroll-area {
    max-height: calc(98vh - 120px);
  }

  .modal-content-padding {
    padding: 16px;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .item-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .item-title {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .item-chips {
    justify-content: center;
    gap: 6px;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .breakdown-item {
    padding: 12px;
  }

  .breakdown-value {
    font-size: 1.5rem;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item {
    padding: 12px;
  }

  .stock-metric-large {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px;
  }

  .metric-value {
    font-size: 1.6rem;
  }

  .status-summary-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .formula-line {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .formula-part,
  .formula-operator,
  .formula-result {
    margin: 2px 0;
  }

  .pricing-grid {
    gap: 12px;
  }

  .pricing-item {
    padding: 10px;
  }

  .pricing-value {
    font-size: 1.2rem;
  }

  .verification-formula {
    padding: 12px;
  }

  .section-spacing {
    margin-bottom: 16px;
  }
}

// Mobile Small (up to 575px)
@media (max-width: 575px) {
  .item-details-modal {
    width: 100vw;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  .modal-scroll-area {
    max-height: calc(100vh - 110px);
  }

  .modal-content-padding {
    padding: 12px;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .item-header {
    margin-bottom: 16px;
    text-align: center;
  }

  .item-title {
    font-size: 1.2rem;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .item-chips {
    justify-content: center;
    gap: 4px;
  }

  .item-chips .q-chip {
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  .card-title {
    font-size: 1rem;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .breakdown-item {
    padding: 8px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .breakdown-icon {
    align-self: center;
  }

  .breakdown-value {
    font-size: 1.3rem;
  }

  .breakdown-label {
    font-size: 0.85rem;
  }

  .breakdown-calculation {
    font-size: 0.75rem;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item {
    padding: 8px;
    text-align: center;
  }

  .config-header {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 6px;
  }

  .config-value {
    font-size: 1.2rem;
  }

  .stock-metric-large {
    flex-direction: column;
    text-align: center;
    gap: 6px;
    padding: 8px;
  }

  .metric-value {
    font-size: 1.4rem;
  }

  .metric-label {
    font-size: 0.8rem;
  }

  .status-summary-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px;
  }

  .status-avatar {
    align-self: center;
  }

  .status-title {
    font-size: 1rem;
  }

  .status-subtitle {
    font-size: 0.8rem;
  }

  .formula-line {
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  .formula-part,
  .formula-operator,
  .formula-result {
    margin: 1px 0;
    font-size: 0.8rem;
    padding: 3px 6px;
  }

  .pricing-grid {
    gap: 8px;
  }

  .pricing-item {
    padding: 8px;
    text-align: center;
  }

  .pricing-label {
    justify-content: center;
    font-size: 0.8rem;
  }

  .pricing-value {
    font-size: 1.1rem;
  }

  .pricing-desc {
    font-size: 0.75rem;
  }

  .verification-formula {
    padding: 8px;
  }

  .formula-header {
    justify-content: center;
    font-size: 0.8rem;
  }

  .section-spacing {
    margin-bottom: 12px;
  }

  .modal-actions {
    padding: 12px;
  }

  .warehouse-items-container {
    gap: 12px;
  }

  .filter-buttons {
    width: 100%;
    flex-direction: column;
    gap: 6px;

    .filter-btn {
      min-width: auto;
      width: 100%;
      font-size: 0.9rem;
    }
  }

  .fixed-bottom-center {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
  }
}

// Legacy responsive adjustments (keeping for compatibility)
@media (max-width: 768px) {
  .warehouse-items-container {
    gap: 16px;
  }

  .filter-buttons {
    width: 100%;

    .filter-btn {
      min-width: auto;
      flex: 1;
    }
  }

  .fixed-bottom-center {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
