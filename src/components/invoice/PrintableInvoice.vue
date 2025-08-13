<template>
  <q-dialog v-model="internalModel" @hide="close" maximized>
    <q-card>
      <!-- Action Buttons (hidden in print) -->
      <q-card-actions class="no-print" align="right">
        <q-btn @click="printInvoice" :label="t('invoice.actions.printInvoice')" icon="print" color="primary" unelevated no-caps />
        <q-btn @click="close" :label="t('invoice.actions.close')" color="grey-6" flat no-caps />
      </q-card-actions>

      <div id="invoice-container">
        <q-card>
          <q-card-section>
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
              <div class="info-box">
                <small>{{ t('itemTransaction.transactionType') }}</small>
                <b>{{ transactionData?.type === 'sell' ? t('transaction.types.sell') : t('transaction.types.purchase') }}</b>
              </div>
              <div class="info-box">
                <small>{{ t('transaction.paymentType') }}</small>
                <b>{{ transactionData?.payment_type || '—' }}</b>
              </div>
              <div class="info-box">
                <small>{{ t('warehouse.warehouse') }}</small>
                <b>{{ transactionData?.warehouse?.name || '—' }}</b>
              </div>
              <div class="info-box">
                <small>{{ t('customer.customer') }}</small>
                <b>{{ transactionData?.customer?.name || '—' }}</b>
              </div>
              <div class="info-box">
                <small>{{ t('customer.columns.phone') }}</small>
                <b>{{ (transactionData?.customer as any)?.fphone || '—' }}</b>
              </div>
            </div>

            <!-- Invoice Items Table -->
            <div class="invoice-items-wrapper">
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

const brandLogo = '/brand.jpg'

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
  if (isNaN(numericAmount)) return '0.00'
  const currency = (transactionData.value as any)?.currency || 'USD'
  if (currency === 'IQD') {
    return `${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} IQD`
  }
  return `$${numericAmount.toFixed(2)}`
}

const printInvoice = () => {
  window.print()
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
}

@media screen {
  .invoice-items-table tbody tr:hover {
    background: #f1f7ff;
  }
}

#invoice-container {
  width: 800px;
  margin: 0 auto;
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
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-box {
  flex: 1 1 calc(33.33% - 10px);
  min-width: 200px;
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
}

.invoice-items-wrapper {
  margin-top: 40px;
  overflow: hidden;
  border: 1px solid #d7d7d7;
  border-collapse: collapse;
  width: 100%;
}

.invoice-items-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  font-size: 14px;
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

/* Zebra rows */
.invoice-items-table tbody tr:nth-child(even) {
  background: #e9e9e9 !important;
}
</style>


