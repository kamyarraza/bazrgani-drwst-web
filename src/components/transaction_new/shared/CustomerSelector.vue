<template>
  <div class="customer-selector">
    <q-input
      v-model="searchQuery"
      :label="labelText + ' *'"
      outlined
      clearable
      :loading="loading"
      @keyup.enter="onSearch"
      @input="onSearchInputDebounced"
      @clear="onClearInput"
      :error="!!error"
      :error-message="error"
      hide-bottom-space
      class="search-input"
    >
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          icon="search"
          @click="onSearch"
          :loading="loading"
        >
          <q-tooltip>{{ t('common.search') }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <!-- Selected Customer Display -->
    <div v-if="selectedCustomer" class="selected-customer q-mt-sm">
      <q-chip
        removable
        @remove="clearSelection"
        color="positive"
        text-color="white"
        icon="person"
        size="md"
        class="selected-chip"
      >
        <div class="customer-chip-content">
          <div class="customer-name">{{ selectedCustomer.fname }} {{ selectedCustomer.sname }}</div>
        </div>
      </q-chip>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results q-mt-sm">
      <q-card flat bordered class="results-card">
        <q-card-section class="results-header">
          <div class="text-subtitle2 text-primary">
            <q-icon name="search" class="q-mr-xs" />
            {{ t('customer.searchResults') }} ({{ searchResults.length }})
          </div>
          <q-btn
            flat
            dense
            round
            icon="clear"
            @click="clearSearchResults"
            size="sm"
          >
            <q-tooltip>{{ t('common.clear') }}</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator />

        <q-list separator class="results-list">
          <q-item
            v-for="customer in searchResults"
            :key="customer.id"
            clickable
            v-ripple
            @click="selectCustomer(customer)"
            class="customer-item"
            :class="{ 'selected': modelValue === customer.id }"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="md">
                {{ customer.fname.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="customer-name">
                {{ customer.fname }} {{ customer.sname }}
              </q-item-label>
              <q-item-label caption v-if="customer.location" class="customer-details">
                <q-icon name="location_on" size="xs" class="q-mr-xs" />
                {{ customer.location.name }}
              </q-item-label>
            </q-item-section>

            <q-item-section side v-if="modelValue === customer.id">
              <q-icon name="check_circle" color="positive" size="sm" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <!-- No Results State -->
    <div v-if="showNoResults" class="no-results q-mt-sm">
      <q-card flat bordered class="no-results-card">
        <q-card-section class="text-center q-py-lg">
          <q-icon name="search_off" size="48px" class="text-grey-4 q-mb-sm" />
          <div class="text-h6 text-grey-6 q-mb-xs">
            {{ noResultsText }}
          </div>
          <div class="text-caption text-grey-5">
            {{ t('customer.tryDifferentSearch') }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Loading State -->
    <div v-if="loading && searchQuery.trim()" class="loading-state q-mt-sm">
      <q-card flat bordered>
        <q-card-section class="text-center q-py-lg">
          <q-spinner-dots color="primary" size="40px" />
          <div class="text-caption text-grey-6 q-mt-sm">
            {{ searchingText }}...
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCustomerStore } from 'src/stores/customerStore';

// Props & Emits
interface Props {
  modelValue: number | null;
  customerType: 'customer' | 'supplier';
  error?: string;
  required?: boolean;
}

interface Emits {
  (_e: 'update:modelValue', _value: number | null): void;
  (_e: 'customer-selected', _customer: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  required: true
});

const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const customerStore = useCustomerStore();

// Local state
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const loading = ref(false);
const selectedCustomerData = ref<any>(null);

// Computed properties
const labelText = computed(() => {
  return props.customerType === 'supplier'
    ? t('customer.searchSupplier')
    : t('customer.searchCustomer');
});

const noResultsText = computed(() => {
  return props.customerType === 'supplier'
    ? t('customer.noSuppliersFound')
    : t('customer.noCustomersFound');
});

const searchingText = computed(() => {
  return props.customerType === 'supplier'
    ? t('customer.searchingSuppliers')
    : t('customer.searchingCustomers');
});

const showNoResults = computed(() => {
  return !loading.value &&
         searchQuery.value?.trim() &&
         searchResults.value.length === 0 &&
         !props.modelValue;
});

const selectedCustomer = computed(() => {
  if (!props.modelValue) return null;

  // First, try to find in current search results
  const fromSearchResults = searchResults.value.find(c => c.id === props.modelValue);
  if (fromSearchResults) return fromSearchResults;

  // If not found in search results, return the stored selected customer data
  return selectedCustomerData.value;
});

// Methods
const onSearch = async () => {
  try {
    loading.value = true;
    const searchTerm = searchQuery.value?.trim() || '';

    // Allow empty search to fetch all customers/suppliers
    const results = await customerStore.searchCustomers(searchTerm, props.customerType);
    searchResults.value = results;

  } catch (error) {
    console.error('Error searching customers:', error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearchInputDebounced = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    if (searchQuery.value?.trim().length >= 2) {
      void onSearch();
    } else if (searchQuery.value?.trim().length === 0) {
      // Allow empty search to fetch all
      void onSearch();
    } else {
      clearSearchResults();
    }
  }, 500);
};

const selectCustomer = (customer: any) => {
  emit('update:modelValue', customer.id);
  emit('customer-selected', customer);
  searchQuery.value = `${customer.fname} ${customer.sname}`;
  searchResults.value = [];
  // Store the selected customer data locally
  selectedCustomerData.value = customer;
};

const clearSelection = () => {
  emit('update:modelValue', null);
  emit('customer-selected', null);
  searchQuery.value = '';
  searchResults.value = [];
  selectedCustomerData.value = null;
};

const clearSearchResults = () => {
  searchResults.value = [];
};

const onClearInput = () => {
  // When the clear button is clicked, clear the selection
  clearSelection();
};

// Watch for external value changes
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    searchQuery.value = '';
    clearSearchResults();
    selectedCustomerData.value = null;
  } else if (newValue && !selectedCustomerData.value) {
    // Load customer data if we have an ID but no stored data
    try {
      const searchResults = await customerStore.searchCustomers('', props.customerType);
      const customer = searchResults.find(c => c.id === newValue);
      if (customer) {
        selectedCustomerData.value = customer;
        searchQuery.value = `${customer.fname} ${customer.sname}`;
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  }
}, { immediate: true });

// Watch for searchQuery changes to handle null values
watch(searchQuery, (newValue) => {
  if (newValue === null || newValue === undefined) {
    searchQuery.value = '';
  }
});
</script>

<style lang="scss" scoped>
.customer-selector {
  .search-input {
    :deep(.q-field__control) {
      border-radius: 8px;
    }
  }

  .selected-customer {
    .selected-chip {
      .customer-chip-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .customer-name {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .customer-phone {
          font-size: 0.75rem;
          opacity: 0.8;
        }
      }
    }
  }

  .search-results {
    .results-card {
      border-radius: 8px;
      overflow: hidden;

      .results-header {
        background: $grey-1;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .results-list {
        max-height: 300px;
        overflow-y: auto;

        .customer-item {
          transition: all 0.2s ease;

          &:hover {
            background: $grey-1;
          }

          &.selected {
            background: $blue-1;
            border-left: 3px solid $positive;
          }

          .customer-name {
            font-weight: 600;
            color: $dark;
          }

          .customer-details {
            color: $grey-6;
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }

  .no-results-card,
  .loading-state {
    border-radius: 8px;
    border: 2px dashed $grey-4;
  }
}

// Dark mode support
.body--dark {
  .customer-selector {
    .search-results {
      .results-card {
        .results-header {
          background: $dark-page;
        }

        .customer-item {
          &:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          &.selected {
            background: rgba(33, 150, 243, 0.1);
          }
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .customer-selector {
    .search-results {
      .results-list {
        .customer-item {
          padding: 12px 16px;

          :deep(.q-item__section--avatar) {
            min-width: 40px;

            .q-avatar {
              width: 40px;
              height: 40px;
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }
}
</style>
