<template>
    <!-- Action Buttons (hidden in print) -->
    <q-card-actions class="no-print" align="center">
        <!-- <q-btn-dropdown color="secondary" icon="currency_exchange" :label="t('invoice.actions.switchCurrency')" no-caps
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
        </q-btn-dropdown> -->
        <q-btn @click="printInvoice" :label="t('invoice.actions.printInvoice')" icon="print" color="primary" unelevated
            no-caps />
        <q-btn @click="goBack" :label="t('invoice.actions.close')" color="grey-6" flat no-caps />
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
                                <span class="meta-value">{{ transaction?.id }}</span>
                            </div>
                            <div class="meta-item" dir="ltr">
                                <span class="meta-label">🗓️</span>
                                <span class="meta-value">{{ formatDate(transaction?.created_at) }}</span>
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
                <!-- <div class="invoice-items-wrapper"> -->
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
                        <tr v-for="(item, index) in transaction?.items" :key="item.id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                            <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                        </tr>
                    </tbody>
                </table>
                <!-- </div> -->

                <!-- Price Summary -->
                <div class="price-summary">
                    <div class="price-row">
                        <span>{{ t('invoice.payment.totalPrice') }}:</span>
                        &nbsp;&nbsp;
                        <b style="color: #090909">{{ formatCurrency((transaction?.total_price as any)) }}</b>
                    </div>
                    <div class="price-row" v-if="(transaction as any)?.discounted_rate">
                        <span>{{ t('invoice.payment.discountRate') }}:</span>
                        &nbsp;&nbsp;
                        <b style="color: #7e2a0c">{{ (transaction as any).discounted_rate }}%</b>
                    </div>
                    <div class="price-row" v-if="(transaction as any)?.discounted_rate">
                        <span>{{ t('invoice.payment.discountedPrice') }}:</span>
                        &nbsp;&nbsp;
                        <b style="color: #f54a00;">{{ formatCurrency((transaction as any).discounted_price) }}</b>
                    </div>
                    <div class="price-row highlight" v-if="(transaction as any)?.old_borrowed_price > 0">
                        <span>{{ t('invoice.oldBorrowedPrice') }}:</span>
                        &nbsp;&nbsp;
                        <b>{{ formatCurrency((transaction as any).old_borrowed_price) }}</b>
                    </div>
                    <div class="price-row highlight" v-if="(transaction as any)?.new_borrowed_price > 0">
                        <span>{{ t('invoice.newBorrowedPrice') }}:</span>
                        &nbsp;&nbsp;
                        <b>{{ formatCurrency((transaction as any).new_borrowed_price) }}</b>
                    </div>

                    <!-- Payments -->
                    <template v-if="(transaction as any)?.payment">
                        <div class="payment-title">{{ t('invoice.payment.title') }}</div>
                        <div class="payment-grid">
                            <div class="payment-box success">
                                <small>{{ t('invoice.payment.usdIn') }}</small>
                                <b>{{ formatCurrency((transaction as any)?.payment?.total_usd_in, ' USD') }}</b>
                            </div>
                            <div class="payment-box success">
                                <small>{{ t('invoice.payment.iqdIn') }}</small>
                                <b>{{ formatCurrency((transaction as any)?.payment?.total_iqd_in, ' IQD') }}</b>
                            </div>
                            <div class="payment-box out">
                                <small>{{ t('invoice.payment.usdOut') }}</small>
                                <b>{{ formatCurrency((transaction as any)?.payment?.total_usd_out, ' USD') }}</b>
                            </div>
                            <div class="payment-box out">
                                <small>{{ t('invoice.payment.iqdOut') }}</small>
                                <b>{{ formatCurrency((transaction as any)?.payment?.total_iqd_out, ' IQD') }}</b>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Footer Section -->
                <div class="invoice-footer">
                    <div class="footer-container">
                        <div class="footer-left">
                            <p class="thank-you">{{ t('invoice.footer.thankYou') }}</p>
                        </div>
                        <div class="footer-right">
                            <p class="contact-info">
                                <span class="phone">{{ t('invoice.footer.phone') }}: <span dir="ltr">{{ (me as
                                        any)?.phone }}</span></span>
                            </p>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p class="copyright">{{ t('invoice.footer.copyright') }}</p>
                    </div>
                </div>

            </q-card-section>
        </q-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import type { List } from 'src/types/item_transaction';
