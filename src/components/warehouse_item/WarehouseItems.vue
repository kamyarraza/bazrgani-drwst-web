<template>
  <div class="warehouse-items-container" v-if="selectedWarehouse">
    <!-- Simple Header Section -->
    <div class="q-mb-md">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h6 text-weight-medium">
            <q-icon name="inventory_2" class="q-mr-sm" />
            {{ t('warehouseItem.title', 'Warehouse Items') }}
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

      <!-- Filter Section -->
      <div class="row items-center q-mt-md">
        <div class="col-auto">
          <div class="filter-buttons">
            <q-btn :label="t('warehouseItem.regularItems', 'Regular Items')"
              :color="selectedRelationType === 'items' ? 'primary' : 'grey-5'" :flat="selectedRelationType !== 'items'"
              :icon="selectedRelationType === 'items' ? 'inventory' : 'inventory'" no-caps class="q-mr-sm filter-btn"
              @click="handleRelationTypeChange('items')" />
            <q-btn :label="t('warehouseItem.blumItems', 'Blum Items')"
              :color="selectedRelationType === 'blum_items' ? 'primary' : 'grey-5'"
              :flat="selectedRelationType !== 'blum_items'"
              :icon="selectedRelationType === 'blum_items' ? 'inventory_2' : 'inventory_2'" no-caps class="filter-btn"
              @click="handleRelationTypeChange('blum_items')" />
          </div>
        </div>
        <div class="col">
          <div class="text-caption text-grey-6 q-ml-md">
            {{ t('warehouseItem.filterDescription', 'Switch between regular items and blum items') }}
          </div>
        </div>
      </div>
    </div> <!-- Data Table -->
    <div class="warehouse-items-content">
      <QtableB v-if="hasCurrentItems" show-bottom :columns="currentColumns" :rows="currentItems"
        :loading="warehouseStore.loading" :top-right="false" :menuItems="menuItems"
        :pagination="warehouseStore.pagination" @page-change="handlePageChange" @menu-action="handleAction"
        class="warehouse-items-table" flat bordered>
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
              :label="Number(props.value || 0).toLocaleString()" class="quantity-badge" />
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
          @click="props.selectedWarehouse && loadWarehouseItems(props.selectedWarehouse.id)" class="q-mt-md" />
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

  <!-- Add Item Modal (placeholder) -->
  <!-- <AddWarehouseItem v-model="showAddItemModal" :warehouse-id="selectedWarehouse?.id" @submit="handleAddSubmit" /> -->

  <!-- View Item Modal -->
  <q-dialog v-model="showViewModal" persistent>
    <q-card style="min-width: 600px; max-width: 900px;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="visibility" class="q-mr-sm" />
          {{ t('warehouseItem.viewItemDetails', 'View Item Details') }}
        </div>
      </q-card-section>

      <template v-if="selectedItemForView">
        <q-card-section class="q-pt-md">
          <!-- Item Header -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <div class="text-h6 text-primary">{{ selectedItemForView.name }}</div>
              <div class="text-subtitle2 text-grey-7">
                <q-chip color="grey-6" text-color="white" size="sm" square class="id-chip">
                  #{{ selectedItemForView.id }}
                </q-chip>
                <q-chip v-if="'code' in selectedItemForView && selectedItemForView.code" color="blue-grey"
                  text-color="white" size="sm" class="q-ml-sm">
                  {{ selectedItemForView.code }}
                </q-chip>
                <q-chip v-if="'part_no' in selectedItemForView && selectedItemForView.part_no" color="indigo"
                  text-color="white" size="sm" class="q-ml-sm">
                  {{ selectedItemForView.part_no }}
                </q-chip>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Item Details Grid -->
          <div class="row q-col-gutter-md">
            <!-- Pricing Information -->
            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-sm text-primary">
                <q-icon name="attach_money" class="q-mr-sm" />
                {{ t('warehouseItem.pricingInfo', 'Pricing Information') }}
              </div>
              <q-list dense bordered class="rounded-borders">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.unitCost', 'Unit Cost')
                    }}</q-item-label>
                    <q-item-label caption class="text-h6 text-positive">${{ parseFloat(selectedItemForView.unit_cost ||
                      '0').toFixed(2) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item v-if="'solo_unit_price' in selectedItemForView">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.soloPrice', 'Solo Unit Price')
                    }}</q-item-label>
                    <q-item-label caption class="text-h6 text-primary">${{
                      parseFloat(selectedItemForView.solo_unit_price || '0').toFixed(2) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator v-if="'solo_unit_price' in selectedItemForView" />
                <q-item v-if="'bulk_unit_price' in selectedItemForView">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.bulkPrice', 'Bulk Unit Price')
                    }}</q-item-label>
                    <q-item-label caption class="text-h6 text-orange">${{ parseFloat(selectedItemForView.bulk_unit_price
                      || '0').toFixed(2) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="'unit_price' in selectedItemForView">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.unitPrice', 'Unit Price')
                    }}</q-item-label>
                    <q-item-label caption class="text-h6 text-primary">${{ parseFloat(selectedItemForView.unit_price ||
                      '0').toFixed(2) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Inventory Information -->
            <div class="col-12 col-md-6">
              <div class="text-h6 q-mb-sm text-primary">
                <q-icon name="inventory_2" class="q-mr-sm" />
                {{ t('warehouseItem.inventoryInfo', 'Inventory Information') }}
              </div>
              <q-list dense bordered class="rounded-borders">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.quantity', 'Total Quantity')
                    }}</q-item-label>
                    <q-item-label caption class="text-subtitle1 text-weight-medium">
                      <q-badge
                        :color="(selectedItemForView.quantity || 0) > 100 ? 'positive' : (selectedItemForView.quantity || 0) > 50 ? 'warning' : 'negative'"
                        :label="String(selectedItemForView.quantity || 0)" size="sm" class="quantity-badge-small" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator v-if="'pieces' in selectedItemForView" />
                <q-item v-if="'pieces' in selectedItemForView">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.pieces', 'Pieces') }}</q-item-label>
                    <q-item-label caption class="text-subtitle1 text-weight-medium">{{ selectedItemForView.pieces || 0
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator v-if="'reservations' in selectedItemForView" />
                <q-item v-if="'reservations' in selectedItemForView">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.reservations', 'Reserved Items')
                    }}</q-item-label>
                    <q-item-label caption class="text-subtitle1 text-weight-medium">
                      <q-badge color="info" :label="String(selectedItemForView.reservations || 0)" size="sm"
                        class="reservations-badge-small" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator v-if="'position' in selectedItemForView && selectedItemForView.position" />
                <q-item v-if="'position' in selectedItemForView && selectedItemForView.position">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ t('warehouseItem.position', 'Position')
                    }}</q-item-label>
                    <q-item-label caption class="text-subtitle1 text-weight-medium">{{ selectedItemForView.position
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <!-- Package Information (only for regular items) -->
          <div class="q-mt-md"
            v-if="'packets' in selectedItemForView && (selectedItemForView.packets || selectedItemForView.packages)">
            <div class="text-h6 q-mb-sm text-primary">
              <q-icon name="inventory" class="q-mr-sm" />
              {{ t('warehouseItem.packageInfo', 'Package Information') }}
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6" v-if="selectedItemForView.packets">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-subtitle2 text-grey-6">{{ t('warehouseItem.packets', 'Packets') }}</div>
                    <div class="text-h6 text-teal">{{ selectedItemForView.packets }}</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6" v-if="selectedItemForView.packages">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-subtitle2 text-grey-6">{{ t('warehouseItem.packages', 'Packages') }}</div>
                    <div class="text-h6 text-teal">{{ selectedItemForView.packages }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <!-- Stock Status Summary -->
          <div class="q-mt-md">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium">{{ t('warehouseItem.availability', 'Availability') }}
                    </div>
                  </div>
                </div>
                <div class="text-caption text-grey-6 q-mt-sm">
                  {{ t('warehouseItem.availableForSale', 'Available for sale') }}:
                  <strong>{{ (selectedItemForView.quantity || 0) - ('reservations' in selectedItemForView ?
                    selectedItemForView.reservations || 0 : 0) }}</strong> {{ t('warehouseItem.units', 'units') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-primary">
          <q-btn :label="t('common.close', 'Close')" v-close-popup flat icon="close" />
        </q-card-actions>
      </template>
    </q-card>
  </q-dialog>

  <!-- Stock Adjustment Dialog -->
  <q-dialog v-model="showAdjustDialog">
    <q-card class="q-pa-md" style="min-width: 400px;">
      <div class="text-h6 q-mb-md">
        <q-icon name="tune" class="q-mr-sm" />
        {{ t('warehouseItem.adjustStock', 'Adjust Stock') }}
      </div>

      <div class="q-mb-md" v-if="adjustItem">
        <div class="text-subtitle1">{{ adjustItem.name }}</div>
        <div class="text-caption text-grey-6">
          {{ t('warehouseItem.currentQuantity', 'Current Quantity') }}:
          <strong>{{ adjustItem.quantity || 0 }}</strong>
        </div>
      </div>

      <div class="q-mb-md">
        <q-input v-model.number="adjustQuantity" type="number" min="1" :label="t('warehouseItem.quantity', 'Quantity')"
          outlined dense />
      </div>

      <div class="q-mb-md">
        <q-option-group v-model="adjustAction" :options="[
          { label: t('warehouseItem.add', 'Add to Stock'), value: 'add', color: 'positive' },
          { label: t('warehouseItem.remove', 'Remove from Stock'), value: 'remove', color: 'negative' }
        ]" color="primary" inline />
      </div>

      <q-card-actions align="right">
        <q-btn flat :label="t('common.cancel', 'Cancel')" v-close-popup />
        <q-btn color="primary" :label="t('warehouseItem.addToQueue', 'Add to Queue')" @click="addAdjustment"
          :disable="!adjustQuantity || adjustQuantity <= 0" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Confirmation Dialog for Batch Adjustments -->
  <q-dialog v-model="showConfirmDialog">
    <q-card class="q-pa-md" style="min-width: 500px;">
      <div class="text-h6 q-mb-md">
        <q-icon name="warning" class="q-mr-sm" color="warning" />
        {{ t('warehouseItem.confirmAdjustments', 'Confirm Stock Adjustments') }}
      </div>

      <div class="q-mb-md">
        {{ t('warehouseItem.aboutToAdjust', 'You are about to adjust stock for the following items:') }}
      </div>

      <q-list bordered separator class="q-mb-md">
        <q-item v-for="(adjustment, itemId) in adjustedItems" :key="itemId">
          <q-item-section>
            <q-item-label>
              {{currentItems.find(item => item.id === Number(itemId))?.name || `Item #${itemId}`}}
            </q-item-label>
            <q-item-label caption>
              <q-badge :color="adjustment.action === 'add' ? 'positive' : 'negative'"
                :label="`${adjustment.action === 'add' ? '+' : '-'}${adjustment.quantity}`" />
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="close" @click="removeAdjustment(Number(itemId))" color="grey" />
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-actions align="right">
        <q-btn flat :label="t('common.cancel', 'Cancel')" v-close-popup />
        <q-btn color="primary" :label="t('warehouseItem.confirmSubmit', 'Confirm & Submit')"
          @click="submitAllAdjustments" :loading="isSubmitting" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Floating Action Button for Pending Adjustments -->
  <q-fab v-if="Object.keys(adjustedItems).length > 0" color="orange" icon="inventory" direction="up"
    class="fixed-bottom-center" @click="showConfirmDialog = true">
    <q-badge color="red" floating>
      {{ Object.keys(adjustedItems).length }}
    </q-badge>
    <q-fab-action color="deep-orange" icon="send" :label="t('warehouseItem.submitAdjustments', 'Submit All')"
      @click="showConfirmDialog = true" />
  </q-fab>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { useRTL } from 'src/composables/useRTL';
import type { Warehouse } from 'src/types/warehouse';
import type { AnyItem } from 'src/types/warehouse_item';
import QtableB from 'src/components/common/Qtable.vue';
import type { MenuItem } from 'src/types';
import { api } from 'boot/axios';
import { showNotify } from 'src/composables/Notify';

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

// Modal state
const showViewModal = ref(false);
const selectedItemForView = ref<AnyItem | null>(null);

// Computed property to get current items based on selected type
const currentItems = computed(() => {
  if (!warehouseStore.warehouseItems) return [];

  if (selectedRelationType.value === 'items') {
    return warehouseStore.warehouseItems.items || [];
  } else {
    return warehouseStore.warehouseItems.blum_items || [];
  }
});

// Check if we have any data for the current selection
const hasCurrentItems = computed(() => {
  return currentItems.value && currentItems.value.length > 0;
});

// Get current columns based on selected type
const currentColumns = computed(() => {
  if (selectedRelationType.value === 'items') {
    return itemColumns;
  } else {
    return blumItemColumns;
  }
});

// --- Stock Adjustment State ---
const adjustments = ref<Record<number, { quantity: number, action: 'add' | 'remove' }>>({});
const showAdjustDialog = ref(false);
const adjustItem = ref<AnyItem | null>(null);
const adjustQuantity = ref(1);
const adjustAction = ref<'add' | 'remove'>('add');
const isSubmitting = ref(false);
const showConfirmDialog = ref(false);

// Computed to get items with pending adjustments
const adjustedItems = computed(() => {
  return Object.fromEntries(
    Object.entries(adjustments.value).filter(([_, adj]) => adj.quantity > 0)
  );
});

// Menu items for row actions - now includes adjust stock
const menuItems: MenuItem[] = [
  { label: t('common.details', 'View Item'), icon: 'visibility', value: 'view' },
  { label: t('warehouseItem.adjust', 'Adjust Stock'), icon: 'tune', value: 'adjust' }
];

// Handle menu actions
function handleAction(payload: { item: { value: string }, rowId: number }) {
  const item = currentItems.value.find(item => item.id === payload.rowId);
  if (!item) return;

  if (payload.item.value === 'view') {
    viewItem(item);
  } else if (payload.item.value === 'edit') {
    editItem(item);
  } else if (payload.item.value === 'delete') {
    removeItem(payload.rowId);
  } else if (payload.item.value === 'adjust') {
    openAdjustDialog(item);
  }
}

// Open adjustment dialog for a single item
function openAdjustDialog(item: AnyItem) {
  adjustItem.value = item;
  adjustQuantity.value = 1;
  adjustAction.value = 'add';
  showAdjustDialog.value = true;
}

// Add adjustment to pending list
function addAdjustment() {
  if (!adjustItem.value || adjustQuantity.value <= 0) return;

  adjustments.value[adjustItem.value.id] = {
    quantity: adjustQuantity.value,
    action: adjustAction.value
  };

  showAdjustDialog.value = false;

  showNotify({
    type: 'positive',
    message: t('warehouseItem.adjustmentAdded', 'Adjustment added to queue'),
    position: 'top',
    duration: 2000
  });
}

// Submit all pending adjustments
async function submitAllAdjustments() {
  if (!props.selectedWarehouse || Object.keys(adjustedItems.value).length === 0) return;

  isSubmitting.value = true;
  try {
    const payload = {
      _method: 'put',
      items: Object.entries(adjustedItems.value).map(([itemId, adjustment]) => ({
        item_id: Number(itemId),
        quantity: adjustment.quantity,
        action: adjustment.action
      }))
    };

    await api.post(`/warehouses-items/adjust/quantity/${props.selectedWarehouse.id}`, payload);

    showNotify({
      type: 'positive',
      message: t('warehouseItem.adjustmentSuccess', 'Stock adjustments applied successfully'),
      position: 'top',
      duration: 3000
    });

    // Clear adjustments and refresh data
    adjustments.value = {};
    showConfirmDialog.value = false;
    await warehouseStore.fetchWarehouseItems(props.selectedWarehouse.id);

  } catch (error) {
    console.error('Error adjusting stock:', error);
    showNotify({
      type: 'negative',
      message: t('warehouseItem.adjustmentError', 'Failed to adjust stock'),
      position: 'top',
      duration: 3000
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Remove adjustment from queue
function removeAdjustment(itemId: number) {
  delete adjustments.value[itemId];
}

// Combined watcher for warehouse selection and tab visibility changes
watch(() => [props.selectedWarehouse, props.showItemsTab] as const, ([newWarehouse, showItems]) => {
  if (newWarehouse && showItems && typeof newWarehouse === 'object') {
    void loadWarehouseItems(newWarehouse.id);
  }
}, { immediate: true });

// Handle relation type change
async function handleRelationTypeChange(newRelationType: 'items' | 'blum_items') {
  selectedRelationType.value = newRelationType;
  if (props.selectedWarehouse) {
    await loadWarehouseItems(props.selectedWarehouse.id);
  }
}

// Load items for the selected warehouse
async function loadWarehouseItems(warehouseId: number) {
  try {
    await warehouseStore.fetchWarehouseItems(warehouseId, 1, 10, selectedRelationType.value);
  } catch (error) {
    console.error('Error loading warehouse items:', error);
  }
}

// Navigate back to previous screen
function goBack() {
  emit('back');
  emit('update:showItemsTab', false);
}

// View item details
function viewItem(item: AnyItem) {
  selectedItemForView.value = item;
  showViewModal.value = true;
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  if (props.selectedWarehouse) {
    try {
      await warehouseStore.fetchWarehouseItems(props.selectedWarehouse.id, page, 10, selectedRelationType.value);
    } catch (error) {
      console.error('Error loading warehouse items:', error);
    }
  }
}

// Edit warehouse item
function editItem(item: AnyItem) {
  console.log('Edit item:', item);
  // Implement edit functionality
}

// Remove item from warehouse
function removeItem(itemId: number) {
  console.log('Remove item:', itemId);
  // Implement remove functionality
}

// Table columns for warehouse items
const itemColumns = [

  {
    name: 'name',
    label: t('warehouseItem.name', 'Item Name'),
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'unit_cost',
    label: t('warehouseItem.unitCost', 'Unit Cost'),
    align: 'right' as const,
    field: 'unit_cost',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'solo_unit_price',
    label: t('warehouseItem.soloPrice', 'Solo Price'),
    align: 'right' as const,
    field: 'solo_unit_price',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'bulk_unit_price',
    label: t('warehouseItem.bulkPrice', 'Bulk Price'),
    align: 'right' as const,
    field: 'bulk_unit_price',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'quantity',
    label: t('warehouseItem.quantity', 'Quantity'),
    align: 'center' as const,
    field: 'quantity',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : 0;
      return num.toLocaleString();
    },
  },
  // {
  //   name: 'pieces',
  //   label: t('warehouseItem.pieces', 'Pieces'),
  //   align: 'center' as const,
  //   field: 'pieces',
  //   sortable: true,
  // },
  // {
  //   name: 'reservations',
  //   label: t('warehouseItem.reservations', 'Reserved'),
  //   align: 'center' as const,
  //   field: 'reservations',
  //   sortable: true,
  // },
  {
    name: 'actions',
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];

// Table columns for blum items
const blumItemColumns = [

  {
    name: 'code',
    label: t('warehouseItem.code', 'Code'),
    align: 'left' as const,
    field: 'code',
    sortable: true,
  },
  {
    name: 'part_no',
    label: t('warehouseItem.partNo', 'Part No'),
    align: 'left' as const,
    field: 'part_no',
    sortable: true,
  },
  {
    name: 'name',
    label: t('warehouseItem.name', 'Item Name'),
    align: 'left' as const,
    field: 'name',
    sortable: true,
  },
  {
    name: 'unit_cost',
    label: t('warehouseItem.unitCost', 'Unit Cost'),
    align: 'right' as const,
    field: 'unit_cost',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'unit_price',
    label: t('warehouseItem.unitPrice', 'Unit Price'),
    align: 'right' as const,
    field: 'unit_price',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? parseFloat(String(val)) : 0;
      return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
    },
  },
  {
    name: 'quantity',
    label: t('warehouseItem.quantity', 'Quantity'),
    align: 'center' as const,
    field: 'quantity',
    sortable: true,
    format: (val: unknown) => {
      const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : 0;
      return num.toLocaleString();
    },
  },
  {
    name: 'position',
    label: t('warehouseItem.position', 'Position'),
    align: 'center' as const,
    field: 'position',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];
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
</style>
