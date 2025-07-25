<template>
    <q-page class="q-pa-md">
        <!-- Transaction Dashboard Header Card -->
        <Header
            :title="t('transaction.header')"
            :subtitle="t('transaction.subtitle')"
            icon="receipt_long"
            icon-size="3rem"
            icon-color="white"
            :show-waves="true"
            background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
        />

        <!-- Transaction Type Toggle -->
        <q-card flat bordered class="q-mb-md">
            <q-card-section class="q-pa-lg">
                <div class="row items-center justify-between">
                    <div class="row items-center">
                        <q-btn-toggle
                            v-model="transactionType"
                            toggle-color="primary"
                            :options="[
                                { label: t('itemTransaction.purchase'), value: 'purchase' },
                                { label: t('itemTransaction.sell'), value: 'sell' }
                            ]"
                            @update:model-value="handleTypeChange"
                            class="q-mr-md"
                        />
                    </div>
                    <q-btn
                        :label="t('itemTransaction.addNew', { type: transactionType === 'purchase' ? t('itemTransaction.purchase') : t('itemTransaction.sell') })"
                        icon="add"
                        color="primary"
                        @click="showAddModal = true"
                        no-caps
                    />
                </div>
            </q-card-section>
        </q-card>

        <!-- Sticky Notes Overlay (absolute, not in normal flow) -->
        <div class="sticky-notes-overlay">
            <div v-for="(note, idx) in notes" :key="note.id" style="margin-bottom: 12px;">
                <Note :model-value="note" @update:model-value="val => { notes[idx] = { ...notes[idx], ...val } }" @close="removeNote(note.id)" />
            </div>
        </div>

        <!-- Search Section -->
        <div class="row q-col-gutter-md q-mb-md">
            <div class="col-md-8 col-sm-8 col-xs-12">
                <q-input
                    v-model="filters.search"
                    outlined
                    dense
                    clearable
                    :label="t('transaction.searchLabel', 'Search by customer name or note')"
                    class="full-width"
                    @update:model-value="handleSearchChange"
                >
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col-md-4 col-sm-4 col-xs-12">
                <q-btn
                    color="primary"
                    class="full-width elegant-reset-btn"
                    icon="refresh"
                    outline
                    :label="t('transaction.resetFilters', 'Reset')"
                    @click="resetFilters"
                />
            </div>
        </div>

        <!-- Transaction Table with Enhanced UI -->
        <QtableB
        :top-right="false"
            :user-type="user?.type!"
            :allowed-types="['employee']"
            show-bottom
            :hasExpandableRows="true"
            @menu-action="handleAction"
            :columns="columns"
            :rows="filteredData"
            :loading="transactionStore.loading"
            :menuItems="menuItems"
            :pagination="pagination"
            @page-change="handlePageChange"
         >
         <template #expanded-row="{ row }">
  <div class="q-pa-md full-width">
    <div class="row">
      <div class="col-12">
        <div class="text-h6 text-primary q-mb-md text-left">
          {{ t('blumTransaction.transactionItems') }}
        </div>
        <div v-if="row.items?.length">
          <q-list separator>
            <q-item
              v-for="item in row.items"
              :key="item.id"
              class="q-mb-sm rounded-borders no-hover"
              style="background: #f8f9fa;"
            >
              <q-item-section>
                <div class="text-body1 text-weight-bold">
                  {{ item.name }}
                </div>
                <div class="text-caption text-grey-6">
                  ID: {{ item.id }}
                </div>
              </q-item-section>
              <q-item-section side>
                <div class="q-gutter-sm">
                  <q-badge
                    color="blue-4"
                    text-color="white"
                    class="q-pa-sm"
                    rounded
                  >
                    {{ t('blumTransaction.quantity') }}: {{ item.quantity }}
                  </q-badge>
                  <q-badge
                    color="green-4"
                    text-color="white"
                    class="q-pa-sm"
                    rounded
                  >
                    {{ t('blumTransaction.unitPrice') }}: ${{ item.unit_price.toFixed(2) }}
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-else class="text-grey text-center q-mt-md">
          <q-icon name="info" size="md" class="q-mr-xs" />
          {{ t('noItems') || 'No items available for this row.' }}
        </div>
      </div>
    </div>
  </div>
