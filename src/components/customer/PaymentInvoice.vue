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
            style="display: flex; flex-direction: column; justify-content: space-between; min-height: 85vh; height: 297mm;">
            <div>
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
                      <span class="meta-value">{{ transaction?.payment_id || (transaction as any)?.payment_id }}</span>
                    </div>
                    <div class="meta-item" dir="ltr">
                      <span class="meta-label">🗓️</span>
                      <span class="meta-value">{{ transaction?.created_at || payment?.created_at }}</span>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Title -->
              <p class="payment-title-main" style="font-size: 22pt;">{{ t('report.columns.payment') }}</p>
  
              <div class="info-cards-container">
                <!-- Financial Information Card -->
                <div class="info-card">
                  <div class="card-header">
                    <h3 class="card-title">🧾 {{ t('invoice.information') }}</h3>
                  </div>
                  <div class="card-content">
  
                    <!-- Invoice Information -->
                    <table>
                      <tbody>
                        <tr>
                          <td colspan="2">{{ t('invoice.payment.totalPrice') }}</td>
                          <td class="text-primary fw-bold">{{ formatCurrency((transaction as any)?.paid_price) }}</td>
                        </tr>
                        <tr>
                          <td colspan="2">{{ t('transaction.count') }}</td>
                          <td class=" fw-bold">{{ (transaction as any)?.paid_transactions }}</td>
                        </tr>
                        <tr>
                          <td colspan="2">{{ t('transaction.date') }}</td>
                          <td class="fw-bold">{{ transaction?.created_at }}</td>
                        </tr>
                        <tr>
                          <td colspan="2">{{ t('invoice.unpaidAmount') }}</td>
                          <td class=" text-danger fw-bold">{{ formatCurrency(transaction?.remained_borrowed_price ?? 0) }}
                          </td>
                        </tr>
                        <tr>
                          <td><span style="padding: 0 2rem;"></span></td>
                          <td><span style="padding: 0 2rem;"></span></td>
                          <td><span style="padding: 0 4rem;"></span></td>
                        </tr>
  
                        <!-- Fully Paid Badge -->
                        <tr v-if="(transaction as any)?.is_fully_paid">
                          <td colspan="3">
                            <div class="text-center">
                              <span class="cute-badge">
                                ✅ fully paid
                              </span>
                            </div>
  
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  
                <!-- Customer Information Card -->
                <div class="info-card">
                  <div class="card-header">
                    <h3 class="card-title">👤 {{ t('customer.customerInfo') }}</h3>
                  </div>
                  <div class="card-content">
                    <table>
                      <tbody>
                        <tr>
                          <td>{{ t('customer.columns.id') }}</td>
                          <td colspan="2" class="fw-bold">{{ customerId }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('customer.customer') }}</td>
                          <td colspan="2" class="fw-bold">{{ customerName }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('customer.columns.phone') }}</td>
                          <td colspan="2" class="fw-bold">{{ customerPhone }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('customer.columns.place') }}</td>
                          <td colspan="2" class="fw-bold">{{ customerPlace }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('customer.columns.createdAt') }}</td>
                          <td colspan="2" class="fw-bold">{{ customerCreatedAt }}</td>
                        </tr>
                        <tr>
                          <td>{{ t('customer.columns.purchaseBorrow') }}</td>
                          <td colspan="2" class="fw-bold text-danger">{{ formatCurrency(customerPurchaseBorrow) }}</td>
                        </tr>
                        <tr>
                          <td><span style="padding: 0 4rem;"></span></td>
                          <td><span style="padding: 0 4rem;"></span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  
                <!-- Payment Details Section -->
                <div class="info-card">
                  <div class="card-header">
                    <h5 class="details-title">📊 {{ t('expense.paymentInformation') }}</h5>
                  </div>
                  <div class="card-content payment-details">
  
                    <table style="width: 100%;" class="table-prices">
                      <tbody>
                        <!-- Grouped by currency -->
                        <tr v-for="currency in ['usd', 'iqd']" :key="currency">
                          <td>
                            <!-- Currency Label -->
                            <span v-if="currency === 'usd'">{{ t('invoice.payment.usdIn') }}</span>
                            <span v-else>{{ t('invoice.payment.iqdIn') }}</span>
                          </td>
  
                          <!-- In Amount -->
                          <td class="fw-bold text-success">
                            {{
                              formatCurrency(
                                ((transaction as any)?.payment || [])
                                  .find(p => p.currency === currency && p.direction === 'in')?.amount || 0,
                                ' ' + currency.toUpperCase()
                              )
                            }}
                          </td>
  
                          <td>
                            <!-- Currency Label -->
                            <span v-if="currency === 'usd'">{{ t('invoice.payment.usdOut') }}</span>
                            <span v-else>{{ t('invoice.payment.iqdOut') }}</span>
                          </td>
  
                          <!-- Out Amount -->
                          <td class="fw-bold text-danger">
                            {{
                              formatCurrency(
                                ((transaction as any)?.payment || [])
                                  .find(p => p.currency === currency && p.direction === 'out')?.amount || 0,
                                ' ' + currency.toUpperCase()
                              )
                            }}
                          </td>
                        </tr>
  
  
                        <!-- Exchange Rate -->
                        <!-- <tr>
                          <td>{{ t('exchange.rate') }}</td>
                          <td class="">
                            {{ formatCurrency((transaction as any)?.exchange_rate?.usd_iqd_rate ?? 0, ' IQD') }}
                          </td>
                        </tr> -->
  
                        <!-- Spacer row -->
                        <tr>
                          <td colspan="4"><span style="padding: 0 2rem;"></span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
  
              </div>
            </div>

            <!-- Footer Section -->
            <div class="invoice-footer">
              <table>
                <tr>
                  <td><b>{{ t('invoice.footer.thankYou') }}</b></td>
                  <td><em>{{ t('invoice.footer.copyright') }}</em></td>
                  <td style="text-align: left;">
                      <span>{{ t('invoice.footer.phone') }}: <span dir="ltr">{{ (me as any)?.phone || '.........................................' }}</span></span>
                  </td>
                </tr>
              </table>
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
import { useMeStore } from 'src/stores/meStore'

