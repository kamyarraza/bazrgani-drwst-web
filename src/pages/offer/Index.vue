<template>
  <q-page class="offer-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <q-icon name="local_offer" class="title-icon" />
            {{ $t('offer.title') }}
          </h1>
          <p class="page-subtitle">{{ $t('offer.subtitle') }}</p>
        </div>
        <div class="header-right">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-number">{{ activeOffers.length }}</span>
              <span class="stat-label">{{ $t('offer.activeOffers') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ validOffers.length }}</span>
              <span class="stat-label">{{ $t('offer.availableNow') }}</span>
            </div>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            :label="$t('offer.createNewOffer')"
            size="md"
            class="create-btn"
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
        spinner-size="2rem"
      />
    </div>

    <!-- Offers Content -->
    <div v-else class="offers-content">
      <!-- Empty State -->
      <div v-if="offers.length === 0" class="empty-state">
        <q-icon name="redeem" size="4rem" color="grey-4" />
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
          <!-- Card Header -->
          <div class="card-header">
            <div class="status-badge" :class="getOfferBadgeClass(offer)">
              <q-icon :name="getOfferIcon(offer)" size="sm" />
              <span>{{ getOfferStatus(offer) }}</span>
            </div>
            <div class="card-actions" v-if="canManageOffers">
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                color="grey-6"
                size="sm"
                @click.stop
              >
                <MenuDropdown
                  :menu-items="getMenuItems(offer)"
                  @item-click="(data) => handleOfferAction(data, offer)"
                />
              </q-btn>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h3 class="offer-title">{{ offer.title }}</h3>
            <p v-if="offer.note" class="offer-note">{{ offer.note }}</p>
            
            <div class="offer-details">
              <div class="detail-row">
                <q-icon name="person" size="sm" color="grey-6" />
                <span class="detail-text">{{ getCustomerName(offer) || $t('offer.unknownCustomer') }}</span>
                <span class="customer-id">#{{ getCustomerId(offer) || $t('offer.notAvailable') }}</span>
              </div>
              
              <div class="detail-row">
                <q-icon name="attach_money" size="sm" color="grey-6" />
                <span class="detail-text">{{ $t('offer.totalPrice') }}</span>
                <span class="price-value">${{ formatPrice(offer.total_price || 0) }}</span>
              </div>
              
              <div v-if="offer.discounted_rate && offer.discounted_rate > 0" class="detail-row">
                <q-icon name="percent" size="sm" color="orange-6" />
                <span class="detail-text">{{ $t('offer.discountText') }}</span>
                <span class="discount-value">{{ offer.discounted_rate }}%</span>
              </div>
              
              <div class="detail-row">
                <q-icon
                  :name="isOfferExpired(offer) ? 'schedule' : 'event_available'"
                  :color="isOfferExpired(offer) ? 'negative' : 'positive'"
                  size="sm"
                />
                <span class="detail-text">{{ $t('offer.validUntil') }}</span>
                <span class="date-value" :class="{ 'expired': isOfferExpired(offer) }">
                  {{ formatDate(offer.valid_until) }}
                </span>
              </div>
              
              <div v-if="offer.items && offer.items.length > 0" class="detail-row">
                <q-icon name="inventory_2" size="sm" color="grey-6" />
                <span class="detail-text">{{ offer.items.length }} {{ offer.items.length > 1 ? $t('offer.itemsCountPlural') : $t('offer.itemsCount') }}</span>
              </div>
            </div>
            
            <div class="created-info">
              <small class="created-text">
                {{ $t('offer.createdBy') }} {{ offer.created_by?.name || $t('offer.unknownCreator') }} {{ $t('offer.on') }} {{ formatDate(offer.created_at) }}
              </small>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer" v-if="!isOfferExpired(offer)">
            <q-btn
              unelevated
              color="primary"
              :label="$t('offer.viewDetails')"
              class="full-width"
              size="sm"
              @click="viewOfferDetails(offer)"
            />
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="pagination-container">
        <div class="pagination-wrapper">
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
            class="pagination"
          />
          <div class="pagination-info">
            <span v-if="pagination && pagination.last_page > 1">
              {{ $t('offer.pagination.page') }} {{ pagination.current_page }} {{ $t('offer.pagination.of') }} {{ pagination.last_page }}
            </span>
            <span v-if="pagination">
              {{ $t('offer.pagination.total') }}: {{ pagination.total }} {{ $t('offer.pagination.offers') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
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
  background: #f8fafc;
}

.page-header {
  background: var(--q-primary);
  color: white;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  border-radius: 0 0 16px 16px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2.25rem;
}

.page-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.header-right {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.stats-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  min-width: 80px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

.create-btn {
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

.loading-container {
  padding: 3rem 2rem;
}

.offers-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--q-dark);
}

.empty-title {
  color: var(--q-dark);
  font-size: 1.5rem;
  margin: 1rem 0 0.5rem;
}

.empty-subtitle {
  color: var(--q-dark-page);
  font-size: 1rem;
  margin: 0;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.offer-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &.expired {
    opacity: 0.6;
    background: #f8f9fa;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
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

.card-body {
  padding: 1rem;
}

.offer-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.offer-note {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 1rem;
}

.offer-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.25rem 0;
}

.detail-text {
  font-weight: 500;
  color: #475569;
  flex: 1;
}

.customer-id {
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.8rem;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3b82f6;
}

.discount-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ff9800;
}

.date-value {
  font-weight: 500;
  color: #475569;
  
  &.expired {
    color: #f44336;
  }
}

.created-info {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.created-text {
  font-size: 0.75rem;
  color: #94a3b8;
}

.card-footer {
  padding: 0 1rem 1rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  margin-top: 1.5rem;
}

.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #64748b;
}

.pagination {
  .q-btn {
    border-radius: 6px;
    margin: 0 1px;
    min-width: 36px;
    height: 36px;
    font-size: 0.85rem;

    &.q-btn--active {
      background: var(--q-primary);
      color: white;
      font-weight: 600;
    }

    &:not(.q-btn--active) {
      background: white;
      color: var(--q-primary);
      border: 1px solid rgba(var(--q-primary-rgb), 0.2);

      &:hover {
        background: rgba(var(--q-primary-rgb), 0.05);
      }
    }
  }
}

.pagination-input {
  border-radius: 6px;
  background: white;
  border: 1px solid rgba(var(--q-primary-rgb), 0.2);
  padding: 4px 8px;
  text-align: center;
  min-width: 50px;
  font-size: 0.85rem;
}

// Mobile responsive
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .header-right {
    flex-direction: column;
    width: 100%;
  }

  .stats-row {
    flex-direction: row;
    gap: 2rem;
    width: 100%;
    justify-content: center;
  }

  .stat-item {
    min-width: auto;
  }

  .create-btn {
    margin-left: 0;
    margin-top: 0.5rem;
    width: 100%;
    max-width: 200px;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .offers-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .offers-content {
    padding: 0 1rem 2rem;
  }

  .page-header {
    padding: 1.25rem 1rem;
  }

  .pagination-container {
    padding: 1.5rem 0;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .offers-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .pagination .q-btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .pagination-input {
    min-width: 45px;
    font-size: 0.8rem;
  }
}
</style>