</template>
            <!-- Custom slot for refund status column -->
            <template #body-cell-refund_status="props">
                <q-td :props="props">
                    <q-chip
                        v-if="props.row.refunded"
                        color="orange"
                        text-color="white"
                        icon="undo"
                        size="sm"
                        class="refund-chip"
                    >
                        {{ t('transaction.refunded') }}
                    </q-chip>
                    <span v-else class="text-grey-6">
                        {{ t('transaction.notRefunded') }}
                    </span>
                </q-td>
            </template>
        </QtableB>

        <!-- Add Item Transaction Modal - New Redesigned Modal -->
        <TransactionModal
            v-model="showAddModal"
            :transactionType="transactionType"
        />

        <!-- Payment Modals -->
        <PaySupplier
            v-model="showPaySupplierModal"
            :transaction-data="selectedTransactionData"
            @success="handlePaymentSuccess"
        />

        <ReceiveFromCustomer
            v-model="showReceiveCustomerModal"
            :transaction-data="selectedTransactionData"
            @success="handlePaymentSuccess"
        />

        <!-- Transaction Invoice Modal -->
        <PrintableInvoice
            v-model="showInvoiceModal"
            :transaction="selectedTransaction"
            @transaction-updated="handleTransactionUpdated"
        />

        <!-- Refund Transaction Modal -->
        <RefundTransaction
            v-model="showRefundModal"
            :transaction-data="selectedRefundTransaction"
            @success="handleRefundSuccess"
        />

        <!-- Refund Details Modal -->
        <RefundDetailsModal
            v-model="showRefundDetailsModal"
            :refund-data="selectedRefundDetails"
        />
    </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import { useItemTransactionStore } from 'src/stores/itemTransactionStore'
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import type { MenuItem } from 'src/types'
import { useI18n } from 'vue-i18n'
import Note from 'src/components/common/Note.vue'
import type { List } from 'src/types/item_transaction'
import { useRouter } from 'vue-router'
import PaySupplier from 'src/components/transaction/PaySupplier.vue'
import ReceiveFromCustomer from 'src/components/transaction/ReceiveFromCustomer.vue'
import PrintableInvoice from 'src/components/invoice/PrintableInvoice.vue'
import RefundTransaction from 'src/components/transaction/RefundTransaction.vue'
import RefundDetailsModal from 'src/components/transaction/RefundDetailsModal.vue'
import TransactionModal from 'src/components/transaction_alpha/TransactionModal.vue'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const {user} = useAuthStore()
const $q = useQuasar()
// declarations
const transactionStore = useItemTransactionStore()
const { t } = useI18n()
const router = useRouter()

// variables
const data = computed<List[]>(() => transactionStore.list)
const pagination = computed(() => transactionStore.pagination)
const currentPage = ref(1)
const transactionType = ref<'purchase' | 'sell'>('purchase')

// Modal states
const showAddModal = ref(false)
const showPaySupplierModal = ref(false)
const showReceiveCustomerModal = ref(false)
const showInvoiceModal = ref(false)
const showRefundModal = ref(false)
const showRefundDetailsModal = ref(false)

// Selected transaction data for modals
const selectedTransactionData = ref<{
  customer: { id: number; name: string };
  amount: number;
  total_price?: number;
  paid_price?: number;
  unpaid_price?: number;
} | null>(null)

// Selected transaction for invoice
const selectedTransaction = ref<List | null>(null)

// Selected transaction for refund
const selectedRefundTransaction = ref<List | null>(null)

// Selected refund details for viewing
const selectedRefundDetails = ref<{
  id: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    reason: string;
  }>;
  refund_price: number;
  usd_iqd_rate: number;
  created_at: string;
} | null>(null)

// Filter states
const filters = ref({
    search: ''
})

