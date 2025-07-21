<template>
  <q-dialog v-model="internalModel" @hide="closeModal" maximized>
    <q-card class="invoice-dialog-card">
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
              <div class="company-name">Bazrgani Drwst</div>
            </div>
            <div class="invoice-section">
              <div class="invoice-title">OFFER</div>
            </div>
          </div>

          <!-- Client and Offer Details -->
          <div class="details-section">
            <div class="invoice-details">
              <div class="section-header">Offer Details</div>
              <div class="details-container">
                <div class="detail-row">
                  <span class="label">Offer No:</span>
                  <span class="value">{{ offerNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDate(offer?.created_at) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Valid Until:</span>
                  <span class="value">{{ formatDate(offer?.valid_until) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value">{{ formatStatus(offer?.status) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Currency:</span>
                  <span class="value">USD</span>
                </div>
              </div>
            </div>
            <div class="client-info">
              <div class="section-header">Client Information</div>
              <div class="details-container">
                <div class="detail-row">
                  <span class="label">Name:</span>
                  <span class="value">{{ getCustomerName() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Phone:</span>
                  <span class="value">{{ getCustomerPhone() }}</span>
                </div>
                <div class="detail-row" v-if="getCustomerEmail()">
                  <span class="label">Email:</span>
                  <span class="value">{{ getCustomerEmail() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Type:</span>
                  <span class="value">Customer</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Offer Title -->
          <div class="project-name">
            <strong>Offer Title:</strong> {{ offer?.title || 'Business Offer' }}
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead class="table-header">
              <tr>
                <th>SL</th>
                <th>ITEM DESCRIPTION</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th v-if="hasDiscounts">DISCOUNT</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in offerItems" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.item_name || item.description }}</td>
                <td>{{ item.quantity || 0 }}</td>
                <td>${{ (item.unit_price || 0).toFixed(2) }}</td>
                <td v-if="hasDiscounts">{{ (item.discount_percentage || 0) }}%</td>
                <td>${{ (item.subtotal || ((item.quantity || 0) * (item.unit_price || 0))).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Spacer to push totals section down -->
          <div class="content-spacer"></div>

          <!-- Payment and Totals Section -->
          <div class="bottom-section">
            <div class="left-section">
              <div class="totals-section">
                <div class="total-line">Subtotal: <span class="amount">${{ (subtotal || 0).toFixed(2) }}</span></div>
                <div class="total-line" v-if="(totalDiscount || 0) > 0">
                  Discount: <span class="amount">-${{ (totalDiscount || 0).toFixed(2) }}</span>
                </div>
                <div class="total-line" v-if="offer?.discounted_rate">
                  Discount Rate: <span class="amount">{{ offer?.discounted_rate }}%</span>
                </div>
                <div class="total-line total-bold">Total: <span class="amount">${{ (finalTotal || 0).toFixed(2) }}</span></div>
                <div class="total-line" v-if="offer?.discounted_price">
                  Final Price: <span class="amount">${{ (Number(offer?.discounted_price) || 0).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="right-section">
              <div class="payment-section">
                <div class="payment-title">Offer Information</div>
                <div class="payment-details">
                  <div class="payment-row">
                    <span class="label">Offer Type:</span>
                    <span class="value">Business Proposal</span>
                  </div>
                  <div class="payment-row">
                    <span class="label">Status:</span>
                    <span class="value">{{ formatStatus(offer?.status) }}</span>
                  </div>
                  <div class="payment-row" v-if="offer?.reference">
                    <span class="label">Reference:</span>
                    <span class="value">{{ offer?.reference }}</span>
                  </div>
                  <div class="payment-row">
                    <span class="label">Offer ID:</span>
                    <span class="value">{{ offer?.id }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Note Section (hidden in print) -->
          <div class="note-section no-print" v-if="offer?.note">
            <div class="note-title">Note:</div>
            <div class="note-content">{{ offer.note }}</div>
          </div>

        </div>

        <!-- Signature Section -->
        <div class="signature-section-bottom">
          <div class="thank-you">Thank you for considering our offer</div>
          <div class="signature-area">
            <div class="signature-line">Authorized Signature</div>
            <div class="account-manager">Sales Manager</div>
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
                <span>Sulaymaniyah, Kurdistan Region</span>
              </div>
            </div>

            <div class="footer-center">
              <div class="footer-brand-name">Bazrgani Drwst</div>
              <div class="footer-tagline">For General Trading Ltd</div>
            </div>

            <div class="footer-right">
              <div class="footer-item">
                <span class="footer-icon">☎</span>
                <span>2089 153 0770</span>
              </div>
              <div class="footer-item">
                <span class="footer-icon">✉</span>
                <span>true.trading23@gmail.com</span>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            Bazrgani Drwst Company. All rights reserved 2025 ©
          </div>
        </div>
      </div>

      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="modal-actions no-print" align="right">
        <q-btn
          @click="printOffer"
          label="Print Offer"
          icon="print"
          color="primary"
          unelevated
          no-caps
        />
        <q-btn
          @click="closeModal"
          label="Close"
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
import brandLogo from 'src/assets/images/brand.jpg';
import type { OfferResponse } from 'src/types/offer';

// Props
interface Props {
  modelValue: boolean;
  offer: OfferResponse | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'offer-updated': [offer: OfferResponse];
}>();

// Internal model
const internalModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

// Invoice reference for printing
const invoiceRef = ref<HTMLElement>();

// Computed properties
const offerItems = computed(() => props.offer?.items || []);

const offerNumber = computed(() => {
  if (!props.offer) return 'N/A';
  return `OFF-${props.offer.id.toString().padStart(6, '0')}`;
});

const hasDiscounts = computed(() => {
  return offerItems.value.some(item => item.discount_percentage && item.discount_percentage > 0);
});

const subtotal = computed(() => {
  return offerItems.value.reduce((sum, item) => {
    return sum + (item.subtotal || (item.quantity * item.unit_price));
  }, 0);
});

const totalDiscount = computed(() => {
  return offerItems.value.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    const discount = itemTotal * (item.discount_percentage || 0) / 100;
    return sum + discount;
  }, 0);
});

const finalTotal = computed(() => {
  const total = props.offer?.total_price;
  if (typeof total === 'number') return total;
  return subtotal.value - totalDiscount.value;
});

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return new Date().toLocaleDateString();
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatStatus = (status?: string) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getCustomerName = () => {
  if (!props.offer) return 'N/A';

  // Handle both cases where customer_id might be a Customer object or customer might be separate
  const customer = (props.offer.customer_id as any)?.name ? props.offer.customer_id as any : props.offer.customer;

  return customer?.name || customer?.full_name || 'N/A';
};

const getCustomerPhone = () => {
  if (!props.offer) return 'N/A';

  // Handle both cases where customer_id might be a Customer object or customer might be separate
  const customer = (props.offer.customer_id as any)?.phone ? props.offer.customer_id as any : props.offer.customer;

  return customer?.phone || 'N/A';
};

const getCustomerEmail = () => {
  if (!props.offer) return '';

  // Handle both cases where customer_id might be a Customer object or customer might be separate
  const customer = (props.offer.customer_id as any)?.email ? props.offer.customer_id as any : props.offer.customer;

  return customer?.email || '';
};

const printOffer = () => {
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
  padding: 0;
  margin: 0;
}

.invoice-container {
  max-width: 800px;
  margin: 20px auto 0 auto;
  background-color: white;
  padding: 0;
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
  z-index: 999;
  opacity: 0.08;
  pointer-events: none;

  img {
    width: 350px;
    height: 350px;
    object-fit: contain;
  }
}

// All content should be above watermark
.invoice-content {
  flex: 1;
  padding: 40px;
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

.table-header th:nth-child(6) {
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

// Add spacer to push totals section down
.content-spacer {
  height: 80px;
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
  margin: 0;
  background-color: #2A7B9B;
  color: white;
  padding: 20px 40px;
  width: 100%;
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
  margin: 0;
}

// Print-specific adjustments
@media print {
  @page {
    size: A4;
    margin: 0.5in;
  }

  .watermark {
    opacity: 0.08 !important;
  }

  .watermark img {
    width: 250px !important;
    height: 250px !important;
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

  .content-spacer {
    height: 60px !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .brand-logo {
    width: 50px !important;
    height: 50px !important;
  }

  .items-table {
    font-size: 12px !important;
    margin-bottom: 20px !important;
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
    margin: 10px auto 0 auto;
    padding: 0;
  }

  .invoice-content {
    padding: 20px;
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
    padding: 0;
  }

  .invoice-content {
    padding: 15px;
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
