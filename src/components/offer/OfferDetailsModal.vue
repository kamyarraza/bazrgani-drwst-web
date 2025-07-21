<template>
  <q-dialog v-model="internalModel" @hide="closeModal" maximized>
    <q-card class="invoice-card" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Loading overlay -->
      <q-inner-loading :showing="offerStore.loading">
        <q-spinner-gears size="50px" color="primary" />
        <div class="q-mt-md text-subtitle2">{{ $t('offer.loadingOfferDetails') }}</div>
      </q-inner-loading>

      <q-card-section class="invoice-header">
        <div class="header-content">
          <!-- Multi-language Company Header -->
          <div class="company-header">
            <!-- Left side - English -->
            <div class="company-info english">
              <h2 class="company-name">Bazrgani Drwst Company</h2>
              <p class="company-subtitle">For General Trading Ltd</p>
            </div>

            <!-- Center - Arabic -->
            <div class="company-info arabic">
              <h2 class="company-name">شركة بازركاني درست</h2>
              <p class="company-subtitle">للتجارة العامة المحدودة</p>
            </div>

            <!-- Right side - Kurdish -->
            <div class="company-info kurdish">
              <h2 class="company-name">کۆمپانیای بازرکانی دروست</h2>
              <p class="company-subtitle">بۆ بازرکانی گشتی سنور دار</p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="contact-info">
            <div class="contact-item">
              <q-icon name="email" size="xs" class="q-mr-xs" />
              <span>true.trading23@gmail.com</span>
            </div>
            <div class="contact-item">
              <q-icon name="location_on" size="xs" class="q-mr-xs" />
              <span>سلێمانی مجید بەگ بەرامبەر خوێندنگای هەوری</span>
            </div>
            <div class="contact-item">
              <q-icon name="phone" size="xs" class="q-mr-xs" />
              <span>0770 153 2089 | 0770 152 60 16</span>
            </div>
          </div>

          <!-- Invoice Meta Information -->
          <div class="invoice-meta">
            <div class="invoice-title-row">
              <h2 class="invoice-title">{{ $t('offer.businessOffer') }} (USD)</h2>
              <div class="invoice-number">{{ $t('offer.offerNumber') }} #{{ offer?.id }}</div>
            </div>
            <div class="invoice-date">{{ formatDate(offer?.created_at || new Date().toISOString()) }}</div>
            <div class="status-container">
              <span class="status-badge" :class="`status-${offer?.status?.toLowerCase()}`">
                <q-icon :name="getStatusIcon(offer?.status || 'pending')" size="sm" class="q-mr-xs" />
                {{ offer?.status?.toUpperCase() || 'PENDING' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Offer Details -->
        <div class="transaction-details" v-if="offer">
          <div class="detail-row">
            <span class="detail-label">{{ $t('offer.title') }}:</span>
            <span class="detail-value">{{ offer.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('offer.customer') }}:</span>
            <span class="detail-value">{{ getCustomerName(offer) }} ({{ getCustomerPhone(offer) }})</span>
          </div>
          <div class="detail-row" v-if="getCustomerEmail(offer)">
            <span class="detail-label">{{ $t('offer.email') }}:</span>
            <span class="detail-value">{{ getCustomerEmail(offer) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('offer.validUntil') }}:</span>
            <span class="detail-value">{{ formatDate(offer.valid_until) }}</span>
          </div>
        </div>

        <!-- Items Table -->
        <div class="items-section" v-if="offer?.items?.length">
          <h3 class="section-title">{{ $t('offer.items') }}</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th class="text-left">#</th>
                <th class="text-left">{{ $t('offer.itemDescription') }}</th>
                <th class="text-center">{{ $t('offer.quantity') }}</th>
                <th class="text-right">{{ $t('offer.unitPrice') }} (USD)</th>
                <th class="text-center" v-if="hasDiscounts">{{ $t('offer.discount') }}</th>
                <th class="text-right">{{ $t('offer.total') }} (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in offer.items" :key="index" class="item-row">
                <td class="item-number">{{ index + 1 }}</td>
                <td class="item-name">
                  <div>{{ item.item?.name || `Item #${item.item_id}` }}</div>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">${{ formatPrice(item.unit_price || 0) }}</td>
                <td class="text-center" v-if="hasDiscounts">
                  {{ item.discount_percentage ? `${item.discount_percentage}%` : '-' }}
                </td>
                <td class="text-right item-total">${{ formatPrice(getItemTotal(item)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals Section -->
        <div class="totals-section" v-if="offer">
          <div class="totals-container">
            <div class="total-row subtotal-row">
              <span class="total-label">{{ $t('offer.subtotal') }} (USD):</span>
              <span class="total-value">${{ formatPrice(subtotal) }}</span>
            </div>

            <div class="total-row" v-if="totalDiscount > 0">
              <span class="total-label">{{ $t('offer.totalDiscount') }}:</span>
              <span class="total-value discount-amount">-${{ formatPrice(totalDiscount) }}</span>
            </div>

            <div class="total-row">
              <span class="total-label">{{ $t('offer.tax') }} ({{ taxRate }}%):</span>
              <span class="total-value">${{ formatPrice(tax) }}</span>
            </div>

            <div class="total-row final-total-row">
              <span class="total-label">{{ $t('offer.totalAmount') }} (USD):</span>
              <span class="total-value">${{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="notes-section" v-if="offer?.note">
          <h3 class="section-title">{{ $t('offer.notes') }}</h3>
          <p class="note-content">{{ offer.note }}</p>
        </div>
      </q-card-section>

      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="modal-actions no-print" align="right">
        <q-btn
          @click="printOffer"
          :label="$t('offer.printOffer')"
          icon="print"
          color="primary"
          unelevated
          no-caps
          :disable="offerStore.loading"
        />
        <q-btn
          v-if="canEdit"
          @click="$emit('edit')"
          :label="$t('offer.editOffer')"
          icon="edit"
          color="secondary"
          unelevated
          no-caps
        />
        <q-btn
          @click="closeModal"
          :label="$t('offer.close')"
          color="grey-6"
          flat
          no-caps
        />

        <!-- Status Change Select -->
        <div v-if="canChangeStatus" class="status-change-container">
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            label="Change Status"
            dense
            outlined
            emit-value
            map-options
            style="min-width: 150px"
            class="status-select"
            @update:model-value="handleStatusChange"
          >
            <template v-slot:prepend>
              <q-icon :name="getStatusIcon(selectedStatus)" />
            </template>
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section avatar>
                  <q-icon :name="getStatusIcon(opt.value)" :color="getStatusColor(opt.value)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOfferStore } from 'src/stores/offerStore'
import { useAuthStore } from 'src/stores/authStore'
import { useI18n } from 'vue-i18n'
import { Notify } from 'quasar'
import type { OfferResponse, OfferItem } from 'src/types/offer'

interface Props {
  show: boolean
  offer: OfferResponse | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  edit: []
  statusChanged: []
}>()

const offerStore = useOfferStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const taxRate = 10 // 10% tax rate

// Determine text direction based on locale
const isRTL = computed(() => {
  return locale.value === 'ar' || locale.value === 'ckb'
})

// Internal model
const internalModel = computed({
  get: () => props.show,
  set: (val: boolean) => {
    if (!val) {
      emit('close');
    }
  }
});

// Status management
const selectedStatus = ref(props.offer?.status || 'pending')

// Status options
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' }
]

// Permissions
const canEdit = computed(() => {
  return authStore.user?.type !== 'customer'
})

const canChangeStatus = computed(() => {
  return authStore.user?.type !== 'customer'
})

const hasDiscounts = computed(() => {
  return props.offer?.items?.some(item => item.discount_percentage && item.discount_percentage > 0) || false
})

const subtotal = computed(() => {
  if (!props.offer?.items) return 0
  return props.offer.items.reduce((sum, item) => {
    return sum + (item.subtotal || (item.quantity * item.unit_price))
  }, 0)
})

const totalDiscount = computed(() => {
  if (!props.offer?.items) return 0
  return props.offer.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price
    const discount = itemTotal * (item.discount_percentage || 0) / 100
    return sum + discount
  }, 0)
})

const tax = computed(() => {
  const taxableAmount = subtotal.value - totalDiscount.value
  return taxableAmount * taxRate / 100
})

const total = computed(() => {
  return subtotal.value - totalDiscount.value + tax.value
})

// Methods
const closeModal = () => {
  emit('close');
};

const printOffer = () => {
  // Temporarily hide all non-essential elements
  const elementsToHide = document.querySelectorAll('.no-print, .modal-actions');
  const originalDisplays: (string | null)[] = [];

  elementsToHide.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    originalDisplays[index] = htmlEl.style.display || null;
    htmlEl.style.display = 'none';
  });

  // Store original title and set print title
  const originalTitle = document.title;
  document.title = `${t('offer.businessOffer')} #${props.offer?.id} - Bazrgani Drwst`;

  // Trigger print
  window.print();

  // Restore elements and title after print
  setTimeout(() => {
    elementsToHide.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = originalDisplays[index] || '';
    });
    document.title = originalTitle;
  }, 100);

  // Show notification
  Notify.create({
    message: t('offer.printNotification', 'Offer has been sent to printer'),
    type: 'positive',
    position: 'top',
    timeout: 2000
  });
};

function getItemTotal(item: OfferItem): number {
  if (item.subtotal) {
    return item.subtotal;
  }
  const itemTotal = item.quantity * item.unit_price
  const discount = itemTotal * (item.discount_percentage || 0) / 100
  return itemTotal - discount
}

// Helper functions to handle different data structures
function getCustomerName(offer: OfferResponse): string {
  if (typeof offer.customer_id === 'object' && offer.customer_id?.name) {
    return offer.customer_id.name;
  }

  return offer.customer?.name || offer.customer?.full_name || '';
}

function getCustomerPhone(offer: OfferResponse): string {
  if (typeof offer.customer_id === 'object' && offer.customer_id?.phone) {
    return offer.customer_id.phone;
  }

  return offer.customer?.phone || '';
}

function getCustomerEmail(offer: OfferResponse): string {
  if (typeof offer.customer_id === 'object' && offer.customer_id?.email) {
    return offer.customer_id.email;
  }

  return offer.customer?.email || '';
}

function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'check_circle'
    case 'rejected':
      return 'cancel'
    case 'pending':
      return 'schedule'
    case 'expired':
      return 'access_time_filled'
    default:
      return 'help'
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'positive'
    case 'rejected':
      return 'negative'
    case 'expired':
      return 'warning'
    default:
      return 'grey'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

function handleStatusChange(newStatus: string) {
  if (!props.offer || newStatus === props.offer.status) return

  try {
    // TODO: Implement updateOfferStatus method in offerStore
    // await offerStore.updateOfferStatus(props.offer.id, newStatus)
    console.log('Status change requested:', newStatus);
    emit('statusChanged')
  } catch (error) {
    console.error('Failed to update offer status:', error)
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.invoice-card {
  font-family: 'Inter', sans-serif;
  background: white;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.invoice-header {
  padding: 2rem;
}

.header-content {
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 2rem;
}

// Multi-language Company Header
.company-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  text-align: center;

  .company-info {
    flex: 1;
    padding: 0 1rem;

    &.english {
      text-align: left;
    }

    &.arabic {
      text-align: center;
    }

    &.kurdish {
      text-align: right;
    }

    .company-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 0.25rem 0;
      line-height: 1.2;
    }

    .company-subtitle {
      font-size: 0.95rem;
      color: #666;
      margin: 0;
      font-weight: 500;
    }
  }
}

// Contact Information
.contact-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  .contact-item {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.9rem;

    .q-icon {
      color: #1976d2;
    }
  }
}

// Invoice Meta Information
.invoice-meta {
  .invoice-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;

    .invoice-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    .invoice-number {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }
  }

  .invoice-date {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.75rem;
    text-align: center;
  }

  .status-container {
    text-align: center;

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.status-approved {
        background: #10b981;
        color: white;
      }

      &.status-rejected {
        background: #ef4444;
        color: white;
      }

      &.status-expired {
        background: #f59e0b;
        color: white;
      }

      &.status-pending {
        background: #6b7280;
        color: white;
      }
    }
  }
}