// Menu items for row actions - conditional based on transaction type and refund status
const menuItems = computed(() => {
    return (row: List) => {
        const baseItems = [
            { label: t('transaction.viewInvoice'), icon: 'receipt', value: 'view_invoice' }
        ];

        // Add refund-related options only for sell transactions
        if (transactionType.value === 'sell') {
            if (row.refunded) {
                // If transaction is already refunded, show refund details option
                baseItems.push({
                    label: t('transaction.viewRefundDetails'),
                    icon: 'visibility',
                    value: 'view_refund_details'
                });
            } else {
                // If not refunded, show refund option
                baseItems.push({
                    label: t('transaction.refundItems'),
                    icon: 'undo',
                    value: 'refund_transaction'
                });
            }

            // Only show freeding (remove from reservation) option if status is not completed
            if (row.status !== 'completed') {
                baseItems.push({
                    label: t('transaction.freeding'),
                    icon: 'store',
                    value: 'freeding_transaction'
                });
            }
        }

        // Add payment options based on current transaction type and payment status
        if (transactionType.value === 'purchase' && user?.type !== 'admin') {
            // Only show "Pay Supplier" if there's an unpaid amount
            const unpaidAmount = row.unpaid_price ?? (row.total_price - row.paid_price);
            if (unpaidAmount > 0) {
                baseItems.push({
                    label: t('transaction.paySupplier'),
                    icon: 'payment',
                    value: 'pay_supplier'
                });
            }
        } else if (transactionType.value === 'sell' && user?.type !== 'admin') {
            // Only show "Receive from Customer" if there's an unpaid amount
            const unpaidAmount = row.unpaid_price ?? (row.total_price - row.paid_price);
            if (unpaidAmount > 0) {
                baseItems.push({
                    label: t('transaction.receiveFromCustomer'),
                    icon: 'account_balance_wallet',
                    value: 'receive_customer'
                });
            }
        }

        return baseItems;
    };
})

// Filtered data based on search only
const filteredData = computed(() => {
    return data.value.filter(transaction => {
        // Search filter - check customer name and transaction note
        const searchMatch = !filters.value.search ||
            (transaction.customer?.name && transaction.customer.name.toLowerCase().includes(filters.value.search.toLowerCase())) ||
            transaction.note.toLowerCase().includes(filters.value.search.toLowerCase())

        return searchMatch
    })
})

// Reset search filter
function resetFilters() {
    filters.value = {
        search: ''
    }
}

// Handle search input changes
function handleSearchChange(_searchValue: string | number | null) {
    // The filtering is handled automatically by the computed filteredData property
}

const columns = computed(() => {
    const baseColumns = [
        {
            name: 'type',
            label: t('transaction.columns.type'),
            align: "center" as const,
            field: 'type',
            sortable: true
        },
        {
            name: 'customer',
            label: t('transaction.columns.customer'),
            align: "left" as const,
            field: (row: any) => row.customer?.name || 'N/A',
            sortable: true
        },
        {
            name: 'warehouse',
            label: t('transaction.columns.warehouse'),
            align: "left" as const,
            field: (row: any) => row.warehouse?.name || 'N/A',
            sortable: true
        },
        {
            name: 'payment_type',
            label: t('transaction.columns.paymentType'),
            align: "center" as const,
            field: 'payment_type',
            sortable: true
        },
        {
            name: 'total_price',
            label: t('transaction.columns.totalPrice'),
            align: "center" as const,
      field: (row: any) => `$ ${row.total_price}`,
            sortable: true
        }
    ];

    // Add refund status column only for sell transactions
    if (transactionType.value === 'sell') {
        baseColumns.push({
            name: 'refund_status',
            label: t('transaction.columns.refundStatus'),
            align: "center" as const,
            field: (row: any) => row.refunded ? 'refunded' : 'not_refunded',
            sortable: true
        } as any);
    }

    // Add remaining columns
    baseColumns.push(
      {
            name: 'created_at',
            label: t('transaction.columns.createdAt'),
            align: "left" as const,
            field: (row: any) => row.created_at,
            sortable: true
        },

        {
            name: 'actions',
            label: t('transaction.columns.actions'),
            align: "center" as const,
            field: 'actions',
            sortable: false
        }

    );

    return baseColumns;
})

