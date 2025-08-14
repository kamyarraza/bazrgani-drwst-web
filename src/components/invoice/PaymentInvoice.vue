<template>
  <q-dialog v-model="internalModel" @hide="close" maximized>
    <q-card>
      <q-card-actions class="no-print sticky-actions" align="center">
        <q-btn @click="printInvoice" :label="t('invoice.actions.printInvoice')" icon="print" color="primary" unelevated no-caps />
        <q-btn @click="close" :label="t('invoice.actions.close')" color="grey-6" flat no-caps />
      </q-card-actions>

      <div id="payment-invoice-container">
        <div class="watermark">
          <img :src="brandLogo" alt="Brand Watermark" />
        </div>

        <q-card>
          <q-card-section style="display: flex; flex-direction: column; justify-content: space-between; min-height: 85vh;">
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
                    <span class="meta-value">{{ transaction?.transaction_id }}</span>
                  </div>
                  <div class="meta-item" dir="ltr">
                    <span class="meta-label">🗓️</span>
                    <span class="meta-value">{{ transaction?.created_at || payment?.created_at }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="transaction-info">
              <div class="info-item">
                <small class="label">{{ t('itemTransaction.transactionType') }}</small>
                <span class="value">{{ (transaction?.payment_type === 'borrow') ? t('transaction.types.borrow') : (transaction?.payment_type || '—') }}</span>
              </div>
              <div class="info-item">
                <small class="label">{{ t('transaction.paymentType') }}</small>
                <span class="value">{{ transaction?.payment_type || '—' }}</span>
              </div>
              <div class="info-item">
                <small class="label">{{ t('invoice.payment.totalPrice') }}</small>
                <span class="value">{{ formatCurrency(transaction?.total_price ?? 0) }}</span>
              </div>
              <div class="info-item">
                <small class="label">{{ t('invoice.payment.paid') }}</small>
                <span class="value">{{ formatCurrency(transaction?.paid_price ?? 0) }}</span>
              </div>
              <div class="info-item">
                <small class="label">{{ t('invoice.payment.remaining') }}</small>
                <span class="value">{{ formatCurrency(transaction?.remaining ?? 0) }}</span>
              </div>
              <div class="info-item" v-if="exchangeRate">
                <small class="label">{{ t('exchange.rate') }}</small>
                <span class="value">{{ formatCurrency(exchangeRate?.usd_iqd_rate ?? 0, ' IQD') }} | EUR/USD: {{ exchangeRate?.eur_usd_rate ?? '' }}</span>
              </div>
              <div class="info-item">
                <small class="label">{{ t('customer.customer') }}</small>
                <span class="value">{{ customerName }}</span>
              </div>
              <div class="info-item">
                <small class="label">{{ t('customer.columns.phone') }}</small>
                <span class="value">{{ customerPhone }}</span>
              </div>
            </div>

            <div class="price-summary">
              <template v-if="payment">
                <div class="payment-title">{{ t('invoice.payment.title') }}</div>
                <div class="payment-grid">
                  <div class="payment-box success">
                    <small>{{ t('invoice.payment.usdIn') }}</small>
                    <b>{{ formatCurrency(payment?.total_usd_in ?? 0, ' USD') }}</b>
                  </div>
                  <div class="payment-box success">
                    <small>{{ t('invoice.payment.iqdIn') }}</small>
                    <b>{{ formatCurrency(payment?.total_iqd_in ?? 0, ' IQD') }}</b>
                  </div>
                  <div class="payment-box out">
                    <small>{{ t('invoice.payment.usdOut') }}</small>
                    <b>{{ formatCurrency(payment?.total_usd_out ?? 0, ' USD') }}</b>
                  </div>
                  <div class="payment-box out">
                    <small>{{ t('invoice.payment.iqdOut') }}</small>
                    <b>{{ formatCurrency(payment?.total_iqd_out ?? 0, ' IQD') }}</b>
                  </div>
                </div>
              </template>
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

const printInvoice = () => {
  printJS({ printable: 'payment-invoice-container', type: 'html', targetStyles: ['*'] })
}

const close = () => {
  internalModel.value = false
}
</script>

<style lang="scss" scoped>
@media print {
  @page { size: A4; margin: 0.5in 0.4in !important; }
  .no-print { display: none !important; }
}

#payment-invoice-container { width: 100%; max-width: 800px; position: relative; }
.q-card { box-shadow: none !important; }
.invoice-header { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; border-bottom: 3px solid #4CAF50; background-color: #f9fdf9; border-radius: 8px; }
.header-left { display: flex; align-items: center; }
.brand-logo { height: 60px; width: auto; margin-right: 15px; }
.company-info { display: flex; flex-direction: column; }
.company-name { font-size: 1.6rem; margin: 0; height: 70px; color: #333; font-weight: 700; }
.company-tagline { font-size: 0.9rem; color: #777; margin-top: 2px; }
.header-right { text-align: right; }
.invoice-meta { font-size: 0.95rem; }
.meta-item { width: 200px; margin-bottom: 4px; }
.meta-label { font-weight: bold; color: #555; }
.meta-value { margin-left: 5px; color: #333; font-weight: 700; }
.transaction-info { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; margin-bottom: 12px; background: #e5e5e5; border-radius: 8px; border: 1px solid #e0e0e0; }
.transaction-info .info-item { flex: 1 1 150px; background: white; border-radius: 6px; padding: 6px 10px; box-shadow: 3px 3px 2px rgba(25, 25, 25, 0.1); border: 1px solid #e0e0e0; }
.transaction-info .label { display: block; font-size: 11px; color: #666; margin-bottom: 2px; text-transform: uppercase; }
.transaction-info .value { font-weight: bold; font-size: 13px; color: #333; white-space: nowrap; }
.price-summary { margin-top: 1.5rem; padding: 1rem; border-top: 2px dashed #ccc; font-size: 14px; page-break-inside: avoid; display: flex; flex-direction: column; gap: 6px; }
.payment-title { margin-top: 1rem; font-weight: bold; text-decoration: underline; }
.payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 0.5rem; }
.payment-box { padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; background-color: #fdfdfd; text-align: center; }
.payment-box.success { background-color: #dff0d8; color: #28a745; }
.payment-box.out { background-color: #f2dede; color: #c9302c; }

.watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 999; opacity: 0.08; pointer-events: none; }
.watermark img { width: 500px; height: 500px; object-fit: contain; }

.sticky-actions { position: sticky; top: 0; z-index: 1000; background: white; border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
</style>


