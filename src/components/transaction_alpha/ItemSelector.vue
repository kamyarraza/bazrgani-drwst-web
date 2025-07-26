<script setup lang="ts">
import { ref, watch, onMounted, computed, defineExpose } from 'vue';
import { useItemStore } from 'src/stores/itemStore';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

interface SelectedItem {
  item: any;
  unit_cost: number;
  solo_unit_cost: number;
  bulk_unit_cost: number;
  quantity: number;
  packages: number;
  packets: number;
}

const props = defineProps({
  transactionType: { type: String, default: 'purchase' },
  warehouseId: { type: [Number, String, null], default: null }
});
const emit = defineEmits(['update:selectedItems']);

const itemStore = useItemStore();
const { items, loading } = storeToRefs(itemStore);

const searchQuery = ref('');
let searchTimeout: any = null;

const selectedItems = ref<SelectedItem[]>([]);
const selectedItemIds = computed(() => new Set(selectedItems.value.map(sel => sel.item.id)));

const lastChangedField = ref('');

const { t } = useI18n();

// Remove watcher that copies props.selectedItems to local selectedItems
// Only emit changes to parent
watch(selectedItems, (val) => {
  emit('update:selectedItems', val);
}, { deep: true });

onMounted(async () => {
  if (props.transactionType === 'purchase') {
    await itemStore.fetchItems();
  }
  // For sell, do not fetch items until warehouse is selected
});

watch(() => props.warehouseId, (warehouseId) => {
  if (props.transactionType === 'sell' && warehouseId) {
    void itemStore.fetchItemsByWarehouse(warehouseId);
  }
});

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (props.transactionType === 'sell') {
    if (!props.warehouseId) return; // Don't search if no warehouse selected
    void itemStore['searchItemsByWarehouse']((searchQuery.value || '').trim(), props.warehouseId);
    return;
  }
  void itemStore.searchItems((searchQuery.value || '').trim());
}

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!val || !val.trim()) {
    // If cleared, fetch all items
    searchTimeout = setTimeout(() => {
      if (props.transactionType === 'sell' && props.warehouseId) {
        void itemStore.fetchItemsByWarehouse(props.warehouseId);
      } else {
        void itemStore.fetchItems();
      }
    }, 1000);
    return;
  }
  searchTimeout = setTimeout(() => {
    if (props.transactionType === 'sell' && props.warehouseId) {
      void itemStore['searchItemsByWarehouse'](val.trim(), props.warehouseId);
    } else {
      void itemStore.searchItems(val.trim());
    }
  }, 1000);
});

function selectItem(item) {
  if (selectedItemIds.value.has(item.id)) return;
  selectedItems.value.push({
    item,
    unit_cost: item.unit_cost || 0,
    solo_unit_cost: item.solo_unit_price || 0,
    bulk_unit_cost: item.bulk_unit_price || 0,
    quantity: 1,
    packages: 0,
    packets: 0
  });
}

function onPackagesChange(selected, val) {
  if (lastChangedField.value === 'packages') return;
  lastChangedField.value = 'packages';
  selected.packages = val || 0;
  const packageUnits = selected.item.package_units || 0;
  const packetUnits = selected.item.packet_units || 0;
  selected.packets = selected.packages * packageUnits;
  selected.quantity = selected.packets * packetUnits;
  lastChangedField.value = '';
}
function onPacketsChange(selected, val) {
  if (lastChangedField.value === 'packets') return;
  lastChangedField.value = 'packets';
  selected.packets = val || 0;
  const packageUnits = selected.item.package_units || 0;
  const packetUnits = selected.item.packet_units || 0;
  selected.packages = packageUnits > 0 ? Math.floor(selected.packets / packageUnits) : 0;
  selected.quantity = selected.packets * packetUnits;
  lastChangedField.value = '';
}
function onQuantityChange(selected, val) {
  if (lastChangedField.value === 'quantity') return;
  lastChangedField.value = 'quantity';
  selected.quantity = val || 0;
  const packageUnits = selected.item.package_units || 0;
  const packetUnits = selected.item.packet_units || 0;
  let remaining = selected.quantity;
  if (packageUnits > 0 && packetUnits > 0) {
    selected.packages = Math.floor(remaining / (packageUnits * packetUnits));
    remaining = remaining % (packageUnits * packetUnits);
    selected.packets = Math.floor(remaining / packetUnits);
  } else if (packetUnits > 0) {
    selected.packages = 0;
    selected.packets = Math.floor(remaining / packetUnits);
  } else if (packageUnits > 0) {
    selected.packages = Math.floor(remaining / packageUnits);
    selected.packets = 0;
  } else {
    selected.packages = 0;
    selected.packets = 0;
  }
  lastChangedField.value = '';
}

function removeItem(idx) {
  selectedItems.value.splice(idx, 1);
}

function clearAll() {
  selectedItems.value = [];
}

function fetchItemsForWarehouse() {
  if (props.transactionType === 'sell' && props.warehouseId) {
    void itemStore.fetchItemsByWarehouse(props.warehouseId);
  }
}