import { formatCurrency } from 'src/composables/useFormat';
import printJS from 'print-js';
import { useMeStore } from 'src/stores/meStore';

const brandLogo = '/brand.jpg';

const me = useMeStore().me;

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const transactionStore = useItemTransactionStore();

// State
const transaction = ref<List | null>(null);
const loading = ref(false);

// Get transaction ID from route params
const transactionId = computed(() => route.params.id as string);

const transactionDetails = computed(() => [
    {
        label: t('itemTransaction.transactionType'),
        value: transaction.value?.type === 'sell'
            ? t('transaction.types.sell')
            : t('transaction.types.purchase')
    },
    {
        label: t('transaction.paymentType'),
        value: transaction.value?.payment_type || '—'
    },
    {
        label: t('warehouse.warehouse'),
        value: transaction.value?.warehouse?.name || '—'
    },
    {
        label: t('exchange.rate'),
        value: formatCurrency((transaction.value as any)?.usd_iqd_rate, ' IQD')
    },
    {
        label: t('customer.customer'),
        value: transaction.value?.customer?.name || '—'
    },
    {
        label: t('customer.columns.phone'),
        value: (transaction.value?.customer as any)?.fphone || '—'
    }
]);

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

const printInvoice = () => {
    printJS({
        printable: 'invoice-container', // ID of your div
        type: 'html',
        targetStyles: ['*'] // Keep all styles
    });
};

const goBack = () => {
    router.back();
};

// Format currency display based on transaction currency
const formatCurrencyDisplay = (amount: any) => {
    // Ensure amount is a valid number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return '0.00';
    }

    const currency = (transaction.value as any)?.currency || 'USD';

    if (currency === 'IQD') {
        return `${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} IQD`;
    } else {
        return `$${numericAmount.toFixed(2)}`;
    }
};

// Fetch transaction data on mount
onMounted(async () => {
    if (transactionId.value) {
        loading.value = true;
        try {
            const transactionData = await transactionStore.fetchSingleTransaction(transactionId.value);
            if (transactionData) {
                transaction.value = transactionData;
            }
        } catch (error) {
            console.error('Failed to fetch transaction:', error);
        } finally {
            loading.value = false;
        }
    }
});
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

/* Hover effect for on-screen */
@media screen {
    .invoice-items-table tbody tr:hover {
        background: #f1f7ff;
    }
}


#invoice-container {
    width: 800px;
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
    ;
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

// .price-row {
    // display: flex;
    // justify-content: space-between;
    // gap: 1rem;
// }

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
    padding: 15px 20px;
    border-top: 2px solid #4CAF50;
    font-size: 0.85rem;
    color: #333;
    width: 100%;
    box-sizing: border-box;

    .footer-container {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-bottom: 8px;
    }

    .footer-left,
    .footer-right {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .footer-left .thank-you {
        font-weight: 600;
        font-size: 1rem;
        color: #222;
    }

    .footer-right .contact-info {
        font-size: 0.85rem;
        color: #444;

        .phone {
            font-weight: 500;
        }
    }

    .footer-bottom {
        text-align: center;
        font-size: 0.8rem;
        color: #555;
        margin-top: 5px;
    }

    /* Print Styles */
    @media print {
        border-top: 2px solid #000 !important;
        color: #000 !important;

        .footer-left .thank-you,
        .footer-right .contact-info,
        .footer-bottom p {
            color: #000 !important;
        }

        .footer-container {
            flex-wrap: nowrap !important;
            /* keep left/right on same line */
            justify-content: space-between !important;
        }

        .footer-left,
        .footer-right {
            flex: 0 0 auto !important;
            /* prevent shrinking */
            min-width: 40% !important;
            /* ensure enough space */
        }

        .footer-left p,
        .footer-right p {
            white-space: nowrap !important;
            /* prevent line break */
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        .footer-bottom p {
            text-align: center !important;
            white-space: normal !important;
            /* allow wrap if really long */
        }
    }
}

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
    width: 500px;
    /* Slightly smaller for better proportions */
    height: 500px;
    object-fit: contain;
    /* Removed grayscale filter to show brand colors */
  }
}
</style>