.transaction-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;

  .detail-row {
    display: flex;
    justify-content: space-between;

    .detail-label {
      font-weight: 600;
      color: #333;
    }

    .detail-value {
      color: #666;
      text-align: right;
    }
  }
}

.items-section {
  margin: 2rem 0;

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ddd;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .item-name {
      font-weight: 500;
    }

    .item-total {
      font-weight: 600;
    }

    .item-number {
      font-weight: 600;
      color: #666;
      text-align: center;
      width: 60px;
    }
  }
}

.totals-section {
  margin-top: 2rem;

  .totals-container {
    width: 100%;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: 2px solid #333;
      margin-top: 8px;
      padding-top: 20px;
    }

    .total-label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .total-value {
      font-size: 14px;
      color: #333;
      font-weight: 600;
      text-align: right;
      min-width: 120px;
    }

    &.subtotal-row {
      .total-label,
      .total-value {
        font-weight: 400;
        color: #666;
      }
    }

    &.final-total-row {
      .total-label,
      .total-value {
        font-size: 18px;
        font-weight: 700;
        color: #333;
      }
    }

    .discount-amount {
      color: #f44336;
      font-weight: 600;
    }
  }
}

.notes-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
  }

  .note-content {
    color: #666;
    line-height: 1.5;
    margin: 0;
  }
}

