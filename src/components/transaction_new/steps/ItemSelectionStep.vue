<template>
  <div class="item-selection-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="inventory_2" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('transaction.steps.itemSelection') }}</span>
        </div>
        <div class="step-description">
          {{ t('transaction.steps.itemSelectionDesc') }}
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <q-card flat bordered class="search-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="search" class="q-mr-sm" />
              {{ t('item.searchItems') }}
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="itemSearchQuery"
                  :label="t('item.searchItem')"
                  outlined
                  @keyup.enter="onSearchItems"
                  @input="onSearchInputDebounced"
                  clearable
                  :loading="searchLoading"
                  :disable="!formData.warehouse_id"
                  :hint="!formData.warehouse_id ? t('item.selectWarehouseFirst') : ''"
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
                  class="full-width search-btn"
                  :loading="searchLoading"
                  :disable="!formData.warehouse_id"
                  size="md"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="search-results q-mt-lg">
        <div class="results-header">
          <div class="section-title">
            <q-icon name="inventory" class="q-mr-sm" />
            {{ t('item.availableItems') }} ({{ searchResults.length }})
          </div>
          <q-btn
            flat
            dense
            round
            icon="clear_all"
            @click="clearSearchResults"
            size="sm"
          >
            <q-tooltip>{{ t('common.clearAll') }}</q-tooltip>
          </q-btn>
        </div>

        <div class="search-results-container">
          <q-list separator class="rounded-borders item-search-list" style="max-height: 500px; overflow-y: auto;">
            <q-item
              v-for="item in searchResults"
              :key="`item-${item.id}`"
              clickable
              v-ripple
              @click="addItemToTransaction(item)"
              class="item-list-item"
              :class="{
                'item-selected': isItemSelected(item.id)
              }"
            >
              <q-item-section avatar>
                <q-avatar size="56px" rounded class="item-avatar-enhanced">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    style="object-fit: cover;"
                  />
                  <q-icon v-else name="inventory_2" size="28px" color="blue-grey-5" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="item-name">
                  {{ item.name }}
                  <q-chip
                    v-if="isItemSelected(item.id)"
                    size="sm"
                    color="positive"
                    text-color="white"
                    icon="check"
                    class="q-ml-sm"
                  >
                    {{ t('item.added') }}
                  </q-chip>
                </q-item-label>

                <q-item-label caption class="item-details">
                  <div class="item-codes">
                    <span v-if="item.sku && item.sku !== 'N/A'" class="item-code-chip">
                      <q-icon name="qr_code" size="xs" />
                      {{ item.sku }}
                    </span>
                    <span v-if="item.code && item.code !== 'N/A'" class="item-part-chip">
                      <q-icon name="tag" size="xs" />
                      {{ item.code }}
                    </span>
                    <span v-if="transactionType === 'sell' && getItemQuantity(item)" class="item-info-chip">
                      <q-icon name="inventory" size="xs" />
                      {{ t('item.available') }}: {{ getItemQuantity(item) }}
                    </span>
                    <span v-if="item.category?.name" class="item-info-chip">
                      <q-icon name="category" size="xs" />
                      {{ item.category.name }}
                    </span>
                  </div>
                </q-item-label>

                <q-item-label caption class="item-pricing">
                  <span v-if="item.solo_unit_price" class="price-display">
                    ${{ Number(item.solo_unit_price).toFixed(2) }}
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side class="item-action-section">
                <q-btn
                  round
                  :color="isItemSelected(item.id) ? 'positive' : 'primary'"
                  :icon="isItemSelected(item.id) ? 'check' : 'add'"
                  size="sm"
                  @click.stop="addItemToTransaction(item)"
                  :disable="(transactionType === 'sell' && getItemQuantity(item) === 0) || isItemSelected(item.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Quick Add All Button -->
        <div v-if="searchResults.length > 1" class="quick-actions q-mt-md">
          <q-btn
            :label="t('item.addAllToTransaction')"
            color="secondary"
            outline
            no-caps
            icon="playlist_add"
            @click="addAllItemsToTransaction"
            :disable="transactionType === 'sell' && searchResults.every(item => getItemQuantity(item) === 0)"
          />
        </div>
      </div>

      <!-- Selected Items Section -->
      <div v-if="formData.selectedItems.length > 0" class="selected-items q-mt-lg">
        <div class="section-title">
          <q-icon name="shopping_cart" class="q-mr-sm" />
          {{ t('item.selectedItems') }}
          <q-chip
            :label="`${formData.selectedItems.length} ${formData.selectedItems.length === 1 ? 'item' : 'items'}`"
            color="primary"
            text-color="white"
            size="sm"
            dense
            class="q-ml-sm"
          />
        </div>

        <!-- Individual Items Section -->
        <div class="individual-items-section">
          <div class="individual-items-list">
            <q-card
              v-for="(selectedItem, index) in formData.selectedItems"
              :key="selectedItem.item.id"
              flat
              bordered
              class="individual-item-card-fullwidth q-mb-md"
            >
              <q-card-section class="item-content-horizontal">
                <!-- Left: Item Info -->
                <div class="item-info-section">
                  <div class="item-avatar">
                    <q-avatar size="48px" rounded>
                      <img
                        v-if="selectedItem.item?.image"
                        :src="selectedItem.item.image"
                        :alt="selectedItem.item.name"
                        style="object-fit: cover;"
                      />
                      <q-icon v-else name="inventory_2" size="24px" color="blue-grey-5" />
                    </q-avatar>
                  </div>
                  <div class="item-details">
                    <div class="item-name">{{ selectedItem.item?.name }}</div>
                    <div class="item-meta">
                      <span v-if="selectedItem.item?.sku" class="item-code">{{ selectedItem.item.sku }}</span>
                      <span v-if="selectedItem.item?.code" class="item-part">{{ selectedItem.item.code }}</span>
                      <span v-if="getItemQuantity(selectedItem.item) && transactionType === 'sell'" class="item-stock">
                        {{ t('item.available') }}: {{ getItemQuantity(selectedItem.item) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Center: Controls -->
                <div class="item-controls-section">
                  <!-- Unit Price -->
                  <div class="price-input">
                    <q-input
                      v-model.number="selectedItem.unit_price"
                      :label="t('item.unitPrice')"
                      type="number"
                      min="0"
                      step="0.01"
                      dense
                      outlined
                      @update:model-value="updateItemTotal(index)"
                      class="price-field"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_money" />
                      </template>
                    </q-input>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="quantity-controls">
                    <div class="quantity-buttons">
                      <q-btn
                        flat
                        size="sm"
                        icon="remove"
                        @click="decreaseQuantity(index)"
                        :disable="selectedItem.quantity <= 1"
                        color="negative"
                        class="quantity-btn"
                      />
                      <q-input
                        v-model.number="selectedItem.quantity"
                        type="number"
                        :min="1"
                        :max="transactionType === 'sell' ? getItemQuantity(selectedItem.item) : undefined"
                        dense
                        outlined
                        @update:model-value="updateItemTotal(index)"
                        class="quantity-input"
                        input-class="text-center"
                      />
                      <q-btn
                        flat
                        size="sm"
                        icon="add"
                        @click="increaseQuantity(index)"
                        :disable="transactionType === 'sell' && selectedItem.quantity >= getItemQuantity(selectedItem.item)"
                        color="positive"
                        class="quantity-btn"
                      />
                    </div>
                    <div v-if="transactionType === 'sell' && getItemQuantity(selectedItem.item)" class="quantity-progress">
                      <q-linear-progress
                        :value="selectedItem.quantity / getItemQuantity(selectedItem.item)"
                        :color="getQuantityProgressColor(selectedItem.quantity, getItemQuantity(selectedItem.item))"
                        size="4px"
                        rounded
                        class="q-mt-xs"
                      />
                      <div class="progress-text">
                        {{ selectedItem.quantity }} / {{ getItemQuantity(selectedItem.item) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: Total & Actions -->
                <div class="item-actions-section">
                  <div class="item-total">
                    <div class="total-label">{{ t('item.total') }}</div>
                    <div class="total-value">${{ formatCurrency(selectedItem.quantity * selectedItem.unit_price) }}</div>
                  </div>
                  <q-btn
                    @click="removeItem(index)"
                    icon="close"
                    flat
                    round
                    color="negative"
                    size="sm"
                    class="remove-btn"
                  >
                    <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- No Results State -->
      <div v-if="!searchLoading && itemSearchQuery.trim() && searchResults.length === 0" class="no-results q-mt-lg">
        <q-card flat bordered class="no-results-card">
          <q-card-section class="text-center q-py-lg">
            <q-icon name="search_off" size="64px" class="text-grey-4 q-mb-md" />
            <div class="text-h6 text-grey-6 q-mb-sm">{{ t('item.noItemsFound') }}</div>
            <div class="text-body2 text-grey-5">
              {{ t('item.tryDifferentSearch') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loading State -->
      <div v-if="searchLoading" class="loading-state q-mt-lg">
        <q-card flat bordered>
          <q-card-section class="text-center q-py-lg">
            <q-spinner-dots color="primary" size="48px" />
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ t('item.searchingItems') }}...
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="!searchLoading && !itemSearchQuery.trim() && searchResults.length === 0" class="empty-state q-mt-lg">
        <q-card flat bordered class="empty-state-card">
          <q-card-section class="text-center q-py-xl">
            <q-icon name="inventory" size="80px" class="text-grey-4 q-mb-md" />
            <div class="text-h6 text-grey-6 q-mb-sm">{{ t('item.searchToBegin') }}</div>
            <div class="text-body2 text-grey-5 q-mb-lg">
              {{ t('item.searchHint') }}
            </div>
            <q-btn
              color="primary"
              :label="t('item.browseAllItems')"
              no-caps
              @click="onSearchItems"
              :disable="!formData.warehouse_id"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';

// Props & Emits
interface Props {
  formData: any;
  transactionType: 'sell' | 'purchase';
  validationErrors: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const itemTransactionStore = useItemTransactionStore();

// Local state
const itemSearchQuery = ref('');
const searchResults = ref<any[]>([]);
const searchLoading = ref(false);

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value: any) => emit('update:formData', value)
});

const isStepValid = computed(() => {
  return formData.value.selectedItems.length > 0;
});

// Methods
const formatCurrency = (amount: number) => {
  return Number(amount).toFixed(2);
};

const getQuantityProgressColor = (current: number, max: number) => {
  const ratio = current / max;
  if (ratio >= 0.9) return 'negative';
  if (ratio >= 0.7) return 'warning';
  return 'positive';
};

const getItemQuantity = (item: any): number => {
  // Calculate available quantity for sell transactions
  if (props.transactionType === 'sell') {
    return item.total_quantity || item.quantity || 0;
  }
  return 999; // For purchase, quantity is not limited
};

const isItemSelected = (itemId: number): boolean => {
  return formData.value.selectedItems.some((si: any) => si.item.id === itemId);
};

const onSearchItems = async () => {
  if (!formData.value.warehouse_id) {
    return;
  }

  try {
    searchLoading.value = true;
    const searchQuery = itemSearchQuery.value.trim();

    let results: any[] = [];

    if (props.transactionType === 'sell') {
      // For sell transactions, use the same approach as the old modal
      const queryParam = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : '';

      const response = await api.get<any>(
        `${endPoints.specialwarehouseItems(formData.value.warehouse_id)}?relations=items${queryParam}`
      );

      if (response.data.status === 'success' && response.data.data?.items) {
        // Convert items object to array if needed
        const itemsData = response.data.data.items;
        if (Array.isArray(itemsData)) {
          results = itemsData;
        } else {
          // If items is an object, convert to array
          results = Object.values(itemsData);
        }
      }
    } else {
      // For purchase transactions, use the store method
      results = await itemTransactionStore.searchItems(
        searchQuery,
        formData.value.warehouse_id,
        props.transactionType
      );    }

    searchResults.value = results || [];

  } catch (error) {
    console.error('Error searching items:', error);
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
};

// Debounced search
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
    } else {
      clearSearchResults();
    }
  }, 500);
};

