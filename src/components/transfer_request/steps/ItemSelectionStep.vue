<template>
  <div class="item-selection-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="inventory_2" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('transferRequest.selectItems') }}</span>
        </div>
        <div class="step-description">
          {{ t('transferRequest.selectItemsDescription') }}
        </div>
        <div class="warehouse-info q-mt-sm">
          <q-chip color="info" text-color="white" size="sm" icon="warehouse">
            {{ t('transferRequest.itemsFrom') }}: <strong>{{ formData.fromWarehouseName }}</strong>
          </q-chip>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <q-card flat bordered class="search-card">
          <q-card-section>
            <div class="section-title">
              <q-icon name="search" class="q-mr-sm" />
              {{ t('transferRequest.searchItems') }}
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="itemSearchQuery"
                  :label="t('transferRequest.searchItems')"
                  outlined
                  @keyup.enter="onSearchItems"
                  @input="onSearchInputDebounced"
                  clearable
                  :loading="searchLoading"
                  :disable="!formData.fromWarehouseId"
                  :hint="!formData.fromWarehouseId ? t('transferRequest.selectBranchFirst') : ''"
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
                  :disable="!formData.fromWarehouseId"
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
            {{ t('transferRequest.availableItems') }} ({{ searchResults.length }})
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
              @click="addItemToTransfer(item)"
              class="item-list-item"
              :class="{
                'item-selected': isItemSelected(item.id)
              }"
            >
              <q-item-section avatar>
                <q-avatar size="56px" rounded class="item-avatar-enhanced">
                  <q-icon name="inventory_2" size="28px" color="blue-grey-5" />
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
                    {{ t('transferRequest.added') }}
                  </q-chip>
                </q-item-label>

                <q-item-label caption class="item-details">
                  <div class="text-caption text-grey-6">
                    ID: {{ item.id }}
                  </div>
                  <div class="text-caption text-grey-6" v-if="item.volume">
                    {{ t('transferRequest.volume') }}: {{ item.volume }}
                  </div>
                  <div class="text-caption text-positive q-mt-xs">
                    {{ t('transferRequest.available') }}: {{ item.quantity }} {{ t('common.units') }}
                  </div>
                </q-item-label>
              </q-item-section>

              <q-item-section side class="item-action-section">
                <q-btn
                  round
                  :color="isItemSelected(item.id) ? 'positive' : 'primary'"
                  :icon="isItemSelected(item.id) ? 'check' : 'add'"
                  size="sm"
                  @click.stop="addItemToTransfer(item)"
                  :disable="item.quantity === 0 || isItemSelected(item.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Quick Add All Button -->
        <div v-if="searchResults.length > 1" class="quick-actions q-mt-md">
          <q-btn
            :label="t('transferRequest.addAllToTransfer')"
            color="secondary"
            outline
            no-caps
            icon="playlist_add"
            @click="addAllItemsToTransfer"
            :disable="searchResults.every(item => item.quantity === 0)"
          />
        </div>
      </div>

      <!-- No Search Results -->
      <div v-else-if="itemSearchQuery && !searchLoading" class="no-results q-mt-lg">
        <q-card flat bordered class="no-results-card">
          <q-card-section class="text-center">
            <q-icon name="search_off" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">{{ t('transferRequest.noItemsFound') }}</div>
            <div class="text-body2 text-grey-5 q-mt-sm">
              {{ t('transferRequest.noItemsFoundDescription') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Selected Items Section -->
      <div v-if="formData.selectedItems.length > 0" class="selected-items q-mt-lg">
        <div class="section-title">
          <q-icon name="shopping_cart" class="q-mr-sm" />
          {{ t('transferRequest.selectedItems') }}
          <q-chip
            :label="`${formData.selectedItems.length} ${formData.selectedItems.length === 1 ? 'item' : 'items'}`"
            color="primary"
            text-color="white"
            size="sm"
            dense
            class="q-ml-sm"
          />
        </div>

        <div class="selected-items-grid">
          <q-card
            v-for="(selectedItem, index) in formData.selectedItems"
            :key="selectedItem.item.id"
            flat
            bordered
            class="selected-item-card"
          >
            <q-card-section class="selected-item-content">
              <!-- Item Header -->
              <div class="item-header">
                <div class="item-info">
                  <div class="item-name">{{ selectedItem.item.name }}</div>
                  <div class="item-id">ID: {{ selectedItem.item.id }}</div>
                </div>
                <q-btn
                  @click="removeItem(index)"
                  flat
                  round
                  dense
                  icon="close"
                  color="negative"
                  size="sm"
                  class="remove-btn"
                >
                  <q-tooltip>{{ t('transferRequest.removeItem') }}</q-tooltip>
                </q-btn>
              </div>

              <!-- Item Details -->
              <div class="item-details-section q-mt-sm">
                <div class="availability-info">
                  <span class="availability-label">{{ t('transferRequest.available') }}:</span>
                  <span class="availability-value">{{ selectedItem.availableQuantity }} {{ t('common.units') }}</span>
                </div>
              </div>

              <!-- Quantity Input -->
              <div class="quantity-section q-mt-md">
                <q-input
                  v-model.number="selectedItem.quantity"
                  type="number"
                  :label="t('transferRequest.quantity')"
                  outlined
                  dense
                  min="1"
                  :max="selectedItem.availableQuantity"
                  @update:model-value="(val) => updateQuantity(selectedItem, val)"
                  :error="selectedItem.quantity > selectedItem.availableQuantity || selectedItem.quantity < 1"
                  :error-message="selectedItem.quantity > selectedItem.availableQuantity ? t('transferRequest.quantityExceedsAvailable') : selectedItem.quantity < 1 ? t('transferRequest.quantityRequired') : ''"
                  class="quantity-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="format_list_numbered" />
                  </template>
                  <template v-slot:append>
                    <div class="quantity-controls">
                      <q-btn
                        flat
                        round
                        dense
                        icon="remove"
                        @click="decreaseQuantity(selectedItem)"
                        :disable="selectedItem.quantity <= 1"
                        size="sm"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="add"
                        @click="increaseQuantity(selectedItem)"
                        :disable="selectedItem.quantity >= selectedItem.availableQuantity"
                        size="sm"
                      />
                    </div>
                  </template>
                </q-input>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- No Items Selected -->
      <div v-else-if="!itemSearchQuery" class="no-items-selected q-mt-lg">
        <q-card flat bordered class="no-items-card">
          <q-card-section class="text-center">
            <q-icon name="shopping_cart_outlined" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">{{ t('transferRequest.noItemsSelected') }}</div>
            <div class="text-body2 text-grey-5 q-mt-sm">
              {{ t('transferRequest.noItemsSelectedDescription') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar, debounce } from 'quasar';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';

// Props & Emits
interface Props {
  formData: any;
  transferType: 'request' | 'transfer';
  validationErrors?: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'clearValidationError', _field: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const _warehouseStore = useWarehouseStore();

// Reactive data
const itemSearchQuery = ref('');
const searchResults = ref<any[]>([]);
const searchLoading = ref(false);

// Computed
const formData = computed({
  get: () => props.formData,
  set: (value) => emit('update:formData', value)
});

const isStepValid = computed(() => {
  // Step is valid if there are selected items and all quantities are valid
  return formData.value.selectedItems.length > 0 &&
         formData.value.selectedItems.every((item: any) =>
           item.quantity >= 1 && item.quantity <= item.availableQuantity
         );
});

// Debounced search function
const onSearchInputDebounced = debounce((value: string) => {
  if (value && value.length >= 2) {
    void onSearchItems();
  } else if (!value) {
    clearSearchResults();
  }
}, 500);

// Methods
const onSearchItems = async () => {
  if (!formData.value.fromWarehouseId) return;

  searchLoading.value = true;
  try {
    const searchQuery = itemSearchQuery.value.trim();
    const queryParam = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : '';

    const response = await api.get<any>(
      `${endPoints.specialwarehouseItems(formData.value.fromWarehouseId)}?relations=items${queryParam}`
    );

    if (response.data.status === 'success' && response.data.data?.items) {
      // Convert items object to array if needed
      const itemsData = response.data.data.items;
      if (Array.isArray(itemsData)) {
        searchResults.value = itemsData;
      } else {
        // If items is an object, convert to array
        searchResults.value = Object.values(itemsData);
      }
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error('Error searching items:', error);
    searchResults.value = [];
    $q.notify({
      type: 'negative',
      message: t('transferRequest.errorSearchingItems'),
      position: 'top'
    });
  } finally {
    searchLoading.value = false;
  }
};

const clearSearchResults = () => {
  searchResults.value = [];
  itemSearchQuery.value = '';
};

const isItemSelected = (itemId: number) => {
  return formData.value.selectedItems.some((selected: any) => selected.item.id === itemId);
};

const addItemToTransfer = (item: any) => {
  if (isItemSelected(item.id) || item.quantity === 0) return;

  const newSelectedItem = {
    item: item,
    quantity: 1,
    availableQuantity: item.quantity
  };

  const updatedData = {
    ...formData.value,
    selectedItems: [...formData.value.selectedItems, newSelectedItem]
  };

  emit('update:formData', updatedData);

  // Use nextTick to ensure the reactive update is complete before validating
  void nextTick(() => {
    validateStep();
  });

  $q.notify({
    type: 'positive',
    message: t('transferRequest.itemAddedToTransfer', { name: item.name }),
    position: 'top'
  });
};

const addAllItemsToTransfer = () => {
  const availableItems = searchResults.value.filter(item =>
    !isItemSelected(item.id) && item.quantity > 0
  );

  const newSelectedItems = availableItems.map(item => ({
    item: item,
    quantity: 1,
    availableQuantity: item.quantity
  }));

  const updatedData = {
    ...formData.value,
    selectedItems: [...formData.value.selectedItems, ...newSelectedItems]
  };

  emit('update:formData', updatedData);

  void nextTick(() => {
    validateStep();
  });

  $q.notify({
    type: 'positive',
    message: t('transferRequest.allItemsAddedToTransfer', { count: newSelectedItems.length }),
    position: 'top'
  });
};

const removeItem = (index: number) => {
  const updatedItems = [...formData.value.selectedItems];
  updatedItems.splice(index, 1);

  const updatedData = {
    ...formData.value,
    selectedItems: updatedItems
  };

  emit('update:formData', updatedData);

  void nextTick(() => {
    validateStep();
  });
};

const updateQuantity = (selectedItem: any, value: any) => {
  const numValue = Number(value) || 1;
  selectedItem.quantity = Math.max(1, Math.min(numValue, selectedItem.availableQuantity));

  // Trigger validation immediately
  void nextTick(() => {
    validateStep();
  });
};

const increaseQuantity = (selectedItem: any) => {
  if (selectedItem.quantity < selectedItem.availableQuantity) {
    selectedItem.quantity++;
    void nextTick(() => {
      validateStep();
    });
  }
};

const decreaseQuantity = (selectedItem: any) => {
  if (selectedItem.quantity > 1) {
    selectedItem.quantity--;
    void nextTick(() => {
      validateStep();
    });
  }
};

const validateStep = () => {
  emit('validate', 2, isStepValid.value);
};

// Watch for changes in selected items and their quantities to auto-validate
watch(() => formData.value.selectedItems, () => {
  void nextTick(() => {
    validateStep();
  });
}, { deep: true });

// Initial validation
validateStep();
</script>

<style lang="scss" scoped>
.item-selection-step {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;

  .step-container {
    .step-header {
      text-align: center;
      margin-bottom: 2rem;

      .step-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--q-dark);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .step-description {
        color: var(--q-grey-6);
        font-size: 1rem;
        margin-bottom: 1rem;
      }

      .warehouse-info {
        display: flex;
        justify-content: center;
      }
    }

    .search-section {
      margin-bottom: 2rem;

      .search-card {
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.12);

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--q-dark);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
        }

        .search-btn {
          height: 56px;
        }
      }
    }

    .search-results {
      .results-header {
        display: flex;
        justify-content: between;
        align-items: center;
        margin-bottom: 1rem;

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--q-dark);
          display: flex;
          align-items: center;
          flex: 1;
        }
      }

      .item-search-list {
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.12);

        .item-list-item {
          padding: 1rem;
          transition: all 0.3s ease;

          &:hover {
            background-color: rgba(var(--q-primary-rgb), 0.05);
          }

          &.item-selected {
            background-color: rgba(var(--q-positive-rgb), 0.1);
            border-left: 4px solid var(--q-positive);
          }

          .item-avatar-enhanced {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }

          .item-name {
            font-weight: 600;
            font-size: 1rem;
          }

          .item-details {
            margin-top: 0.25rem;
          }

          .item-action-section {
            min-width: auto;
          }
        }
      }

      .quick-actions {
        text-align: center;
      }
    }

    .no-results,
    .no-items-selected {
      .no-results-card,
      .no-items-card {
        border-radius: 12px;
        border: 2px dashed rgba(0, 0, 0, 0.12);
        padding: 2rem;
      }
    }

    .selected-items {
      .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--q-dark);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
      }

      .selected-items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1rem;

        .selected-item-card {
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          transition: all 0.3s ease;

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .selected-item-content {
            padding: 1.5rem;

            .item-header {
              display: flex;
              justify-content: between;
              align-items: flex-start;

              .item-info {
                flex: 1;

                .item-name {
                  font-weight: 600;
                  font-size: 1rem;
                  color: var(--q-dark);
                }

                .item-id {
                  font-size: 0.875rem;
                  color: var(--q-grey-6);
                  margin-top: 0.25rem;
                }
              }

              .remove-btn {
                margin-left: 1rem;
              }
            }

            .item-details-section {
              .availability-info {
                .availability-label {
                  font-weight: 500;
                  color: var(--q-grey-7);
                }

                .availability-value {
                  font-weight: 600;
                  color: var(--q-positive);
                  margin-left: 0.5rem;
                }
              }
            }

            .quantity-section {
              .quantity-input {
                :deep(.q-field__control) {
                  border-radius: 8px;
                }
              }

              .quantity-controls {
                display: flex;
                gap: 4px;
              }
            }
          }
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .item-selection-step {
    padding: 1rem 0.5rem;

    .step-container {
      .selected-items {
        .selected-items-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
