<script setup lang="ts">
import { ref, watch, onMounted, computed, defineExpose } from 'vue';
import { useItemStore } from 'src/stores/itemStore';
import { useItemCategoryStore } from 'src/stores/itemCategoryStore';
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
const categoryStore = useItemCategoryStore();
const { items, loading, pagination } = storeToRefs(itemStore);
const { itemCategories } = storeToRefs(categoryStore);

const searchQuery = ref('');
const selectedCategoryId = ref<number | null>(null);
let searchTimeout: any = null;

// Pagination state
const currentPage = ref(1);
const isLoadingMore = ref(false);
const hasMorePages = computed(() => {
  return pagination.value ? currentPage.value < pagination.value.last_page : false;
});

const selectedItems = ref<SelectedItem[]>([]);
const selectedItemIds = computed(() => new Set(selectedItems.value.map(sel => sel.item.id)));

// Items are now filtered server-side, so we just return the items from the store
const filteredItems = computed(() => {
  return items.value;
});

// Category options for the select dropdown
const categoryOptions = computed(() => {
  return itemCategories.value.map(category => ({
    label: category.name,
    value: category.id
  }));
});

const lastChangedField = ref('');

const { t } = useI18n();

// Remove watcher that copies props.selectedItems to local selectedItems
// Only emit changes to parent
watch(selectedItems, (val) => {
  emit('update:selectedItems', val);
}, { deep: true });

onMounted(async () => {
  // Load categories for filtering
  await categoryStore.fetchItemCategories();

  if (props.transactionType === 'purchase') {
    await loadInitialItems();
  }
  // For sell, do not fetch items until warehouse is selected
});

async function loadInitialItems() {
  currentPage.value = 1;
  await itemStore.fetchItemsPaginated(currentPage.value, selectedCategoryId.value);
}

async function loadMoreItems() {
  if (hasMorePages.value && !loading.value && !isLoadingMore.value) {
    isLoadingMore.value = true;
    currentPage.value += 1;

    try {
      await itemStore.fetchItemsPaginated(currentPage.value, selectedCategoryId.value, true);
    } catch {
      currentPage.value -= 1; // Revert page number on error
    } finally {
      isLoadingMore.value = false;
    }
  }
}

function onScroll(event: Event) {
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  // Load more when scrolled to within 200px of bottom
  if (scrollHeight - scrollTop - clientHeight < 200) {
    void loadMoreItems();
  }
}

watch(() => props.warehouseId, (warehouseId) => {
  if (props.transactionType === 'sell' && warehouseId) {
    void itemStore.fetchItemsByWarehouse(warehouseId, selectedCategoryId.value);
  }
});

// Watch for transaction type changes to refresh items
watch(() => props.transactionType, () => {
  refreshItems();
});

// Watch for category changes to refetch items
watch(selectedCategoryId, () => {
  if (props.transactionType === 'purchase') {
    void loadInitialItems();
  } else if (props.transactionType === 'sell' && props.warehouseId) {
    void itemStore.fetchItemsByWarehouse(props.warehouseId, selectedCategoryId.value);
  }
});

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (props.transactionType === 'sell') {
    if (!props.warehouseId) return; // Don't search if no warehouse selected
    void itemStore['searchItemsByWarehouse']((searchQuery.value || '').trim(), props.warehouseId, selectedCategoryId.value);
    return;
  }
  // For purchase, use regular search (not paginated for search results)
  void itemStore.searchItems((searchQuery.value || '').trim(), selectedCategoryId.value);
}

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!val || !val.trim()) {
    // If cleared, fetch all items
    searchTimeout = setTimeout(() => {
      if (props.transactionType === 'sell' && props.warehouseId) {
        void itemStore.fetchItemsByWarehouse(props.warehouseId, selectedCategoryId.value);
      } else {
        void loadInitialItems();
      }
    }, 1000);
    return;
  }
  searchTimeout = setTimeout(() => {
    if (props.transactionType === 'sell' && props.warehouseId) {
      void itemStore['searchItemsByWarehouse'](val.trim(), props.warehouseId, selectedCategoryId.value);
    } else {
      void itemStore.searchItems(val.trim(), selectedCategoryId.value);
    }
  }, 1000);
});

