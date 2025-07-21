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
          {{ $t('offer.editOffer') }} #{{ offer?.id || '' }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="closeDialog" />
      </div>

      <q-card-section class="q-pt-none">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Basic Offer Information -->
          <div class="text-subtitle1 text-primary q-mb-sm">{{ $t('offer.basicInfo') }}</div>

          <!-- Customer Information (Read Only) -->
          <div class="customer-info-section q-mb-lg">
            <q-card flat bordered class="customer-info-card">
              <q-card-section class="q-pa-lg">
                <div class="text-h6 q-mb-md flex items-center">
                  <q-icon name="person" class="q-mr-sm" />
                  {{ $t('offer.customerInformation') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="info-item">
                      <div class="info-label">{{ $t('offer.name') }}</div>
                      <div class="info-value">{{ getCustomerName() }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="info-item">
                      <div class="info-label">{{ $t('offer.phone') }}</div>
                      <div class="info-value">{{ getCustomerPhone() }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Offer Details -->
          <div class="row q-col-gutter-md">
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

            <div class="col-12 col-md-6">
              <!-- Valid Until Date -->
              <q-input
                v-model="form.valid_until"
                :label="$t('offer.validUntil') + ' *'"
                outlined
                type="date"
                :min="getCurrentDate()"
                :rules="[val => !!val || $t('offer.dateRequired')]"
                class="enhanced-input"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md">
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

            <div class="col-12 col-md-6">
              <!-- Note -->
              <q-input
                v-model="form.note"
                :label="$t('offer.descriptionNote')"
                outlined
                class="enhanced-input"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" />
                </template>
              </q-input>
            </div>
          </div>

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
                  <div class="row q-col-gutter-sm">
                    <div
                      v-for="item in searchResults"
                      :key="item.id"
                      class="col-12 col-md-6 col-lg-4"
                    >
                      <q-card
                        flat
                        bordered
                        class="result-item-card cursor-pointer"
                        :class="{ 'selected-item': isItemSelected(item.id) }"
                        @click="selectItem(item)"
                      >
                        <q-card-section class="q-pa-md">
                          <div class="row items-center no-wrap">
                            <div class="col">
                              <div class="item-name text-weight-medium q-mb-xs">
                                {{ item.name }}
                              </div>
                              <div class="item-details">
                                <div class="text-caption text-grey-6">
                                  {{ $t('offer.sku') }}: {{ item.sku || 'N/A' }}
                                </div>
                                <div class="text-caption text-grey-6" v-if="item.category?.name">
                                  {{ $t('offer.category') }}: {{ item.category.name }}
                                </div>
                                <div class="text-caption text-positive q-mt-xs">
                                  {{ $t('offer.price') }}: ${{ formatPrice(item.solo_unit_price || 0) }}
                                </div>
                              </div>
                            </div>
                            <div class="col-auto">
                              <q-btn
                                round
                                :color="isItemSelected(item.id) ? 'positive' : 'primary'"
                                :icon="isItemSelected(item.id) ? 'check' : 'add'"
                                size="sm"
                                @click.stop="selectItem(item)"
                                :disable="isItemSelected(item.id)"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
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
                          <h6 class="item-name q-mb-xs">{{ item.item_name || getItemName(item.item_id) }}</h6>
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
                  :label="$t('offer.updateOffer')"
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
import { useItemStore } from 'src/stores/itemStore'
import type { OfferResponse, OfferPost, OfferPostDetail } from 'src/types/offer'
import type { Product } from 'src/types/item'

// Props and emits
const props = defineProps<{
  modelValue: boolean
  offer: OfferResponse | null
}>()

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void
  (_e: 'updated'): void
  (_e: 'close'): void
}>()

// Composables
const { t: _t } = useI18n()

// Stores
const offerStore = useOfferStore()
const itemStore = useItemStore()

// Internal model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form data
interface OfferFormData {
  customer_id: number
  title: string
  valid_until: string
  note: string
  discounted_rate: number
  details: OfferPostDetail[]
}

const form = ref<OfferFormData>({
  customer_id: 0,
  title: '',
  note: '',
  valid_until: '',
  discounted_rate: 0,
  details: []
})

// Search state
const itemSearchQuery = ref('')
const itemSearchLoading = ref(false)
const searchResults = ref<Product[]>([])

// Computed properties for totals
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
function getCurrentDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0] || ''
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

function getCustomerName(): string {
  if (!props.offer) return ''

  if (typeof props.offer.customer_id === 'object' && props.offer.customer_id?.name) {
    return props.offer.customer_id.name
  }

  return props.offer.customer?.name || props.offer.customer?.full_name || ''
}

function getCustomerPhone(): string {
  if (!props.offer) return ''

  if (typeof props.offer.customer_id === 'object' && props.offer.customer_id?.phone) {
    return props.offer.customer_id.phone
  }

  return props.offer.customer?.phone || ''
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

const getItemName = (itemId: number): string => {
  const item = itemStore.items.find(i => i.id === itemId)
  return item?.name || 'Unknown Item'
}

const getItemSku = (itemId: number): string => {
  const item = itemStore.items.find(i => i.id === itemId)
  return item?.sku || 'N/A'
}

// Initialize form with offer data
const initializeForm = () => {
  if (props.offer) {
    // Get customer_id - handle both object and number formats
    let customerId = 0
    if (typeof props.offer.customer_id === 'object' && props.offer.customer_id?.id) {
      customerId = props.offer.customer_id.id
    } else if (typeof props.offer.customer_id === 'number') {
      customerId = props.offer.customer_id
    }

    form.value = {
      customer_id: customerId,
      title: props.offer.title || '',
      valid_until: props.offer.valid_until ? (props.offer.valid_until.split('T')[0] || '') : '',
      note: props.offer.note || '',
      discounted_rate: props.offer.discounted_rate || 0,
      details: props.offer.items?.map(item => ({
        item_id: item.item_id || item.id,
        item_name: item.item_name,
        description: item.description || '',
        unit_price: item.unit_price,
        quantity: item.quantity
      })) || []
    }
  }
}

// Form submission
async function handleSubmit() {
  if (!props.offer) return

  try {
    // Transform form data to match OfferPost structure
    const postData: OfferPost = {
      customer_id: form.value.customer_id,
      title: form.value.title,
      valid_until: form.value.valid_until,
      note: form.value.note,
      discounted_rate: form.value.discounted_rate,
      details: form.value.details
    }

    await offerStore.updateOffer(props.offer.id, postData)
    emit('updated')
    closeDialog()
  } catch (error) {
    console.error('Error updating offer:', error)
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  emit('close')
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
  itemSearchQuery.value = ''
  searchResults.value = []
}

// Lifecycle
onMounted(async () => {
  // Pre-load items
  await itemStore.fetchItems()
})

// Watch for dialog and offer changes
watch(dialogVisible, (newVal) => {
  if (newVal && props.offer) {
    initializeForm()
  } else if (!newVal) {
    resetForm()
  }
})

watch(() => props.offer, (newOffer) => {
  if (newOffer && dialogVisible.value) {
    initializeForm()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
/* Enhanced Dialog Styling */
.enhanced-dialog {
  .q-dialog__backdrop {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
  }

  .q-modal-form {
    border-radius: 16px;
    max-width: 1000px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
}

.modal-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  padding: 1.5rem;
  margin: -1rem -1rem 1.5rem -1rem;
  border-radius: 16px 16px 0 0;
}

.enhanced-input {
  .q-field__control {
    border-radius: 8px;
  }
}

/* Customer Info Section */
.customer-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid var(--q-primary);
}

.info-item {
  .info-label {
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .info-value {
    font-size: 1rem;
    color: #212529;
    font-weight: 600;
  }
}

/* Search Results */
.search-results-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
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
