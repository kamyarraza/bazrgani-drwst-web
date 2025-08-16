<template>
  <q-dialog v-model="internalModel" @hide="close" maximized>
    <q-card>
      <q-card-actions class="no-print sticky-actions" align="center">
        <q-btn @click="printInvoice" :label="t('invoice.actions.printInvoice')" icon="print" color="primary" unelevated
          no-caps />
        <q-btn @click="close" :label="t('invoice.actions.close')" color="grey-6" flat no-caps />
      </q-card-actions>

      <div id="payment-invoice-container">
        <div class="watermark">
          <img :src="brandLogo" alt="Brand Watermark" />
        </div>

        <q-card>
          <q-card-section
            style="display: flex; flex-direction: column; justify-content: space-between; min-height: 85vh;">
            <div class="invoice-header">
              <div class="header-left">
                <img :src="brandLogo" alt="Brand Logo" class="brand-logo" />
                <div class="company-info">
                  <h1 class="company-name">{{ t('invoice.header.companyName') }}</h1>
                  <p class="company-tagline">{{ t('invoice.header.companyTagline') }}</p>
                </div>
              </div>

                <div class="header-right">
                <div class="invoice-meta">
                  <div class="meta-item" dir="ltr">
                  <span class="meta-label">💳</span>
                  <span class="meta-value">{{ (transaction as any)?.payment_id }}</span>
                  </div>
                  <div class="meta-item" dir="ltr">
                  <span class="meta-label">🧾</span>
                  <span class="meta-value">{{ transaction?.transaction_id }}</span>
                  </div>
                  <div class="meta-item" dir="ltr">
                  <span class="meta-label">🗓️</span>
                  <span class="meta-value">{{ transaction?.created_at || payment?.created_at }}</span>
                  </div>
                </div>
                </div>
            </div>

            <h5 style="text-align: center;">{{ t('report.columns.payment') }}</h5>

            <div class="info-cards-container">
              <!-- Financial Information Card -->
              <div class="info-card">
                <div class="card-header">
                  <h3 class="card-title">💰 {{ t('expense.paymentInformation') }}</h3>
                </div>
                <div class="card-content">
                  <!-- Prices -->
                  <div class="info-row">
                    <div class="info-item">
                      <small class="label">{{ t('invoice.payment.totalPrice') }}</small>
                      <span class="value text-primary fw-bold">{{ formatCurrency(transaction?.total_price ?? 0) }}</span>
                    </div>
                    <div class="info-item">
                      <small class="label">{{ t('invoice.payment.discountRate') }}</small>
                      <span class="value">{{ (transaction as any)?.discounted_rate ? (transaction as any).discounted_rate + '%' : '—' }}</span>
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="info-item">
                      <small class="label">{{ t('invoice.payment.discountedPrice') }}</small>
                      <span class="value">{{ formatCurrency((transaction as any)?.discounted_price ?? 0) }}</span>
                    </div>
                    <div class="info-item">
                      <small class="label">{{ t('invoice.payment.paid') }}</small>
                      <span class="value text-success fw-bold">{{ formatCurrency(transaction?.paid_price ?? 0) }}</span>
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="info-item unpaid-highlight">
                      <small class="label">{{ t('invoice.payment.unpaid') }}</small>
                      <span class="value text-danger fw-bold">{{ formatCurrency((transaction as any)?.unpaid_price ?? 0)
                        }}</span>
                    </div>
                  </div>

                  <!-- Fully Paid Badge -->
                  <div class="info-row" v-if="(transaction as any)?.is_fully_paid !== undefined">
                    <div class="info-item">
                      <span class="badge px-3 py-1" :class="(transaction as any).is_fully_paid ? 'bg-success' : 'bg-warning'">
                        {{ (transaction as any).is_fully_paid ? t('invoice.payment.fullyPaid') :
                          t('invoice.payment.notFullyPaid') }}
                      </span>
                    </div>
                  </div>

                  <!-- Payment Details Section -->
                  <div class="payment-details">
                    <h5 class="details-title">📊 {{ t('invoice.payment.details') }}</h5>
                    <div class="info-row">
                      <div class="info-item">
                        <small class="label">{{ t('invoice.payment.usdPrice') }}</small>
                        <span class="value">{{ formatCurrency(getPaymentValue((transaction as any)?.payment, 'usd', 'in'), ' USD') }}</span>
                      </div>
                      <div class="info-item">
                        <small class="label">{{ t('invoice.payment.usdReturnPrice') }}</small>
                        <span class="value">{{ formatCurrency(getPaymentValue((transaction as any)?.payment, 'usd', 'out'), ' USD') }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <small class="label">{{ t('invoice.payment.iqdPrice') }}</small>
                        <span class="value">{{ formatCurrency(getPaymentValue((transaction as any)?.payment, 'iqd', 'in'), ' IQD') }}</span>
                      </div>
                      <div class="info-item">
                        <small class="label">{{ t('invoice.payment.iqdReturnPrice') }}</small>
                        <span class="value">{{ formatCurrency(getPaymentValue((transaction as any)?.payment, 'iqd', 'out'), ' IQD') }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <small class="label">{{ t('exchange.rate') }}</small>
                        <span class="value">
                          {{ formatCurrency(exchangeRate?.usd_iqd_rate ?? (transaction as any)?.exchange_rate?.usd_iqd ?? 0, ' IQD') }}
                          <template v-if="exchangeRate?.eur_usd_rate ?? (transaction as any)?.exchange_rate?.eur_usd">
                            | EUR/USD: {{ exchangeRate?.eur_usd_rate ?? (transaction as any).exchange_rate.eur_usd }}
                          </template>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Customer Information Card -->
              <div class="info-card">
                <div class="card-header">
                  <h3 class="card-title">👤 {{ t('customer.customerInfo') }}</h3>
                </div>
                <div class="card-content">
                  <div class="info-row">
                    <div class="info-item">
                      <small class="label">{{ t('customer.customer') }}</small>
                      <span class="value">{{ customerName }}</span>
                    </div>
                    <div class="info-item">
                      <small class="label">{{ t('customer.columns.phone') }}</small>
                      <span class="value">{{ customerPhone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>



          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </q-dialog>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from 'src/composables/useFormat'
import printJS from 'print-js'

const brandLogo = '/brand.jpg'

const { t } = useI18n()

interface PaymentPayloadTransaction {
  id?: number | string
  transaction_id?: number | string
  payment_type?: string
  total_price?: number
  paid_price?: number
  remaining?: number
  created_at?: string
}

interface PaymentPayload {
  data?: PaymentPayloadTransaction
  transaction?: PaymentPayloadTransaction
  customer?: { id?: number; name?: string; fname?: string; sname?: string; phone?: string }
  payment?: { total_usd_in?: number; total_iqd_in?: number; total_usd_out?: number; total_iqd_out?: number; created_at?: string }
  exchange_rate?: { usd_iqd_rate?: number; eur_usd_rate?: number }
}

interface Props {
  modelValue: boolean
  payload: PaymentPayload | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const internalModel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// Normalize various payload shapes to support:
// 1) ApiResponse { status, message, data: { transaction, customer, payment, exchange_rate } }
// 2) Direct object     { transaction, customer, payment, exchange_rate }
// 3) Fallbacks          { data: PaymentPayloadTransaction }
const root = computed<any>(() => (props.payload as any)?.data ? (props.payload as any).data : props.payload)
const transaction = computed<PaymentPayloadTransaction | undefined>(() => (root.value?.transaction) || (root.value?.data) || root.value)
const customer = computed(() => root.value?.customer)
const payment = computed(() => root.value?.payment)
const exchangeRate = computed(() => root.value?.exchange_rate)

const customerName = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.name || [c.fname, c.sname].filter(Boolean).join(' ') || '—'
})

const customerPhone = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.phone || '—'
})

const getPaymentValue = (payment: any, currency: string, direction: string): number => {
  // Handle null/undefined payment
  if (!payment) return 0;
  
  // Handle different payment data structures
  if (Array.isArray(payment)) {
    // If payment is an array, iterate through it
    let amount = 0;
    payment.forEach(element => {
      if (element && element.currency === currency && element.direction === direction) {
        amount = element.value?.amount || 0;
      }
    });
    return amount;
  }
  
  // Handle object-based payment structure (fallback for different API responses)
  if (typeof payment === 'object') {
    // Try direct property access patterns
    const key = `${direction}_${currency}`;
    if (payment[key] !== undefined) {
      return payment[key] || 0;
    }
    
    // Try common property patterns
    if (currency === 'usd' && direction === 'in' && payment.total_usd_in !== undefined) {
      return payment.total_usd_in || 0;
    }
    if (currency === 'usd' && direction === 'out' && payment.total_usd_out !== undefined) {
      return payment.total_usd_out || 0;
    }
    if (currency === 'iqd' && direction === 'in' && payment.total_iqd_in !== undefined) {
      return payment.total_iqd_in || 0;
    }
    if (currency === 'iqd' && direction === 'out' && payment.total_iqd_out !== undefined) {
      return payment.total_iqd_out || 0;
    }
  }
  
  return 0;
}

const printInvoice = () => {
  printJS({ printable: 'payment-invoice-container', type: 'html', targetStyles: ['*'] })
}

const close = () => {
  internalModel.value = false
}
</script>

<style lang="scss" scoped>
@media print {
  @page {
    size: A4;
    margin: 0.5in 0.4in !important;
  }

  .no-print {
    display: none !important;
  }
}

#payment-invoice-container {
  width: 100%;
  max-width: 800px;
  position: relative;
}