function selectItem(item) {
  if (selectedItemIds.value.has(item.id)) return;

  // For sell transactions, prioritize solo price as default selling price
  const defaultPrice = props.transactionType === 'sell'
    ? (Number(item.solo_unit_price) || Number(item.unit_cost) || 0)
    : (Number(item.unit_cost) || 0);

  selectedItems.value.push({
    item,
    unit_cost: defaultPrice, // This will be the editable selling price
    solo_unit_cost: Number(item.solo_unit_price) || 0, // Reference only
    bulk_unit_cost: Number(item.bulk_unit_price) || 0, // Reference only
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

function selectAll() {
  // Get all currently visible/filtered items that are not already selected
  const itemsToSelect = filteredItems.value.filter(item => !selectedItemIds.value.has(item.id));

  // Select each item using the same logic as selectItem function
  itemsToSelect.forEach(item => {
    // For sell transactions, prioritize solo price as default selling price
    const defaultPrice = props.transactionType === 'sell'
      ? (Number(item.solo_unit_price) || Number(item.unit_cost) || 0)
      : (Number(item.unit_cost) || 0);

    selectedItems.value.push({
      item,
      unit_cost: defaultPrice, // This will be the editable selling price
      solo_unit_cost: Number(item.solo_unit_price) || 0, // Reference only
      bulk_unit_cost: Number(item.bulk_unit_price) || 0, // Reference only
      quantity: 1,
      packages: 0,
      packets: 0
    });
  });
}

function fetchItemsForWarehouse() {
  if (props.transactionType === 'sell' && props.warehouseId) {
    void itemStore.fetchItemsByWarehouse(props.warehouseId, selectedCategoryId.value);
  } else if (props.transactionType === 'purchase') {
    void loadInitialItems();
  }
}

function refreshItems() {
  // Clear current items and reload to get updated quantities
  if (props.transactionType === 'sell' && props.warehouseId) {
    void itemStore.fetchItemsByWarehouse(props.warehouseId, selectedCategoryId.value);
  } else if (props.transactionType === 'purchase') {
    void loadInitialItems();
  }
}

function refreshAfterTransaction() {
  // This method should be called after a successful transaction submission
  // It will refresh the items to show updated stock quantities
  refreshItems();
  // Optionally clear selected items as they've been processed
  clearAll();
}

function formatTotalPrice(quantity: number, unitPrice: number): string {
  const qty = Number(quantity || 0);
  const price = Number(unitPrice || 0);
  const total = qty * price;
  return total.toFixed(2);
}

defineExpose({
  fetchItemsForWarehouse,
  clearAll,
  selectAll,
  refreshItems,
  refreshAfterTransaction
});
</script>

<template>
  <div class="item-selector-redesign">

    <div class="item-selector-content">
      <div class="item-list-fullwidth">
        <div class="search-row q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-input v-model="searchQuery" :label="t('transactionAlpha.searchItems')" outlined dense clearable
                :loading="loading" class="search-input" @keyup.enter="onSearch">
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-md-4 col-xs-12">
              <q-select v-model="selectedCategoryId" :options="categoryOptions"
                :label="t('transactionAlpha.filterByCategory')" outlined dense clearable option-value="value"
                option-label="label" emit-value map-options class="category-filter">
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>
            <div class="col-md-2 col-xs-12">
              <q-btn :label="t('transactionAlpha.search')" color="primary" class="search-btn full-width"
                :loading="loading" @click="onSearch" flat dense no-caps />
            </div>
          </div>
        </div>
        <!-- 🛍️ Available Items Section -->
        <div class="section-card items-section">
          <div class="section-header">
            <div class="section-icon">
              <q-icon name="inventory_2" size="20px" />
            </div>
            <h3 class="section-title">🛍️ {{ t('transactionAlpha.availableItems') }}</h3>
            <div class="section-badge">{{ filteredItems.length }} {{ t('transactionAlpha.items') }}</div>
          </div>

          <!-- Select All Items Button - Only show when there are items to select -->
          <div v-if="filteredItems.length > 0" class="select-all-container q-mb-md">
            <q-btn @click="selectAll" size="md" class="cute-select-all-btn primary" color="primary" no-caps rounded>
              <div class="btn-content">
                <span class="btn-text">{{ t('transactionAlpha.selectAllItems') }} &nbsp; ✅</span>
              </div>
            </q-btn>
          </div>



          <div v-if="loading && currentPage === 1" class="loading-state">
            <q-spinner color="primary" size="2em" />
            <p class="loading-text">{{ t('transactionAlpha.searchingItems') }}</p>
          </div>

          <div v-else-if="filteredItems.length === 0" class="empty-state">
            <q-icon name="inventory_2" size="3em" color="grey-4" />
            <p class="empty-text">{{ t('transactionAlpha.noItemsFound') }}</p>
            <p class="empty-subtext">
              {{ selectedCategoryId
                ? t('transactionAlpha.noCategoryItems')
                : t('transactionAlpha.tryDifferentSearch') }}
            </p>
          </div>

          <div v-else class="items-grid-container" @scroll="onScroll">
            <div class="items-grid">
              <div v-for="item in filteredItems" :key="item.id" class="item-card"
                :class="{ 'item-selected': selectedItemIds.has(item.id) }">
                <div class="item-header">
                  <div class="item-name">{{ item.name }}</div>
                  <q-btn :icon="selectedItemIds.has(item.id) ? 'check_circle' : 'add_circle'"
                    :color="selectedItemIds.has(item.id) ? 'positive' : 'primary'" flat round dense size="sm"
                    @click="() => { if (!selectedItemIds.has(item.id)) selectItem(item); }"
                    :disable="selectedItemIds.has(item.id)" class="add-button" />
                </div>

                <div class="item-details">
                  <div class="item-meta">
                    <span v-if="item.sku" class="item-sku">{{ t('transactionAlpha.sku') }}: {{ item.sku }}</span>
                    <span v-if="item.category" class="item-category">{{ item.category.name }}</span>
                  </div>

                  <div class="item-quantities">
                    <!-- Stock Information Display -->
                    <div class="stock-header">
                      <q-icon name="inventory" size="14px" color="primary" />
                      <span class="stock-title">{{ t('transactionAlpha.inStock') }}</span>
                    </div>

                    <!-- Total Quantity (always show) -->
                    <div class="quantity-badge total-stock">
                      <q-icon name="apps" size="14px" />
                      <span>{{ t('transactionAlpha.total') }}: {{ item.quantity || 0 }} {{ t('transactionAlpha.pcs')
                        }}</span>
                    </div>

                    <!-- Stock Breakdown (if item has packaging structure) -->
                    <template v-if="(item.package_units || 0) > 0 && (item.packet_units || 0) > 0">
                      <!-- Calculate breakdown: packages, remaining packets, remaining pieces -->
                      <div class="quantity-badge packages">
                        <q-icon name="inventory_2" size="14px" />
                        <span>{{ Math.floor((item.quantity || 0) / ((item.package_units || 1) * (item.packet_units ||
                          1))) }} {{ t('transactionAlpha.pkg') }}</span>
                      </div>

                      <div class="quantity-badge packets">
                        <q-icon name="category" size="14px" />
                        <span>{{ Math.floor(((item.quantity || 0) % ((item.package_units || 1) * (item.packet_units ||
                          1))) / (item.packet_units || 1)) }} {{ t('transactionAlpha.pkt') }}</span>
                      </div>

                      <div class="quantity-badge pieces">
                        <q-icon name="style" size="14px" />
                        <span>{{ (item.quantity || 0) % (item.packet_units || 1) }} {{ t('transactionAlpha.pcs')
                          }}</span>
                      </div>
                    </template>

                    <!-- If only packet_units (no packages) -->
                    <template v-else-if="(item.packet_units || 0) > 0">
                      <div class="quantity-badge packets">
                        <q-icon name="category" size="14px" />
                        <span>{{ Math.floor((item.quantity || 0) / (item.packet_units || 1)) }} {{
                          t('transactionAlpha.pkt') }}</span>
                      </div>

                      <div class="quantity-badge pieces">
                        <q-icon name="style" size="14px" />
                        <span>{{ (item.quantity || 0) % (item.packet_units || 1) }} {{ t('transactionAlpha.pcs')
                          }}</span>
                      </div>
                    </template>

                    <!-- If only package_units (no packets) -->
                    <template v-else-if="(item.package_units || 0) > 0">
                      <div class="quantity-badge packages">
                        <q-icon name="inventory_2" size="14px" />
                        <span>{{ Math.floor((item.quantity || 0) / (item.package_units || 1)) }} {{
                          t('transactionAlpha.pkg') }}</span>
                      </div>

                      <div class="quantity-badge pieces">
                        <q-icon name="style" size="14px" />
                        <span>{{ (item.quantity || 0) % (item.package_units || 1) }} {{ t('transactionAlpha.pcs')
                          }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Load more indicator -->
            <div v-if="isLoadingMore" class="load-more-indicator">
              <q-spinner color="primary" size="1.5em" />
              <p class="loading-text">{{ t('transactionAlpha.loadingMoreItems') }}</p>
            </div>

            <!-- End of list indicator -->
            <div v-else-if="!hasMorePages && pagination && filteredItems.length > 0" class="end-of-list">
              <q-icon name="check_circle" color="positive" size="1.5em" />
              <p class="end-text">{{ t('transactionAlpha.allItemsLoaded') }}</p>
              <p class="end-subtext">{{ t('transactionAlpha.totalItemsCount', { count: pagination.total }) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 🛒 Selected Items Section -->
      <div v-if="selectedItems.length > 0" class="section-card selected-section">
        <div class="section-header">
          <div class="section-icon selected-icon">
            <q-icon name="shopping_cart" size="20px" />
          </div>
          <h3 class="section-title">🛒 {{ t('transactionAlpha.selectedItems') }}</h3>
          <div class="section-badge selected-badge">{{ selectedItems.length }} {{ t('transactionAlpha.selected') }}
          </div>
        </div>

        <div class="selected-items-scroll">
          <div class="q-mb-sm"><b>{{ t('transactionAlpha.selectedItems') }}</b></div>
          <div v-for="(selected, idx) in selectedItems" :key="selected.item.id"
            class="selected-item-card-modern q-mb-md">
            <div class="row items-center q-col-gutter-md flex-nowrap">
              <div class="col-auto item-info-col">
                <div class="text-weight-bold text-lg">{{ selected.item.name }}</div>
                <div class="text-caption text-grey-7">
                  <span v-if="selected.item.sku">{{ t('transactionAlpha.sku') }}: {{ selected.item.sku }}</span>
                  <span v-if="selected.item.category"> | {{ selected.item.category.name }}</span>
                </div>
              </div>
              <div class="col-auto">
                <q-input v-if="selected.item.package_units > 0" v-model.number="selected.packages"
                  :label="t('transactionAlpha.packages')" type="number" dense outlined min="0" style="max-width:90px;"
                  @update:model-value="val => onPackagesChange(selected, val)" />
                <div v-if="selected.item.package_units > 0" class="text-caption text-grey-7 q-mt-xs">{{
                  t('transactionAlpha.packageHint', { n: selected.item.package_units }) }}</div>
              </div>
              <div class="col-auto">
                <q-input v-if="selected.item.packet_units > 0" v-model.number="selected.packets"
                  :label="t('transactionAlpha.packets')" type="number" dense outlined min="0" style="max-width:90px;"
                  @update:model-value="val => onPacketsChange(selected, val)" />
                <div v-if="selected.item.packet_units > 0" class="text-caption text-grey-7 q-mt-xs">{{
                  t('transactionAlpha.packetHint', { n: selected.item.packet_units }) }}</div>
              </div>
              <div class="col-auto">
                <q-input v-model.number="selected.quantity" :label="t('transactionAlpha.quantity')" type="number" dense
                  outlined min="0" style="max-width:90px;"
                  @update:model-value="val => onQuantityChange(selected, val)" />
                <div class="text-caption text-grey-7 q-mt-xs">{{ t('transactionAlpha.totalItems', {
                  n: selected.quantity
                }) }}
                </div>
              </div>
              <div class="col q-gutter-md flex justify-end items-center">
                <!-- For Purchase Transactions: Show all 3 price fields -->
                <template v-if="props.transactionType === 'purchase'">
                  <q-input v-model.number="selected.unit_cost" :label="t('transactionAlpha.unitCost')" type="number"
                    dense outlined min="0" style="max-width:110px;" />
                  <q-input v-model.number="selected.solo_unit_cost" :label="t('transactionAlpha.soloUnitCost')"
                    type="number" dense outlined min="0" style="max-width:110px;" />
                  <q-input v-model.number="selected.bulk_unit_cost" :label="t('transactionAlpha.bulkUnitCost')"
                    type="number" dense outlined min="0" style="max-width:110px;" />
                </template>

                <!-- For Sell Transactions: Show only ONE selling price input -->
                <template v-else>
                  <div class="cute-price-container">
                    <!-- Single selling price input -->
                    <q-input v-model.number="selected.unit_cost" :label="t('transactionAlpha.sellingPrice')"
                      type="number" dense outlined min="0" step="0.01" class="cute-price-input">
                      <template v-slot:prepend>
                        <q-icon name="attach_money" color="positive" />
                      </template>
                    </q-input>

                    <!-- Reference price badges (solo and bulk) -->
                    <div class="reference-badges q-mt-sm">
                      <q-badge v-if="selected.solo_unit_cost > 0" color="blue-4" text-color="white" class="q-mr-sm">
                        {{ t('transactionAlpha.soloUnitPrice') }}: ${{ Number(selected.solo_unit_cost || 0).toFixed(2)
                        }}
                      </q-badge>
                      <q-badge v-if="selected.bulk_unit_cost > 0" color="purple-4" text-color="white">
                        {{ t('transactionAlpha.bulkUnitPrice') }}: ${{ Number(selected.bulk_unit_cost || 0).toFixed(2)
                        }}
                      </q-badge>
                    </div>

                    <!-- Compact Total Prices Display -->
                    <div class="cute-totals-display">
                      <!-- Package Total -->
                      <div v-if="selected.item?.package_units > 0 && selected.packages > 0" class="total-line">
                        <div class="total-info">
                          <q-icon name="inventory" color="purple" size="12px" />
                          <span class="total-label">{{ selected.packages }} {{ t('transactionAlpha.pkg') }}</span>
                          <span class="total-value">${{ formatTotalPrice(Number(selected.packages) *
                            Number(selected.item?.package_units || 0) * Number(selected.item?.packet_units || 0),
                            Number(selected.unit_cost || 0)) }}</span>
                        </div>
                      </div>

                      <!-- Packet Total -->
                      <div v-if="selected.item?.packet_units > 0 && selected.packets > 0" class="total-line">
                        <div class="total-info">
                          <q-icon name="inbox" color="orange" size="12px" />
                          <span class="total-label">{{ selected.packets }} {{ t('transactionAlpha.pkt') }}</span>
                          <span class="total-value">${{ formatTotalPrice(Number(selected.packets) *
                            Number(selected.item?.packet_units || 0), Number(selected.unit_cost || 0)) }}</span>
                        </div>
                      </div>

                      <!-- Pieces Total -->
                      <div v-if="selected.quantity > 0" class="total-line">
                        <div class="total-info">
                          <q-icon name="widgets" color="green" size="12px" />
                          <span class="total-label">{{ selected.quantity }} {{ t('transactionAlpha.pcs') }}</span>
                          <span class="total-value">${{ formatTotalPrice(Number(selected.quantity),
                            Number(selected.unit_cost ||
                              0)) }}</span>
                        </div>
                      </div>

                      <!-- Grand Total -->
                      <div class="grand-total-line">
                        <div class="total-info grand">
                          <q-icon name="paid" color="primary" size="14px" />
                          <span class="total-label grand">{{ t('transactionAlpha.total') }}</span>
                          <span class="total-value grand">${{ formatTotalPrice(Number(selected.quantity),
                            Number(selected.unit_cost || 0)) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <q-btn icon="delete" color="negative" flat round dense @click="removeItem(idx)" class="q-ml-md" />
              </div>
            </div>
          </div>
          <div class="clear-all-container">
            <div class="cute-clear-container">
              <q-btn @click="clearAll" size="md" class="cute-clear-btn danger" color="negative" no-caps rounded>
                <div class="btn-content">
                  <span class="btn-text">{{ t('transactionAlpha.clearAll') }} &nbsp; ⚠️</span>
                </div>
              </q-btn>
            </div>
          </div>
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

.category-filter {
  min-width: 200px;
}

.category-filter .q-field__prepend {
  color: #1976d2;
}

.search-btn {
  min-width: 90px;
}

/* Professional Item Cards Design */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
  width: 100%;
  margin-top: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
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
  width: 100%;
  margin-top: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
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

.quantity-badge.total-stock {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 600;
  border: 1px solid #0369a1;
}

.stock-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  padding: 2px 0;
}

.stock-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  padding: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.selected-item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px 24px 16px 24px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  width: 100%;
  margin: 0 0 16px 0;
  box-sizing: border-box;
}

.selected-item-card-modern {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 14px 8px 14px;
  background: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
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

  .item-info-col,
  .col-auto,
  .col {
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

  .q-input,
  .q-btn {
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

/* Cute price design for sell transactions */
.cute-price-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
  border-radius: 12px;
  padding: 8px 12px 12px 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
  max-width: 250px;
  margin-bottom: 35px;
  /* Reduced space for side-by-side helpers */
}

.cute-price-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
}

.cute-price-input {
  background: transparent;
  border: none;
  max-width: 210px;
}

.cute-price-input .q-field__control {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(224, 224, 224, 0.5);
  transition: all 0.2s ease;
}

.cute-price-input .q-field__control:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #9e9e9e;
}

.cute-price-input .q-field--focused .q-field__control {
  border-color: #1976d2;
  background: white;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.cute-price-input .q-field__label {
  color: #2e7d32;
  font-weight: 600;
  font-size: 0.85rem;
}

.cute-price-input .q-field__native {
  color: #1b5e20;
  font-weight: 600;
  font-size: 1rem;
}

/* Cute price helpers */
.price-helpers {
  position: absolute;
  top: 100%;
  left: 8px;
  right: 8px;
  margin-top: 4px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  z-index: 10;
}

.price-helper {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(76, 175, 80, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  flex: 1;
  min-width: 0;
}

.price-helper:hover {
  background: white;
  border-color: rgba(76, 175, 80, 0.4);
  transform: translateX(2px);
}

.price-helper.solo {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.2);
}

.price-helper.solo:hover {
  border-color: rgba(99, 102, 241, 0.4);
}

.price-helper.bulk {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.2);
}

.price-helper.bulk:hover {
  border-color: rgba(245, 158, 11, 0.4);
}

.price-helper span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {

  /* Mobile responsive adjustments for cute price container */
  .cute-price-container {
    margin-bottom: 25px !important;
    /* Less space on mobile */
  }

  .price-helpers {
    position: static !important;
    margin-top: 8px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    flex-direction: column !important;
    gap: 4px !important;
  }

  .price-helper {
    font-size: 0.65rem !important;
    padding: 2px 6px !important;
    flex: none !important;
  }
}

/* Reference price badges styling */
.reference-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.reference-badges .q-badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.reference-badges .q-badge:hover {
  opacity: 1;
}

/* Compact totals display */
.cute-totals-display {
  margin-top: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.total-line {
  display: flex;
  align-items: center;
  margin: 3px 0;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.total-line:hover {
  background: rgba(255, 255, 255, 0.7);
}

.total-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.total-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4a5568;
  min-width: 45px;
}

.total-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2d3748;
  margin-left: auto;
}

/* Grand total styling */
.grand-total-line {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.total-info.grand {
  font-weight: 600;
}

.total-label.grand {
  color: #2b6cb0;
  font-weight: 600;
}

.total-value.grand {
  color: #2b6cb0;
  font-weight: 700;
  font-size: 0.85rem;
}

@media (max-width: 768px) {

  /* Mobile responsive adjustments for compact price container */
  .cute-price-container {
    max-width: 100%;
    margin-bottom: 6px;
  }

  .total-line {
    margin: 2px 0;
    padding: 3px 4px;
  }

  .total-label {
    font-size: 0.7rem;
    min-width: 35px;
  }

  .total-value {
    font-size: 0.75rem;
  }
}

/* 🎨 Cute Section Cards Design */
.section-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.section-card.items-section {
  border-color: rgba(103, 126, 234, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
}

.section-card.items-section::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.section-card.selected-section {
  border-color: rgba(16, 185, 129, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
}

.section-card.selected-section::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.section-icon.selected-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.section-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.selected-section .section-title {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: pulse 2s infinite;
}

.section-badge.selected-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.clear-all-container {
  text-align: center;
  padding: 16px;
  border-top: 2px solid rgba(0, 0, 0, 0.05);
  margin-top: 16px;
}

.clear-all-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.clear-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

/* Pagination and infinite scroll styles */
.items-grid-container {
  max-height: 500px;
  overflow-y: auto;
  width: 100%;
  margin-top: 0;
  padding: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  scroll-behavior: smooth;
}

.items-grid-container::-webkit-scrollbar {
  width: 6px;
}

.items-grid-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.items-grid-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.items-grid-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.load-more-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 8px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  margin: 16px 0;
  border: 2px dashed rgba(102, 126, 234, 0.3);
}

.load-more-indicator .loading-text {
  margin: 0;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  animation: fadeInOut 1.5s ease-in-out infinite;
}

.end-of-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 8px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  margin: 16px 0;
  border: 2px solid rgba(16, 185, 129, 0.2);
}

.end-of-list .end-text {
  margin: 0;
  color: #059669;
  font-size: 0.9rem;
  font-weight: 600;
}

.end-of-list .end-subtext {
  margin: 0;
  color: #065f46;
  font-size: 0.8rem;
  opacity: 0.8;
}

@keyframes fadeInOut {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

/* Cute button container styles */
.cute-clear-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Select All button styles */
.cute-select-all-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border-radius: 12px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  min-width: 180px;
}

.cute-select-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Clear All button styles */
.cute-clear-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.cute-clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

/* Button content styling */
.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Responsive button layout */
@media (max-width: 640px) {
  .cute-clear-container {
    flex-direction: column;
    gap: 8px;
  }

  .cute-select-all-btn,
  .cute-clear-btn {
    width: 100%;
    max-width: 200px;
  }
}

/* Select All container styles */
.select-all-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.select-all-container .cute-select-all-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border-radius: 12px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  min-width: 180px;
}

.select-all-container .cute-select-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.select-all-container .btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.select-all-container .btn-text {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .select-all-container {
    padding: 12px;
  }

  .select-all-container .cute-select-all-btn {
    width: 100%;
    max-width: 250px;
    padding: 12px 20px;
  }
}
</style>