const addItemToTransaction = (item: any) => {
  if (isItemSelected(item.id)) {
    return; // Already selected
  }

  // Check availability for sell transactions
  if (props.transactionType === 'sell' && getItemQuantity(item) === 0) {
    return;
  }

  const newSelectedItem = {
    item: item,
    quantity: 1,
    unit_price: item.solo_unit_price || 0,
    solo_unit_price: item.solo_unit_price || 0,
    bulk_unit_price: item.bulk_unit_price || 0,
    total: item.solo_unit_price || 0
  };

  formData.value.selectedItems.push(newSelectedItem);
};

const addAllItemsToTransaction = () => {
  searchResults.value.forEach(item => {
    if (!isItemSelected(item.id) && (props.transactionType === 'purchase' || getItemQuantity(item) > 0)) {
      addItemToTransaction(item);
    }
  });
};

const removeItem = (index: number) => {
  formData.value.selectedItems.splice(index, 1);
};

const increaseQuantity = (index: number) => {
  const selectedItem = formData.value.selectedItems[index];
  const maxQuantity = props.transactionType === 'sell' ? getItemQuantity(selectedItem.item) : 999;

  if (selectedItem.quantity < maxQuantity) {
    selectedItem.quantity++;
    updateItemTotal(index);
  }
};