defineExpose({
  fetchItemsForWarehouse,
  clearAll
});
</script>

<template>
  <div class="item-selector-redesign">

    <div class="item-selector-content">
      <div class="item-list-fullwidth">
        <div class="search-row q-mb-md">
          <q-input
            v-model="searchQuery"
            :label="t('transactionAlpha.searchItems')"
            outlined
            dense
            clearable
            :loading="loading"
            class="search-input"
            @keyup.enter="onSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            :label="t('transactionAlpha.search')"
            color="primary"
            class="search-btn"
            :loading="loading"
            @click="onSearch"
            flat
            dense
            no-caps
          />
        </div>
        <div class="items-container">
          <div v-if="loading" class="loading-state">
            <q-spinner color="primary" size="2em" />
            <p class="loading-text">{{ t('transactionAlpha.searchingItems') }}</p>
          </div>

          <div v-else-if="items.length === 0" class="empty-state">
            <q-icon name="inventory_2" size="3em" color="grey-4" />
            <p class="empty-text">{{ t('transactionAlpha.noItemsFound') }}</p>
            <p class="empty-subtext">{{ t('transactionAlpha.tryDifferentSearch') }}</p>
          </div>

          <div v-else class="items-grid">
            <div
              v-for="item in items"
              :key="item.id"
              class="item-card"
              :class="{ 'item-selected': selectedItemIds.has(item.id) }"
            >
              <div class="item-header">
                <div class="item-name">{{ item.name }}</div>
                <q-btn
                  :icon="selectedItemIds.has(item.id) ? 'check_circle' : 'add_circle'"
                  :color="selectedItemIds.has(item.id) ? 'positive' : 'primary'"
                  flat
                  round
                  dense
                  size="sm"
                  @click="() => { if (!selectedItemIds.has(item.id)) selectItem(item); }"
                  :disable="selectedItemIds.has(item.id)"
                  class="add-button"
                />
              </div>

              <div class="item-details">
                <div class="item-meta">
                  <span v-if="item.sku" class="item-sku">SKU: {{ item.sku }}</span>
                  <span v-if="item.category" class="item-category">{{ item.category.name }}</span>
                </div>

                <div class="item-quantities">
                  <div v-if="props.transactionType=='sell'" class="quantity-badge available">
                    <q-icon name="inventory" size="14px" />
                    <span>{{ t('transactionAlpha.qty') }}: {{ item.quantity ?? 0 }}</span>
                  </div>
                  <div v-if="item.package_units" class="quantity-badge packages">
                    <q-icon name="inventory_2" size="14px" />
                    <span>{{ t('transactionAlpha.pkg') }}: {{ item.packages }}</span>
                  </div>
                  <div v-if="item.packet_units" class="quantity-badge packets">
                    <q-icon name="category" size="14px" />
                    <span>{{ t('transactionAlpha.pkt') }}: {{ item.packets }}</span>
                  </div>
                  <div v-if="item.pieces" class="quantity-badge pieces">
                    <q-icon name="style" size="14px" />
                    <span>{{ t('transactionAlpha.pieces') }}: {{ item.pieces }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedItems.length > 0" class="selected-items-scroll">
        <div class="q-mb-sm"><b>{{ t('transactionAlpha.selectedItems') }}</b></div>
        <div v-for="(selected, idx) in selectedItems" :key="selected.item.id" class="selected-item-card-modern q-mb-md">
          <div class="row items-center q-col-gutter-md flex-nowrap">
            <div class="col-auto item-info-col">
              <div class="text-weight-bold text-lg">{{ selected.item.name }}</div>
              <div class="text-caption text-grey-7">
                <span v-if="selected.item.sku">SKU: {{ selected.item.sku }}</span>
                <span v-if="selected.item.category"> | {{ selected.item.category.name }}</span>
              </div>
            </div>
            <div class="col-auto">
              <q-input v-if="selected.item.package_units > 0" v-model.number="selected.packages" :label="t('transactionAlpha.packages')" type="number" dense outlined min="0" style="max-width:90px;" @update:model-value="val => onPackagesChange(selected, val)" />
              <div v-if="selected.item.package_units > 0" class="text-caption text-grey-7 q-mt-xs">{{ t('transactionAlpha.packageHint', { n: selected.item.package_units }) }}</div>
            </div>
            <div class="col-auto">
              <q-input v-if="selected.item.packet_units > 0" v-model.number="selected.packets" :label="t('transactionAlpha.packets')" type="number" dense outlined min="0" style="max-width:90px;" @update:model-value="val => onPacketsChange(selected, val)" />
              <div v-if="selected.item.packet_units > 0" class="text-caption text-grey-7 q-mt-xs">{{ t('transactionAlpha.packetHint', { n: selected.item.packet_units }) }}</div>
            </div>
            <div class="col-auto">
              <q-input v-model.number="selected.quantity" :label="t('transactionAlpha.quantity')" type="number" dense outlined min="0" style="max-width:90px;" @update:model-value="val => onQuantityChange(selected, val)" />
              <div class="text-caption text-grey-7 q-mt-xs">{{ t('transactionAlpha.totalItems', { n: selected.quantity }) }}</div>
            </div>
            <div class="col q-gutter-md flex justify-end items-center">
              <q-input v-model.number="selected.unit_cost" :label="t('transactionAlpha.unitCost')" type="number" dense outlined min="0" style="max-width:110px;" />
              <q-input v-model.number="selected.solo_unit_cost" :label="t('transactionAlpha.soloUnitCost')" type="number" dense outlined min="0" style="max-width:110px;" :disable="props.transactionType === 'sell'" />
              <q-input v-model.number="selected.bulk_unit_cost" :label="t('transactionAlpha.bulkUnitCost')" type="number" dense outlined min="0" style="max-width:110px;" :disable="props.transactionType === 'sell'" />
              <q-btn icon="delete" color="negative" flat round dense @click="removeItem(idx)" class="q-ml-md" />
            </div>
          </div>
        </div>
        <div class="q-mt-sm">
          <q-btn :label="t('transactionAlpha.clearAll')" color="negative" flat @click="clearAll" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-selector-redesign {
  width: 100%;
  margin: 0 auto;
}
.item-selector-divider {
  border: none;
  border-top: 2px solid #1976d2;
  margin: 24px 0 32px 0;
  width: 100%;
}
.item-selector-content {
  width: 100%;
  display: block;
}
.item-selector-left {
  flex: 1 1 350px;
  max-width: 350px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-input {
  flex: 1 1 auto;
}
.search-btn {
  min-width: 90px;
}
/* Professional Item Cards Design */
.items-container {
  max-height: 320px;
  overflow-y: auto;
  width: 100%;
  margin-top: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-text {
  margin: 16px 0 0 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-text {
  margin: 16px 0 8px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
}

.empty-subtext {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 4px;
}

.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.item-card:hover {
  border-color: #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

.item-card.item-selected {
  border-color: #4caf50;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.add-button {
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.add-button:hover {
  transform: scale(1.1);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.8rem;
  color: #6b7280;
}

.item-sku {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.item-category {
  background: #e0f2fe;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.item-quantities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quantity-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.quantity-badge.available {
  background: #dcfce7;
  color: #166534;
}

.quantity-badge.packages {
  background: #dbeafe;
  color: #1e40af;
}

.quantity-badge.packets {
  background: #fef3c7;
  color: #92400e;
}

.quantity-badge.pieces {
  background: #f3e8ff;
  color: #7c3aed;
}

.item-list {
  margin-top: 8px;
}
/* .item-selector-selected {
  flex: 2 1 0;
  min-width: 0;
} */
.item-list-fullwidth {
  width: 100%;
  margin-bottom: 24px;
}
.selected-items-scroll {
  max-height: 350px;
  overflow-y: auto;
  width: 100%;
  margin: 0;
}
.selected-item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px 24px 16px 24px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  width: 100%;
  margin: 0 0 16px 0;
  box-sizing: border-box;
}
.selected-item-card-modern {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 14px 8px 14px;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  width: 100%;
  margin: 0 0 10px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.price-col {
  border-left: 1px solid #e0e0e0;
  padding-left: 18px !important;
  min-width: 180px;
}
.item-info-col {
  min-width: 160px;
  max-width: 220px;
}
@media (max-width: 900px) {
  .selected-item-card-modern .row.no-wrap {
    flex-direction: column !important;
  }
  .price-col {
    border-left: none;
    padding-left: 0 !important;
    margin-top: 24px;
    min-width: 0;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
  }

  .item-card {
    padding: 12px;
  }
}

/* Additional responsive improvements for selected item card */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .item-card {
    padding: 12px;
  }

  .item-quantities {
    gap: 4px;
  }

  .quantity-badge {
    font-size: 0.7rem;
    padding: 3px 6px;
  }

  .selected-item-card-modern {
    padding: 8px 4px 6px 4px;
    border-radius: 8px;
  }
  .selected-item-card-modern .row.items-center.q-col-gutter-md.flex-nowrap {
    flex-direction: column !important;
    gap: 0 !important;
    align-items: stretch !important;
  }
  .item-info-col, .col-auto, .col {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    margin-bottom: 8px !important;
  }
  .col.q-gutter-md.flex.justify-end.items-center {
    flex-wrap: wrap;
    justify-content: flex-start !important;
    gap: 8px !important;
    margin-bottom: 8px !important;
  }
  .q-input, .q-btn {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .q-btn.q-ml-md {
    margin-left: 0 !important;
    margin-top: 8px !important;
  }
}
@media (max-width: 480px) {
  .selected-item-card-modern {
    padding: 4px 2px 4px 2px;
    border-radius: 6px;
  }
  .item-info-col {
    font-size: 0.98rem;
    min-width: 0;
    max-width: 100%;
  }
}
</style>
