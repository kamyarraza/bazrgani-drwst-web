<template>
    <div class="transaction-history">
        <div class="transactions-header">
            <h6>{{ t('cashbox.transactionHistory', 'Transaction History') }}</h6>
            <q-btn flat round icon="refresh" size="sm" @click="$emit('refresh')" :loading="loading" color="primary">
                <q-tooltip>{{ t('cashbox.refresh', 'Refresh') }}</q-tooltip>
            </q-btn>
        </div>

        <div class="transactions-content">
            <template v-if="transactions && transactions.length > 0">
                <div class="transactions-list">
                    <div v-for="transaction in reversedTransactions" :key="transaction.id" class="transaction-item">
                        <div class="transaction-icon-wrapper">
                            <q-icon :name="transaction.tag === 'deposit' ? 'add_circle' : 'remove_circle'"
                                :class="transaction.tag === 'deposit' ? 'deposit-icon' : 'withdraw-icon'" size="2rem" />
                        </div>

                        <div class="transaction-details">
                            <div class="transaction-main">
                                <div class="transaction-type">
                                    {{ transaction.tag === 'deposit' ? t('cashbox.deposit', 'Deposit') :
                                        t('cashbox.withdraw', 'Withdraw') }}
                                </div>
                                <div class="transaction-description" v-if="transaction.description">
                                    {{ transaction.description }}
                                </div>

                                <!-- Transaction amounts (if available) -->
                                <div class="transaction-amounts" v-if="hasAmounts(transaction)">
                                    <div class="amount-item" v-if="transaction.total_iqd">
                                        <q-chip :color="transaction.total_iqd > 0 ? 'amber-6' : 'red-6'"
                                            text-color="white" size="sm"
                                            :icon="transaction.total_iqd > 0 ? 'add_circle' : 'remove_circle'">
                                            {{ formatCurrency(Math.abs(transaction.total_iqd), 'IQD') }}
                                        </q-chip>
                                    </div>
                                    <div class="amount-item" v-if="transaction.total_usd">
                                        <q-chip :color="transaction.total_usd > 0 ? 'green-6' : 'red-6'"
                                            text-color="white" size="sm"
                                            :icon="transaction.total_usd > 0 ? 'add_circle' : 'remove_circle'">
                                            {{ formatCurrency(Math.abs(transaction.total_usd), 'USD') }}
                                        </q-chip>
                                    </div>
                                </div>
                            </div>

                            <div class="transaction-meta">
                                <div class="transaction-by">
                                    <q-icon name="person" size="16px" />
                                    {{ transaction.created_by.name }}
                                </div>
                                <div class="transaction-date">
                                    <q-icon name="schedule" size="16px" />
                                    {{ formatDate(transaction.created_at) }}
                                </div>
                            </div>
                        </div>

                        <div class="transaction-badge">
                            <div class="badge-container">
                                <q-chip :color="transaction.tag === 'deposit' ? 'green-6' : 'red-6'" text-color="white"
                                    size="md" :icon="transaction.tag === 'deposit' ? 'trending_up' : 'trending_down'"
                                    class="transaction-type-chip">
                                    {{ transaction.tag === 'deposit' ? '+' : '-' }}
                                </q-chip>

                                <!-- Total amount summary -->
                                <div class="total-summary" v-if="hasAmounts(transaction)">
                                    <div class="total-item" v-if="transaction.total_iqd">
                                        <span class="total-amount" :class="{ 'negative': transaction.total_iqd < 0 }">
                                            {{ transaction.total_iqd > 0 ? '+' : '' }}{{
                                                formatCurrency(transaction.total_iqd, 'IQD') }}
                                        </span>
                                    </div>
                                    <div class="total-item" v-if="transaction.total_usd">
                                        <span class="total-amount" :class="{ 'negative': transaction.total_usd < 0 }">
                                            {{ transaction.total_usd > 0 ? '+' : '' }}{{
                                                formatCurrency(transaction.total_usd, 'USD') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="no-transactions">
                    <div class="no-transactions-icon">
                        <q-icon name="receipt_long" size="4rem" color="grey-4" />
                    </div>
                    <h6>{{ t('cashbox.noTransactions', 'No transactions found') }}</h6>
                    <p>{{ t('cashbox.noTransactionsDesc', 'No transactions have been made yet') }}</p>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatCurrency } from 'src/composables/useFormat';
import type { CashboxTransaction } from 'src/types/cashbox';

const props = defineProps<{
    transactions?: CashboxTransaction[] | undefined;
    loading?: boolean;
}>();

defineEmits(['refresh']);

const { t } = useI18n();

// Reverse transactions to show most recent first
const reversedTransactions = computed(() => {
    if (!props.transactions) return [];
    return [...props.transactions].reverse();
});

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function hasAmounts(transaction: CashboxTransaction) {
    return transaction.total_iqd || transaction.total_usd;
}
</script>

<style lang="scss" scoped>
.transaction-history {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.transactions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 1px solid #e2e8f0;

    h6 {
        margin: 0;
        color: #475569;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
            content: '';
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
    }
}

.transactions-content {
    padding: 16px 0;
    max-height: 400px;
    overflow-y: auto;
}

.transactions-list {
    .transaction-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        border-bottom: 1px solid #f1f5f9;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.02);
        }

        &:last-child {
            border-bottom: none;
        }
    }

    .transaction-icon-wrapper {
        flex-shrink: 0;

        .deposit-icon {
            color: #10b981;
        }

        .withdraw-icon {
            color: #ef4444;
        }
    }

    .transaction-details {
        flex: 1;

        .transaction-main {
            margin-bottom: 8px;

            .transaction-type {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .transaction-description {
                color: #6b7280;
                font-size: 0.9rem;
            }

            .transaction-amounts {
                display: flex;
                gap: 8px;
                margin-top: 8px;
                flex-wrap: wrap;

                .amount-item {
                    .q-chip {
                        font-size: 0.75rem;
                        font-weight: 600;
                    }
                }
            }
        }

        .transaction-meta {
            display: flex;
            gap: 16px;
            font-size: 0.85rem;
            color: #9ca3af;

            .transaction-by,
            .transaction-date {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }

    .transaction-badge {
        flex-shrink: 0;
        display: flex;
        align-items: center;

        .badge-container {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;

            .transaction-type-chip {
                align-self: center;
            }

            .total-summary {
                display: flex;
                flex-direction: column;
                gap: 4px;
                align-items: flex-end;

                .total-item {
                    .total-amount {
                        font-size: 0.8rem;
                        font-weight: 600;
                        padding: 2px 8px;
                        border-radius: 12px;
                        background: rgba(0, 0, 0, 0.05);
                        color: #10b981;

                        &.negative {
                            color: #ef4444;
                        }
                    }
                }
            }
        }
    }
}

.no-transactions {
    text-align: center;
    padding: 40px 24px;
    color: #6b7280;

    .no-transactions-icon {
        margin-bottom: 16px;
    }

    h6 {
        margin: 0 0 8px 0;
        color: #9ca3af;
    }

    p {
        margin: 0;
        font-size: 0.9rem;
    }
}

// Responsive
@media (max-width: 768px) {
    .transactions-content {
        max-height: 300px;
    }

    .transaction-item {
        padding: 12px 16px !important;
        gap: 12px !important;

        .transaction-meta {
            flex-direction: column;
            gap: 4px !important;
        }

        .transaction-badge {
            .badge-container {
                .total-summary {
                    .total-item {
                        .total-amount {
                            font-size: 0.7rem !important;
                            padding: 1px 6px !important;
                        }
                    }
                }
            }
        }
    }

    .transactions-header {
        padding: 16px 16px !important;
    }
}
</style>
