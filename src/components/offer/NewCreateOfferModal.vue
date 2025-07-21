<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
    class="enhanced-dialog"
  >
    <q-card class="q-pa-md q-modal-form">
      <!-- Beautiful Header -->
      <div class="row items-center q-mb-md modal-header">
        <div class="text-h5 col text-uppercase">
          {{ $t('offer.createNewOffer') }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="closeDialog" />
      </div>

      <q-card-section class="q-pt-none">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Basic Offer Information -->
          <div class="text-subtitle1 text-primary q-mb-sm">{{ $t('offer.basicInfo') }}</div>

          <!-- Customer and Offer Info Section -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <!-- Customer Search Input -->
              <q-input
                v-model="customerSearchQuery"
                :label="$t('offer.searchCustomer') + ' *'"
                outlined
                clearable
                :loading="customerSearchLoading"
                @keyup.enter="onSearchCustomers"
                @input="onCustomerSearchInputDebounced"
                :error="false"
                hide-bottom-space
                class="enhanced-input"
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
                    @click="onSearchCustomers"
                    :loading="customerSearchLoading"
                  >
                    <q-tooltip>{{ $t('common.search') }}</q-tooltip>
                  </q-btn>
                </template>
              </q-input>

              <!-- Selected Customer Display -->
              <div v-if="form.customer_id && selectedCustomerDisplay" class="q-mt-xs">
                <q-chip
                  removable
                  @remove="clearSelectedCustomer"
                  color="positive"
                  text-color="white"
                  icon="person"
                  size="sm"
                >
                  {{ selectedCustomerDisplay }}
                </q-chip>
              </div>

              <!-- Customer Search Results -->
              <div v-if="customerSearchResults.length > 0" class="q-mt-sm customer-search-results">
                <q-card flat bordered class="search-results-card">
                  <q-list separator class="search-results-list">
                    <q-item
                      v-for="customer in customerSearchResults"
                      :key="customer.id"
                      clickable
                      v-ripple
                      @click="selectCustomer(customer)"
                      class="customer-result-item"
                      :class="{ 'selected-customer': form.customer_id === customer.id }"
                    >
                      <q-item-section avatar>
                        <q-avatar color="primary" text-color="white" size="sm">
                          {{ customer.fname.charAt(0).toUpperCase() }}
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="customer-name">{{ customer.fname }} {{ customer.sname }}</q-item-label>
                        <q-item-label caption class="customer-location">{{ customer.location?.name || 'N/A' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </div>

              <!-- No Results State -->
              <div v-if="!customerSearchLoading && customerSearchQuery.trim() && customerSearchResults.length === 0 && !form.customer_id" class="q-mt-sm">
                <q-card flat bordered class="no-results-card">
                  <q-card-section class="text-center q-py-lg">
                    <q-icon name="search_off" size="48px" class="text-grey-4 q-mb-sm" />
                    <div class="text-h6 text-grey-6 q-mb-xs">
                      {{ $t('offer.noCustomersFound') }}
                    </div>
                    <div class="text-caption text-grey-5">
                      {{ $t('offer.tryDifferentSearch') }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <!-- Offer Title -->
              <q-input
                v-model="form.title"
                :label="$t('offer.offerTitle') + ' *'"
                outlined
                :rules="[val => !!val || $t('offer.titleRequired')]"
                class="enhanced-input"
              >
                <template v-slot:prepend>
                  <q-icon name="title" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <!-- Valid Until Date -->
              <q-input
                v-model="form.valid_until"
                :label="$t('offer.validUntil') + ' *'"
                outlined
                readonly
                :rules="[val => !!val || $t('offer.dateRequired')]"
                class="enhanced-input"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
                <template v-slot:append>
                  <q-icon name="calendar_today" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="form.valid_until"
                        :options="dateOptions"
                        today-btn
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <!-- Discount Rate -->
              <q-input
                v-model.number="form.discounted_rate"
                :label="$t('offer.discountRate')"
                outlined
                type="number"
                min="0"
                max="100"
                suffix="%"
                class="enhanced-input"
              >
                <template v-slot:prepend>
                  <q-icon name="percent" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Note -->
          <q-input
            v-model="form.note"
            :label="$t('offer.descriptionNote')"
            outlined
            type="text"
            rows="3"
            class="enhanced-input"
          >
            <template v-slot:prepend>
              <q-icon name="notes" />
            </template>
          </q-input>

          <!-- Items Section -->
          <div class="items-section q-mt-lg">
            <div class="text-subtitle1 text-primary q-mb-sm flex items-center">
              <q-icon name="inventory_2" class="q-mr-sm" />
              {{ $t('offer.offerItems') }}
            </div>

            <!-- Item Search -->
            <div class="q-mb-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-8">
                  <q-input
                    v-model="itemSearchQuery"
                    :label="$t('offer.searchItem')"
                    outlined
                    @keyup.enter="onSearchItems"
                    @input="onItemSearchInputDebounced"
                    clearable
                    :loading="itemSearchLoading"
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
                        @click="clearItemSearchResults"
                        size="sm"
                      >
                        <q-tooltip>{{ $t('common.clear') }}</q-tooltip>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4 flex items-end">
                  <q-btn
                    color="primary"
                    icon="search"
                    :label="$t('common.search')"
                    @click="onSearchItems"
                    :loading="itemSearchLoading"
                    class="full-width"
                    size="md"
                    no-wrap
                    style="height: 56px; font-size: 13px;"
                  />
                </div>
              </div>

              <!-- Search Loading State -->
              <div v-if="itemSearchLoading" class="q-mb-md text-center">
                <q-spinner-dots
                  color="primary"
                  size="40px"
                />
                <div class="text-caption text-grey-6 q-mt-sm">
                  {{ $t('offer.searchingItems') }}...
                </div>
              </div>

              <!-- No Results State -->
              <div v-if="!itemSearchLoading && itemSearchQuery.trim() && searchResults.length === 0" class="q-mb-md text-center q-pa-md">
                <q-icon name="search_off" size="48px" class="text-grey-4 q-mb-sm" />
                <div class="text-h6 text-grey-6 q-mb-sm">{{ $t('offer.noItemsFound') }}</div>
                <div class="text-body2 text-grey-5">
                  {{ $t('offer.tryDifferentSearch') }}
                </div>
              </div>

              <!-- Search Results -->
              <div v-if="searchResults.length > 0" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm flex items-center">
                  <q-icon name="search" class="q-mr-sm" />
                  {{ $t('offer.searchResults') }} ({{ searchResults.length }})
                  <q-space />
                  <q-btn
                    flat
                    dense
                    round
                    icon="clear_all"
                    @click="clearItemSearchResults"
                    size="sm"
                  >
                    <q-tooltip>{{ $t('common.clearAll') }}</q-tooltip>
                  </q-btn>
                </div>

                <div class="search-results-container">
                  <q-list separator class="rounded-borders item-search-list">
                    <q-item
                      v-for="item in searchResults"
                      :key="`item-${item.id}`"
                      clickable
                      v-ripple
                      @click="selectItem(item)"
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
                            {{ $t('offer.selected') }}
                          </q-chip>
                        </q-item-label>

                        <q-item-label caption class="item-details">
                          <div class="text-caption text-grey-6">
                            {{ $t('offer.sku') }}: {{ item.sku || 'N/A' }}
                          </div>
                          <div class="text-caption text-grey-6" v-if="item.category?.name">
                            {{ $t('offer.category') }}: {{ item.category.name }}
                          </div>
                          <div class="text-caption text-positive q-mt-xs">
                            {{ $t('offer.price') }}: ${{ formatPrice(item.solo_unit_price || 0) }}
                          </div>
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side class="item-action-section">
                        <q-btn
                          round
                          :color="isItemSelected(item.id) ? 'positive' : 'primary'"
                          :icon="isItemSelected(item.id) ? 'check' : 'add'"
                          size="sm"
                          @click.stop="selectItem(item)"
                          :disable="isItemSelected(item.id)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>

            <!-- Selected Items -->
            <div v-if="form.details.length > 0" class="selected-items-section q-mt-lg">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="shopping_cart" class="q-mr-sm" />
                {{ $t('offer.selectedItems') }} ({{ form.details.length }})
              </div>

              <div class="selected-items-list">
                <q-card
                  v-for="(item, index) in form.details"
                  :key="index"
                  class="selected-item-card q-mb-sm"
                  flat
                  bordered
                >
                  <q-card-section class="q-pa-md">
                    <div class="row items-center q-col-gutter-md">
                      <div class="col-12 col-md-4">
                        <div class="item-info">
                          <h6 class="item-name q-mb-xs">{{ item.item_name }}</h6>
                          <p class="item-sku text-caption text-grey-6 q-mb-none">
                            {{ $t('offer.sku') }}: {{ getItemSku(item.item_id) }}
                          </p>
                        </div>
                      </div>

                      <div class="col-12 col-md-2">
                        <q-input
                          v-model.number="item.quantity"
                          :label="$t('offer.quantity')"
                          type="number"
                          min="1"
                          dense
                          outlined
                          @update:model-value="updateItemSubtotal(index)"
                        />
                      </div>

                      <div class="col-12 col-md-2">
                        <q-input
                          v-model.number="item.unit_price"
                          :label="$t('offer.unitPrice')"
                          type="number"
                          min="0"
                          step="0.01"
                          dense
                          outlined
                          @update:model-value="updateItemSubtotal(index)"
                        />
                      </div>

                      <div class="col-12 col-md-2">
                        <div class="subtotal-display">
                          <div class="text-caption text-grey-6">{{ $t('offer.subtotal') }}</div>
                          <div class="text-weight-bold text-primary">
                            ${{ formatPrice(item.quantity * item.unit_price) }}
                          </div>
                        </div>
                      </div>

                      <div class="col-12 col-md-2 text-right">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete"
                          size="sm"
                          @click="removeItem(index)"
                        >
                          <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Totals Summary -->
            <div v-if="form.details.length > 0" class="totals-section q-mt-lg">
              <q-card flat bordered class="totals-card">
                <q-card-section class="q-pa-lg">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-8">
                      <div class="text-h6 text-grey-8">{{ $t('offer.orderSummary') }}</div>
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="totals-breakdown">
                        <div class="row justify-between q-mb-sm">
                          <span>{{ $t('offer.subtotal') }}:</span>
                          <span class="text-weight-medium">${{ formatPrice(subtotal) }}</span>
                        </div>
                        <div v-if="form.discounted_rate > 0" class="row justify-between q-mb-sm">
                          <span>{{ $t('offer.discount') }} ({{ form.discounted_rate }}%):</span>
                          <span class="text-negative">-${{ formatPrice(discountAmount) }}</span>
                        </div>
                        <q-separator class="q-my-sm" />
                        <div class="row justify-between">
                          <span class="text-h6">{{ $t('offer.total') }}:</span>
                          <span class="text-h6 text-primary">${{ formatPrice(totalPrice) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions q-mt-xl">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-btn
                  :label="$t('offer.cancel')"
                  color="grey-7"
                  flat
                  class="full-width"
                  @click="closeDialog"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-btn
                  :label="$t('offer.createOffer')"
                  color="primary"
                  class="full-width"
                  type="submit"
                  :loading="offerStore.loading"
                  :disable="!isFormValid"
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOfferStore } from 'src/stores/offerStore'
import { useCustomerStore } from 'src/stores/customerStore'
import { useItemStore } from 'src/stores/itemStore'
import type { OfferPost, OfferPostDetail } from 'src/types/offer'
import type { Customer } from 'src/types/customer'
import type { Product } from 'src/types/item'

// Props and emits
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void
  (_e: 'created'): void
}>()

// Composables
const { t: _t } = useI18n()

// Stores
const offerStore = useOfferStore()
const customerStore = useCustomerStore()
const itemStore = useItemStore()

// Internal model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form data
const form = ref<OfferPost>({
  customer_id: 0,
  title: '',
  valid_until: '',
  note: '',
  discounted_rate: 0,
  details: []
})

// Search state
const customerSearchQuery = ref('')
const customerSearchLoading = ref(false)
const customerSearchResults = ref<Customer[]>([])

const itemSearchQuery = ref('')
const itemSearchLoading = ref(false)
const searchResults = ref<Product[]>([])

// Computed properties
const selectedCustomerDisplay = computed(() => {
  if (form.value.customer_id && customerSearchResults.value.length > 0) {
    const selected = customerSearchResults.value.find(c => c.id === form.value.customer_id)
    if (selected) {
      return `${selected.fname} ${selected.sname}`
    }
  }
  return customerSearchQuery.value
})

const subtotal = computed(() => {
  return form.value.details.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price)
  }, 0)
})

const discountAmount = computed(() => {
  return (subtotal.value * form.value.discounted_rate) / 100
})

const totalPrice = computed(() => {
  return subtotal.value - discountAmount.value
})

const isFormValid = computed(() => {
  return (
    form.value.customer_id > 0 &&
    form.value.title.trim() !== '' &&
    form.value.valid_until !== '' &&
    form.value.details.length > 0 &&
    form.value.details.every(item =>
      item.item_id > 0 &&
      item.unit_price > 0 &&
      item.quantity > 0
    )
  )
})

// Methods
function dateOptions(date: string): boolean {
  // Only allow dates from today onwards
  const today = new Date().toISOString().split('T')[0]
  return today ? date >= today : true
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// Customer search methods
let customerSearchTimeout: ReturnType<typeof setTimeout> | null = null
const onCustomerSearchInputDebounced = () => {
  if (customerSearchTimeout) {
    clearTimeout(customerSearchTimeout)
  }

  customerSearchTimeout = setTimeout(() => {
    if (customerSearchQuery.value.trim().length >= 2) {
      void onSearchCustomers()
    } else if (customerSearchQuery.value.trim().length === 0) {
      // Allow empty search - this will fetch all customers
      void onSearchCustomers()
    }
  }, 500)
}

const onSearchCustomers = async () => {
  try {
    customerSearchLoading.value = true
    const searchQuery = customerSearchQuery.value.trim()

    // Allow empty search to fetch all customers
    const results = await customerStore.searchCustomers(searchQuery, 'customer')
    customerSearchResults.value = results

    if (results.length === 0) {
      // Show notification for no results
    }
  } catch (error) {
    console.error('Error searching customers:', error)
    customerSearchResults.value = []
  } finally {
    customerSearchLoading.value = false
  }
}

const selectCustomer = (customer: Customer) => {
  form.value.customer_id = customer.id
  customerSearchQuery.value = `${customer.fname} ${customer.sname}`
  customerSearchResults.value = []
}

const clearSelectedCustomer = () => {
  form.value.customer_id = 0
  customerSearchQuery.value = ''
  customerSearchResults.value = []
}

// Item search methods
let itemSearchTimeout: ReturnType<typeof setTimeout> | null = null
const onItemSearchInputDebounced = () => {
  if (itemSearchTimeout) {
    clearTimeout(itemSearchTimeout)
  }

  itemSearchTimeout = setTimeout(() => {
    if (itemSearchQuery.value.trim().length >= 2) {
      void onSearchItems()
    } else if (itemSearchQuery.value.trim().length === 0) {
      void onSearchItems() // Allow empty search to show all items
    }
  }, 500)
}

const onSearchItems = async () => {
  try {
    itemSearchLoading.value = true
    const query = itemSearchQuery.value.trim()

    if (query) {
      // Search with query
      await itemStore.searchItems(query)
      searchResults.value = itemStore.items || []
    } else {
      // Get all items
      await itemStore.fetchItems()
      searchResults.value = itemStore.items.slice(0, 20) // Limit to first 20 for performance
    }
  } catch (error) {
    console.error('Error searching items:', error)
    searchResults.value = []
  } finally {
    itemSearchLoading.value = false
  }
}

const clearItemSearchResults = () => {
  searchResults.value = []
  itemSearchQuery.value = ''
}

const isItemSelected = (itemId: number): boolean => {
  return form.value.details.some(detail => detail.item_id === itemId)
}

const selectItem = (item: Product) => {
  if (isItemSelected(item.id)) return

  const newItem: OfferPostDetail = {
    item_id: item.id,
    item_name: item.name,
    description: item.description || '',
    unit_price: item.solo_unit_price || 0,
    quantity: 1
  }

  form.value.details.push(newItem)
}

const removeItem = (index: number) => {
  form.value.details.splice(index, 1)
}

const updateItemSubtotal = (_index: number) => {
  // Automatically triggered when quantity or unit_price changes
  // The computed subtotal will handle the calculation
}

const getItemSku = (itemId: number): string => {
  const item = itemStore.items.find(i => i.id === itemId)
  return item?.sku || 'N/A'
}

// Form submission
const onSubmit = async () => {
  if (!isFormValid.value) return

  try {
    const success = await offerStore.createOffer(form.value)
    if (success) {
      emit('created')
      closeDialog()
    }
  } catch (error) {
    console.error('Error creating offer:', error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    customer_id: 0,
    title: '',
    valid_until: '',
    note: '',
    discounted_rate: 0,
    details: []
  }

  // Clear search states
  customerSearchQuery.value = ''
  customerSearchResults.value = []
  itemSearchQuery.value = ''
  searchResults.value = []
}

// Lifecycle
onMounted(async () => {
  // Pre-load customers and items
  await Promise.all([
    customerStore.fetchCustomers(1, 'customer'),
    itemStore.fetchItems()
  ])
})

// Watch for dialog changes
watch(dialogVisible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})
</script>

<style lang="scss" scoped>
/* Enhanced Dialog Styling */
.enhanced-dialog {
  .q-dialog__backdrop {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
  }

  .q-modal-form {
    max-width: 1000px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
}

.modal-header {
  background: #2A7B9B;
  color: white;
  padding: 1.5rem;
  margin: -1rem -1rem 1.5rem -1rem;

  .text-h5 {
    color: white !important;
    text-transform: none !important;
  }
}

.enhanced-input {
  .q-field__control {
    border-radius: 8px;
  }
}

/* Customer Search Results */
.customer-search-results {
  .search-results-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow: hidden;
  }

  .search-results-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .customer-result-item {
    padding: 12px 16px;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f0f0f0;

    &:hover {
      background-color: #f5f5f5;
    }

    &.selected-customer {
      background-color: #e3f2fd;
      border-left: 4px solid #1976d2;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .customer-name {
    font-weight: 500;
    color: #1976d2;
  }

  .customer-phone, .customer-location {
    color: #757575;
    font-size: 0.875rem;
  }
}

.no-results-card {
  border-radius: 8px;
  border: 1px dashed #ccc;
  background-color: #fafafa;
}

/* Search Results */
.search-results-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
}

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
    font-size: 0.8rem;
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

.result-item-card {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;

  &:hover {
    border-left-color: var(--q-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.selected-item {
    border-left-color: var(--q-positive);
    background-color: #f1f8e9;
  }
}

.item-name {
  font-size: 0.95rem;
  line-height: 1.3;
}

.item-details {
  font-size: 0.8rem;
}

/* Selected Items */
.selected-item-card {
  border-left: 4px solid var(--q-primary);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.subtotal-display {
  text-align: center;
}

/* Totals Section */
.totals-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid var(--q-primary);
}

.totals-breakdown {
  font-size: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-results-container {
    .col-12.col-md-6.col-lg-4 {
      width: 100% !important;
    }
  }

  .selected-item-card {
    .row.q-col-gutter-md > .col-12.col-md-2,
    .row.q-col-gutter-md > .col-12.col-md-4 {
      width: 100% !important;
      margin-bottom: 0.5rem;
    }
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