// methods
const handleAction = async (payload: { item: MenuItem; rowId: string | number }) => {
    if (payload.item.value === 'view_invoice') {
        // Fetch single transaction and show invoice modal
        try {
            const transactionData = await transactionStore.fetchSingleTransaction(payload.rowId)
            if (transactionData) {
                selectedTransaction.value = transactionData
                showInvoiceModal.value = true
            }
        } catch {
            // Failed to fetch transaction
        }
    } else if (payload.item.value === 'buy_sell') {
        // Navigate to item_transaction/index
        await router.push('/item-transaction-section')
    } else if (payload.item.value === 'pay_supplier') {
        // Find the selected transaction
        const transaction = data.value.find(t => t.id === Number(payload.rowId))

        if (transaction && transaction.customer) {
            try {
                // Fetch the full customer details by ID
                const customerStore = await import('src/stores/customerStore');
                const useCustomerStore = customerStore.useCustomerStore;
                const store = useCustomerStore();
                await store.getCustomerDetails(String(transaction.customer.id));
                const customer = store.currentCustomer;
                // Calculate amount to pay (total_price - paid_price)
                const amountToPay = transaction.total_price - transaction.paid_price;
                selectedTransactionData.value = {
                    customer: {
                        id: customer?.id || transaction.customer.id,
                        name: customer ? `${customer.fname} ${customer.sname}` : transaction.customer.name
                    },
                    amount: amountToPay > 0 ? amountToPay : 0,
                    total_price: transaction.total_price,
                    paid_price: transaction.paid_price,
                    unpaid_price: amountToPay
                }
            } catch (_err) {
                selectedTransactionData.value = null;
            }
        } else {
            selectedTransactionData.value = null
        }

        showPaySupplierModal.value = true
    } else if (payload.item.value === 'receive_customer') {
        // Find the selected transaction
        const transaction = data.value.find(t => t.id === Number(payload.rowId))

        if (transaction && transaction.customer) {
            try {
                // Fetch the full customer details by ID
                const customerStore = await import('src/stores/customerStore');
                const useCustomerStore = customerStore.useCustomerStore;
                const store = useCustomerStore();
                await store.getCustomerDetails(String(transaction.customer.id));
                const customer = store.currentCustomer;
                // Calculate amount to receive (total_price - paid_price)
                const amountToReceive = transaction.total_price - transaction.paid_price;
                selectedTransactionData.value = {
                    customer: {
                        id: customer?.id || transaction.customer.id,
                        name: customer ? `${customer.fname} ${customer.sname}` : transaction.customer.name
                    },
                    amount: amountToReceive > 0 ? amountToReceive : 0,
                    total_price: transaction.total_price,
                    paid_price: transaction.paid_price,
                    unpaid_price: amountToReceive
                }
            } catch (_err) {
                selectedTransactionData.value = null;
            }
        } else {
            selectedTransactionData.value = null
        }

        showReceiveCustomerModal.value = true
    } else if (payload.item.value === 'refund_transaction') {
        // Find the selected transaction for refund
        const transaction = data.value.find(t => t.id === Number(payload.rowId))

        if (transaction) {
            // Fetch full transaction details with items
            try {
                const transactionData = await transactionStore.fetchSingleTransaction(payload.rowId)
                if (transactionData) {
                    selectedRefundTransaction.value = transactionData
                    showRefundModal.value = true
                }
            } catch {
                // Failed to fetch transaction for refund
            }
        }
    } else if (payload.item.value === 'view_refund_details') {
        // Find the selected transaction and show refund details
        const transaction = data.value.find(t => t.id === Number(payload.rowId))

        if (transaction && transaction.refunded) {
            selectedRefundDetails.value = transaction.refunded
            showRefundDetailsModal.value = true
        }
    } else if (payload.item.value === 'freeding_transaction') {
        // Handle freeding (return to warehouse)
        $q.dialog({
            title: t('transaction.freedingConfirmTitle'),
            message: t('transaction.freedingConfirmMessage'),
            cancel: true,
            persistent: true
        }).onOk(() => {
            void handleFreedingTransaction(payload.rowId)
        })
    }
}

// Notes state
const notes = reactive<Array<{ id: number; title: string; content: string }>>([])

function removeNote(id: number) {
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) notes.splice(idx, 1)
}

// Handle payment success - refresh data
const handlePaymentSuccess = async () => {
    // Refresh transaction list after successful payment
    await transactionStore.fetchTransactionList(transactionType.value, currentPage.value);

    // Reset selected transaction data
    selectedTransactionData.value = null;
}

// Handle refund success - refresh data
const handleRefundSuccess = async () => {
    // Refresh transaction list after successful refund
    await transactionStore.fetchTransactionList(transactionType.value, currentPage.value);

    // Reset selected refund transaction data
    selectedRefundTransaction.value = null;
}

// Handle freeding transaction (return to warehouse)
const handleFreedingTransaction = async (transactionId: string | number) => {
    try {
        await transactionStore.feedingTransaction(transactionId)

        // Show success notification
        $q.notify({
            type: 'positive',
            message: t('transaction.freedingSuccess'),
            position: 'top-right'
        })

        // Refresh the transaction list
        await transactionStore.fetchTransactionList(transactionType.value, currentPage.value)
    } catch {
        $q.notify({
            type: 'negative',
            message: t('transaction.freedingError'),
            position: 'top-right'
        })
    }
}

// Watch modal visibility to reset data when closed
watch(showPaySupplierModal, (isOpen) => {
    if (!isOpen) {
        selectedTransactionData.value = null;
    }
});

watch(showReceiveCustomerModal, (isOpen) => {
    if (!isOpen) {
        selectedTransactionData.value = null;
    }
});

