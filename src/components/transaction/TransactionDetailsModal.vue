<template>
    <q-dialog v-model="isVisible" class="transaction-details-dialog" :maximized="$q.screen.lt.md"
        :full-width="$q.screen.lt.md">
        <q-card class="transaction-details-card">
            <!-- Beautiful Modal Header -->
            <div class="modal-header">
                <div class="text-h5">
                    <q-icon :name="transactionTypeIcon" class="q-mr-sm" />
                    {{ t('transaction.transactionDetails') }}
                </div>
                <q-btn icon="close" flat round v-close-popup size="sm" />
            </div>

            <!-- Scrollable Content Area -->
            <q-card-section v-if="transactionData" class="q-pa-md scroll-area">
                <!-- Transaction Summary Cards -->
                <div class="transaction-summary q-mb-md">
                    <div class="row q-col-gutter-md">
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="summary-item">
                                <q-icon name="receipt" class="summary-icon text-primary" />
                                <div>
                                    <div class="summary-label">{{ t('transaction.transactionId') }}</div>
                                    <div class="summary-value">#{{ transactionData.id }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="summary-item">
                                <q-icon name="swap_horiz" class="summary-icon text-blue" />
                                <div>
                                    <div class="summary-label">{{ t('transaction.type') }}</div>
                                    <div class="summary-value text-capitalize">{{ transactionData.type }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="summary-item">
                                <q-icon name="calendar_today" class="summary-icon text-orange" />
                                <div>
                                    <div class="summary-label">{{ t('transaction.date') }}</div>
                                    <div class="summary-value">{{ formatDate(transactionData.created_at) }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="summary-item">
                                <q-icon name="info" class="summary-icon text-purple" />
                                <div>
                                    <div class="summary-label">{{ t('transaction.status') }}</div>
                                    <div class="summary-value">
                                        <q-chip :color="getStatusColor(transactionData.status || 'completed')"
                                            text-color="white" size="sm">
                                            {{ t(`transaction.statusTypes.${transactionData.status || 'completed'}`) }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Customer Information -->
                <div class="customer-section q-mb-md">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="person" class="q-mr-sm" />
                        {{ transactionData.type === 'purchase' ? t('transaction.supplierInfo') :
                            t('transaction.customerInfo') }}
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-md-6 col-xs-12">
                            <div class="info-card">
                                <q-icon name="person" class="info-icon text-blue" />
                                <div class="info-label">{{ t('transaction.name') }}</div>
                                <div class="info-value">{{ transactionData.customer?.name || t('common.notSet') }}</div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <div class="info-card">
                                <q-icon name="place" class="info-icon text-green" />
                                <div class="info-label">{{ t('transaction.location') }}</div>
                                <div class="info-value">{{ transactionData.customer?.place || t('common.notSet') }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <div class="info-card">
                                <q-icon name="phone" class="info-icon text-orange" />
                                <div class="info-label">{{ t('transaction.phone') }}</div>
                                <div class="info-value" dir="ltr">{{ formatPhoneNumber(transactionData.customer?.fphone) || t('common.notSet') }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xs-12">
                            <div class="info-card">
                                <q-icon name="account_balance_wallet" class="info-icon text-red" />
                                <div class="info-label">{{ t('transaction.purchaseBorrow') }}</div>
                                <div class="info-value text-weight-bold">
                                    {{ formatCurrency(transactionData.customer?.purchase_borrow || 0) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Warehouse Information -->
                <div class="warehouse-section q-mb-md">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="warehouse" class="q-mr-sm" />
                        {{ t('transaction.warehouseInfo') }}
                    </div>

                    <div class="row q-col-gutter-md items-center">
                        <div class="col-md-3 col-xs-12">
                            <div class="info-card">
                                <q-icon name="warehouse" class="info-icon text-indigo" />
                                <div class="info-label">{{ t('itemTransaction.branch') }}</div>
                                <div class="info-value">{{ transactionData.warehouse?.branch_name || t('common.notSet') }}</div>
                            </div>
                        </div>
                        <div class="col-md-5 col-xs-12">
                            <div class="info-card">
                                <q-icon name="warehouse" class="info-icon text-indigo" />
                                <div class="info-label">{{ t('transaction.warehouseName') }}</div>
                                <div class="info-value">{{ transactionData.warehouse?.name || t('common.notSet') }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2 col-xs-12">
                            <div class="info-card" style="padding: 0;">
                                <q-icon name="qr_code" class="info-icon text-cyan" />
                                <div class="info-label">{{ t('transaction.warehouseCode') }}</div>
                                <div class="info-value">{{ transactionData.warehouse?.code || t('common.notSet') }}
                                </div>
                            </div>
                            <div class="info-card" style="padding: 0;">
                                <q-icon name="inventory" class="info-icon text-teal" />
                                <div class="info-label">{{ t('transaction.capacity') }}</div>
                                <div class="info-value">{{ transactionData.warehouse?.capacity || t('common.notSet') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Financial Summary -->
                <div class="financial-section q-mb-md">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="monetization_on" class="q-mr-sm" />
                        {{ t('transaction.financialSummary') }}
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card total-price price-box">
                                <q-icon name="attach_money" class="price-icon text-blue" />
                                <div class="price-label">{{ t('transaction.totalPrice') }}</div>
                                <div class="price-value text-blue">{{
                                    formatCurrency(transactionData.original_total_price) }}
                                </div>
                            </div>
                        </div>
                        <div v-if="transactionData.discounted_rate && transactionData.discounted_rate > 0"
                            class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card discount-rate price-box">
                                <q-icon name="percent" class="price-icon text-orange" />
                                <div class="price-label">{{ t('transaction.discountRate') }}</div>
                                <div class="price-value text-orange">{{ transactionData.discounted_rate }}%</div>
                            </div>
                        </div>
                        <div v-if="transactionData.discounted_price && transactionData.discounted_price !== transactionData.total_price"
                            class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card discounted-price price-box">
                                <q-icon name="local_offer" class="price-icon text-purple" />
                                <div class="price-label">{{ t('transaction.discountedPrice') }}</div>
                                <div class="price-value text-purple">{{ formatCurrency(transactionData.discounted_price)
                                }}</div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card paid-price price-box">
                                <q-icon name="check_circle" class="price-icon text-green" />
                                <div class="price-label">{{ t('transaction.paidPrice') }}</div>
                                <div class="price-value text-green">{{ formatCurrency(transactionData.paid_price) }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card unpaid-price price-box">
                                <q-icon name="schedule" class="price-icon text-pink" />
                                <div class="price-label">{{ t('transaction.unpaidPrice') }}</div>
                                <div class="price-value text-pink">{{ formatCurrency(transactionData.unpaid_price) }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12"
                            v-if="(transactionData).forgiven_price && (transactionData).forgiven_price > 0">
                            <div class="price-card unpaid-price price-box">
                                <q-icon name="money_off" class="price-icon text-red" />
                                <div class="price-label">
                                    {{ t('transactionAlpha.forgivenPrice') }}
                                    <q-icon name="help_outline" size="1rem" />

                                    <q-tooltip anchor="top middle" self="bottom middle" max-width="200px">
                                        {{ t('transactionAlpha.forgivenPriceTooltip') }}
                                    </q-tooltip>
                                </div>
                                <div class="price-value text-red">{{ formatCurrency(transactionData.forgiven_price,
                                    'IQD') }}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card exchange-rate price-box">
                                <q-icon name="currency_exchange" class="price-icon text-amber" />
                                <div class="price-label">{{ t('transaction.exchangeRate') }}</div>
                                <div class="price-value text-amber">{{ transactionData.usd_iqd_rate }} {{
                                    t('common.iqdPerUsd') }}</div>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card payment-type price-box">
                                <q-icon name="payment" class="price-icon text-indigo" />
                                <div class="price-label">{{ t('transaction.paymentType') }}</div>
                                <div class="price-value text-indigo">{{ transactionData.payment_type }}</div>
                            </div>
                        </div>
                        <div v-if="transactionData.is_editable !== undefined" class="col-md-3 col-sm-6 col-xs-12">
                            <div class="price-card edit-status price-box">
                                <q-icon :name="transactionData.is_editable ? 'edit' : 'lock'"
                                    :class="transactionData.is_editable ? 'price-icon text-green' : 'price-icon text-red'" />
                                <div class="price-label">{{ t('transaction.editability') }}</div>
                                <div
                                    :class="transactionData.is_editable ? 'price-value text-green' : 'price-value text-red'">
                                    {{ transactionData.is_editable ? t('transaction.editable') : t('transaction.locked')
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Items List -->
                <div class="items-section q-mb-md">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="inventory_2" class="q-mr-sm" />
                        {{ t('transaction.itemsList') }} ({{ transactionData.items?.length || 0 }})
                    </div>

                    <div v-if="transactionData.items?.length" class="items-container">
                        <q-list separator bordered class="rounded-borders q-pa-sm bg-grey-1">
                            <q-item v-for="(item, index) in transactionData.items" :key="`item-${index}`"
                                class="q-mb-sm q-pa-md rounded-borders shadow-1 bg-white">

                                <!-- Left: Item name + ID -->
                                <q-item-section>
                                    <q-item-label class="text-subtitle1 text-weight-bold text-primary">
                                        {{ item.name }}
                                    </q-item-label>
                                    <q-item-label caption class="text-grey-6">
                                        ID: {{ item.id }}
                                    </q-item-label>
                                </q-item-section>

                                <!-- Right: Details badges -->
                                <q-item-section side top>
                                    <div class="q-gutter-xs flex column items-end">
                                        <q-chip color="blue-2" text-color="blue-10" icon="inventory" size="sm" square>
                                            {{ t('transaction.quantity') }}: {{ formatNumber(item.quantity) }}
                                        </q-chip>

                                        <q-chip color="green-2" text-color="green-10" icon="attach_money" size="sm"
                                            square>
                                            {{ t('transaction.unitPrice') }}: {{ formatCurrency(item.unit_price) }}
                                        </q-chip>

                                        <q-chip color="purple-2" text-color="purple-10" icon="calculate" size="sm"
                                            square>
                                            {{ t('transaction.subtotal') }}:
                                            {{ formatCurrency(item.quantity * item.unit_price) }}
                                        </q-chip>
                                    </div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </div>
                    <div v-else class="no-items text-center q-py-lg">
                        <q-icon name="inventory_2" size="lg" class="text-grey-4 q-mb-md" />
                        <div class="text-grey-6">{{ t('transaction.noItems') }}</div>
                    </div>
                </div>

                <!-- Transaction Note -->
                <div v-if="transactionData.note" class="note-section q-mb-md">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="note" class="q-mr-sm" />
                        {{ t('transaction.note') }}
                    </div>
                    <div class="note-content">
                        <q-card flat bordered class="note-card">
                            <q-card-section>
                                <div class="text-body2">{{ transactionData.note }}</div>
                            </q-card-section>
                        </q-card>
                    </div>
                </div>

                <!-- Refund Information -->
                <div v-if="transactionData.refunded" class="refund-section q-mb-md">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="undo" class="q-mr-sm" />
                        {{ t('transaction.refundInfo') }}
                    </div>
                    <div class="refund-alert">
                        <q-banner rounded class="bg-orange-1 text-orange-8 q-mb-md">
                            <template v-slot:avatar>
                                <q-icon name="warning" color="orange" />
                            </template>
                            {{ t('transaction.transactionRefunded') }}
                        </q-banner>
                    </div>
                </div>

                <!-- Borrowed Amount Information -->
                <div v-if="(transactionData.old_borrowed_price || 0) > 0 || (transactionData.new_borrowed_price || 0) > 0"
                    class="borrow-section">
                    <q-separator class="q-my-md" />
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        <q-icon name="account_balance" class="q-mr-sm" />
                        {{ t('transaction.borrowInfo') }}
                    </div>
                    <div class="row q-col-gutter-md">
                        <div class="col-6">
                            <div class="info-card">
                                <q-icon name="history" class="info-icon text-grey" />
                                <div class="info-label">{{ t('transaction.oldBorrowed') }}</div>
                                <div class="info-value">{{ formatCurrency(transactionData.old_borrowed_price || 0) }}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="info-card">
                                <q-icon name="trending_up" class="info-icon text-orange" />
                                <div class="info-label">{{ t('transaction.newBorrowed') }}</div>
                                <div class="info-value">{{ formatCurrency(transactionData.new_borrowed_price || 0) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </q-card-section>

            <!-- Action Buttons -->
            <q-card-actions align="right" class="q-pa-md actions-sticky">
                <q-btn flat :label="t('common.close')" color="grey-6" v-close-popup />
                <q-btn color="primary" :label="t('transaction.viewInvoice')" icon="receipt"
                    @click="$emit('view-invoice')" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatCurrency, formatNumber, formatPhoneNumber } from 'src/composables/useFormat'
import { date } from 'quasar'
import type { List } from 'src/types/item_transaction'

interface Props {
    modelValue: boolean
    transactionData: List | null
}

interface Emits {
    (_e: 'update:modelValue', _value: boolean): void
    (_e: 'view-invoice'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const isVisible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
})

const transactionTypeIcon = computed(() => {
    return props.transactionData?.type === 'purchase' ? 'shopping_cart' : 'sell'
})

const formatDate = (dateString: string) => {
    return date.formatDate(dateString, 'YYYY-MM-DD')
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'green'
        case 'reserved': return 'orange'
        case 'cancelled': return 'red'
        default: return 'grey'
    }
}
</script>

<style lang="scss" scoped>
.transaction-details-dialog {
    .transaction-details-card {
        max-width: 1000px;
        width: 90vw;
        max-height: 90vh;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
}

.scroll-area {
    overflow-y: auto;
    flex: 1;
    max-height: calc(90vh - 140px); // Account for header and actions

    // Custom scrollbar styling
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;

        &:hover {
            background: #a8a8a8;
        }
    }
}

.modal-header {
    background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
    color: white;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .text-h5 {
        font-weight: 600;
        display: flex;
        align-items: center;
    }
}

.actions-sticky {
    background: white;
    border-top: 1px solid #e0e0e0;
    flex-shrink: 0;
}

.summary-item,
.info-card,
.price-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
}

.summary-item {
    box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.25);
    height: 78px;
    overflow: hidden;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        transform: translateY(-1px);
        background: #ebebeb;
    }
}

.price-card.price-box {
    box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.3);
    border: 2px solid transparent;

    &:hover {
        box-shadow: 2px 2px 16px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
        border: 2px solid #4e91cfa8;
    }
}

.summary-icon,
.info-icon,
.price-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.summary-label,
.info-label,
.price-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.summary-value,
.info-value,
.price-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
}

.price-card {
    flex-direction: column;
    text-align: center;
    gap: 8px;

    .price-icon {
        margin-bottom: 8px;
    }

    .price-value {
        font-size: 1.1rem;
        font-weight: 700;
    }
}

.item-card {
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    margin-bottom: 8px;

    &:hover {
        background: #e9ecef;
    }
}

.item-header {
    .item-name {
        font-size: 0.95rem;
        color: #495057;
        margin-bottom: 4px;
    }

    .item-id {
        font-size: 0.75rem;
        color: #6c757d;
    }
}

.item-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    .q-badge {
        font-size: 0.7rem;
        padding: 4px 8px;
    }
}

.note-card {
    background: #fff3cd;
    border-color: #ffeaa7;

    .text-body2 {
        font-style: italic;
        color: #856404;
    }
}

.no-items {
    padding: 40px 20px;
    color: #6c757d;
}

.refund-alert {
    .q-banner {
        border-left: 4px solid #ff9800;
    }
}

// Responsive adjustments
@media (max-width: 768px) {
    .transaction-details-dialog {
        .transaction-details-card {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
        }
    }

    .scroll-area {
        max-height: calc(100vh - 140px);
    }

    .summary-item,
    .info-card,
    .price-card {
        padding: 12px;
    }

    .item-details {
        align-items: flex-start;
    }

    .item-details .q-badge {
        font-size: 0.65rem;
        padding: 3px 6px;
    }
}

// Animation
.transaction-details-card {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