.q-card {
  box-shadow: none !important;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 3px solid #4CAF50;
  background-color: #f9fdf9;
  border-radius: 8px;
}

.header-left {
  display: flex;
  align-items: center;
}

.brand-logo {
  height: 60px;
  width: auto;
  margin-right: 15px;
}

.company-info {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-size: 1.6rem;
  margin: 0;
  height: 70px;
  color: #333;
  font-weight: 700;
}

.company-tagline {
  font-size: 0.9rem;
  color: #777;
  margin-top: 2px;
}

.header-right {
  text-align: right;
}

.invoice-meta {
  font-size: 0.95rem;
}

.meta-item {
  width: 200px;
  margin-bottom: 4px;
}

.meta-label {
  font-weight: bold;
  color: #555;
}

.meta-value {
  margin-left: 5px;
  color: #333;
  font-weight: 700;
}

.transaction-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  margin-bottom: 12px;
  background: #e5e5e5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.transaction-info .info-item {
  flex: 1 1 150px;
  background: white;
  border-radius: 6px;
  padding: 6px 10px;
  box-shadow: 3px 3px 2px rgba(25, 25, 25, 0.1);
  border: 1px solid #e0e0e0;
}

.transaction-info .label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
  text-transform: uppercase;
}

.transaction-info .value {
  font-weight: bold;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
}

