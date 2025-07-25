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

        <!-- Main Content -->
        <div class="invoice-content">
          <!-- Header -->
          <div class="header">
          <div class="brand-section">
            <img :src="brandLogo" alt="Brand Logo" class="brand-logo" />
            <div class="company-name">{{ t('invoice.header.companyName') }}</div>
          </div>
          <div class="invoice-section">
            <div class="invoice-title">{{ t('blumTransaction.invoice') }}</div>
          </div>
        </div>

        <!-- Client and Invoice Details -->
        <div class="details-section">
          <div class="invoice-details">
            <div class="section-header">{{ t('blumTransaction.invoiceDetails') }}</div>
            <div class="details-container">
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.invoiceNo') }}:</span>
                <span class="value">{{ invoiceNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.date') }}:</span>
                <span class="value">{{ formatDate(blumTransaction?.created_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.status') }}:</span>
                <span class="value">{{ formatStatus(getBlumTransactionStatus()) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.currency') }}:</span>
                <span class="value">{{ (blumTransaction as any)?.currency || 'USD' }}</span>
              </div>
              <div class="detail-row" v-if="(blumTransaction as any)?.usd_iqd_rate">
                <span class="label">{{ t('blumTransaction.usdIqdRate') }}:</span>
                <span class="value">{{ (blumTransaction as any)?.usd_iqd_rate }}</span>
              </div>
            </div>
          </div>
          <div class="client-info">
            <div class="section-header">{{ t('blumTransaction.billingTo') }}</div>
            <div class="details-container">
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.name') }}:</span>
                <span class="value">{{ blumTransaction?.customer?.name || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.phone') }}:</span>
                <span class="value">{{ (blumTransaction?.customer as any)?.fphone || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('blumTransaction.type') }}:</span>
                <span class="value">{{ t('blumTransaction.individual') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Project/Transaction Type -->
        <div class="project-name">
          <strong>{{ t('blumTransaction.transactionType') }}:</strong> {{ blumTransaction?.type === 'purchase' ? t('blumTransaction.purchaseBlumTransaction') : t('blumTransaction.salesBlumTransaction') }}
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead class="table-header">
            <tr>
              <th>{{ t('blumTransaction.sl') }}</th>
              <th>{{ t('blumTransaction.itemDescription') }}</th>
              <th>{{ t('blumTransaction.qty') }}</th>
              <th>{{ t('blumTransaction.price') }}</th>
              <th>{{ t('blumTransaction.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in blumTransactionItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.quantity || 0 }}</td>
              <td>${{ (item.unit_price || 0).toFixed(2) }}</td>
              <td>${{ ((item.quantity || 0) * (item.unit_price || 0)).toFixed(2) }}</td>
            </tr>
            <!-- Only show actual data rows, no empty filler rows -->
          </tbody>
        </table>

        <!-- Spacer to push totals section down -->
        <div class="content-spacer"></div>

        <!-- Payment and Totals Section - kept inside content for proper padding -->
        <div class="bottom-section">
          <div class="left-section">
            <div class="totals-section">
              <div class="total-line">{{ t('blumTransaction.subtotal') }}: <span class="amount">${{ (subtotal || 0).toFixed(2) }}</span></div>
              <div class="total-line" v-if="blumTransaction?.discounted_rate">
                {{ t('blumTransaction.discount') }}: <span class="amount">{{ blumTransaction?.discounted_rate }}%</span>
              </div>
              <div class="total-line total-bold">{{ t('blumTransaction.total') }}: <span class="amount">${{ (finalTotal || 0).toFixed(2) }}</span></div>
              <div class="total-line">{{ t('blumTransaction.paid') }}: <span class="amount">${{ (Number(blumTransaction?.paid_price) || 0).toFixed(2) }}</span></div>
              <div class="total-line balance-line" :class="{ 'balance-due': (balanceAmount || 0) > 0 }">
                {{ t('blumTransaction.balance') }}: <span class="amount">${{ (balanceAmount || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="right-section">
            <div class="payment-section">
              <div class="payment-title">{{ t('blumTransaction.paymentInformation') }}</div>
              <div class="payment-details">
                <div class="payment-row">
                  <span class="label">{{ t('blumTransaction.paymentType') }}:</span>
                  <span class="value">{{ formatPaymentType(blumTransaction?.payment_type) }}</span>
                </div>
                <div class="payment-row">
                  <span class="label">{{ t('blumTransaction.status') }}:</span>
                  <span class="value">{{ getPaymentStatus() }}</span>
                </div>
                <div class="payment-row">
                  <span class="label">{{ t('blumTransaction.warehouse') }}:</span>
                  <span class="value">{{ blumTransaction?.warehouse?.name || 'N/A' }}</span>
                </div>
                <div class="payment-row">
                  <span class="label">{{ t('blumTransaction.reference') }}:</span>
                  <span class="value">{{ blumTransaction?.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Note Section (hidden in print) -->
        <div class="note-section no-print" v-if="(blumTransaction as any)?.note">
          <div class="note-title">{{ t('blumTransaction.note') }}:</div>
          <div class="note-content">{{ (blumTransaction as any).note }}</div>
        </div>

        </div>

        <!-- Signature Section - moved above footer -->
        <div class="signature-section-bottom">
          <div class="thank-you">{{ t('blumTransaction.thankYou') }}</div>
          <div class="signature-area">
            <div class="signature-line">{{ t('blumTransaction.authorizedSignature') }}</div>
            <div class="account-manager">{{ t('blumTransaction.accountManager') }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-main">
            <div class="footer-left">
              <div class="footer-item">
                <span class="footer-icon">🌐</span>
                <span>{{ t('blumTransaction.website') }}</span>
              </div>
              <div class="footer-item">
                <span class="footer-icon">📍</span>
                <span>{{ t('blumTransaction.address') }}</span>
              </div>
            </div>

            <div class="footer-center">
              <div class="footer-brand-name">{{ t('invoice.header.companyName') }}</div>
              <div class="footer-tagline">{{ t('invoice.header.companyTagline') }}</div>
            </div>

            <div class="footer-right">
              <div class="footer-item">
                <span class="footer-icon">☎</span>
                <span>{{ t('invoice.header.companyPhone') }}</span>
              </div>
              <div class="footer-item">
                <span class="footer-icon">✉</span>
                <span>{{ t('invoice.header.companyEmail') }}</span>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            {{ t('invoice.footer.copyright') }}
          </div>
        </div>
      </div>

      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="modal-actions no-print" align="right">
        <q-btn-dropdown
          color="secondary"
          icon="currency_exchange"
          :label="t('blumTransaction.currency')"
          no-caps
          unelevated
          :loading="fetchingCurrency"
          :disable="fetchingCurrency"
        >
          <q-list>
            <q-item clickable v-close-popup @click="fetchBlumInvoiceByCurrency('USD')">
              <q-item-section avatar>
                <q-icon name="attach_money" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('blumTransaction.usdCurrency') }}</q-item-label>
                <q-item-label caption>{{ t('blumTransaction.convertToUsd') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="fetchBlumInvoiceByCurrency('IQD')">
              <q-item-section avatar>
                <q-icon name="currency_exchange" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('blumTransaction.iqdCurrency') }}</q-item-label>
                <q-item-label caption>{{ t('blumTransaction.convertToIqd') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          @click="printInvoice"
          :label="t('blumTransaction.printInvoice')"
          icon="print"
          color="primary"
          unelevated
          no-caps
        />
        <q-btn
          @click="closeModal"
          :label="t('blumTransaction.close')"
          color="grey-6"
          flat
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
const brandLogo = '/brand.jpg';
import type { ListTransactionType } from 'src/types/blumTypes';

// Composables
const { t } = useI18n();

// Props
interface Props {
  modelValue: boolean;
  blumTransaction: ListTransactionType | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'blum-transaction-updated': [blumTransaction: ListTransactionType];
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

// Computed properties
const blumTransactionItems = computed(() => props.blumTransaction?.items || []);

const invoiceNumber = computed(() => {
  if (!props.blumTransaction) return 'N/A';
  return `BLUM-${props.blumTransaction.id.toString().padStart(6, '0')}`;
});

const subtotal = computed(() => {
  return blumTransactionItems.value.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
});

const finalTotal = computed(() => {
  const total = props.blumTransaction?.total_price ?? subtotal.value;
  return typeof total === 'number' ? total : 0;
});

const balanceAmount = computed(() => {
  if (!props.blumTransaction) return 0;
  // Use unpaid_price if available, otherwise calculate from total - paid
  const unpaidPrice = props.blumTransaction.unpaid_price;
  if (unpaidPrice !== undefined && unpaidPrice !== null && typeof unpaidPrice === 'number') {
    return unpaidPrice;
  }
  const total = finalTotal.value;
  const paid = Number(props.blumTransaction.paid_price) || 0;
  return total - paid;
});

// Methods
const formatDate = (dateString?: string, addDays = 0) => {
  if (!dateString) return new Date().toLocaleDateString();
  const date = new Date(dateString);
  if (addDays > 0) {
    date.setDate(date.getDate() + addDays);
  }
  return date.toLocaleDateString();
};

const formatPaymentType = (paymentType?: string) => {
  if (!paymentType) return 'N/A';
  return paymentType.charAt(0).toUpperCase() + paymentType.slice(1);
};

const formatStatus = (status?: string) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getBlumTransactionStatus = () => {
  if (!props.blumTransaction) return 'Unknown';

  // Since ListTransactionType doesn't have status, we'll determine it from other fields
  const total = finalTotal.value;
  const paid = Number(props.blumTransaction.paid_price) || 0;

  if (props.blumTransaction.is_fully_paid) return 'Completed';
  if (paid >= total) return 'Paid';
  if (paid > 0) return 'Partially Paid';
  return 'Pending';
};

const getPaymentStatus = () => {
  if (!props.blumTransaction) return 'Unknown';

  const total = finalTotal.value;
  const paid = Number(props.blumTransaction.paid_price) || 0;

  if (paid >= total) return 'Fully Paid';
  if (paid > 0) return 'Partially Paid';
  return 'Unpaid';
};

const fetchBlumInvoiceByCurrency = async (currency: 'USD' | 'IQD') => {
  if (!props.blumTransaction?.id) {
    Notify.create({
      type: 'negative',
      message: 'No blum transaction ID available',
      position: 'top'
    });
    return;
  }

  fetchingCurrency.value = true;

  try {
    // Adjust the API endpoint based on your blum transaction API
    const response = await api.get(`/blum-transactions/${props.blumTransaction.id}?relations=customer,warehouse,items&currency=${currency}`);

    if (response.data && response.data.data) {
      // Emit the updated blum transaction data to the parent component
      emit('blum-transaction-updated', response.data.data);

      Notify.create({
        type: 'positive',
        message: `Blum invoice updated to ${currency} currency`,
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error fetching blum invoice by currency:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch blum invoice data',
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
</script>

<style lang="scss" scoped>
// Print-only styles
@media print {
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
  }

  .invoice-container {
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: white !important;
    max-width: none !important;
    min-height: 100vh !important;
    font-size: 13px !important;
    display: flex !important;
    flex-direction: column !important;
  }

  // Ensure proper page breaks
  .invoice-container {
    page-break-inside: avoid;
  }

  .items-table {
    page-break-inside: auto;
  }

  .items-table tr {
    page-break-inside: avoid;
  }
}

// Screen-only styles
@media screen {
  .print-only {
    display: none !important;
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
  padding: 0; /* Remove any padding */
  margin: 0; /* Remove any margin */
}

.invoice-container {
  max-width: 800px;
  margin: 20px auto 0 auto;
  background-color: white;
  padding: 0; /* Remove all padding */
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
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
  z-index: 999; /* Highest z-index to appear over everything */
  opacity: 0.08; /* Slightly increased opacity to show colors better */
  pointer-events: none;

  img {
    width: 350px; /* Slightly smaller for better proportions */
    height: 350px;
    object-fit: contain;
    /* Removed grayscale filter to show brand colors */
  }
}

// All content should be above watermark
.invoice-content {
  flex: 1;
  padding: 40px; /* Add padding back to content only */
}

.header,
.details-section,
.project-name,
.items-table,
.bottom-section {
  position: relative;
  z-index: 2;
}

.footer {
  position: relative;
  z-index: 2;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 10px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.company-name {
  color: #2A7B9B;
  font-size: 20px;
  font-weight: bold;
}

.invoice-section {
  flex: 1;
  text-align: right;
}

.invoice-title {
  color: #2A7B9B;
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 1px;
}

.brand-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2A7B9B;
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
    margin-bottom: 12px;
    padding: 8px 0;
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

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.payment-row .label {
  font-weight: 500;
  color: #333;
}

.payment-row .value {
  font-weight: 600;
  color: #2A7B9B;
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
  margin: 0; /* Remove all margins to take full width */
  background-color: #2A7B9B;
  color: white;
  padding: 20px 40px;
  width: 100%; /* Ensure full width */
  position: relative;
  z-index: 2;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.footer-left, .footer-right {
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
  color: rgba(255,255,255,0.8);
}

.footer-right {
  text-align: right;
}

.footer-bottom {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.2);
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.modal-actions {
  padding: 16px 24px;
  background: white;
  border-top: 1px solid rgba(0,0,0,0.1);
  margin: 0; /* Remove any margin */
}

// Print-specific adjustments
@media print {
  @page {
    size: A4;
    margin: 0.5in;
  }

  .watermark {
    opacity: 0.08 !important; /* Consistent with screen view */
  }

  .watermark img {
    width: 250px !important; /* Smaller for print */
    height: 250px !important;
    /* No grayscale filter to maintain brand colors */
  }

  .invoice-content {
    padding: 15px !important;
    flex: 1 !important;
  }

  .footer {
    margin: 0 !important;
    padding: 12px 15px !important;
    width: 100% !important;
    margin-top: auto !important;
  }

  .items-table th,
  .items-table td {
    padding: 6px 4px !important;
  }

  .details-section {
    background: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
    margin-bottom: 20px !important;
    padding: 15px !important;
  }

  .section-header {
    font-size: 10px !important;
    border-bottom-width: 1px !important;
    margin-bottom: 10px !important;
    padding-bottom: 5px !important;
  }

  .details-container .detail-row {
    margin-bottom: 8px !important;
    padding: 5px 0 !important;
  }

  // Content spacer for print
  .content-spacer {
    height: 60px !important; // Slightly smaller for print
  }

  // Ensure text is crisp in print
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  // Fix brand logo size for print
  .brand-logo {
    width: 50px !important;
    height: 50px !important;
  }

  // Optimize table for print
  .items-table {
    font-size: 12px !important;
    margin-bottom: 20px !important;
  }

  .items-table th,
  .items-table td {
    padding: 6px 4px !important;
  }

  .header {
    margin-bottom: 20px !important;
  }

  .details-section {
    margin-bottom: 15px !important;
  }

  .project-name {
    margin-bottom: 15px !important;
  }

  .bottom-section {
    margin-bottom: 15px !important;
  }

  .signature-section-bottom {
    padding: 20px 15px !important;
  }

  .brand-name {
    font-size: 36px !important;
  }

  .company-name {
    font-size: 16px !important;
  }

  .invoice-title {
    font-size: 24px !important;
  }
}

// Responsive design for mobile and tablet
@media screen and (max-width: 768px) {
  .invoice-container {
    margin: 10px auto 0 auto; /* Keep auto margins for centering */
    padding: 0; /* Remove padding */
  }

  .invoice-content {
    padding: 20px; /* Add padding to content only */
  }

  .header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .invoice-title {
    font-size: 28px;
  }

  .details-section {
    flex-direction: column;
    gap: 20px;
    padding: 15px;
  }

  .section-header {
    font-size: 11px;
    margin-bottom: 10px;
  }

  .details-container .detail-row {
    margin-bottom: 10px;
    padding: 6px 0;
  }

  .details-container .detail-row .label {
    min-width: 100px;
    font-size: 13px;
  }

  .details-container .detail-row .value {
    font-size: 13px;
  }

  .invoice-details {
    text-align: left;
  }

  .bottom-section {
    flex-direction: column;
    gap: 20px;
  }

  .left-section {
    padding-right: 0;
  }

  .totals-section {
    text-align: left;
  }

  .footer-main {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .footer-left,
  .footer-right {
    align-items: center;
  }

  .watermark img {
    width: 250px;
    height: 250px;
  }
}

@media screen and (max-width: 480px) {
  .invoice-container {
    padding: 0; /* Remove padding */
  }

  .invoice-content {
    padding: 15px; /* Add padding to content only */
  }

  .brand-name {
    font-size: 18px;
  }

  .invoice-title {
    font-size: 24px;
  }

  .items-table {
    font-size: 12px;
  }

  .items-table th,
  .items-table td {
    padding: 8px 4px;
  }

  .watermark img {
    width: 200px;
    height: 200px;
  }
}
</style>
