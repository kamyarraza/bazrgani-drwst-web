<template>
    <q-dialog v-model="isVisible" persistent maximized transition-show="slide-up" transition-hide="slide-down">
        <div class="modal-backdrop">
            <q-card class="professional-modal">
                <!-- Header -->
                <div class="modal-header cute-header">
                    <div class="header-content">
                        <div class="header-left">
                            <div class="transaction-icon-wrapper cute-icon">
                                <q-icon name="edit" size="24px" class="transaction-icon bouncy" />
                            </div>
                            <div class="header-text">
                                <h1 class="modal-title cute-title">
                                    {{ transactionType === 'purchase' ? '🛒' : '💰' }}
                                    {{ t('transaction.editTransaction') }} - {{ transactionTypeLabel }}
                                </h1>
                            </div>
                        </div>
                        <q-btn flat round dense icon="close" @click="handleCancel" class="close-button cute-close"
                            size="md" />
                    </div>
                </div>

                <!-- Loading state -->
                <div v-if="!transactionData" class="loading-container">
                    <q-spinner color="primary" size="3em" />
                    <div class="q-mt-md">{{ t('common.loading') }}</div>
                </div>

                <!-- Edit Form -->
                <div v-else class="modal-content edit-content">
                    <q-form @submit="handleSubmit" class="full-height">
                        <div class="form-sections">
                            <!-- Customer/Supplier Section -->
                            <q-card flat bordered class="form-section">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="person" class="q-mr-sm" />
                                        {{ transactionType === 'purchase' ? t('customer.supplier') :
                                        t('customer.customer') }}
                                    </div>
                                    <q-select v-model="formData.customer_id" :options="customerOptions" outlined dense
                                        :label="transactionType === 'purchase' ? t('customer.selectSupplier') : t('customer.selectCustomer')"
                                        option-value="id" option-label="name" emit-value map-options class="q-mt-sm"
                                        :rules="[val => val || t('validation.customerRequired')]" />
                                </q-card-section>
                            </q-card>

                            <!-- Branch Section (for admin users) -->
                            <q-card flat bordered class="form-section" v-if="!isEmployee">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="business" class="q-mr-sm" />
                                        {{ t('branch.branch') }}
                                    </div>
                                    <q-select v-model="formData.branch_id" :options="branchOptions" outlined dense
                                        :label="t('branch.selectBranch')" option-value="id" option-label="name"
                                        emit-value map-options class="q-mt-sm"
                                        :rules="[val => val || t('validation.branchRequired')]"
                                        @update:model-value="handleBranchChange" />
                                </q-card-section>
                            </q-card>

                            <!-- Warehouse Section -->
                            <q-card flat bordered class="form-section">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="warehouse" class="q-mr-sm" />
                                        {{ t('transaction.warehouse') }}
                                    </div>
                                    <q-select v-model="formData.warehouse_id" :options="warehouseOptions" outlined dense
                                        :label="t('warehouse.selectWarehouse')" option-value="id" option-label="name"
                                        emit-value map-options class="q-mt-sm"
                                        :rules="[val => val || t('validation.warehouseRequired')]"
                                        :disable="!formData.branch_id" />
                                </q-card-section>
                            </q-card>

                            <!-- Payment Type Section -->
                            <q-card flat bordered class="form-section">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="payment" class="q-mr-sm" />
                                        {{ t('transaction.paymentType') }}
                                    </div>
                                    <q-select v-model="formData.payment_type" :options="paymentTypeOptions" outlined
                                        dense :label="t('transaction.selectPaymentType')" class="q-mt-sm"
                                        :rules="[val => val || t('validation.paymentTypeRequired')]" />
                                </q-card-section>
                            </q-card>

                            <!-- Transaction Status Section (for sell transactions) -->
                            <q-card flat bordered class="form-section" v-if="transactionType === 'sell'">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="info" class="q-mr-sm" />
                                        {{ t('transaction.status') }}
                                    </div>
                                    <q-option-group v-model="formData.status" :options="statusOptions" type="radio"
                                        color="primary" inline class="q-mt-sm" />
                                </q-card-section>
                            </q-card>

                            <!-- Discount Rate Section (for sell transactions) -->
                            <q-card flat bordered class="form-section" v-if="transactionType === 'sell'">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="percent" class="q-mr-sm" />
                                        {{ t('transaction.discountRate') }}
                                    </div>
                                    <q-input v-model.number="formData.discounted_rate" type="number" outlined dense
                                        :label="t('transaction.discountRateLabel')" suffix="%" class="q-mt-sm"
                                        :rules="[val => val >= 0 && val <= 100 || t('validation.discountRateInvalid')]"
                                        min="0" max="100" step="0.1" />
                                </q-card-section>
                            </q-card>

                            <!-- Exchange Rate Section -->
                            <q-card flat bordered class="form-section">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="currency_exchange" class="q-mr-sm" />
                                        {{ t('transaction.exchangeRate') }}
                                    </div>
                                    <q-input v-model.number="formData.usd_iqd_rate" type="number" outlined dense
                                        :label="t('transaction.exchangeRateLabel')" suffix="IQD per USD" class="q-mt-sm"
                                        :rules="[val => val > 0 || t('transaction.exchangeRateMustBePositive')]" />
                                </q-card-section>
                            </q-card>

                            <!-- Note Section -->
                            <q-card flat bordered class="form-section">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="note" class="q-mr-sm" />
                                        {{ t('transaction.note') }}
                                    </div>
                                    <q-input v-model="formData.note" type="textarea" outlined dense
                                        :label="t('transaction.addNote')" rows="3" class="q-mt-sm" />
                                </q-card-section>
                            </q-card>

                            <!-- Items Section (Read-only) -->
                            <q-card flat bordered class="form-section">
                                <q-card-section>
                                    <div class="section-title">
                                        <q-icon name="inventory_2" class="q-mr-sm" />
                                        {{ t('transaction.items') }} ({{ transactionData.items?.length || 0 }})
                                    </div>
                                    <div class="items-info-note">
                                        <q-icon name="info" class="q-mr-sm" />
                                        {{ t('transaction.itemsCannotBeModified') }}
                                    </div>

                                    <div v-if="transactionData.items?.length" class="items-list q-mt-md">
                                        <q-list bordered separator>
                                            <q-item v-for="item in transactionData.items" :key="item.id"
                                                class="item-row">
                                                <q-item-section>
                                                    <q-item-label class="item-name">{{ item.name }}</q-item-label>
                                                    <q-item-label caption>ID: {{ item.id }}</q-item-label>
                                                </q-item-section>
                                                <q-item-section side>
                                                    <div class="item-details">
                                                        <q-chip color="blue" text-color="white" size="sm">
                                                            {{ t('transaction.quantity') }}: {{ item.quantity }}
                                                        </q-chip>
                                                        <q-chip color="green" text-color="white" size="sm">
                                                            {{ t('transaction.unitPrice') }}: {{
                                                            formatCurrency(item.unit_price) }}
                                                        </q-chip>
                                                    </div>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- Action Buttons -->
                        <div class="action-buttons">
                            <q-btn flat :label="t('common.cancel')" color="grey-6" @click="handleCancel"
                                class="q-mr-md" />
                            <q-btn type="submit" :label="t('transaction.updateTransaction')" color="primary" icon="save"
                                :loading="loading" />
                        </div>
                    </q-form>
                </div>
            </q-card>
        </div>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useItemTransactionStore } from 'src/stores/itemTransactionStore'
