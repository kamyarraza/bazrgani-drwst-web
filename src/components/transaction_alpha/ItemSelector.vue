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
        <q-list bordered separator class="item-list" style="max-height: 320px; overflow-y: auto; width: 100%;">
          <q-item v-for="item in items" :key="item.id">
            <q-item-section>
              <q-item-label>{{ item.name }}</q-item-label>
              <div class="q-gutter-xs q-mt-xs">
                <q-chip dense color="primary" text-color="white" v-if="props.transactionType=='sell'">{{ t('transactionAlpha.qty') }}: {{ item.quantity ?? 0 }}</q-chip>
                <q-chip v-if="item.package_units" dense color="secondary" text-color="white">{{ t('transactionAlpha.pkg') }}: {{ item.packages }}</q-chip>
                <q-chip v-if="item.packet_units" dense color="accent" text-color="white">{{ t('transactionAlpha.pkt') }}: {{ item.packets }}</q-chip>
                <q-chip v-if="item.pieces" dense color="teal" text-color="white">{{ t('transactionAlpha.pieces') }}: {{ item.pieces }}</q-chip>
              </div>
              <q-item-label caption>
                <span v-if="item.sku">SKU: {{ item.sku }}</span>
                <span v-if="item.category"> | {{ item.category.name }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                :icon="selectedItemIds.has(item.id) ? 'check' : 'add'"
                :color="selectedItemIds.has(item.id) ? 'positive' : 'primary'"
                flat
                round
                dense
                @click="() => { if (!selectedItemIds.has(item.id)) selectItem(item); }"
                :disable="selectedItemIds.has(item.id)"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="!loading && items.length === 0">
            <q-item-section>{{ t('transactionAlpha.noItemsFound') }}</q-item-section>
          </q-item>
        </q-list>
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
}

/* Additional responsive improvements for selected item card */
@media (max-width: 768px) {
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
