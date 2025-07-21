<template>
  <div class="item-selector">
    <!-- Item Search Section -->
    <q-card flat bordered>
      <q-card-section>
        <!-- Item Search Section -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12">
            <div class="text-subtitle2 q-mb-sm">{{ t('transferRequest.searchItems', 'Search Items') }}</div>
          </div>
          <div class="col-12 col-md-8">
            <q-input
              v-model="itemSearchQuery"
              :label="t('transferRequest.searchItem', 'Search for items by name or SKU')"
              filled
              @keyup.enter="onSearchItems"
              @input="onSearchInputDebounced"
              clearable
              :loading="searchLoading"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="searchResults.length > 0">
                <q-btn
                  flat
                  round
                  dense
                  icon="clear"
                  @click="clearSearchResults"
                  size="sm"
                >
                  <q-tooltip>{{ t('common.clear') }}</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-btn
              @click="onSearchItems"
              :label="t('common.search')"
              color="primary"
              icon="search"
              no-caps
              class="full-width"
              :loading="searchLoading"
            />
          </div>
        </div>

        <!-- Search Loading State -->
        <div v-if="searchLoading" class="q-mb-md text-center">
          <q-spinner-dots
            color="primary"
            size="40px"
          />
          <div class="text-caption text-grey-6 q-mt-sm">
            {{ t('transferRequest.searchingItems', 'Searching items') }}...
          </div>
        </div>

        <!-- No Results State -->
        <div v-if="!searchLoading && itemSearchQuery.trim() && searchResults.length === 0" class="q-mb-md text-center q-pa-md">
          <q-icon name="search_off" size="48px" class="text-grey-4 q-mb-sm" />
          <div class="text-h6 text-grey-6 q-mb-sm">{{ t('transferRequest.noItemsFound', 'No items found') }}</div>
          <div class="text-body2 text-grey-5">
            {{ t('transferRequest.tryDifferentSearch', 'Try a different search term') }}
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm flex items-center">
            <q-icon name="search" class="q-mr-sm" />
            {{ t('transferRequest.searchResults', 'Search Results') }} ({{ searchResults.length }})
            <q-space />
            <q-btn
              flat
              dense
              round
              icon="clear"
              size="sm"
              @click="clearSearchResults"
              class="text-grey-6"
            >
              <q-tooltip>{{ t('common.clear') }}</q-tooltip>
            </q-btn>
          </div>

          <div class="search-results-container">
            <q-card
              v-for="item in searchResults"
              :key="item.id"
              flat
              bordered
              class="result-item-card q-mb-sm cursor-pointer"
              :class="{ 'item-selected': isItemSelected(item.id) }"
              @click="addItemToTransfer(item)"
            >
              <q-card-section class="q-pa-md">
                <div class="row items-center q-col-gutter-md">
                  <!-- Item Basic Info -->
                  <div class="col-12 col-md-6">
                    <div class="item-info">
                      <div class="item-name text-h6 text-primary q-mb-xs">
                        {{ item.name }}
                        <q-chip
                          v-if="isItemSelected(item.id)"
                          size="sm"
                          color="positive"
                          text-color="white"
                          icon="check"
                          class="q-ml-sm"
                        >
                          {{ t('transferRequest.added', 'Added') }}
                        </q-chip>
                      </div>
                      <div v-if="item.sku" class="item-sku text-caption text-grey-6 q-mb-sm">
                        <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                        {{ t('common.sku') }}: {{ item.sku }}
                      </div>
                      <div v-if="item.description" class="item-description text-caption text-grey-7 q-mb-sm">
                        {{ item.description }}
                      </div>
                      <div v-if="item.category?.name" class="item-category">
                        <q-chip
                          :label="item.category.name"
                          color="grey-3"
                          text-color="grey-8"
                          size="sm"
                          square
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Stock Information -->
                  <div class="col-12 col-md-3">
                    <div class="stock-info">
                      <div class="text-caption text-grey-7 q-mb-xs">{{ t('transferRequest.inventory', 'Inventory') }}</div>

                      <!-- Available Quantity -->
                      <div class="stock-item q-mb-xs">
                        <q-chip
                          :color="getItemQuantity(item) > 0 ? 'green' : 'red'"
                          text-color="white"
                          size="sm"
                          icon="inventory_2"
                        >
                          {{ t('transferRequest.available', 'Available') }}: {{ getItemQuantity(item) }}
                        </q-chip>
                      </div>

                      <!-- Packaging Info -->
                      <div class="packaging-info text-caption">
                        <div v-if="getItemPackets(item)" class="q-mb-xs">
                          <q-icon name="inventory" size="xs" class="q-mr-xs" />
                          {{ t('transferRequest.packets', 'Packets') }}: {{ getItemPackets(item) }}
                        </div>
                        <div v-if="getItemPackages(item)" class="q-mb-xs">
                          <q-icon name="all_inbox" size="xs" class="q-mr-xs" />
                          {{ t('transferRequest.packages', 'Packages') }}: {{ getItemPackages(item) }}
                        </div>
                        <div v-if="getItemPieces(item)">
                          <q-icon name="circle" size="xs" class="q-mr-xs" />
                          {{ t('transferRequest.pieces', 'Pieces') }}: {{ getItemPieces(item) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="col-12 col-md-3">
                    <div class="text-right">
                      <q-btn
                        v-if="!isItemSelected(item.id)"
                        :label="t('transferRequest.addToTransfer', 'Add to Transfer')"
                        color="primary"
                        size="sm"
                        no-caps
                        icon="add_shopping_cart"
                        @click.stop="addItemToTransfer(item)"
                      />
                      <q-btn
                        v-else
                        :label="t('transferRequest.addMore', 'Add More')"
                        color="positive"
                        size="sm"
                        no-caps
                        icon="add"
                        @click.stop="addItemToTransfer(item)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Low Stock Warning -->
                <q-banner
                  v-if="getItemQuantity(item) <= 5 && getItemQuantity(item) > 0"
                  class="bg-orange-1 text-orange-9 q-mt-sm"
                  dense
                >
                  <template v-slot:avatar>
                    <q-icon name="warning" color="orange" />
                  </template>
                  {{ t('transferRequest.lowStock', 'Low stock warning') }}
                </q-banner>

                <!-- Out of Stock Warning -->
                <q-banner
                  v-if="getItemQuantity(item) === 0"
                  class="bg-red-1 text-red-9 q-mt-sm"
                  dense
                >
                  <template v-slot:avatar>
                    <q-icon name="error" color="red" />
                  </template>
                  {{ t('transferRequest.outOfStock', 'Out of stock') }}
                </q-banner>
              </q-card-section>

              <!-- Hover effect indicator -->
              <q-tooltip anchor="top middle" self="bottom middle" class="bg-primary">
                {{ isItemSelected(item.id) ? t('transferRequest.clickToAddMore', 'Click to add more') : t('transferRequest.clickToAdd', 'Click to add') }}
              </q-tooltip>
            </q-card>
          </div>

          <!-- Quick Add All Button -->
          <div class="row q-mt-md" v-if="searchResults.length > 1">
            <div class="col-12 text-center">
              <q-btn
                :label="t('transferRequest.addAllToTransfer', 'Add All to Transfer')"
                color="secondary"
                outline
                no-caps
                icon="playlist_add"
                @click="addAllItemsToTransfer"
                :disable="searchResults.every(item => getItemQuantity(item) === 0)"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Selected Items Section -->
    <div v-if="selectedItems.length > 0" class="selected-items-section q-mt-lg">
      <div class="section-header q-mb-md">
        <h6 class="section-title">
          <q-icon name="shopping_cart" class="q-mr-sm" />
          {{ t('transferRequest.selectedItems', 'Selected Items') }} ({{ selectedItems.length }})
        </h6>
      </div>

      <q-list bordered separator>
        <q-item
          v-for="selectedItem in selectedItems"
          :key="selectedItem.item.id"
          class="q-pa-md"
        >
          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ selectedItem.item.name }}
            </q-item-label>
            <q-item-label caption>{{ selectedItem.item.sku }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row q-col-gutter-md items-center">
              <div class="col">
                <q-input
                  :model-value="selectedItem.quantity"
                  type="number"
                  min="1"
                  :max="getAvailableQuantityForSelectedItem(selectedItem)"
                  outlined
                  dense
                  :label="t('transferRequest.quantity', 'Quantity')"
                  @update:model-value="(val) => updateItemQuantityWithValidation(selectedItem.item_id, Number(val) || 1)"
                >
                  <template v-slot:hint>
                    {{ t('transferRequest.maxAvailable', 'Max available') }}: {{ getAvailableQuantityForSelectedItem(selectedItem) }}
                  </template>
                </q-input>
              </div>
              <div class="col">
                <div class="text-body2 text-weight-medium">
                  {{ t('transferRequest.itemTotal', 'Total') }}: {{ selectedItem.quantity }} {{ t('transferRequest.units', 'units') }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  @click="removeItem(selectedItem.item_id)"
                  icon="delete"
                  flat
                  round
                  color="negative"
                  size="sm"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useTransferRequestStore } from 'src/stores/transferRequestStore';
import type { Product } from 'src/types/item';
import type { SelectedTransferItem } from 'src/stores/transferRequestStore';

// Composables
const { t } = useI18n();
const $q = useQuasar();

// Props
const props = defineProps<{
  warehouseId: number;
  selectedItems: SelectedTransferItem[];
}>();

// Emits
const emit = defineEmits<{
  'item-added': [item: Product, quantity: number];
  'item-removed': [itemId: number];
  'item-quantity-updated': [itemId: number, quantity: number];
}>();

const transferRequestStore = useTransferRequestStore();

// State
const searchLoading = ref(false);
const itemSearchQuery = ref('');
const searchResults = ref<Product[]>([]);

// Methods
const onSearchItems = async () => {
  try {
    searchLoading.value = true;

    // Use the new search method that searches items directly
    // Allow empty search to fetch all items
    const searchQuery = itemSearchQuery.value.trim() || '';
    const items = await transferRequestStore.searchItems(searchQuery);

    searchResults.value = items || [];

    if (searchResults.value.length === 0) {
      $q.notify({
        type: 'info',
        message: t('transferRequest.noItemsFound', 'No items found'),
        position: 'top-right'
      });
    }
  } catch (error) {
    console.error('Error searching items:', error);
    $q.notify({
      type: 'negative',
      message: t('transferRequest.searchError', 'Error searching items'),
      position: 'top-right'
    });
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
};

const addItemToTransfer = (item: Product) => {
  // Check if item already selected
  const existingIndex = props.selectedItems.findIndex(si => si.item_id === item.id);

  if (existingIndex >= 0) {
    // Increase quantity - use item_id from the existing selected item for consistency
    const existingItem = props.selectedItems[existingIndex]!;
    const availableQty = getItemQuantity(item);
    const newQuantity = Math.min(existingItem.quantity + 1, availableQty);

    if (newQuantity > existingItem.quantity) {
      emit('item-quantity-updated', existingItem.item_id, newQuantity);
    } else {
      $q.notify({
        type: 'warning',
        message: t('transferRequest.maxQuantityReached', 'Maximum available quantity reached'),
        position: 'top-right',
        timeout: 2000
      });
    }
  } else {
    // Add new item with quantity 1 (or max available if less than 1)
    const availableQty = getItemQuantity(item);
    const initialQuantity = Math.min(1, availableQty);

    if (initialQuantity > 0) {
      emit('item-added', item, initialQuantity);
      $q.notify({
        type: 'positive',
        message: t('transferRequest.itemAdded', 'Item added to transfer'),
        position: 'top-right',
        timeout: 2000
      });
    } else {
      $q.notify({
        type: 'negative',
        message: t('transferRequest.itemOutOfStock', 'Item is out of stock'),
        position: 'top-right',
        timeout: 3000
      });
    }
  }

  // Clear search
  itemSearchQuery.value = '';
  searchResults.value = [];
};

const removeItem = (itemId: number) => {
  emit('item-removed', itemId);
};

const updateItemQuantity = (itemId: number, quantity: number) => {
  if (quantity > 0) {
    emit('item-quantity-updated', itemId, quantity);
  }
};

// Get available quantity for a selected item
const getAvailableQuantityForSelectedItem = (selectedItem: SelectedTransferItem) => {
  // Find the item in search results to get its available quantity
  // If not in search results, we need to use the item's stored quantity data
  return getItemQuantity(selectedItem.item);
};

// Validate and update item quantity with max limit
const updateItemQuantityWithValidation = (itemId: number, quantity: number) => {
  const selectedItem = props.selectedItems.find(si => si.item_id === itemId);
  if (!selectedItem) return;

  const availableQuantity = getAvailableQuantityForSelectedItem(selectedItem);
  const validQuantity = Math.min(Math.max(1, quantity), availableQuantity);

  // Show warning if user tried to enter more than available
  if (quantity > availableQuantity) {
    $q.notify({
      type: 'warning',
      message: t('transferRequest.quantityExceedsAvailable', `Maximum available quantity is ${availableQuantity}`),
      position: 'top-right',
      timeout: 3000
    });
  }

  updateItemQuantity(itemId, validQuantity);
};

// Helper functions for accessing item properties safely
const getItemQuantity = (item: Product) => {
  // Try to get warehouse-specific quantity first
  if ((item as any).pivot && (item as any).pivot.quantity !== undefined) {
    return (item as any).pivot.quantity;
  }
  // Check for total_quantity property (common in API responses)
  if ((item as any).total_quantity !== undefined) {
    return (item as any).total_quantity;
  }
  // Fallback to item's general quantity property
  return (item as any).quantity || 0;
};

const getItemPackets = (item: Product) => {
  // Check total_quantity first as it's the main stock indicator
  return (item as any).total_quantity || (item as any).packets || 0;
};

const getItemPackages = (item: Product) => {
  return (item as any).packages || 0;
};

const getItemPieces = (item: Product) => {
  return (item as any).pieces || 0;
};

// Check if item is already selected
const isItemSelected = (itemId: number) => {
  return props.selectedItems.some(si => si.item_id === itemId);
};

// Clear search results
const clearSearchResults = () => {
  searchResults.value = [];
  itemSearchQuery.value = '';
};

// Add all search results to transaction
const addAllItemsToTransfer = () => {
  searchResults.value.forEach(item => {
    if (getItemQuantity(item) > 0) {
      addItemToTransfer(item);
    }
  });
};

// Debounced search function
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearchInputDebounced = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    if (itemSearchQuery.value.trim().length >= 2) {
      void onSearchItems();
    } else if (itemSearchQuery.value.trim().length === 0) {
      // Allow empty search to fetch all items
      void onSearchItems();
    }
  }, 500);
};