import { useCustomerStore } from 'src/stores/customerStore'
import { useBranchStore } from 'src/stores/branchStore'
import { useWarehouseStore } from 'src/stores/warehouseStore'
import { useAuthStore } from 'src/stores/authStore'
import { formatCurrency } from 'src/composables/useFormat'
import type { List } from 'src/types/item_transaction'

interface Props {
    modelValue: boolean
    transactionData: List | null
}

interface Emits {
    (_e: 'update:modelValue', _value: boolean): void
    (_e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const $q = useQuasar()
const transactionStore = useItemTransactionStore()
const customerStore = useCustomerStore()
const branchStore = useBranchStore()
const warehouseStore = useWarehouseStore()
const authStore = useAuthStore()

const loading = ref(false)

const isVisible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
})

const transactionType = computed(() => {
    return props.transactionData?.type as 'purchase' | 'sell'
})

const transactionTypeLabel = computed(() => {
    return transactionType.value === 'purchase' ? t('itemTransaction.purchase') : t('itemTransaction.sell')
})

// Form data
const formData = ref({
    customer_id: null as number | null,
    branch_id: null as number | null,
    warehouse_id: null as number | null,
    payment_type: '',
    status: 'completed' as 'completed' | 'reserved',
    discounted_rate: 0,
    usd_iqd_rate: 0,
    note: ''
})

// Check if user is employee
const isEmployee = computed(() => {
    return authStore.user?.type === 'employee'
})

// Computed options for dropdowns
const customerOptions = computed(() => {
    return customerStore.customers.map(customer => ({
        id: customer.id,
        name: `${customer.fname} ${customer.sname}`,
        value: customer.id,
        label: `${customer.fname} ${customer.sname}`
    }))
})

const branchOptions = computed(() => {
    return branchStore.branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        value: branch.id,
        label: branch.name
    }))
})

const warehouseOptions = computed(() => {
    return warehouseStore.warehouses.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        value: warehouse.id,
        label: warehouse.name
    }))
})

// Payment type options
const paymentTypeOptions = [
    { label: t('transaction.paymentTypes.cash'), value: 'cash' },
    { label: t('transaction.paymentTypes.borrow'), value: 'borrow' },
    { label: t('transaction.paymentTypes.credit'), value: 'credit' },
    { label: t('transaction.paymentTypes.bank'), value: 'bank' }
]