.price-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  border-top: 2px dashed #ccc;
  font-size: 14px;
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payment-title {
  margin-top: 1rem;
  font-weight: bold;
  text-decoration: underline;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-top: 0.5rem;
}

.payment-box {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fdfdfd;
  text-align: center;
}

.payment-box.success {
  background-color: #dff0d8;
  color: #28a745;
}

.payment-box.out {
  background-color: #f2dede;
  color: #c9302c;
}

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  opacity: 0.08;
  pointer-events: none;
}

.watermark img {
  width: 500px;
  height: 500px;
  object-fit: contain;
}

.sticky-actions {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.info-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ddd;
  flex: 1;
  min-width: 280px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  page-break-inside: avoid;
  /* Prevent breaking in print */
}

.card-header {
  background: #f9f9f9;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eee;
  border-radius: 12px 12px 0 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.card-content {
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.info-item {
  flex: 1;
}

.label {
  font-size: 0.78rem;
  color: #6c757d;
  display: block;
}

.value {
  font-size: 0.95rem;
  font-weight: 500;
}

.text-primary {
  color: #007bff !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.badge {
  font-size: 0.8rem;
  border-radius: 50px;
}

.payment-details {
  margin-top: 1rem;
  border-top: 1px dashed #ddd;
  padding-top: 0.8rem;
}

.details-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
  color: #495057;
}

/* Print-friendly adjustments */
@media print {
  .info-card {
    box-shadow: none;
    border: 1px solid #000;
  }

  .card-header {
    background: #fff;
    border-bottom: 1px solid #000;
  }

  .text-primary,
  .text-success,
  .text-danger {
    color: #000 !important;
    /* Avoid color loss in print */
  }
}
</style>