// Action buttons (shown only on screen)
.modal-actions {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.status-change-container {
  margin-left: 1rem;
}

// Print styles
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }

  html, body {
    height: auto !important;
    overflow: visible !important;
    margin: 0;
    padding: 0;
    font-size: 12px;
    line-height: 1.4;
  }

  .invoice-card {
    box-shadow: none;
    max-width: none;
    margin: 0;
    height: auto;
    max-height: none;
    overflow: visible;
    page-break-inside: auto;
  }

  .modal-actions {
    display: none !important;
  }

  .no-print {
    display: none !important;
  }

  .invoice-header {
    padding: 15mm;
    margin-bottom: 5mm;
  }

  .header-content {
    page-break-inside: avoid;
    page-break-after: auto;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }

  .company-header {
    margin-bottom: 1rem;

    .company-info .company-name {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }

    .company-info .company-subtitle {
      font-size: 0.85rem;
    }
  }

  .contact-info {
    margin-bottom: 1rem;
    gap: 1rem;

    .contact-item {
      font-size: 0.8rem;
    }
  }

  .invoice-meta {
    margin-bottom: 1rem;

    .invoice-title-row {
      margin-bottom: 0.5rem;

      .invoice-title {
        font-size: 1.1rem;
      }

      .invoice-number {
        font-size: 1rem;
      }
    }

    .invoice-date {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .status-container .status-badge {
      font-size: 0.65rem;
      padding: 0.3rem 0.6rem;
    }
  }

  .transaction-details {
    page-break-inside: avoid;
    page-break-after: auto;
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
  }

  .items-section {
    page-break-inside: auto;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    page-break-after: avoid;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    page-break-inside: auto;

    th, td {
      padding: 8px 6px;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
      page-break-after: avoid;
    }

    tr {
      page-break-inside: avoid;
    }

    thead {
      display: table-header-group;
    }

    tbody {
      display: table-row-group;
    }
  }

  .totals-section {
    page-break-inside: avoid;
    page-break-before: auto;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
  }

  .totals-container {
    page-break-inside: avoid;
  }

  .total-row {
    padding: 8px 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: 2px solid #333;
      font-weight: bold;
    }
  }

  .notes-section {
    page-break-inside: auto;
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
  }

  .text-right {
    text-align: right !important;
  }

  .text-center {
    text-align: center !important;
  }

  .text-left {
    text-align: left !important;
  }
}

// Responsive design
@media (max-width: 768px) {
  .company-header {
    flex-direction: column;
    gap: 1rem;

    .company-info {
      text-align: center !important;
      padding: 0;

      &.english,
      &.arabic,
      &.kurdish {
        text-align: center !important;
      }
    }
  }

  .contact-info {
    flex-direction: column;
    gap: 0.5rem;

    .contact-item {
      justify-content: center;
    }
  }

  .invoice-meta .invoice-title-row {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;

    .invoice-title {
      font-size: 1.1rem;
    }

    .invoice-number {
      font-size: 1rem;
    }
  }

  .transaction-details {
    grid-template-columns: 1fr;
  }

  .items-table {
    font-size: 0.875rem;

    th, td {
      padding: 8px;
    }
  }
}

// RTL support
[dir="rtl"] {
  .company-header {
    .company-info {
      &.english {
        text-align: right;
      }

      &.kurdish {
        text-align: left;
      }
    }
  }

  .invoice-meta .invoice-title-row {
    direction: rtl;
  }

  .contact-info {
    direction: rtl;
  }
}
</style>