// Status options for sell transactions
const statusOptions = [
    { label: t('transaction.statusTypes.completed'), value: 'completed' },
    { label: t('transaction.statusTypes.reserved'), value: 'reserved' }
]

// Initialize form data when transaction data changes
watch(() => props.transactionData, async (newData) => {
    if (newData) {
        formData.value = {
            customer_id: newData.customer?.id || null,
            branch_id: null, // Not available in transaction data, will use default
            warehouse_id: newData.warehouse?.id || null,
            payment_type: newData.payment_type || 'cash',
            status: (newData.status as 'completed' | 'reserved') || 'completed',
            discounted_rate: newData.discounted_rate || 0,
            usd_iqd_rate: newData.usd_iqd_rate || 1500,
            note: newData.note || ''
        }
        await loadFormOptions()
    }
}, { immediate: true })

// Load options for dropdowns
const loadFormOptions = async () => {
    try {
        // Load customers (suppliers for purchase, customers for sell)
        const customerType = transactionType.value === 'purchase' ? 'supplier' : 'customer'
        await customerStore.fetchCustomers(1, customerType)

        // Load branches (if not employee)
        if (!isEmployee.value) {
            await branchStore.fetchBranches()
        }

        // Load warehouses for selected branch
        if (formData.value.branch_id) {
            await handleBranchChange()
        }
    } catch (error) {
        console.error('Error loading form options:', error)
    }
}

// Handle branch change
const handleBranchChange = async () => {
    if (formData.value.branch_id) {
        try {
            // Load warehouses for the selected branch
            await warehouseStore.fetchBranchWarehouses(formData.value.branch_id)
        } catch (error) {
            console.error('Error loading warehouses:', error)
        }
    } else {
        formData.value.warehouse_id = null
    }
}

const handleSubmit = async () => {
    if (!props.transactionData) return

    try {
        loading.value = true

        // Prepare the update data using form values
        const updateData = {
            branch_id: formData.value.branch_id || 1, // Use selected branch or default
            customer_id: formData.value.customer_id,
            warehouse_id: formData.value.warehouse_id,
            payment_type: formData.value.payment_type,
            status: formData.value.status,
            discounted_rate: formData.value.discounted_rate,
            usd_iqd_rate: formData.value.usd_iqd_rate,
            note: formData.value.note,
            created_at: props.transactionData.created_at,
            iqd_price: props.transactionData.total_price * formData.value.usd_iqd_rate,
            usd_price: props.transactionData.total_price,
            iqd_return_amount: 0,
            usd_return_amount: 0,
            details: props.transactionData.items?.map(item => ({
                item_id: item.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                solo_unit_price: item.solo_unit_price || item.unit_price,
                bulk_unit_price: item.bulk_unit_price || item.unit_price
            })) || []
        }

        // Determine the correct endpoint based on transaction type
        const endpoint = transactionType.value === 'sell'
            ? `/transactions/update/sell/${props.transactionData.id}`
            : `/transactions/update/purchase/${props.transactionData.id}`

        // Call the update API
        await transactionStore.updateTransaction(endpoint, updateData)

        // Show success notification
        $q.notify({
            type: 'positive',
            message: t('transaction.transactionUpdatedSuccessfully'),
            position: 'top-right'
        })

        // Close modal and emit success
        isVisible.value = false
        emit('success')

    } catch (error: any) {
        console.error('Error updating transaction:', error)

        // Show error notification
        $q.notify({
            type: 'negative',
            message: error?.message || t('transaction.errorUpdatingTransaction'),
            position: 'top-right'
        })
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    isVisible.value = false
}
</script>

<style lang="scss" scoped>
.modal-backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.professional-modal {
    width: 90vw;
    max-width: 900px;
    max-height: 90vh;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
    color: white;
    padding: 20px 24px;

    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .transaction-icon-wrapper {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
    }
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
}

.edit-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.form-sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.form-section {
    border-radius: 8px;

    .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--q-primary);
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .field-value {
        font-size: 0.95rem;
        color: #333;
        background: #f5f5f5;
        padding: 8px 12px;
        border-radius: 4px;
        margin-top: 4px;
    }

    .field-note {
        font-size: 0.8rem;
        color: #666;
        font-style: italic;
        margin-top: 4px;
    }

    .items-info-note {
        background: #e3f2fd;
        color: #1976d2;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
    }
}

.items-list {
    .item-row {
        background: #fafafa;

        .item-name {
            font-weight: 500;
            color: #333;
        }

        .item-details {
            display: flex;
            gap: 4px;
            flex-direction: column;
            align-items: flex-end;
        }
    }
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 0;
    border-top: 1px solid #e0e0e0;
    background: white;
    position: sticky;
    bottom: 0;
}

// Responsive adjustments
@media (max-width: 768px) {
    .modal-backdrop {
        padding: 0;
    }

    .professional-modal {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
    }

    .edit-content {
        padding: 16px;
    }

    .form-sections {
        gap: 12px;
    }

    .item-details {
        align-items: flex-start !important;
    }
}

// Animation
.professional-modal {
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
