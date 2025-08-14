<template>
    <q-dialog v-model="isVisible" persistent class="bulk-payment-dialog">
        <q-card class="modal-card" style="width: 700px; max-width: 95vw; max-height: 90vh; overflow: hidden;">
            <q-card-section class="modal-header">
                <div class="header-content">
                    <div class="icon-wrapper">
                        <q-icon name="payment" size="2rem" />
                    </div>
                    <div>
                        <h4 class="modal-title">{{ t('payment.bulkPayment.title') }}</h4>
                        <p class="modal-subtitle">{{ t('payment.bulkPayment.subtitle') }}</p>
                    </div>
                </div>
                <q-btn icon="close" flat round dense @click="close" class="close-btn" />
            </q-card-section>

            <q-separator />

            <q-card-section class="modal-body" style="overflow-y: auto; flex: 1;">
                <!-- Customer Info -->
                <div v-if="props.customer" class="customer-info-card q-mb-md">
                    <div class="info-header">
                        <q-icon name="person" class="q-mr-sm" />
                        <span class="info-title">{{ t('payment.bulkPayment.customerDetails') }}</span>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">{{ t('payment.bulkPayment.customerName') }}:</span>
                            <span class="info-value">{{ props.customer.fname }} {{ props.customer.sname }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">{{ t('payment.bulkPayment.customerPhone') }}:</span>
                            <span class="info-value">{{ props.customer.fphone }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">{{ t('payment.bulkPayment.customerType') }}:</span>
                            <span class="info-value">{{ t(`customer.${props.customer.type}`) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">{{ t('payment.bulkPayment.outstandingDebt') }}:</span>
                            <span class="info-value debt-amount">{{ formatCurrency(props.customer.purchase_borrow || 0)
                                }}</span>
                        </div>
                    </div>
                </div>

                <q-form @submit="handleSubmit" class="payment-form">
                    <!-- Exchange Rate Display -->
                    <div class="form-group">
                        <label class="form-label">
                            <q-icon name="currency_exchange" class="label-icon" />
                            {{ t('payment.bulkPayment.exchangeRateLabel') }}
                        </label>
                        <div class="exchange-rate-display">
                            <div class="rate-item">
                                <q-chip color="primary" text-color="white" icon="attach_money">
                                    1 USD = {{ formatNumber(usdIqdRate) }} IQD
                                </q-chip>
                                <q-btn flat dense round icon="refresh" @click="refreshExchangeRate"
                                    :loading="refreshingRate" class="refresh-btn"
                                    :title="t('payment.bulkPayment.refreshRate')" />
                            </div>
                        </div>
                    </div>

                    <!-- Payment Amounts Section -->
                    <div class="form-group">
                        <label class="form-label section-label">
                            <q-icon name="account_balance_wallet" class="label-icon" />
                            {{ t('payment.bulkPayment.paymentAmountsLabel') }}
                        </label>

                        <div class="payment-grid">
                            <div class="payment-item">
                                <label class="form-label">
                                    <q-icon name="currency_exchange" color="primary" size="16px" />
                                    {{ t('payment.bulkPayment.iqdAmountLabel') }}
                                </label>
                                <q-input v-model.number="form.iqd_price" type="number" min="0" step="1" outlined dense
                                    suffix="IQD" :placeholder="t('payment.bulkPayment.enterIqdAmount')"
                                    class="form-input payment-input" @input="onIqdAmountChange">
                                    <template v-slot:prepend>
                                        <q-icon name="currency_exchange" color="primary" />
                                    </template>
                                </q-input>
                            </div>

                            <div class="payment-item">
                                <label class="form-label">
                                    <q-icon name="attach_money" color="primary" size="16px" />
                                    {{ t('payment.bulkPayment.usdAmountLabel') }}
                                </label>
                                <q-input v-model.number="form.usd_price" type="number" min="0" step="0.01" outlined
                                    dense suffix="USD" :placeholder="t('payment.bulkPayment.enterUsdAmount')"
                                    class="form-input payment-input" @input="onUsdAmountChange">
                                    <template v-slot:prepend>
                                        <q-icon name="attach_money" color="primary" />
                                    </template>
                                </q-input>
                            </div>

                            <div class="payment-item">
                                <label class="form-label">
                                    <q-icon name="keyboard_return" color="warning" size="16px" />
                                    {{ t('payment.bulkPayment.iqdReturnLabel') }}
                                </label>
                                <q-input v-model.number="form.iqd_return_amount" type="number" min="0" step="1" outlined
                                    dense suffix="IQD" :placeholder="t('payment.bulkPayment.enterIqdReturn')"
                                    class="form-input return-input">
                                    <template v-slot:prepend>
                                        <q-icon name="keyboard_return" color="warning" />
                                    </template>
                                </q-input>
                            </div>

                            <div class="payment-item">
                                <label class="form-label">
                                    <q-icon name="keyboard_return" color="warning" size="16px" />
                                    {{ t('payment.bulkPayment.usdReturnLabel') }}
                                </label>
                                <q-input v-model.number="form.usd_return_amount" type="number" min="0" step="0.01"
                                    outlined dense suffix="USD" :placeholder="t('payment.bulkPayment.enterUsdReturn')"
                                    class="form-input return-input">
                                    <template v-slot:prepend>
                                        <q-icon name="keyboard_return" color="warning" />
                                    </template>
                                </q-input>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Card -->
                    <div class="summary-card q-mb-md">
                        <div class="summary-header">
                            <q-icon name="calculate" class="q-mr-sm" />
                            <span class="summary-title">{{ t('payment.bulkPayment.paymentSummary') }}</span>
                        </div>
                        <div class="summary-content">
                            <div class="summary-row">
                                <span class="summary-label">{{ t('payment.bulkPayment.totalPayment') }}:</span>
                                <span class="summary-value payment-total">${{ formatCurrency(totalPaymentAmount)
                                    }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">{{ t('payment.bulkPayment.totalReturn') }}:</span>
                                <span class="summary-value return-total">${{ formatCurrency(totalReturnAmount) }}</span>
                            </div>
                            <div class="summary-row total-row">
                                <span class="summary-label">{{ t('payment.bulkPayment.netPayment') }}:</span>
                                <span class="summary-value net-total">${{ formatCurrency(netPaymentAmount) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Note Section -->
                    <div class="form-group">
                        <label class="form-label">
                            <q-icon name="note" class="label-icon" />
                            {{ t('payment.bulkPayment.noteLabel') }}
                        </label>
                        <q-input v-model="form.note" type="textarea" outlined dense :rows="3"
                            :placeholder="t('payment.bulkPayment.notePlaceholder')" class="form-input note-input" />
                    </div>
                </q-form>
            </q-card-section>

            <q-separator />

            <q-card-actions class="modal-actions">
                <q-btn flat :label="t('common.cancel')" @click="close" class="cancel-btn" />
                <q-btn color="primary" :label="t('payment.bulkPayment.processPayment')" @click="handleSubmit"
                    :loading="loading" :disable="!canSubmit" class="submit-btn" icon="payment" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useCustomerStore } from 'src/stores/customerStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import type { Customer } from 'src/types/customer';

interface Props {
    modelValue: boolean;
    customer?: Customer | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'success': [];
}>();

// Store
const customerStore = useCustomerStore();
const exchangeRateStore = useExchangeRateStore();
const $q = useQuasar();
const { t } = useI18n();

// Local state
const isVisible = ref(false);
const loading = ref(false);
const refreshingRate = ref(false);

const form = ref({
    note: '',
    iqd_price: 0,
    usd_price: 0,
    iqd_return_amount: 0,
    usd_return_amount: 0
});

// Computed
const usdIqdRate = computed(() => exchangeRateStore.activeRate?.usd_iqd_rate || 1500);

const totalPaymentAmount = computed(() => {
    const iqdInUsd = (form.value.iqd_price || 0) / usdIqdRate.value;
    return iqdInUsd + (form.value.usd_price || 0);
});

const totalReturnAmount = computed(() => {
    const iqdInUsd = (form.value.iqd_return_amount || 0) / usdIqdRate.value;
    return iqdInUsd + (form.value.usd_return_amount || 0);
});

const netPaymentAmount = computed(() => {
    return totalPaymentAmount.value - totalReturnAmount.value;
});

const canSubmit = computed(() => {
    const hasPayment = (form.value.iqd_price || 0) > 0 || (form.value.usd_price || 0) > 0;
    return hasPayment && props.customer && !loading.value;
});

// Methods
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
};

const onIqdAmountChange = () => {
    // Payment amounts changed - calculation handled by computed properties
};

const onUsdAmountChange = () => {
    // Payment amounts changed - calculation handled by computed properties
};

const refreshExchangeRate = async () => {
    refreshingRate.value = true;
    try {
        await exchangeRateStore.fetchActiveExchangeRate();
        $q.notify({
            type: 'positive',
            message: t('payment.bulkPayment.exchangeRateRefreshed'),
            position: 'top'
        });
    } catch (error) {
        console.error('Error refreshing exchange rate:', error);
        $q.notify({
            type: 'negative',
            message: t('payment.bulkPayment.exchangeRateRefreshError'),
            position: 'top'
        });
    } finally {
        refreshingRate.value = false;
    }
};

// Initialize exchange rate on mount
onMounted(async () => {
    if (!exchangeRateStore.activeRate) {
        await exchangeRateStore.fetchActiveExchangeRate();
    }
});

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
    isVisible.value = newVal;
    if (newVal) {
        resetForm();
    }
});

watch(isVisible, (newVal) => {
    emit('update:modelValue', newVal);
});

// Methods
const close = () => {
    isVisible.value = false;
    resetForm();
};

const resetForm = () => {
    form.value = {
        note: '',
        iqd_price: 0,
        usd_price: 0,
        iqd_return_amount: 0,
        usd_return_amount: 0
    };
};

const handleSubmit = async () => {
    if (!props.customer) {
        $q.notify({
            type: 'negative',
            message: t('payment.bulkPayment.errors.customerRequired'),
            position: 'top'
        });
        return;
    }

    // Validate that at least one payment amount is provided
    const hasPayment = (form.value.iqd_price || 0) > 0 || (form.value.usd_price || 0) > 0;
    if (!hasPayment) {
        $q.notify({
            type: 'negative',
            message: t('payment.bulkPayment.errors.paymentAmountRequired'),
            position: 'top'
        });
        return;
    }

    try {
        loading.value = true;

        const paymentData = {
            customer_id: props.customer.id,
            iqd_price: form.value.iqd_price || 0,
            usd_price: form.value.usd_price || 0,
            iqd_return_amount: form.value.iqd_return_amount || 0,
            usd_return_amount: form.value.usd_return_amount || 0,
            note: form.value.note || ''
        };

        await customerStore.bulkPaymentReceive(props.customer.id, paymentData);

        $q.notify({
            type: 'positive',
            message: t('payment.bulkPayment.success.paymentSuccessful'),
            position: 'top'
        });

        emit('success');
        close();
    } catch (error) {
        console.error('Error processing bulk payment:', error);
        $q.notify({
            type: 'negative',
            message: t('payment.bulkPayment.errors.paymentFailed'),
            position: 'top'
        });
    } finally {
        loading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.bulk-payment-dialog {
    .modal-card {
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        background: linear-gradient(135deg, #1976d2, #1565c0);
        color: white;
        padding: 20px 24px;

        .header-content {
            display: flex;
            align-items: center;
            gap: 16px;

            .icon-wrapper {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-title {
                margin: 0 0 4px 0;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .modal-subtitle {
                margin: 0;
                opacity: 0.9;
                font-size: 0.95rem;
            }
        }

        .close-btn {
            color: white;
            margin-left: auto;
        }
    }

    .modal-body {
        padding: 24px;
    }

    .customer-info-card {
        background: linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.1));
        border: 1px solid rgba(25, 118, 210, 0.2);
        border-radius: 12px;
        padding: 20px;

        .info-header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            color: #1976d2;
            font-weight: 600;
            font-size: 1.1rem;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);

            &:last-child {
                border-bottom: none;
            }

            .info-label {
                font-weight: 500;
                color: #666;
                font-size: 0.9rem;
            }

            .info-value {
                font-weight: 600;
                color: #2c3e50;

                &.debt-amount {
                    color: #e74c3c;
                    font-size: 1.1rem;
                }
            }
        }
    }

    .form-group {
        margin-bottom: 24px;

        .form-label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 500;
            color: #2c3e50;

            &.section-label {
                font-size: 1.1rem;
                font-weight: 600;
                color: #1976d2;
                margin-bottom: 16px;
            }

            .label-icon {
                color: #1976d2;
            }
        }

        .form-input {
            margin-bottom: 8px;
        }
    }

    .exchange-rate-display {
        .rate-item {
            display: flex;
            align-items: center;
            gap: 12px;

            .refresh-btn {
                background: rgba(25, 118, 210, 0.1);
                color: #1976d2;

                &:hover {
                    background: rgba(25, 118, 210, 0.2);
                }
            }
        }
    }

    .payment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;

        .payment-item {
            .payment-input {
                border: 2px solid rgba(25, 118, 210, 0.2);

                &:focus-within {
                    border-color: #1976d2;
                }
            }

            .return-input {
                border: 2px solid rgba(245, 166, 35, 0.2);

                &:focus-within {
                    border-color: #f5a623;
                }
            }
        }
    }

    .summary-card {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(76, 175, 80, 0.1));
        border: 1px solid rgba(76, 175, 80, 0.2);
        border-radius: 12px;
        padding: 20px;

        .summary-header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            color: #4caf50;
            font-weight: 600;
            font-size: 1.1rem;
        }

        .summary-content {
            .summary-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);

                &:last-child {
                    border-bottom: none;
                }

                &.total-row {
                    background: rgba(76, 175, 80, 0.1);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 8px -8px;
                    border: 1px solid rgba(76, 175, 80, 0.3) !important;

                    .summary-label {
                        font-weight: 700;
                        color: #4caf50;
                        font-size: 1rem;
                    }

                    .summary-value {
                        font-size: 1.1rem !important;
                        font-weight: 700 !important;
                        color: #4caf50 !important;
                    }
                }

                .summary-label {
                    font-weight: 500;
                    color: #666;
                    font-size: 0.9rem;
                }

                .summary-value {
                    font-weight: 600;
                    font-size: 0.95rem;

                    &.payment-total {
                        color: #1976d2;
                    }

                    &.return-total {
                        color: #f5a623;
                    }

                    &.net-total {
                        color: #4caf50;
                    }
                }
            }
        }
    }

    .note-input {
        :deep(.q-field__control) {
            min-height: 80px;
        }
    }

    .modal-actions {
        padding: 20px 24px;
        background: #f8f9fa;
        border-top: 1px solid rgba(0, 0, 0, 0.1);

        .cancel-btn {
            color: #666;
            font-weight: 500;
        }

        .submit-btn {
            background: linear-gradient(135deg, #1976d2, #1565c0);
            color: white;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 8px;
        }
    }
}
</style>
