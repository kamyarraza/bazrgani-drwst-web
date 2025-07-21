<template>
  <q-dialog v-model="internalModel" @hide="closeModal" maximized>
    <q-card class="invoice-card" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Loading overlay -->
      <q-inner-loading :showing="isLoadingTransaction || blumTransactionStore.loading">
        <q-spinner-gears size="50px" color="primary" />
        <div class="q-mt-md text-subtitle2">{{ t('invoice.actions.loading') }}</div>
      </q-inner-loading>

      <!-- Transaction not found or error state -->
      <div v-if="!transaction && !blumTransactionStore.loading" class="error-state text-center q-pa-xl">
        <q-icon name="error" size="4rem" color="grey-5" />
        <div class="text-h6 q-mt-md">{{ t('blumTransaction.transactionNotFound') }}</div>
        <q-btn
          @click="closeModal"
          :label="t('common.close')"
          color="primary"
          class="q-mt-md"
          unelevated
        />
      </div>

      <!-- Invoice content (only show if transaction exists) -->
      <div v-else-if="transaction">
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
                <h2 class="invoice-title">{{ transaction?.type === 'purchase' ? t('blumTransaction.purchaseInvoice') : t('blumTransaction.sellInvoice') }} (EUR)</h2>
                <div class="invoice-number">{{ t('invoice.header.invoiceNumber') }} #BT-{{ transaction?.id }}</div>
              </div>
              <div class="invoice-date">{{ formatDate(transaction?.created_at || new Date()) }}</div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="transaction-details">
            <div class="detail-row">
              <span class="detail-label">{{ t('invoice.details.transactionType') }}:</span>
              <span class="detail-value">{{ transaction.type === 'purchase' ? t('blumTransaction.purchase') : t('blumTransaction.sell') }}</span>
            </div>
            <div class="detail-row" v-if="transaction.customer">
              <span class="detail-label">{{ transaction.type === 'purchase' ? t('invoice.details.supplier') : t('invoice.details.customer') }}:</span>
              <span class="detail-value">{{ transaction.customer.name }} ({{ transaction.customer.phone }})</span>
            </div>
            <div class="detail-row" v-if="warehouseName">
              <span class="detail-label">{{ t('invoice.details.warehouse') }}:</span>
              <span class="detail-value">{{ warehouseName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('invoice.details.paymentMethod') }}:</span>
              <span class="detail-value">{{ formatPaymentType(transaction.payment_type) }}</span>
            </div>
          </div>

          <!-- Items Table -->
          <div class="items-section" v-if="transactionDetails?.length">
            <h3 class="section-title">{{ t('blumTransaction.items') }}</h3>
            <table class="items-table">
              <thead>
              <tr>
                <th>{{ t('invoice.items.description') }}</th>
                <th class="text-center">{{ t('invoice.items.quantity') }}</th>
                <th class="text-right">{{ t('invoice.items.unitPrice') }} (EUR)</th>
                <th class="text-right">{{ t('invoice.items.total') }} (EUR)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in transactionDetails" :key="detail.id">
                <td class="item-name">
                  <div v-if="detail.item_id">{{ getItemName(detail.item_id) }}</div>
                  <div v-else-if="detail.set_id">{{ getSetName(detail.set_id) }} ({{ t('blumTransaction.set') }})</div>
                  <div v-else>{{ detail.description || 'Unknown Item' }}</div>
                  <div v-if="transaction.type === 'purchase' && detail.solo_unit_price" class="text-caption text-grey-6">
                    {{ t('blumTransaction.soloUnitPrice') }}: €{{ formatCurrency(detail.solo_unit_price || 0) }}
                  </div>
                </td>
                <td class="text-center">{{ detail.quantity }}</td>
                <td class="text-right">€{{ formatCurrency(detail.unit_price) }}</td>
                <td class="text-right item-total">€{{ formatCurrency(detail.quantity * detail.unit_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Currency Information -->
        <div class="currency-section" v-if="transaction">
          <h3 class="section-title">{{ t('blumTransaction.currencyConversion') }}</h3>
          <div class="currency-details">
            <div class="detail-row">
              <span class="detail-label">{{ t('blumTransaction.usdEquivalent') }} (USD):</span>
              <span class="detail-value">${{ formatCurrency((transaction?.total_price || 0) * (transaction?.eur_usd_rate || 1.1)) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('blumTransaction.iqdEquivalent') }} (IQD):</span>
              <span class="detail-value">{{ formatCurrency((transaction?.total_price || 0) * (transaction?.eur_usd_rate || 1.1) * (transaction?.usd_iqd_rate || 1500)) }} IQD</span>
            </div>
          </div>
        </div>

        <!-- Totals Section -->
        <div class="totals-section" v-if="transaction">
          <div class="totals-container">
            <div class="total-row subtotal-row">
              <span class="total-label">{{ t('invoice.totals.subtotal') }} (EUR):</span>
              <span class="total-value">€{{ formatCurrency(transaction.total_price || 0) }}</span>
            </div>
            <div class="total-row" v-if="transaction.type === 'sell' && transaction.discounted_rate > 0">
              <span class="total-label">{{ t('blumTransaction.discount') }} ({{ transaction.discounted_rate }}%):</span>
              <span class="total-value discount-amount">-€{{ formatCurrency((transaction.total_price || 0) * (transaction.discounted_rate / 100)) }}</span>
            </div>
            <div class="total-row final-total-row">
              <span class="total-label">{{ t('invoice.totals.totalAmount') }} (EUR):</span>
              <span class="total-value">€{{ formatCurrency(getFinalTotal()) }}</span>
            </div>
            <div class="total-row paid-row" v-if="transaction?.paid_price && transaction.paid_price > 0">
              <span class="total-label">{{ t('invoice.totals.amountPaid') }} (EUR):</span>
              <span class="total-value paid-amount">€{{ formatCurrency(transaction.paid_price) }}</span>
            </div>
            <div class="total-row balance-row" v-if="getBalanceAmount() > 0">
              <span class="total-label">{{ t('invoice.totals.balanceDue') }} (EUR):</span>
              <span class="total-value balance-due">€{{ formatCurrency(getBalanceAmount()) }}</span>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="notes-section" v-if="transaction?.note">
          <h3 class="section-title">{{ t('invoice.notes.title') }}</h3>
          <p class="note-content">{{ transaction.note }}</p>
        </div>
      </q-card-section>

      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="modal-actions no-print" align="right">
        <q-btn
          @click="printInvoice"
          :label="t('invoice.actions.printInvoice')"
          icon="print"
          color="primary"
          unelevated
          no-caps
          :disable="isLoadingTransaction"
        />
        <q-btn
          @click="closeModal"
          :label="t('invoice.actions.close')"
          color="grey-6"
          flat
          no-caps
        />
      </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumTransactionStore } from 'src/stores/blumTransactionStore';

// Initialize i18n
const { t, locale } = useI18n();

// RTL detection
const isRTL = computed(() => locale.value === 'ar' || locale.value === 'ckb');

// Props
interface Props {
  modelValue: boolean;
  transaction?: any;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  transaction: null
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

// Store
const blumTransactionStore = useBlumTransactionStore();

// Internal model
const internalModel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
});

// Loading state
const isLoadingTransaction = ref(false);

// Load data on mount
onMounted(async () => {
  if (blumTransactionStore.blumItems.length === 0) {
    await blumTransactionStore.fetchBlumItems();
  }
  if (blumTransactionStore.blumSets.length === 0) {
    await blumTransactionStore.fetchBlumSets();
  }
});

// Computed properties
const warehouseName = computed(() => {
  if (!props.transaction) return null;

  // Handle both cases: when warehouse is an object or just an ID
  if (props.transaction.warehouse && typeof props.transaction.warehouse === 'object') {
    const name = props.transaction.warehouse.name || 'Unknown';
    const code = props.transaction.warehouse.code || '';
    return code ? `${name} (${code})` : name;
  } else if (props.transaction.warehouse_id) {
    // Since warehouse store was removed, just show the ID
    return `Warehouse #${props.transaction.warehouse_id}`;
  }
  return null;
});

const transactionDetails = computed(() => {
  if (!props.transaction) return [];

  // The transaction might have details in different formats depending on the API response
  if (props.transaction.details && Array.isArray(props.transaction.details)) {
    return props.transaction.details;
  }
  if (props.transaction.items && Array.isArray(props.transaction.items)) {
    return props.transaction.items;
  }
  return [];
});

// Format functions
const formatCurrency = (amount: number) => {
  // Handle null, undefined or NaN values
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '0.00';
  }
};