const decreaseQuantity = (index: number) => {
  const selectedItem = formData.value.selectedItems[index];

  if (selectedItem.quantity > 1) {
    selectedItem.quantity--;
    updateItemTotal(index);
  }
};

const updateItemTotal = (index: number) => {
  const selectedItem = formData.value.selectedItems[index];
  selectedItem.total = selectedItem.quantity * selectedItem.unit_price;
};

const clearSearchResults = () => {
  searchResults.value = [];
  itemSearchQuery.value = '';
};

// Watch for validation changes
watch(isStepValid, (isValid) => {
  emit('validate', 2, isValid);
}, { immediate: true });

// Watch for warehouse changes
watch(() => formData.value.warehouse_id, (newWarehouseId) => {
  if (newWarehouseId) {
    // Clear previous search when warehouse changes
    clearSearchResults();
    formData.value.selectedItems = [];
  }
});
</script>

<style lang="scss" scoped>
.item-selection-step {
  .step-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .step-header {
    margin-bottom: 2rem;
    text-align: center;

    .step-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: $dark;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .step-description {
      color: $grey-6;
      font-size: 1rem;
      line-height: 1.5;
    }
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: $primary;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .search-section {
    .search-card {
      border-radius: 12px;
    }

    .search-btn {
      height: 56px;
    }
  }

  .search-results {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .search-results-container {
      .item-search-list {
        .item-list-item {
          padding: 12px 16px;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f0f0f0;

          &:hover {
            background-color: rgba(25, 118, 210, 0.04);
            border-left: 4px solid var(--q-primary);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          &.item-selected {
            background-color: rgba(76, 175, 80, 0.08);
            border-left: 4px solid #4caf50;
          }

          &:last-child {
            border-bottom: none;
          }
        }

        .item-name {
          font-weight: 500;
          color: #1976d2;
          font-size: 0.95rem;
          line-height: 1.3;
        }

        .item-details {
          .item-codes {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-top: 4px;

            .item-code-chip, .item-part-chip, .item-info-chip {
              background-color: $grey-2;
              color: $grey-7;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 0.7rem;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 3px;
            }

            .item-code-chip {
              background-color: rgba(33, 150, 243, 0.1);
              color: $primary;
            }

            .item-part-chip {
              background-color: rgba(76, 175, 80, 0.1);
              color: $positive;
            }

            .item-info-chip {
              background-color: rgba(76, 175, 80, 0.1);
              color: $positive;
            }
          }
        }

        .item-pricing {
          .price-display {
            font-weight: 600;
            color: $positive;
            font-size: 0.9rem;
          }
        }

        .item-avatar-enhanced {
          border: 2px solid #e0e0e0;
          transition: border-color 0.2s ease;
        }

        .item-list-item:hover .item-avatar-enhanced {
          border-color: var(--q-primary);
        }

        .item-action-section {
          .q-btn {
            transition: all 0.2s ease;
          }
        }

        .item-list-item:hover .q-btn {
          transform: scale(1.05);
        }
      }
    }

    .quick-actions {
      text-align: center;
    }
  }

  .selected-items {
    .individual-items-section {
      .individual-items-list {
        .individual-item-card-fullwidth {
          border-radius: 12px;
          border: 1px solid $grey-3;
          transition: all 0.2s ease;

          &:hover {
            border-color: $primary;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .item-content-horizontal {
            display: flex;
            gap: 1rem;
            align-items: center;
            padding: 1rem;

            .item-info-section {
              display: flex;
              gap: 0.75rem;
              align-items: center;
              flex: 1;

              .item-avatar {
                flex-shrink: 0;
              }

              .item-details {
                .item-name {
                  font-weight: 600;
                  color: $grey-8;
                  margin-bottom: 0.25rem;
                }

                .item-meta {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;

                  .item-code, .item-part, .item-stock {
                    font-size: 0.75rem;
                    color: $grey-6;
                    background: $grey-2;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                  }

                  .item-stock {
                    background: rgba(76, 175, 80, 0.1);
                    color: $positive;
                  }
                }
              }
            }

            .item-controls-section {
              display: flex;
              gap: 1rem;
              align-items: center;
              flex: 1;

              .price-input {
                flex: 1;
                max-width: 150px;

                .price-field {
                  min-width: 120px;
                }
              }

              .quantity-controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;

                .quantity-buttons {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;

                  .quantity-btn {
                    min-width: 32px;
                    height: 32px;
                  }

                  .quantity-input {
                    max-width: 80px;
                  }
                }

                .quantity-progress {
                  width: 100%;
                  text-align: center;

                  .progress-text {
                    font-size: 0.7rem;
                    color: $grey-6;
                    margin-top: 2px;
                  }
                }
              }
            }

            .item-actions-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
              flex-shrink: 0;

              .item-total {
                text-align: center;

                .total-label {
                  font-size: 0.75rem;
                  color: $grey-6;
                  font-weight: 500;
                }

                .total-value {
                  font-weight: 600;
                  color: $primary;
                  font-size: 1rem;
                }
              }

              .remove-btn {
                margin-top: 0.25rem;
              }
            }
          }
        }
      }
    }
  }

  .no-results-card,
  .loading-state,
  .empty-state-card {
    border-radius: 12px;
    border: 2px dashed $grey-4;
  }
}

// Dark mode support
.body--dark {
  .item-selection-step {
    .step-header {
      .step-title {
        color: $grey-1;
      }
    }

    .search-results {
      .search-results-container {
        .item-search-list {
          .item-list-item {
            border-bottom-color: #424242;

            &:hover {
              background-color: rgba(25, 118, 210, 0.08);
            }

            &.item-selected {
              background-color: rgba(76, 175, 80, 0.12);
            }
          }

          .item-name {
            color: #64b5f6;
          }

          .item-avatar-enhanced {
            border-color: #424242;
          }
        }
      }
    }

    .selected-items {
      .individual-items-section {
        .individual-item-card-fullwidth {
          background: $dark;
          border-color: #424242;

          &:hover {
            border-color: $primary;
          }
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .item-selection-step {
    .step-header {
      margin-bottom: 1.5rem;

      .step-title {
        font-size: 1.25rem;
      }

      .step-description {
        font-size: 0.9rem;
      }
    }

    .search-results {
      .search-results-container {
        .item-search-list {
          .item-list-item {
            padding: 16px 12px;
          }

          .item-avatar-enhanced {
            width: 48px !important;
            height: 48px !important;
          }

          .item-action-section {
            .q-btn {
              padding: 8px;
            }
          }
        }
      }
    }

    .selected-items {
      .individual-items-section {
        .individual-item-card-fullwidth {
          .item-content-horizontal {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;

            .item-info-section {
              justify-content: center;
              text-align: center;
            }

            .item-controls-section {
              flex-direction: column;
              gap: 1rem;

              .price-input {
                max-width: 100%;
              }

              .quantity-controls {
                width: 100%;

                .quantity-buttons {
                  justify-content: center;
                }
              }
            }

            .item-actions-section {
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
          }
        }
      }
    }
  }
}
</style>
