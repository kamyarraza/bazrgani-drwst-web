<template>
  <q-dialog v-model="internalModel" @hide="closeModal" maximized>
    <q-card class="invoice-dialog-card">
      <!-- Print Header (hidden on screen) -->
      <!-- Removed the Invoice header -->

      <!-- Invoice Container -->
      <div class="invoice-container" ref="invoiceRef">
        <!-- Watermark -->
        <div class="watermark">
          <img :src="brandLogo" alt="Brand Watermark" />
        </div>

        <!-- Static Header -->
        <div class="static-header">
          <!-- Enhanced Professional Header -->
          <div class="header">
            <div class="brand-section">
              <img :src="brandLogo" alt="Brand Logo" class="brand-logo" />
              <div class="company-info">
                <div class="company-name">{{ t('invoice.header.companyName') }}</div>
                <div class="company-tagline">{{ t('invoice.header.companyTagline') }}</div>
                <div class="company-contact" dir="ltr">
                  <span class="contact-item" style="white-space: nowrap;">
                    📞
                    <template v-if="profileStore.userProfile && profileStore.userProfile.phone">
                      {{ profileStore.userProfile.phone }}
                    </template>
                    <template v-else>
                      {{ t('invoice.header.companyPhone') }}
                    </template>
                  </span>
                  <span class="contact-item" style="white-space: nowrap;">✉ true.trading23@gmail.com</span>
                </div>
              </div>
            </div>
            <div class="invoice-section">
              <div class="invoice-title">{{ t('invoice.types.invoice') }}</div>
              <div class="invoice-meta">
                <div class="invoice-number">{{ invoiceNumber }}</div>
                <div class="invoice-date" dir="ltr">📅 {{ formatDate(transaction?.created_at) }}</div>
                <!-- <div class="currency-badge" :class="(transaction as any)?.currency?.toLowerCase() || 'usd'">
                  {{ (transaction as any)?.currency || 'USD' }}
                </div> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Content Area -->
        <div class="dynamic-content">
          <!-- Enhanced Client and Invoice Details -->
          <div class="details-section">
            <div class="invoice-details-card">
              <div class="card-header">
                <q-icon name="receipt_long" size="18px" color="primary" />
                <span class="card-title">{{ t('invoice.details.title') }}</span>
              </div>
              <div class="details-container">
                <div class="detail-row">
                  <span class="label">{{ t('invoice.header.invoiceNumber') }}</span>
                  <span class="value highlight">{{ invoiceNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ t('invoice.details.transactionType') }}:</span>
                  <span class="value">
                    {{ transaction?.type === 'purchase' ? t('invoice.types.purchase') : t('invoice.types.sale') }}
                  </span>
                </div>
                <div class="detail-row" v-if="transaction?.warehouse?.name">
                  <span class="label">{{ t('invoice.details.warehouse', "warehouse") }}</span>
                  <span class="contact-info">{{ transaction?.warehouse?.name
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ t('invoice.details.date') }}:</span>
                  <span class="value">{{ formatDate(transaction?.created_at) }}</span>
                </div>

                <!-- @Deprecated -->
                <!-- <div class="detail-row">
                  <span class="label">{{ t('invoice.details.status') }}:</span>
                  <span class="value" :class="getStatusClass()">{{ formatStatus(transaction?.status) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">{{ t('invoice.currency.title') }}:</span>
                  <span class="value currency-display">{{ (transaction as any)?.currency || 'USD' }}</span>
                </div> -->

                <!-- <div class="detail-row" v-if="(transaction as any)?.usd_iqd_rate">
                  <span class="label">{{ t('invoice.details.exchangeRate') }}: &nbsp;</span>
                  <span class="value exchange-rate" dir="ltr">1 USD = {{ Number((transaction as
                    any).usd_iqd_rate).toLocaleString('en-IQ')
                  }} IQD</span>
                </div> -->
              </div>
            </div>

            <div class="client-info-card">
              <div class="card-header">
                <q-icon name="person" size="18px" color="primary" />
                <span class="card-title">{{ t('invoice.details.billingTo') }}</span>
              </div>
              <div class="details-container">
                <div class="detail-row" v-if="(transaction?.customer as any)?.name">
                  <q-icon name="person" size="14px" />
                  <span class="contact-info">{{ (transaction?.customer as any)?.name }}</span>
                </div>
                <div class="detail-row" v-if="(transaction?.customer as any)?.fphone">
                  <q-icon name="phone_android" size="14px" />
                  <span class="contact-info">{{ (transaction?.customer as any)?.fphone }}</span>
                </div>
                <div class="detail-row" v-if="(transaction?.customer as any)?.place">
                  <q-icon name="place" size="14px" />
                  <span class="contact-info">{{ (transaction?.customer as any)?.place }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Items Table -->
          <div class="items-section">
            <div class="section-header">
              <q-icon name="inventory_2" size="20px" />
              <span>{{ t('invoice.items.title') }}</span>
            </div>
            <table class="items-table">
              <thead class="table-header">
                <tr>
                  <th class="serial-col">{{ t('invoice.items.serialNumber') }}</th>
                  <th class="description-col">{{ t('invoice.items.description') }}</th>
                  <th class="quantity-col">{{ t('invoice.items.quantity') }}</th>
                  <th class="price-col">{{ t('invoice.items.unitPrice') }}</th>
                  <th class="total-col">{{ t('invoice.items.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in transactionItems" :key="item.id" class="item-row">
                  <td class="serial-cell">{{ index + 1 }}</td>
                  <td class="description-cell">
                    <div class="item-name">{{ item.name }}</div>
                    <div v-if="(item as any).sku" class="item-sku">SKU: {{ (item as any).sku }}</div>
                  </td>
                  <td class="quantity-cell">{{ item.quantity }}</td>
                  <td class="price-cell">{{ formatCurrencyDisplay(item.unit_price) }}</td>
                  <td class="total-cell">{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Spacer to push totals section down -->
          <div class="content-spacer"></div>

          <!-- Enhanced Payment and Totals Section -->
          <div class="bottom-section">
            <div class="left-section">
              <div class="totals-card">
                <div class="card-header">
                  <q-icon name="calculate" size="18px" color="primary" />
                  <span class="card-title">{{ t('invoice.totals.title') }}</span>
                </div>
                <div class="totals-content">
                  <div v-if="(transaction as any)?.old_borrowed_price !== undefined" class="total-line">
                    <span class="total-label">{{ t('invoice.oldBorrowedPrice') }}</span>
                    <span class="total-amount">{{ formatCurrencyDisplay((transaction as any).old_borrowed_price)
                    }}</span>
                  </div>
                  <div v-if="(transaction as any)?.new_borrowed_price !== undefined" class="total-line">
                    <span class="total-label">{{ t('invoice.newBorrowedPrice') }}</span>
                    <span class="total-amount">{{ formatCurrencyDisplay((transaction as any).new_borrowed_price)
                    }}</span>
                  </div>
                  <div class="total-line subtotal-line">
                    <span class="total-label">{{ t('invoice.subtotal') }}</span>
                    <span class="total-amount" :class="{ 'with-discount': discountedRate > 0 }">{{
                      formatCurrencyDisplay(subtotal) }}</span>
                  </div>
                  <div v-if="discountedRate > 0" class="total-line discount-line">
                    <span class="total-label">{{ t('invoice.discount') }} ({{ discountedRate }}%)</span>
                    <span class="total-amount discount">-{{ formatCurrencyDisplay(discountAmount) }}</span>
                  </div>
                  <div class="total-line grand-total-line">
                    <span class="total-label">{{ t('invoice.totalMoney') }}</span>
                    <span class="total-amount grand-total">{{ formatCurrencyDisplay(finalTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="right-section">
              <div class="payment-card">
                <div class="card-header">
                  <q-icon name="payment" size="18px" color="primary" />
                  <span class="card-title">{{ t('invoice.payment.title') }}</span>
                </div>
                <div class="payment-content">
                  <!-- Basic Payment Information -->
                  <div class="payment-group">
                    <div class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="credit_card" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('invoice.payment.method') }}</span>
                      <span class="payment-value method">{{ formatPaymentType(transaction?.payment_type) }}</span>
                    </div>
                    <div class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="warehouse" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('invoice.details.warehouse') }}</span>
                      <span class="payment-value">{{ transaction?.warehouse?.name || 'N/A' }}</span>
                    </div>
                  </div>

                  <!-- Payment Status Information -->
                  <div class="payment-group">
                    <div class="group-title">{{ t('invoice.payment.status') }}</div>
                    <div class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="payments" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('invoice.paidAmount') }}</span>
                      <span class="payment-value paid">{{ formatCurrencyDisplay(transaction?.paid_price || 0) }}</span>
                    </div>
                    <div class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="pending" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('invoice.unpaidAmount') }}</span>
                      <span class="payment-value unpaid">{{ formatCurrencyDisplay(transaction?.unpaid_price || 0)
                        }}</span>
                    </div>
                  </div>

                  <!-- Payment Amounts (if available) -->
                  <div v-if="(transaction as any)?.iqd_price || (transaction as any)?.usd_price" class="payment-group">
                    <div class="group-title">{{ t('invoice.payment.amounts') }}</div>
                    <div v-if="(transaction as any)?.iqd_price" class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="currency_exchange" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('transactionAlpha.iqdPrice') }}</span>
                      <span class="payment-value amount">{{ formatCurrencyDisplay((transaction as any).iqd_price)
                        }}</span>
                    </div>
                    <div v-if="(transaction as any)?.usd_price" class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="attach_money" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('transactionAlpha.usdPrice') }}</span>
                      <span class="payment-value amount">{{ formatCurrencyDisplay((transaction as any).usd_price)
                        }}</span>
                    </div>
                  </div>

                  <!-- Return Amounts (if available) -->
                  <div v-if="(transaction as any)?.iqd_return_amount || (transaction as any)?.usd_return_amount"
                    class="payment-group">
                    <div class="group-title">{{ t('invoice.payment.returns') }}</div>
                    <div v-if="(transaction as any)?.iqd_return_amount" class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="keyboard_return" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('transactionAlpha.iqdReturnAmount') }}</span>
                      <span class="payment-value return">{{ formatCurrencyDisplay((transaction as
                        any).iqd_return_amount) }}</span>
                    </div>
                    <div v-if="(transaction as any)?.usd_return_amount" class="payment-row">
                      <div class="payment-icon">
                        <q-icon name="keyboard_return" size="16px" />
                      </div>
                      <span class="payment-label">{{ t('transactionAlpha.usdReturnAmount') }}</span>
                      <span class="payment-value return">{{ formatCurrencyDisplay((transaction as
                        any).usd_return_amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Note Section (hidden in print) -->
          <div class="note-section no-print" v-if="(transaction as any)?.note">
            <div class="note-title">{{ t('invoice.notes.title') }}:</div>
            <div class="note-content">{{ (transaction as any).note }}</div>
          </div>
        </div>

        <!-- Static Footer -->
        <div class="static-footer">
          <!-- Signature Section - moved above footer -->
          <div class="signature-section-bottom">
            <div class="thank-you">{{ t('invoice.footer.thankYou') }}</div>
            <div class="signature-area">
              <div class="signature-line">{{ t('invoice.footer.signature') }}</div>
              <div class="account-manager">{{ t('invoice.footer.accountManager') }}</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-main">
              <div class="footer-left">
                <div class="footer-item">
                  <span class="footer-icon">🌐</span>
                  <span>www.bazrganidrwst.com</span>
                </div>
                <div class="footer-item">
                  <span class="footer-icon">📍</span>
                  <span>{{ t('invoice.header.companyAddress') }}</span>
                </div>
              </div>

              <div class="footer-center">
                <div class="footer-brand-name">{{ t('invoice.header.companyName') }}</div>
                <div class="footer-tagline">{{ t('invoice.header.companyTagline') }}</div>
              </div>

              <div class="footer-right">
                <div class="footer-item" dir="ltr">
                  <span class="footer-icon">☎</span>
                  <template v-if="profileStore.userProfile && profileStore.userProfile.phone">
                    <span>{{ profileStore.userProfile.phone }}</span>
                  </template>
                  <template v-else>
                    <span>{{ t('invoice.header.companyPhone') }}</span>
                  </template>
                </div>
                <div class="footer-item">
                  <span class="footer-icon">✉</span>
                  <span>true.trading23@gmail.com</span>
                </div>
              </div>
            </div>

            <div class="footer-bottom">
              {{ t('invoice.footer.copyright') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="modal-actions no-print" align="right">
        <q-btn-dropdown color="secondary" icon="currency_exchange" :label="t('invoice.actions.switchCurrency')" no-caps
          unelevated :loading="fetchingCurrency" :disable="fetchingCurrency">
          <q-list>
            <q-item clickable v-close-popup @click="fetchInvoiceByCurrency('USD')">
              <q-item-section avatar>
                <q-icon name="attach_money" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('invoice.currency.usd') }}</q-item-label>
                <q-item-label caption>{{ t('invoice.actions.convertTo', { currency: 'USD' }) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="fetchInvoiceByCurrency('IQD')">
              <q-item-section avatar>
                <q-icon name="currency_exchange" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('invoice.currency.iqd') }}</q-item-label>
                <q-item-label caption>{{ t('invoice.actions.convertTo', { currency: 'IQD' }) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn @click="printInvoice" :label="t('invoice.actions.printInvoice')" icon="print" color="primary" unelevated
          no-caps />
        <q-btn @click="closeModal" :label="t('invoice.actions.close')" color="grey-6" flat no-caps />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import type { List } from 'src/types/item_transaction';
import { useProfileStore } from 'src/stores/profileStore';

const brandLogo = '/brand.jpg';

// Composables
const { t } = useI18n();

// Props
interface Props {
  modelValue: boolean;
  transaction: List | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'transaction-updated': [transaction: List];
}>();

// Internal model
const internalModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

// Invoice reference for printing
const invoiceRef = ref<HTMLElement>();

// Loading state for currency fetch
const fetchingCurrency = ref(false);

// Profile store
const profileStore = useProfileStore();

// Computed properties
const transactionItems = computed(() => props.transaction?.items || []);

const invoiceNumber = computed(() => {
  if (!props.transaction) return 'N/A';
  return `INV-${props.transaction.id.toString().padStart(6, '0')}`;
});

const subtotal = computed(() => {
  return transactionItems.value.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
});

const discountedRate = computed(() => {
  return (props.transaction as any)?.discounted_rate || 0;
});

const discountAmount = computed(() => {
  return (subtotal.value * discountedRate.value) / 100;
});

const finalTotal = computed(() => {
  return (props.transaction as any)?.discounted_price || props.transaction?.total_price || (subtotal.value - discountAmount.value);
});



// Methods
const formatDate = (dateString?: string, addDays = 0) => {
  if (!dateString) return new Date().toISOString().slice(0, 10);
  const date = new Date(dateString);
  if (addDays > 0) {
    date.setDate(date.getDate() + addDays);
  }
  // Format as YYYY-mm-dd
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPaymentType = (paymentType?: string) => {
  if (!paymentType) return 'N/A';
  return paymentType.charAt(0).toUpperCase() + paymentType.slice(1);
};

const fetchInvoiceByCurrency = async (currency: 'USD' | 'IQD') => {
  if (!props.transaction?.id) {
    Notify.create({
      type: 'negative',
      message: 'No transaction ID available',
      position: 'top'
    });
    return;
  }

  fetchingCurrency.value = true;

  try {
    const response = await api.get(`/transactions/${props.transaction.id}?relations=customer,warehouse,items&currency=${currency}`);

    if (response.data && response.data.data) {
      console.log(response.data.data);

      // Emit the updated transaction data to the parent component
      emit('transaction-updated', response.data.data);

      Notify.create({
        type: 'positive',
        message: `Invoice updated to ${currency} currency`,
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error fetching invoice by currency:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch invoice data',
      position: 'top'
    });
  } finally {
    fetchingCurrency.value = false;
  }
};

const printInvoice = () => {
  window.print();
};

const closeModal = () => {
  internalModel.value = false;
};

// Format currency display based on transaction currency
const formatCurrencyDisplay = (amount: any) => {
  // Ensure amount is a valid number
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return '0.00';
  }

  const currency = (props.transaction as any)?.currency || 'USD';

  if (currency === 'IQD') {
    return `${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} IQD`;
  } else {
    return `$${numericAmount.toFixed(2)}`;
  }
};
</script>

<style lang="scss" scoped>
// Print-only styles
@media print {

  /* Define printer-safe margins - accounting for physical printer margins */
  /* Increased margins to ensure compatibility with most printers */
  @page {
    size: A4;
    margin: 0.85in 0.6in !important;
    /* Top/bottom: 0.85in, Left/right: 0.6in (more conservative) */
  }

  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .invoice-dialog-card {
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .invoice-container {
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: white !important;
    max-width: none !important;
    min-height: 100vh !important;
    font-size: 12px !important;
    /* Slightly smaller for better fit */
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    width: 100% !important;
    position: relative !important;
  }

  /* Static Header Positioning - adjusted for increased printer margins */
  .static-header {
    position: fixed !important;
    top: 0.35in !important;
    /* Account for increased printer top margin */
    left: 0.35in !important;
    /* Account for increased printer left margin */
    right: 0.35in !important;
    /* Account for increased printer right margin */
    z-index: 1000 !important;
    background: white !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding: 0 !important;
  }

  /* Static Footer Positioning - adjusted for increased printer margins */
  .static-footer {
    position: fixed !important;
    bottom: 0.35in !important;
    /* Account for increased printer bottom margin */
    left: 0.35in !important;
    /* Account for increased printer left margin */
    right: 0.35in !important;
    /* Account for increased printer right margin */
    z-index: 1000 !important;
    background: white !important;
    border-top: 1px solid #e0e0e0 !important;
    padding: 0 !important;
  }

  /* Dynamic Content with adjusted margins for increased printer-safe area */
  .dynamic-content {
    margin-top: 2.25in !important;
    /* Increased space for header within printer margins */
    margin-bottom: 1.75in !important;
    /* Increased space for footer within printer margins */
    padding: 0.3in !important;
    /* Internal padding within printer-safe area */
    flex: 1 !important;
  }

  /* Hide all scrollbars completely in print */
  * {
    overflow: visible !important;
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }

  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  /* Page break controls for multi-page content */
  .items-table {
    page-break-inside: auto !important;
  }

  .items-table tr {
    page-break-inside: avoid !important;
  }

  .details-section,
  .bottom-section {
    page-break-inside: avoid !important;
  }

  /* Ensure content flows properly across pages */
  .dynamic-content>* {
    page-break-inside: avoid !important;
  }

  .items-table tbody tr {
    page-break-inside: avoid !important;
  }

  /* Optimize print layout */
  .header {
    margin: 0 !important;
    padding: 15px !important;
  }

  .footer {
    margin: 0 !important;
    padding: 15px !important;
  }

  .signature-section-bottom {
    padding: 15px !important;
  }
}

// Screen-only styles for new layout structure
@media screen {
  .print-only {
    display: none !important;
  }

  .static-header {
    position: relative;
    width: 100%;
    z-index: 2;
  }

  .dynamic-content {
    flex: 1;
    padding: 0 40px 40px 40px;
    position: relative;
    z-index: 1;
    overflow-y: auto;
  }

  .static-footer {
    position: relative;
    width: 100%;
    z-index: 2;
    margin-top: auto;
  }
}

// Base styles (both screen and print)
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.invoice-dialog-card {
  background-color: #f5f5f5;
  max-width: none;
  height: 100vh;
  overflow-y: auto;
  padding: 0;
  /* Remove any padding */
  margin: 0;
  /* Remove any margin */
}

.invoice-container {
  max-width: 800px;
  margin: 20px auto 0 auto;
  background-color: white;
  padding: 0;
  /* Remove all padding */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: Arial, sans-serif;
  min-height: calc(100vh - 40px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// Watermark
.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  /* Highest z-index to appear over everything */
  opacity: 0.08;
  /* Slightly increased opacity to show colors better */
  pointer-events: none;

  img {
    width: 350px;
    /* Slightly smaller for better proportions */
    height: 350px;
    object-fit: contain;
    /* Removed grayscale filter to show brand colors */
  }
}

// All content should be above watermark
.static-header,
.dynamic-content,
.static-footer {
  position: relative;
  z-index: 2;
}

.footer {
  position: relative;
  z-index: 2;
}

// Enhanced Professional Header Styles
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 35px;
  padding: 25px;
  background: linear-gradient(135deg, #2A7B9B 0%, #1e5f7a 100%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(42, 123, 155, 0.2);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.company-name {
  color: white;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.company-tagline {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-style: italic;
}

.company-contact {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.contact-item {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.invoice-section {
  flex: 1;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.invoice-title {
  color: white;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.invoice-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.invoice-number {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  backdrop-filter: blur(10px);
}

.invoice-date {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.currency-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;

  &.usd {
    background: #22c55e;
    color: white;
  }

  &.iqd {
    background: #f59e0b;
    color: white;
  }
}

.brand-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.details-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  gap: 40px;
}

.invoice-details,
.client-info {
  flex: 1;
  min-width: 0;
}

.section-header {
  font-size: 12px;
  font-weight: 700;
  color: #2A7B9B;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #2A7B9B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.details-container {
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
    padding: 5px 20px 0 20px;
    border-bottom: 1px solid #e9ecef;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .label {
      font-weight: 600;
      color: #495057;
      flex-shrink: 0;
      min-width: 120px;
    }

    .value {
      color: #2A7B9B;
      font-weight: 500;
      text-align: right;
      flex: 1;
    }
  }
}

.project-name {
  color: #2A7B9B;
  font-size: 14px;
  margin-bottom: 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
  border: 1px solid #ddd;
}

.table-header {
  background-color: #4a68a8;
  color: white;
}

.table-header th {
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  border: 1px solid #3a5698;
}

.table-header th:first-child {
  text-align: center;
  width: 60px;
}

.table-header th:nth-child(2) {
  text-align: center;
  width: auto;
}

.table-header th:nth-child(3) {
  text-align: center;
  width: 80px;
}

.table-header th:nth-child(4) {
  text-align: center;
  width: 100px;
}

.table-header th:nth-child(5) {
  text-align: center;
  width: 100px;
}

.items-table td {
  padding: 10px 8px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 14px;
  background-color: white;
}

.items-table td:nth-child(2) {
  text-align: center;
}

.empty-row td {
  height: 35px;
  border: 1px solid #ddd;
  background-color: white;
}

// Add spacer to push totals section down
.content-spacer {
  height: 80px; // Adjust this value to control spacing
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 40px;
}

.left-section {
  flex: 1;
}

.right-section {
  flex: 1;
}

.totals-section {
  text-align: left;
}

.total-line {
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-line .amount {
  font-weight: 600;
  color: #2A7B9B;
}

.total-bold {
  color: #2A7B9B;
  font-weight: bold;
  font-size: 16px;
  border-top: 1px solid #ddd;
  padding-top: 8px;
}

.total-bold .amount {
  font-size: 16px;
}

.balance-line {
  color: #2A7B9B;
  font-weight: bold;
  font-size: 16px;

  &.balance-due {
    color: #e53e3e;
  }

  .amount {
    color: inherit;
  }
}

.payment-section {
  margin-bottom: 20px;
}

.payment-title {
  color: #2A7B9B;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.payment-details {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

// Enhanced Payment and Totals Card Styles
.totals-card,
.payment-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #2A7B9B 0%, #1e5f7a 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.totals-content,
.payment-content {
  padding: 16px;
}

// Totals Section Styles
.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.total-label {
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.total-amount {
  font-weight: 600;
  color: #2A7B9B;
  font-size: 14px;

  &.grand-total {
    color: #2A7B9B;
    font-size: 16px;
    font-weight: 700;
  }

  &.balance {
    color: #2A7B9B;
    font-weight: 700;
  }
}

.subtotal-line {
  border-top: 1px solid #dee2e6;
  padding-top: 12px !important;
  margin-top: 8px;
}

.grand-total-line {
  background: rgba(42, 123, 155, 0.05);
  border: 1px solid rgba(42, 123, 155, 0.2);
  border-radius: 6px;
  padding: 12px !important;
  margin: 8px 0;
}

.balance-line {
  background: rgba(42, 123, 155, 0.05);
  border: 1px solid rgba(42, 123, 155, 0.2);
  border-radius: 6px;
  padding: 12px !important;

  &.balance-due {
    background: rgba(229, 62, 62, 0.05);
    border-color: rgba(229, 62, 62, 0.2);

    .total-amount {
      color: #e53e3e;
    }
  }
}

// Payment Section Styles
.payment-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #2A7B9B;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #2A7B9B;
}

.payment-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.payment-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(42, 123, 155, 0.1);
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;

  .q-icon {
    color: #2A7B9B;
  }
}

.payment-label {
  font-weight: 500;
  color: #495057;
  font-size: 14px;
  flex: 1;
  margin-right: 12px;
}

.payment-value {
  font-weight: 600;
  color: #2A7B9B;
  font-size: 14px;
  text-align: right;
  min-width: 80px;

  &.method {
    text-transform: capitalize;
  }

  &.paid {
    color: #28a745;
  }

  &.unpaid {
    color: #e53e3e;
  }

  &.amount {
    color: #2A7B9B;
    font-weight: 600;
  }

  &.return {
    color: #6f42c1;
  }
}

.note-section {
  margin: 20px 40px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.note-title {
  color: #2A7B9B;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.note-content {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.signature-section-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 30px 40px;
  position: relative;
  z-index: 2;
}

.thank-you {
  color: #666;
  font-size: 16px;
  font-weight: bold;
}

.signature-area {
  text-align: right;
}

.signature-line {
  color: #2A7B9B;
  font-style: italic;
  margin-bottom: 5px;
  font-size: 16px;
}

.account-manager {
  color: #2A7B9B;
  font-size: 14px;
}

.footer {
  margin: 0;
  /* Remove all margins to take full width */
  background-color: #2A7B9B;
  color: white;
  padding: 20px 40px;
  width: 100%;
  /* Ensure full width */
  position: relative;
  z-index: 2;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.footer-left,
.footer-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: white;
}

.footer-icon {
  color: white;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.footer-center {
  text-align: center;
}

.footer-brand-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 3px;
}

.footer-tagline {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.footer-right {
  text-align: right;
}

.footer-bottom {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.modal-actions {
  padding: 16px 24px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 0;
  /* Remove any margin */
}

// Discount styling
.discount-line {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  padding: 8px 12px !important;
  margin: 4px 0;

  .total-amount.discount {
    color: #ef4444;
    font-weight: 600;
  }
}

// Overline effect for discounted prices
.total-amount.with-discount {
  text-decoration: line-through;
  text-decoration-color: #ef4444;
  text-decoration-thickness: 2px;
  opacity: 0.7;
  position: relative;
}
</style>