const brandLogo = '/brand.jpg'

const me = useMeStore().me

const { t } = useI18n()

interface PaymentPayloadTransaction {
  id?: number | string
  paid_transactions?: number | string
  remained_borrowed_price?: number
  payment_id?: number | string
  payment_type?: string
  total_price?: number
  paid_price?: number
  unpaid_price?: number
  remaining?: number
  created_at?: string
  payment?: any[] // Array of payment objects
  exchange_rate?: { usd_iqd_rate?: number; eur_usd_rate?: number }
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

const customerId = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.id || '—'
})

const customerName = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.name || [c.fname, c.sname].filter(Boolean).join(' ') || '—'
})

const customerPhone = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.fphone || '—'
})

const customerPlace = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.place || '—'
})

const customerPurchaseBorrow = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.purchase_borrow || '—'
})

const customerCreatedAt = computed(() => {
  const c = customer.value
  if (!c) return '—'
  return c.created_at || '—'
})

const printInvoice = () => {
  printJS({ printable: 'payment-invoice-container', type: 'html', targetStyles: ['*'] })
}

const close = () => {
  internalModel.value = false
}
</script>

<style lang="scss" scoped>
@page {
  size: A4 portrait;
  margin: 10mm;
  /* adjust to your printer’s minimum margin */
}

@media print {
  body {
    zoom: 1 !important;
    /* prevent Chrome auto-shrink */
  }

  .no-print {
    display: none !important;
  }

  .text-success,
  .text-danger {
    color: #000 !important;
    font-weight: bold;
  }

  .payment-title-main {
    font-size: 20px !important;
    text-align: center !important;
    margin: 1px 0 !important;
    font-weight: 600 !important;
  }

  ::v-deep(.payment-title-main) {
    font-size: 30px !important;
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

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
}

.info-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.label {
  font-size: 0.78rem;
  color: #6c757d;
}

.value {
  font-size: 0.9rem;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.payment-title-main {
  text-align: center;
  font-size: 2rem;
  margin: 1rem 0;
  font-weight: 600;
  color: #333;
}

.cute-badge {
  display: inline-block;
  width: 200px;
  padding: 0.35rem 0.9rem;
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 999px;
  /* pill shape */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  letter-spacing: 0.3px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cute-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.table-prices {
  width: 100%;
  border-collapse: collapse;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.table-prices td {
  padding: 0.5rem;
  border: 1px solid #ddd;
}

.invoice-footer {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 2px solid #4CAF50;
  font-size: 0.65rem !important;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}

.invoice-footer table {
  width: 100%;
  border-collapse: collapse;
}
</style>