const formatPaymentType = (paymentType: string) => {
  return t(`blumTransaction.paymentTypes.${paymentType}`);
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);

  // Use locale-specific date formatting
  if (locale.value === 'ar') {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (locale.value === 'ckb') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Methods
const closeModal = () => {
  emit('close');
  emit('update:modelValue', false);
};

const printInvoice = () => {
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
  const transactionType = props.transaction?.type === 'purchase' ? t('blumTransaction.purchase') : t('blumTransaction.sell');
  document.title = `${transactionType} Invoice #BT-${props.transaction?.id} - Bazrgani Drwst`;

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
};

function getItemName(itemId: number): string {
  if (!itemId) return 'Unknown Item';

  try {
    const item = blumTransactionStore.blumItems.find(i => i.id === itemId);
    if (!item) return `Item #${itemId}`;

    const name = item.name || 'Unnamed Item';
    const code = item.code || '';
    return code ? `${name} (${code})` : name;
  } catch (error) {
    console.error('Error getting item name:', error);
    return `Item #${itemId}`;
  }
}

function getSetName(setId: number): string {
  if (!setId) return 'Unknown Set';

  try {
    const set = blumTransactionStore.blumSets.find(s => s.id === setId);
    return set && set.name ? set.name : `Set #${setId}`;
  } catch (error) {
    console.error('Error getting set name:', error);
    return `Set #${setId}`;
  }
}

function getFinalTotal(): number {
  if (!props.transaction) return 0;

  let total = props.transaction.total_price || 0;

  // Apply discount for sell transactions
  if (props.transaction.type === 'sell' && props.transaction.discounted_rate > 0) {
    total = total - (total * (props.transaction.discounted_rate / 100));
  }

  return total;
}

function getBalanceAmount(): number {
  if (!props.transaction) return 0;

  const total = getFinalTotal();
  const paid = props.transaction.paid_price || 0;
  return Math.max(0, total - paid);
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
    text-align: center;
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

.items-section, .currency-section {
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
  }
}

.currency-section {
  .currency-details {
    padding: 1.5rem;
    background: #e3f2fd;
    border-radius: 8px;

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

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

    &.paid-row {
      .paid-amount {
        color: #4caf50;
        font-weight: 600;
      }
    }

    &.balance-row {
      .balance-due {
        color: #f44336;
        font-weight: 700;
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
    }
  }

  .transaction-details {
    page-break-inside: avoid;
    page-break-after: auto;
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
  }

  .items-section, .currency-section {
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

// RTL Support
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

  .transaction-details {
    .detail-row {
      direction: rtl;
    }
  }

  .items-table {
    th, td {
      text-align: right;
    }

    .text-center {
      text-align: center !important;
    }

    .text-right {
      text-align: left !important;
    }

    .text-left {
      text-align: right !important;
    }
  }

  .totals-section {
    .total-row {
      direction: rtl;
    }
  }
}
</style>