watch(showInvoiceModal, (isOpen) => {
    if (!isOpen) {
        selectedTransaction.value = null;
    }
});

watch(showRefundModal, (isOpen) => {
    if (!isOpen) {
        selectedRefundTransaction.value = null;
    }
});

watch(showRefundDetailsModal, (isOpen) => {
    if (!isOpen) {
        selectedRefundDetails.value = null;
    }
});

watch(showRefundModal, (isOpen) => {
    if (!isOpen) {
        selectedTransactionData.value = null;
    }
});

// Handle page change for pagination
async function handlePageChange(page: number) {
  currentPage.value = page;
  // Use current transaction type for pagination
  await transactionStore.fetchTransactionList(transactionType.value, page);

  // Scroll to top when changing pages for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Handle transaction type change
const handleTypeChange = async (newType: 'purchase' | 'sell') => {
    currentPage.value = 1;
    await transactionStore.fetchTransactionList(newType, 1);
};

// Handle transaction added
const _handleTransactionAdded = async () => {
    await transactionStore.fetchTransactionList(transactionType.value, currentPage.value);
};

// Handle transaction update from currency change
const handleTransactionUpdated = (updatedTransaction: List) => {
    // Update the selected transaction with the new data from the API
    selectedTransaction.value = updatedTransaction;
}

// Print prevention function
const handlePrintShortcut = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        event.stopPropagation();

        // Show a notification that printing from invoice is recommended
        $q.notify({
            type: 'info',
            message: t('transaction.printNotification', 'To print invoices, please open the specific transaction and use the print button in the invoice modal.'),
            position: 'top',
            timeout: 4000,
            actions: [
                {
                    label: t('common.dismiss', 'Dismiss'),
                    color: 'white',
                    handler: () => { /* dismiss */ }
                }
            ]
        });

        return false;
    }
};

// hooks
onMounted(async () => {
    // Fetch transaction data when the component is mounted
    await transactionStore.fetchTransactionList(transactionType.value);

    // Set current page from pagination if available
    if (transactionStore.pagination) {
        currentPage.value = transactionStore.pagination.current_page;
    }

    // Add print prevention
    document.addEventListener('keydown', handlePrintShortcut, true);

    // Override beforeprint event
    window.addEventListener('beforeprint', (event) => {
        event.preventDefault();
        $q.notify({
            type: 'warning',
            message: t('transaction.printWarning', 'Please use the invoice print button for proper A4 formatting.'),
            position: 'top',
            timeout: 3000
        });
        return false;
    });
});

onUnmounted(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', handlePrintShortcut, true);
    window.removeEventListener('beforeprint', () => {});
});
</script>

<style lang="scss" scoped>
.q-card {
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
}

.bg-primary {
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 92, 170, 1) 100%) !important;
}

.text-h4 {
    font-size: 2.2rem;
    font-weight: 700;
}

.text-caption {
    opacity: 0.9;
}

:deep(.q-table) {
    border-radius: 8px;
}

:deep(.q-table th) {
    font-weight: 600;
    background-color: rgba(0, 0, 0, 0.03);
}

:deep(.q-table tbody tr:hover) {
    background-color: rgba(25, 118, 210, 0.05);
}

// Animation for statistics
@keyframes countUp {
    from {
        transform: translateY(10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.text-h2, .text-h5.text-weight-bold.countup {
    font-size: 2rem !important;
    font-weight: 700;
    animation: countUp 0.5s ease-out forwards;
    margin-bottom: 0;
}

.q-card-section {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
}

// Sticky notes overlay style
.sticky-notes-overlay {
    position: fixed;
    top: 100px; // adjust as needed to be below header
    right: 32px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
}
.sticky-notes-overlay > div {
    pointer-events: auto;
}

// Pagination styles
.q-pagination {
    margin-top: 16px;
    .q-btn {
        min-width: 36px;
        min-height: 36px;
        font-weight: 500;
        border-radius: 6px;
        margin: 0 3px;
        color: var(--q-primary);

        &.q-btn--active {
            background: var(--q-primary) !important;
            color: white !important;
            transform: scale(1.05);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }

        &:hover:not(.q-btn--active) {
            background: rgba(var(--q-primary-rgb), 0.1) !important;
        }
    }
}

// Refund chip styling
.refund-chip {
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    border: 1px solid rgba(255, 152, 0, 0.2);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
    }

    transition: all 0.2s ease;
}
</style>