// Lifecycle
onMounted(() => {
  // Component is ready, search functionality is available
});
</script>

<style lang="scss" scoped>
.item-selector {
  // Search Results Styling
  .search-results-container {
    max-height: 400px;
    overflow-y: auto;
    border-radius: 8px;
  }

  .result-item-card {
    transition: all 0.2s ease;
    border-left: 4px solid transparent;
    position: relative;

    &:hover {
      background-color: rgba(25, 118, 210, 0.04);
      border-left-color: var(--q-primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.item-selected {
      background-color: rgba(76, 175, 80, 0.08);
      border-left-color: #4caf50;

      &:hover {
        background-color: rgba(76, 175, 80, 0.12);
      }
    }
  }

  .item-info {
    .item-name {
      margin-bottom: 4px;
      font-weight: 600;
      line-height: 1.2;
    }

    .item-sku {
      display: flex;
      align-items: center;
      font-family: monospace;
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
    }

    .item-description {
      font-style: italic;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .stock-info {
    .stock-item {
      margin-bottom: 8px;
    }

    .packaging-info {
      color: #666;

      > div {
        display: flex;
        align-items: center;
      }
    }
  }

  .selected-items-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid #e0e0e0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .section-title {
        margin: 0;
        display: flex;
        align-items: center;
        color: #1976d2;
      }
    }
  }

  // Stock status styling
  .result-item-card .q-banner {
    border-radius: 0 0 8px 8px;
    font-size: 0.75rem;
  }

  // Selected item styling
  .item-selected .item-name {
    color: #4caf50 !important;
  }

  // Animation for adding items
  .result-item-card .q-btn {
    transition: all 0.2s ease;
  }

  .result-item-card:hover .q-btn {
    transform: scale(1.05);
  }
}

.cursor-pointer {
  cursor: pointer;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .item-selector {
    .search-results-container {
      max-height: 300px;
    }

    .result-item-card {
      .row.q-col-gutter-md > .col-12.col-md-6,
      .row.q-col-gutter-md > .col-12.col-md-3 {
        width: 100% !important;
        flex: 0 0 100% !important;
        max-width: 100% !important;
      }

      .stock-info {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
      }

      .item-name {
        font-size: 1.1rem !important;
      }
    }

    // Make form fields stack vertically on mobile
    .row.q-col-gutter-md > .col-12.col-md-6,
    .row.q-col-gutter-md > .col-12.col-md-4,
    .row.q-col-gutter-md > .col-12.col-md-8 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    // Ensure buttons are properly sized on mobile
    .q-btn {
      min-height: 44px;
    }

    // Make text inputs more mobile-friendly
    .q-field {
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .item-selector {
    .result-item-card {
      .q-card-section {
        padding: 12px 16px;
      }

      .item-name {
        font-size: 1rem !important;
      }
    }
  }
}
</style>
