<template>
  <q-dialog v-model="internalModel" @hide="close" maximized>
    <q-card>
      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="no-print sticky-actions" align="center">
        <!-- currency switch removed for now -->
        <q-btn @click="printInvoice" :label="t('invoice.actions.printInvoice')" icon="print" color="primary" unelevated
          no-caps />
        <q-btn @click="close" :label="t('invoice.actions.close')" color="grey-6" flat no-caps />
      </q-card-actions>

      <div id="invoice-container">
        <!-- Watermark -->
        <div class="watermark">
          <img :src="brandLogo" alt="Brand Watermark" />
        </div>

        <q-card>
          <q-card-section style="display: flex; flex-direction: column; justify-content: space-between; height: 297mm;">
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
                    <span class="meta-label">🧾</span>
                    <span class="meta-value">{{ transactionData?.id }}</span>
                  </div>
                  <div class="meta-item" dir="ltr">
                    <span class="meta-label">🗓️</span>
                    <span class="meta-value">{{ formatDate(transactionData?.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Info Section -->
            <div class="transaction-info">
              <div class="info-item" v-for="(item, i) in transactionDetails" :key="i">
                <small class="label">{{ item.label }}</small>
                <span class="value">{{ item.value }}</span>
              </div>
            </div>

            <!-- Invoice Items Table -->
            <table class="invoice-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ t('invoice.items.description') }}</th>
                  <th>{{ t('invoice.items.quantity') }}</th>
                  <th>{{ t('invoice.items.unitPrice') }}</th>
                  <th>{{ t('invoice.items.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in transactionData?.items" :key="item.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                  <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Price Summary -->
            <div class="price-summary">
              <div class="price-row">
                <span>{{ t('invoice.payment.totalPrice') }}:</span>
                &nbsp;&nbsp;
                <b style="color: #090909">{{ formatCurrency((transactionData as any)?.orginal_total_price) }}</b>
              </div>
              <div class="price-row" v-if="(transactionData as any)?.discounted_rate">
                <span>{{ t('invoice.payment.discountRate') }}:</span>
                &nbsp;&nbsp;
                <b style="color: #7e2a0c">{{ (transactionData as any).discounted_rate }}%</b>
              </div>
              <div class="price-row" v-if="(transactionData as any)?.discounted_rate">
                <span>{{ t('invoice.payment.discountedPrice') }}:</span>
                &nbsp;&nbsp;
                <b style="color: #f54a00;">{{ formatCurrency((transactionData as any).discounted_price) }}</b>
              </div>
              <div class="price-row">
                <span>{{ t('invoice.payment.totalPrice') }}:</span>
                &nbsp;&nbsp;
                <b style="color: #090909">{{ formatCurrency(totalIQDprice, ' IQD') }}</b>
              </div>
              <div class="price-row">
                <span>{{ t('invoice.paidAmount') }}:</span>
                &nbsp;&nbsp;
                <b style="color: #090909">{{ formatCurrency(paidWith, ' IQD') }}</b>
              </div>
              <div class="price-row highlight" v-if="(transactionData as any)?.old_borrowed_price > 0">
                <span>{{ t('invoice.oldBorrowedPrice') }}:</span>
                &nbsp;&nbsp;
                <b>{{ formatCurrency((transactionData as any).old_borrowed_price) }}</b>
              </div>
              <div class="price-row highlight" v-if="(transactionData as any)?.new_borrowed_price > 0">
                <span>{{ t('invoice.newBorrowedPrice') }}:</span>
                &nbsp;&nbsp;
                <b>{{ formatCurrency((transactionData as any).new_borrowed_price) }}</b>
              </div>

              <!-- Payments -->
              <!-- <template v-if="(transactionData as any)?.payment">
                <div class="payment-title">{{ t('invoice.payment.title') }}</div>
                <div class="payment-grid">
                  <div class="payment-box success">
                    <small>{{ t('invoice.payment.usdIn') }}</small>
                    <b>{{ formatCurrency((transactionData as any)?.payment?.total_usd_in, ' USD') }}</b>
                  </div>
                  <div class="payment-box success">
                    <small>{{ t('invoice.payment.iqdIn') }}</small>
                    <b>{{ formatCurrency((transactionData as any)?.payment?.total_iqd_in, ' IQD') }}</b>
                  </div>
                  <div class="payment-box out">
                    <small>{{ t('invoice.payment.usdOut') }}</small>
                    <b>{{ formatCurrency((transactionData as any)?.payment?.total_usd_out, ' USD') }}</b>
                  </div>
                  <div class="payment-box out">
                    <small>{{ t('invoice.payment.iqdOut') }}</small>
                    <b>{{ formatCurrency((transactionData as any)?.payment?.total_iqd_out, ' IQD') }}</b>
                  </div>
                </div>
              </template> -->
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
import type { List } from 'src/types/item_transaction'
import { formatCurrency } from 'src/composables/useFormat'
import printJS from 'print-js'
import { useMeStore } from 'src/stores/meStore'

const brandLogo = '/brand.jpg'

const me = useMeStore().me

// i18n
const { t } = useI18n()

// Props
interface Props {
  modelValue: boolean
  transaction: List | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

// v-model binding
const internalModel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// Use provided transaction data
const transactionData = computed(() => props.transaction)

const totalIQDprice = computed(() => {
  let iqdPrice = (props.transaction?.total_price || 0) * (props.transaction?.usd_iqd_rate || 1);
  iqdPrice = Math.round(iqdPrice / 250) * 250;
  return iqdPrice;
})

const paidWith = computed(() => {
  const payment = (transactionData.value as any)?.payment;
  const paid_usd = (payment?.total_usd_in || 0) - (payment?.total_usd_out || 0);
  const paid_iqd = (payment?.total_iqd_in || 0) - (payment?.total_iqd_out || 0);

  return paid_iqd + (paid_usd * (transactionData.value?.usd_iqd_rate || 1));
})

const transactionDetails = computed(() => [
  {
    label: t('itemTransaction.code'),
    value: transactionData.value?.id || '—'
  },
  {
    label: t('itemTransaction.transactionType'),
    value: transactionData.value?.type === 'sell' ? t('transaction.types.sell') : t('transaction.types.purchase')
  },
  {
    label: t('transaction.paymentType'),
    value: transactionData.value?.payment_type || '—'
  },
  {
    label: t('warehouse.warehouse'),
    value: transactionData.value?.warehouse?.name || '—'
  },
  // {
  //   label: t('exchange.rate'),
  //   value: formatCurrency((transactionData.value as any)?.usd_iqd_rate, ' IQD')
  // },
  {
    label: t('customer.customer'),
    value: transactionData.value?.customer?.name || '—'
  },
  {
    label: t('customer.columns.phone'),
    value: (transactionData.value?.customer as any)?.fphone || '—'
  }
])

// Methods
const formatDate = (dateString?: string, addDays = 0) => {
  if (!dateString) return new Date().toISOString().slice(0, 10)
  const date = new Date(dateString)
  if (addDays > 0) {
    date.setDate(date.getDate() + addDays)
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatCurrencyDisplay = (amount: any) => {
  const numericAmount = Number(amount)
  if (isNaN(numericAmount)) {
    return '0.00'
  }
  const currency = (transactionData.value as any)?.currency || 'USD'
  if (currency === 'IQD') {
    return `${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} IQD`
  } else {
    return `$${numericAmount.toFixed(2)}`
  }
}

const printInvoice = () => {
  printJS({
    printable: 'invoice-container',
    type: 'html',
    targetStyles: ['*']
  })
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

  .transaction-info {
    gap: 6px;
  }

  .info-box {
    border: 1px solid #000;
    box-shadow: none;
    background: transparent;
  }

  .transaction-info {
    background: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  .transaction-info .info-item {
    border: 1px solid #ccc;
    box-shadow: none !important;
    background: white !important;
  }
}

@media screen {
  .invoice-items-table tbody tr:hover {
    background: #f1f7ff;
  }
}

#invoice-container {
  width: 100%;
  max-width: 800px;
  position: relative;
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

.q-card {
  box-shadow: none !important;
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

.invoice-items-table {
  margin-top: 40px;
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  font-size: 14px;
  border: 1px solid #d7d7d7;
}

.invoice-items-table th {
  text-align: left;
  padding: 8px 12px;
  font-weight: 600;
  color: #eee;
  background: #5a5a5a;
  border: 1px solid #d7d7d7;
  border-bottom: 2px solid #c9c9c9;
}

.invoice-items-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

/* Zebra rows for better readability */
.invoice-items-table tbody tr:nth-child(even) {
  background: #e9e9e9 !important;
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
  justify-content: center;
  align-items: stretch;
}

.price-row.highlight {
  color: #d9534f;
  font-weight: bold;
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

.payment-box small {
  display: block;
  font-size: 11px;
  color: #777;
}

.payment-box b {
  font-size: 13px;
}

:root {
  --footer-bg: #f9f9f9;
  --footer-text: #444;
  --footer-accent: #ff7eb9;
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

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  /* Highest z-index to appear over everything */
  opacity: 0.08;
  /* Slightly increased opacity to show brand colors better */
  pointer-events: none;

  img {
    width: 500px;
    /* Slightly smaller for better proportions */
    height: 500px;
    object-fit: contain;
    /* Removed grayscale filter to show brand colors */
  }
}

/* Keep action buttons at top while scrolling */
.sticky-actions {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
