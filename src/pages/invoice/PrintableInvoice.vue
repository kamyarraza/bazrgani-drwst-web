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
                    <div class="info-box">
                        <small>{{ t('itemTransaction.transactionType') }}</small>
                        <b>{{ transaction?.type === 'sell' ? t('transaction.types.sell') :
                            t('transaction.types.purchase') }}</b>
                    </div>
                    <div class="info-box">
                        <small>{{ t('transaction.paymentType') }}</small>
                        <b>{{ transaction?.payment_type || '—' }}</b>
                    </div>
                    <div class="info-box">
                        <small>{{ t('warehouse.warehouse') }}</small>
                        <b>{{ transaction?.warehouse?.name || '—' }}</b>
                    </div>
                    <div class="info-box">
                        <small>{{ t('customer.customer') }}</small>
                        <b>{{ transaction?.customer?.name || '—' }}</b>
                    </div>
                    <div class="info-box">
                        <small>{{ t('customer.columns.phone') }}</small>
                        <b>{{ (transaction?.customer as any)?.fphone || '—' }}</b>
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
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ formatCurrencyDisplay(item.unit_price) }}</td>
                                <td>{{ formatCurrencyDisplay(item.quantity * item.unit_price) }}</td>
                            </tr>
                            <tr v-for="(item, index) in transaction?.items" :key="item.id">
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import type { List } from 'src/types/item_transaction';
import { formatCurrency } from 'src/composables/useFormat';
import printJS from 'print-js';

const brandLogo = '/brand.jpg';

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

// Table columns for items
const itemColumns = computed(() => [
    {
        name: 'name',
        label: t('invoice.itemName'),
        align: 'left' as const,
        field: 'name',
        sortable: false
    },
    {
        name: 'quantity',
        label: t('invoice.quantity'),
        align: 'center' as const,
        field: 'quantity',
        sortable: false
    },
    {
        name: 'unit_price',
        label: t('invoice.unitPrice'),
        align: 'right' as const,
        field: 'unit_price',
        sortable: false
    },
    {
        name: 'total',
        label: t('invoice.total'),
        align: 'right' as const,
        field: (row: any) => row.quantity * row.unit_price,
        sortable: false
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
}

/* Hover effect for on-screen */
@media screen {
    .invoice-items-table tbody tr:hover {
        background: #f1f7ff;
    }
}


#invoice-container {
    width: 800px;
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

.info-box strong {
    font-size: 13px;
    color: #555;
    margin-bottom: 4px;
}

.info-box span {
    font-size: 14px;
    font-weight: 500;
    color: #222;
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

/* Zebra rows for better readability */
.invoice-items-table tbody tr:nth-child(even) {
    background: #e9e9e9 !important;
}
</style>
