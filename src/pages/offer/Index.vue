<template>
  <q-page class="offer-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <q-icon name="local_offer" class="hero-icon" />
            {{ $t('offer.title') }}
          </h1>
          <p class="hero-subtitle">{{ $t('offer.subtitle') }}</p>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <div class="stat-number">{{ activeOffers.length }}</div>
            <div class="stat-label">{{ $t('offer.activeOffers') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ validOffers.length }}</div>
            <div class="stat-label">{{ $t('offer.availableNow') }}</div>
          </div>
          <q-btn
            unelevated
            color="white"
            text-color="primary"
            icon="add_circle"
            :label="$t('offer.createNewOffer')"
            size="md"
            class="create-offer-btn"
            @click="showCreateModal = true"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <EnhancedLoading
        :title="$t('offer.loadingOffers')"
        :subtitle="$t('offer.loadingSubtitle')"
        :show-dots="true"
        spinner-color="primary"
        spinner-size="3rem"
      />
    </div>

    <!-- Offers Grid -->
    <div v-else class="offers-container">
      <!-- Empty State -->
      <div v-if="offers.length === 0" class="empty-state">
        <q-icon name="redeem" size="5rem" color="grey-4" />
        <h3 class="empty-title">{{ $t('offer.noOffersAvailable') }}</h3>
        <p class="empty-subtitle">{{ $t('offer.checkBackSoon') }}</p>
      </div>

      <!-- Offers Grid -->
      <div v-else class="offers-grid">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="offer-card"
          :class="{ 'expired': isOfferExpired(offer) }"
        >
          <!-- Offer Header -->
          <div class="offer-header">
            <div class="offer-badge" :class="getOfferBadgeClass(offer)">
              <q-icon :name="getOfferIcon(offer)" />
              <span>{{ getOfferStatus(offer) }}</span>
            </div>
            <div class="offer-actions" v-if="canManageOffers">
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                color="grey-6"
                @click.stop
              >
                <MenuDropdown
                  :menu-items="getMenuItems(offer)"
                  @item-click="(data) => handleOfferAction(data, offer)"
                />
              </q-btn>
            </div>
          </div>

          <!-- Offer Content -->
          <div class="offer-content">
            <!-- Title and Description -->
            <div class="offer-main">
              <h3 class="offer-title">{{ offer.title }}</h3>
              <p class="offer-note" v-if="offer.note">{{ offer.note }}</p>
            </div>

            <!-- Customer Info -->
            <div class="customer-info">
              <q-avatar size="32px" color="primary" text-color="white">
                {{ getCustomerName(offer)?.charAt(0)?.toUpperCase() || 'C' }}
              </q-avatar>
              <div class="customer-details">
                <div class="customer-name">{{ getCustomerName(offer) || $t('offer.unknownCustomer') }}</div>
                <div class="customer-id">{{ $t('offer.customerNumber') }}{{ getCustomerId(offer) || $t('offer.notAvailable') }}</div>
              </div>
            </div>

            <!-- Pricing Section -->
            <div class="pricing-section">
              <div class="discount-rate" v-if="offer.discounted_rate && offer.discounted_rate > 0">
                <q-icon name="percent" />
                <span class="discount-text">{{ offer.discounted_rate }}{{ $t('offer.discountText') }}</span>
              </div>
              <div class="total-price">
                <span class="price-label">{{ $t('offer.totalPrice') }}</span>
                <span class="price-amount">${{ formatPrice(offer.total_price || 0) }}</span>
              </div>
            </div>

            <!-- Valid Until -->
            <div class="validity-section">
              <q-icon
                :name="isOfferExpired(offer) ? 'schedule' : 'event_available'"
                :color="isOfferExpired(offer) ? 'negative' : 'positive'"
              />
              <span
                class="validity-text"
                :class="{ 'expired': isOfferExpired(offer) }"
              >
                {{ $t('offer.validUntil') }} {{ formatDate(offer.valid_until) }}
              </span>
            </div>

            <!-- Items Preview -->
            <div class="items-preview" v-if="offer.items && offer.items.length > 0">
              <div class="items-header">
                <q-icon name="inventory_2" />
                <span>{{ offer.items.length }} {{ offer.items.length > 1 ? $t('offer.itemsCountPlural') : $t('offer.itemsCount') }}</span>
              </div>
              <div class="items-list">
                <div
                  v-for="(item, index) in offer.items.slice(0, 3)"
                  :key="item.item_id || item.id || index"
                  class="item-chip"
                >
                  <q-chip
                    dense
                    color="grey-2"
                    text-color="grey-8"
                    :label="`${item.item_name || $t('offer.unknownItem')} (${item.quantity || 0}x)`"
                  />
                </div>
                <q-chip
                  v-if="offer.items.length > 3"
                  dense
                  color="primary"
                  text-color="white"
                  :label="`+${offer.items.length - 3} ${$t('offer.moreItems')}`"
                />
              </div>
            </div>

            <!-- Created By Info -->
            <div class="created-info">
              <div class="created-text">
                {{ $t('offer.createdBy') }} {{ offer.created_by?.name || $t('offer.unknownCreator') }} {{ $t('offer.on') }} {{ formatDate(offer.created_at) }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="offer-footer" v-if="!isOfferExpired(offer)">
            <q-btn
              unelevated
              color="primary"
              :label="$t('offer.viewDetails')"
              class="full-width"
              @click="viewOfferDetails(offer)"
            />
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="pagination-container">
        <div class="pagination-wrapper">
          <!-- Show pagination controls only when we actually have multiple pages -->
          <q-pagination
            v-if="pagination && pagination.last_page > 1"
            v-model="currentPage"
            :max="pagination.last_page"
            :input="true"
            direction-links
            boundary-links
            input-class="text-center pagination-input"
            color="primary"
            active-color="primary"
            :ripple="true"
            :max-pages="6"
            :boundary-numbers="true"
            padding="sm"
            @update:model-value="handlePageChange"
            :disable="loading"
            :icon-first="isRTL ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'"
            :icon-last="isRTL ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'"
            :icon-prev="isRTL ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
            :icon-next="isRTL ? 'keyboard_arrow_left' : 'keyboard_arrow_right'"
            class="beautiful-pagination"
          />
          <!-- Always show pagination info when pagination data exists -->
          <div class="pagination-info-container">
            <span v-if="pagination && pagination.last_page > 1" class="pagination-info">
              {{ $t('offer.pagination.page') }} {{ pagination.current_page }} {{ $t('offer.pagination.of') }} {{ pagination.last_page }}
            </span>
            <span v-if="pagination" class="pagination-total">
              {{ $t('offer.pagination.total') }}: {{ pagination.total }} {{ $t('offer.pagination.offers') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modals -->
    <NewCreateOfferModal
      v-model="showCreateModal"
      @created="handleOfferCreated"
    />

    <EditOfferModal
      v-model="showEditModal"
      :offer="selectedOffer"
      @updated="handleOfferUpdated"
    />

    <PrintableOfferInvoice
      v-model="showDetailsModal"
      :offer="selectedOffer"
      @offer-updated="handleOfferUpdated"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOfferStore } from 'src/stores/offerStore'
import type { OfferResponse } from 'src/types/offer'
import type { MenuItem } from 'src/types'
import EnhancedLoading from 'src/components/common/EnhancedLoading.vue'
import MenuDropdown from 'src/components/common/Qmenu.vue'
import NewCreateOfferModal from 'src/components/offer/NewCreateOfferModal.vue'
import EditOfferModal from 'src/components/offer/EditOfferModal.vue'
import PrintableOfferInvoice from 'src/components/invoice/PrintableOfferInvoice.vue'
import { date } from 'quasar'

const { t, locale } = useI18n()
const offerStore = useOfferStore()

// Reactive data
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedOffer = ref<OfferResponse | null>(null)
const currentPage = ref(1)

// Computed properties
const offers = computed(() => offerStore.offers || [])
const loading = computed(() => offerStore.loading)
const pagination = computed(() => offerStore.pagination)
// Use i18n locale to determine RTL direction - more reliable than $q.lang.rtl
const isRTL = computed(() => {
  return ['ar', 'ckb'].includes(locale.value)
})

// Always allow managing offers - no auth restrictions
const canManageOffers = computed(() => true)

// Get valid (non-expired) offers
const validOffers = computed(() => {
  return offers.value?.filter(offer => offer && !isOfferExpired(offer)) || []
})

// Get active offers (non-rejected and non-expired)
const activeOffers = computed(() => {
  return offers.value?.filter(offer =>
    offer &&
    offer.status !== 'rejected' &&
    !isOfferExpired(offer)
  ) || []
})

// Methods
function isOfferExpired(offer: OfferResponse): boolean {
  if (!offer?.valid_until) return false
  const validUntil = new Date(offer.valid_until)
  const now = new Date()
  return validUntil < now
}

function getOfferStatus(offer: OfferResponse): string {
  if (isOfferExpired(offer)) return t('offer.status.expired')

  switch (offer.status) {
    case 'draft':
      return t('offer.status.draft')
    case 'accepted':
      return t('offer.status.accepted')
    case 'rejected':
      return t('offer.status.rejected')
    default:
      return t('offer.status.active')
  }
}

function getOfferIcon(offer: OfferResponse): string {
  if (isOfferExpired(offer)) return 'schedule'

  switch (offer.status) {
    case 'draft':
      return 'edit'
    case 'accepted':
      return 'check_circle'
    case 'rejected':
      return 'cancel'
    default:
      return 'local_offer'
  }
}

function getOfferBadgeClass(offer: OfferResponse): string {
  if (isOfferExpired(offer)) return 'badge-expired'

  switch (offer.status) {
    case 'draft':
      return 'badge-draft'
    case 'accepted':
      return 'badge-accepted'
    case 'rejected':
      return 'badge-rejected'
    default:
      return 'badge-active'
  }
}

function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '0.00'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  try {
    return date.formatDate(dateString, 'MMM DD, YYYY')
  } catch {
    return 'Invalid Date'
  }
}

// Helper functions to handle different customer data structures
function getCustomerName(offer: OfferResponse): string {
  if (typeof offer.customer_id === 'object' && offer.customer_id?.name) {
    return offer.customer_id.name;
  }

  return offer.customer?.name || offer.customer?.full_name || '';
}

function getCustomerId(offer: OfferResponse): number | string {
  if (typeof offer.customer_id === 'object' && offer.customer_id?.id) {
    return offer.customer_id.id;
  }

  return typeof offer.customer_id === 'number' ? offer.customer_id : offer.customer?.id || 'N/A';
}

function getMenuItems(offer: OfferResponse): MenuItem[] {
  const items: MenuItem[] = [
    { label: t('offer.viewDetails'), icon: 'visibility', value: 'view' },
    { label: t('offer.editOffer'), icon: 'edit', value: 'edit' }
  ]

  if (offer && !isOfferExpired(offer)) {
    // Add status change options based on current status
    switch (offer.status) {
      case 'draft':
        items.push(
          { label: t('offer.markAsAccepted'), icon: 'check_circle', value: 'accept' },
          { label: t('offer.markAsRejected'), icon: 'cancel', value: 'reject' }
        )
        break
      case 'accepted':
        items.push(
          { label: t('offer.markAsDraft'), icon: 'edit', value: 'draft' },
          { label: t('offer.markAsRejected'), icon: 'cancel', value: 'reject' }
        )
        break
      case 'rejected':
        items.push(
          { label: t('offer.markAsDraft'), icon: 'edit', value: 'draft' },
          { label: t('offer.markAsAccepted'), icon: 'check_circle', value: 'accept' }
        )
        break
    }
  }

  return items
}

function handleOfferAction(data: { item: MenuItem }, offer: OfferResponse) {
  const { item } = data
  selectedOffer.value = offer

  switch (item.value) {
    case 'view':
      viewOfferDetails(offer)
      break
    case 'edit':
      showEditModal.value = true
      break
    case 'draft':
      void offerStore.changeOfferStatus(offer.id, 'draft')
      break
    case 'accept':
      void offerStore.changeOfferStatus(offer.id, 'accepted')
      break
    case 'reject':
      void offerStore.changeOfferStatus(offer.id, 'rejected')
      break
    case 'expire':
      void offerStore.changeOfferStatus(offer.id, 'expired')
      break
  }
}

function viewOfferDetails(offer: OfferResponse) {
  selectedOffer.value = offer
  showDetailsModal.value = true
}

function handleOfferCreated() {
  showCreateModal.value = false
  void offerStore.fetchOffers(1, 25) // Use default 25 items per page
}

function handleOfferUpdated() {
  showEditModal.value = false
  selectedOffer.value = null
  void offerStore.fetchOffers(currentPage.value, 25) // Use default 25 items per page and maintain current page
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  currentPage.value = page;
  await offerStore.fetchOffers(page, 25); // Use default 25 items per page

  // Scroll to top when changing pages for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Lifecycle
onMounted(async () => {
  await offerStore.fetchOffers(1, 25) // Use default 25 items per page

  // Set current page from pagination if available
  if (offerStore.pagination) {
    currentPage.value = offerStore.pagination.current_page || 1;
  }
})
</script>

<style lang="scss" scoped>
.offer-page {
  min-height: 100vh;
  position: relative;
}

.hero-section {
  background: var(--q-primary);
  color: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 0 0 24px 24px;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero-icon {
  font-size: 3rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.create-offer-btn {
  margin-left: 1rem;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  color: white;
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.loading-container {
  padding: 4rem 2rem;
}

.offers-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--q-dark);
}

.empty-title {
  color: var(--q-dark);
  font-size: 1.8rem;
  margin: 1rem 0 0.5rem;
}

.empty-subtitle {
  color: var(--q-dark-page);
  font-size: 1.1rem;
  margin: 0;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.offer-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &.expired {
    opacity: 0.7;
    background: #f5f5f5;
  }
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0;
}

.offer-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;

  &.badge-active {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  &.badge-draft {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }

  &.badge-accepted {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  &.badge-rejected {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }

  &.badge-expired {
    background: rgba(158, 158, 158, 0.1);
    color: #9e9e9e;
  }
}

.offer-content {
  padding: 1rem 1.5rem;
}

.offer-main {
  margin-bottom: 1.5rem;
}

.offer-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.offer-note {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
}

.customer-details {
  flex: 1;
}

.customer-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.customer-id {
  font-size: 0.85rem;
  color: #64748b;
}

.pricing-section {
  margin-bottom: 1.5rem;
}

.discount-rate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12px;
}

.price-label {
  font-size: 0.9rem;
  color: #64748b;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.validity-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.validity-text {
  &.expired {
    color: #f44336;
  }
}

.items-preview {
  margin-bottom: 1rem;
}

.items-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.created-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.created-text {
  font-size: 0.85rem;
  color: #64748b;
}

.offer-footer {
  padding: 0 1.5rem 1.5rem;
}

.fixed-bottom-right {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  margin-top: 2rem;
}

.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pagination-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.beautiful-pagination {
  .q-btn {
    border-radius: 8px;
    margin: 0 2px;
    min-width: 40px;
    height: 40px;

    &.q-btn--active {
      background: var(--q-primary);
      color: white;
      font-weight: 600;
    }

    &:not(.q-btn--active) {
      background: white;
      color: var(--q-primary);
      border: 1px solid rgba(var(--q-primary-rgb), 0.3);

      &:hover {
        background: rgba(var(--q-primary-rgb), 0.1);
      }
    }
  }

  // RTL support - ensure proper flow direction
  :deep(.q-pagination__content) {
    flex-direction: row;
  }

  // For RTL languages, reverse the button order visually
  body.q-rtl & {
    :deep(.q-pagination__content) {
      flex-direction: row-reverse;
    }

    .q-btn {
      margin: 0 2px;
    }
  }
}

.pagination-input {
  border-radius: 6px;
  background: white;
  border: 1px solid rgba(var(--q-primary-rgb), 0.3);
  padding: 4px 8px;
  text-align: center;
  min-width: 60px;
}

.pagination-info {
  font-size: 0.9rem;
  color: var(--q-dark);
  font-weight: 500;
}

.pagination-total {
  font-size: 0.85rem;
  color: #64748b;
}

// Mobile responsive
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .stat-card {
    min-width: auto;
    padding: 1rem;
  }

  .create-offer-btn {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
    max-width: 200px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .offers-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .offers-container {
    padding: 0 1rem 2rem;
  }

  .hero-section {
    padding: 1.5rem 1rem;
  }

  .offer-card {
    margin-bottom: 1rem;
  }

  .offer-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .pagination-container {
    padding: 1.5rem 0;
  }

  .pagination-wrapper {
    gap: 0.75rem;
  }

  .pagination-info,
  .pagination-total {
    font-size: 0.8rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .offer-card {
    border-radius: 12px;
  }

  .offers-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .pagination-container {
    padding: 1rem 0;
  }

  .beautiful-pagination .q-btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .pagination-input {
    min-width: 50px;
    font-size: 0.8rem;
  }

  .pagination-info,
  .pagination-total {
    font-size: 0.75rem;
  }
}
</style>
