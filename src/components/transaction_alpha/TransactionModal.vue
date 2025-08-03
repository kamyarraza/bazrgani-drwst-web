<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <div class="modal-backdrop">
      <q-card class="professional-modal">
        <!-- Compact Header -->
        <div class="modal-header cute-header">
          <div class="header-content">
            <div class="header-left">
              <div class="transaction-icon-wrapper cute-icon">
                <q-icon :name="transactionTypeIcon" size="24px" class="transaction-icon bouncy" />
              </div>
              <div class="header-text">
                <h1 class="modal-title cute-title">
                  {{ transactionType === 'purchase' ? '🛒' : '💰' }}
                  {{ t('transactionAlpha.transactionTitle', { type: transactionTypeLabel }) }}
                </h1>
              </div>
            </div>
            <q-btn flat round dense icon="close" @click="close" class="close-button cute-close" size="md" />
          </div>
        </div>

        <!-- Compact Progress Indicator -->
        <div class="progress-container cute-progress">
          <div class="progress-bar cute-progress-bar">
            <div class="progress-fill rainbow-progress" :style="{ width: `${getProgressPercentage()}%` }"></div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="modal-content">
          <!-- Step 1: Basic Information -->
          <div class="content-section" :class="{ 'section-active': true }">
            <div class="section-header cute-section-header">
              <div class="section-icon cute-section-icon">
                <q-icon name="person" size="20px" />
              </div>
              <h2 class="section-title cute-section-title">
                👤 {{ t(`transactionAlpha.${transactionType === 'purchase' ? 'supplierAndTransactionDetails' :
                  'customerAndTransactionDetails'}`) }}
              </h2>
            </div>

            <div class="form-grid">
              <div class="form-item">
                <CustomerSelector ref="customerSelectorRef"
                  :customerType="transactionType === 'purchase' ? 'supplier' : 'customer'" v-model="selectedCustomerId"
                  @select="handleSelectCustomer" />
              </div>
              <div class="form-item" :style="isEmployee ? 'display:none' : ''">
                <BranchSelector v-model="selectedBranchId" @select="handleSelectBranch" />
              </div>
              <div class="form-item">
                <WarehouseSelector ref="warehouseSelectorRef" v-model="selectedWarehouseId" :branchId="selectedBranchId"
                  :disabled="!selectedBranchId" />
              </div>
              <div class="form-item">
                <PaymentTypeSelector v-model="selectedPaymentType" />
              </div>
              <div v-if="transactionType === 'sell'" class="form-item status-item">
                <label class="form-label">{{ t('transactionAlpha.transactionStatus') }}</label>
                <q-option-group v-model="transactionStatus" :options="statusOptions" type="radio" color="primary" inline
                  dense class="status-options" />
              </div>
            </div>
          </div>

          <!-- Step 2: Item Selection -->
          <transition name="slide-fade">
            <div v-if="isFirstSectionComplete" class="content-section"
              :class="{ 'section-active': isFirstSectionComplete }">
              <div class="section-header cute-section-header">
                <div class="section-icon cute-section-icon">
                  <q-icon name="inventory_2" size="20px" />
                </div>
                <h2 class="section-title cute-section-title">
                  🛍️ {{ t('transactionAlpha.itemSelection') }}
                </h2>
              </div>
              <ItemSelector ref="itemSelectorRef" v-model:selectedItems="selectedItems"
                :transactionType="transactionType" :warehouseId="selectedWarehouseId" />
            </div>
          </transition>

          <!-- Step 3: Review & Submit -->
          <transition name="slide-fade">
            <div v-if="isFirstSectionComplete && hasSelectedItems" class="content-section"
              :class="{ 'section-active': hasSelectedItems }">
              <div class="section-header cute-section-header">
                <div class="section-icon cute-section-icon">
                  <q-icon name="receipt_long" size="20px" />
                </div>
                <h2 class="section-title cute-section-title">
                  💰 {{ t('transactionAlpha.debtPaymentSection') }}
                </h2>
              </div>

              <!-- Cute Financial Summary Card -->
              <div class="summary-card cute-summary-card">
                <div class="summary-header cute-summary-header">
                  <q-icon name="account_balance_wallet" size="24px" color="primary" />
                  <h3 class="summary-title">💳 {{ t('transactionAlpha.financialSummary') }}</h3>
                </div>

                <div class="summary-content">
                  <div class="summary-row">
                    <div class="summary-label">
                      <q-icon name="paid" color="primary" size="16px" />
                      {{ t('transactionAlpha.usdIqd') }}
                    </div>
                    <div class="summary-value">
                      {{ usdIqdRate }} <span class="currency">IQD</span>
                    </div>
                  </div>

                  <template v-if="transactionType === 'purchase'">
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="store" color="primary" size="16px" />
                        {{ t('transactionAlpha.supplier') }}
                      </div>
                      <div class="summary-value">
                        {{ selectedSupplier ? selectedSupplier.fname + ' ' + selectedSupplier.sname : '-' }}
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="account_balance_wallet" color="primary" size="16px" />
                        {{ t('transactionAlpha.weOweSupplier') }}
                      </div>
                      <div class="summary-value debt">
                        {{ formatCurrency(supplierDebt) }}
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="shopping_cart" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceOfSelectedItems') }}
                      </div>
                      <div class="summary-value total">
                        {{ formatCurrency(totalSelectedItemsPrice) }}
                      </div>
                    </div>
                    <div v-if="selectedPaymentType === 'borrow'" class="summary-row highlight">
                      <div class="summary-label">
                        <q-icon name="trending_up" color="warning" size="16px" />
                        {{ t('transactionAlpha.newTotalOwed') }}
                      </div>
                      <div class="summary-value warning">
                        {{ formatCurrency(newTotalOwed) }}
                      </div>
                    </div>
                  </template>

                  <template v-if="transactionType === 'sell'">
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="person" color="primary" size="16px" />
                        {{ t('transactionAlpha.customer') }}
                      </div>
                      <div class="summary-value">
                        {{ selectedCustomer ? selectedCustomer.fname + ' ' + selectedCustomer.sname : '-' }}
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="account_balance_wallet" color="primary" size="16px" />
                        {{ t('transactionAlpha.customerOwesUs') }}
                      </div>
                      <div class="summary-value debt">
                        {{ formatCurrency(customerDebt) }}
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="shopping_cart" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceBeforeDiscount') }}
                      </div>
                      <div class="summary-value">
                        {{ formatCurrency(totalSelectedItemsPrice) }}
                      </div>
                    </div>
                    <div class="summary-row discount-row">
                      <div class="summary-label">
                        <q-icon name="percent" color="primary" size="16px" />
                        {{ t('transactionAlpha.discountPercent') }}
                      </div>
                      <div class="summary-input">
                        <q-input v-model.number="discountedRate" type="number" min="0" max="100" dense outlined
                          class="discount-input" />
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="attach_money" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceAfterDiscount') }}
                      </div>
                      <div class="summary-value total">
                        {{ formatCurrency(totalAfterDiscount) }}
                      </div>
                    </div>
                    <div v-if="selectedPaymentType === 'borrow'" class="summary-row highlight">
                      <div class="summary-label">
                        <q-icon name="trending_up" color="warning" size="16px" />
                        {{ t('transactionAlpha.newTotalOwed') }}
                      </div>
                      <div class="summary-value warning">
                        {{ formatCurrency(newCustomerTotalOwed) }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Payment and Return Amount Section -->
              <div class="payment-section">
                <div class="section-header cute-section-header">
                  <div class="section-icon cute-section-icon">
                    <q-icon name="payments" size="20px" />
                  </div>
                  <h2 class="section-title cute-section-title">
                    💰 {{ t(`transactionAlpha.${transactionType === 'purchase' ? 'paymentToSupplier' :
                      'paymentFromCustomer'}`) }}
                  </h2>
                </div>

                <!-- Cash payment requirement notice -->
                <div v-if="selectedPaymentType === 'cash'" class="payment-notice">
                  <q-icon name="info" color="primary" size="16px" />
                  <span class="notice-text">
                    {{ t('transactionAlpha.paymentAmountRequired') }}
                  </span>
                </div>

                <div class="payment-grid">
                  <div class="payment-item">
                    <label class="form-label" :class="{ 'required-field': selectedPaymentType === 'cash' }">
                      <q-icon name="currency_exchange" color="primary" size="16px" />
                      {{ t(`transactionAlpha.${transactionType === 'purchase' ? 'iqdAmountWePay' :
                        'iqdAmountCustomerPays'}`) }}
                      <span v-if="selectedPaymentType === 'cash'" class="required-asterisk">*</span>
                    </label>
                    <q-input v-model.number="iqdPrice" type="number" min="0" dense outlined suffix="IQD"
                      class="payment-input" :placeholder="t('transactionAlpha.enterIqdAmount')"
                      :rules="selectedPaymentType === 'cash' ? [(val) => val > 0 || usdPrice > 0 || t('transactionAlpha.paymentAmountRequired')] : []"
                      :error="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice"
                      :error-message="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice ? t('transactionAlpha.paymentAmountRequired') : ''" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label" :class="{ 'required-field': selectedPaymentType === 'cash' }">
                      <q-icon name="attach_money" color="primary" size="16px" />
                      {{ t(`transactionAlpha.${transactionType === 'purchase' ? 'usdAmountWePay' :
                        'usdAmountCustomerPays'}`) }}
                      <span v-if="selectedPaymentType === 'cash'" class="required-asterisk">*</span>
                    </label>
                    <q-input v-model.number="usdPrice" type="number" min="0" step="0.01" dense outlined suffix="USD"
                      class="payment-input" :placeholder="t('transactionAlpha.enterUsdAmount')"
                      :rules="selectedPaymentType === 'cash' ? [(val) => val > 0 || iqdPrice > 0 || t('transactionAlpha.paymentAmountRequired')] : []"
                      :error="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice"
                      :error-message="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice ? t('transactionAlpha.paymentAmountRequired') : ''" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label">
                      <q-icon name="keyboard_return" color="warning" size="16px" />
                      {{ t(`transactionAlpha.${transactionType === 'purchase' ? 'iqdReturnFromSupplier' :
                        'iqdReturnToCustomer'}`) }}
                    </label>
                    <q-input v-model.number="iqdReturnAmount" type="number" min="0" dense outlined suffix="IQD"
                      class="payment-input" :placeholder="t('transactionAlpha.enterIqdReturnAmount')" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label">
                      <q-icon name="keyboard_return" color="warning" size="16px" />
                      {{ t(`transactionAlpha.${transactionType === 'purchase' ? 'usdReturnFromSupplier' :
                        'usdReturnToCustomer'}`) }}
                    </label>
                    <q-input v-model.number="usdReturnAmount" type="number" min="0" step="0.01" dense outlined
                      suffix="USD" class="payment-input" :placeholder="t('transactionAlpha.enterUsdReturnAmount')" />
                  </div>
                </div>
              </div>

              <!-- Note Section -->
              <div class="note-section">
                <div class="section-header">
                  <div class="section-icon">
                    <q-icon name="note" size="20px" />
                  </div>
                  <h3 class="section-title">{{ t('transactionAlpha.note') }}</h3>
                </div>
                <q-input v-model="note" type="textarea" :label="t('transactionAlpha.addNoteOptional')" outlined autogrow
                  class="note-textarea" />
              </div>

              <!-- Cute Action Buttons -->
              <div class="action-buttons cute-buttons">
                <q-btn flat :label="'❌ ' + t('common.cancel')" @click="close" class="cancel-btn cute-cancel" />
                <q-btn color="primary" :label="'🚀 ' + t('transactionAlpha.submitTransaction')" :loading="submitting"
                  :disable="!canSubmit" unelevated class="submit-btn cute-submit" @click="handleSubmit" />
              </div>
            </div>
          </transition>
        </div>
      </q-card>
    </div>
  </q-dialog>

  <!-- Invoice Modal -->
  <PrintableInvoice v-model="showInvoiceModal" :transaction="createdTransaction"
    @transaction-updated="handleTransactionUpdated" @close="closeInvoiceModal" />
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch, onMounted, nextTick } from 'vue';
import { QDialog, QCard, QIcon, QBtn, useQuasar } from 'quasar';
import CustomerSelector from './CustomerSelector.vue';
import BranchSelector from './BranchSelector.vue';
import PaymentTypeSelector from './PaymentTypeSelector.vue';
import ItemSelector from './ItemSelector.vue';
import WarehouseSelector from './WarehouseSelector.vue';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { useCustomerStore } from 'src/stores/customerStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { useAuthStore } from 'src/stores/authStore';
import type { Ref } from 'vue';
import { formatCurrency } from 'src/composables/useFormat';
import { useI18n } from 'vue-i18n';
import type { Customer } from 'src/types/customer';
import PrintableInvoice from 'src/components/invoice/PrintableInvoice.vue';
import type { List } from 'src/types/item_transaction';
const { t } = useI18n();

interface SelectedItem {
  item: { id: number; name: string };
  quantity: number;
  unit_cost: number;
  solo_unit_cost: number;
  bulk_unit_cost: number;
  // ... any other fields used
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  transactionType: { type: String, default: 'purchase' } // 'purchase' or 'sell'
});
const emit = defineEmits(['update:modelValue']);

const show = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
});

const transactionTypeLabel = computed(() =>
  props.transactionType === 'sell' ? 'Sell' : 'Purchase'
);
const transactionTypeIcon = computed(() =>
  props.transactionType === 'sell' ? 'sell' : 'shopping_cart'
);

const selectedCustomerId = ref<number | null>(null);
const selectedBranchId = ref(null);
const selectedPaymentType = ref('cash');
const selectedItems: Ref<SelectedItem[]> = ref([]);
const note = ref("");
const selectedWarehouseId = ref(null);
const discountedRate = ref(0);
const transactionStatus = ref<'completed' | 'reserved'>('completed');

// Payment and return amount fields
const iqdPrice = ref(0);
const usdPrice = ref(0);
const iqdReturnAmount = ref(0);
const usdReturnAmount = ref(0);

const statusOptions = [
  { label: t('transaction.status.complete'), value: 'completed' },
  { label: t('transaction.status.reserved'), value: 'reserved' }
];

const customerStore = useCustomerStore();
const selectedSupplier: Ref<Customer | null> = ref(null);
const supplierDebt = ref(0);
const selectedCustomer: Ref<Customer | null> = ref(null);
const customerDebt = ref(0);

const exchangeRateStore = useExchangeRateStore();
const authStore = useAuthStore();
const isEmployee = computed(() => authStore.currentUser?.type === 'employee');

onMounted(async () => {
  if (!exchangeRateStore.activeRate) {
    await exchangeRateStore.fetchActiveExchangeRate();
  }
});

const usdIqdRate = computed(() => exchangeRateStore.activeRate?.usd_iqd_rate || 0);

watch(selectedBranchId, () => {
  selectedWarehouseId.value = null;
});

const itemSelectorRef = ref();
const customerSelectorRef = ref();
const warehouseSelectorRef = ref();

watch(selectedWarehouseId, (warehouseId) => {
  if (props.transactionType === 'sell' && warehouseId && isFirstSectionComplete.value) {
    void nextTick(() => {
      if (itemSelectorRef.value && typeof itemSelectorRef.value.fetchItemsForWarehouse === 'function') {
        itemSelectorRef.value.fetchItemsForWarehouse();
      }
    });
  }
});

// Watch for modal opening to refresh items
watch(show, (isOpen) => {
  if (isOpen) {
    void nextTick(() => {
      if (itemSelectorRef.value && typeof itemSelectorRef.value.refreshItems === 'function') {
        itemSelectorRef.value.refreshItems();
      }
    });
  }
});

const $q = useQuasar();
const itemTransactionStore = useItemTransactionStore();
const submitting = ref(false);

// Invoice modal state
const showInvoiceModal = ref(false);
const createdTransaction = ref<List | null>(null);

const canSubmit = computed(() => {
  const basicRequirements = selectedCustomerId.value && selectedBranchId.value && selectedPaymentType.value && selectedItems.value.length > 0;

  // If payment type is cash, require at least one payment amount
  if (selectedPaymentType.value === 'cash') {
    const hasPaymentAmount = (iqdPrice.value && iqdPrice.value > 0) || (usdPrice.value && usdPrice.value > 0);
    return basicRequirements && hasPaymentAmount;
  }

  return basicRequirements;
});

const totalSelectedItemsPrice = computed(() => {
  return selectedItems.value.reduce((sum, sel) => sum + (sel.quantity * sel.unit_cost), 0);
});

const totalAfterDiscount = computed(() => {
  if (props.transactionType === 'sell') {
    const discount = Math.max(0, Math.min(discountedRate.value, 100));
    return totalSelectedItemsPrice.value * (1 - discount / 100);
  }
  return totalSelectedItemsPrice.value;
});

const newCustomerTotalOwed = computed(() => {
  if (!selectedCustomer.value) return totalSelectedItemsPrice.value;
  return customerDebt.value + totalSelectedItemsPrice.value;
});
const newTotalOwed = computed(() => {
  if (!selectedSupplier.value) return totalSelectedItemsPrice.value;
  return supplierDebt.value + totalSelectedItemsPrice.value;
});

async function handleSelectCustomer(customer) {
  selectedSupplier.value = null;
  supplierDebt.value = 0;
  selectedCustomer.value = null;
  customerDebt.value = 0;
  if (customer && customer.id) {
    await customerStore.getCustomerDetails(String(customer.id));
    if (customerStore.currentCustomer) {
      if (props.transactionType === 'purchase') {
        selectedSupplier.value = customerStore.currentCustomer;
        supplierDebt.value = Number(customerStore.currentCustomer.sell_borrow || 0);
      } else if (props.transactionType === 'sell') {
        selectedCustomer.value = customerStore.currentCustomer;
        customerDebt.value = Number(customerStore.currentCustomer.purchase_borrow || 0);
      }
    }
  }
  selectedCustomerId.value = customer ? customer.id : null;
}

function handleSelectBranch(branch) {
  // For now, just log the selection
  // You can add logic for next steps here
  console.log('Selected branch:', branch);
}

function clearModalData() {
  selectedCustomerId.value = null;
  selectedBranchId.value = null;
  selectedWarehouseId.value = null;
  selectedItems.value = [];
  note.value = '';
  selectedSupplier.value = null;
  supplierDebt.value = 0;
  selectedCustomer.value = null;
  customerDebt.value = 0;
  discountedRate.value = 0;
  transactionStatus.value = 'completed';

  // Reset payment and return amounts
  iqdPrice.value = 0;
  usdPrice.value = 0;
  iqdReturnAmount.value = 0;
  usdReturnAmount.value = 0;

  // Don't reset invoice modal state here - let it be handled by closeInvoiceModal
  // showInvoiceModal.value = false;
  // createdTransaction.value = null;

  // Reset child selectors if possible
  void nextTick(() => {
    if (itemSelectorRef.value && typeof itemSelectorRef.value.clearAll === 'function') {
      itemSelectorRef.value.clearAll();
    }
    if (customerSelectorRef.value && typeof customerSelectorRef.value.resetOptions === 'function') {
      customerSelectorRef.value.resetOptions();
    }
    if (warehouseSelectorRef.value && typeof warehouseSelectorRef.value.resetOptions === 'function') {
      warehouseSelectorRef.value.resetOptions();
    }
  });
}

async function handleSubmit() {
  if (!canSubmit.value) {
    let errorMessage = '🚫 Please complete all required fields';
    let errorCaption = 'Fill customer info, branch, warehouse, and select items';

    // Check for payment-specific errors
    if (selectedPaymentType.value === 'cash' && !iqdPrice.value && !usdPrice.value) {
      errorMessage = '💰 Payment amount required for cash transactions';
      errorCaption = 'Please enter either IQD or USD payment amount';
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      caption: errorCaption,
      timeout: 3000,
      position: 'top',
      avatar: '📝',
      actions: [
        { icon: 'close', color: 'white', round: true, size: 'sm' }
      ]
    });
    return;
  }
  submitting.value = true;
  try {
    // Prepare data for the new endpoints
    const transactionData: any = {
      branch_id: Number(selectedBranchId.value),
      customer_id: selectedCustomerId.value as number,
      warehouse_id: Number(selectedWarehouseId.value),
      payment_type: selectedPaymentType.value,
      usd_iqd_rate: usdIqdRate.value,
      note: note.value || '',
      created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      details: selectedItems.value.map(sel => ({
        item_id: sel.item.id,
        quantity: sel.quantity,
        unit_price: sel.unit_cost,
        solo_unit_price: sel.solo_unit_cost,
        bulk_unit_price: sel.bulk_unit_cost
      })),
      iqd_price: iqdPrice.value || 0,
      usd_price: usdPrice.value || 0,
      iqd_return_amount: iqdReturnAmount.value || 0,
      usd_return_amount: usdReturnAmount.value || 0
    };

    // Add sell-specific fields
    if (props.transactionType === 'sell') {
      transactionData.discounted_rate = discountedRate.value;
      transactionData.status = transactionStatus.value;
    }

    // Use the new endpoints
    const endpoint = props.transactionType === 'purchase'
      ? '/transactions/create/new/purchase'
      : '/transactions/create/new/sell';

    const response = await itemTransactionStore.createNewTransaction(transactionData, endpoint);

    // Transform the API response to match the List interface for invoice
    if (response && response.status === 'success' && response.data) {
      const apiData = response.data;

      const transformedTransaction: List = {
        id: apiData.id,
        type: props.transactionType,
        customer: {
          id: apiData.customer?.id || selectedCustomer.value?.id || 0,
          name: apiData.customer?.name || (selectedCustomer.value ? `${selectedCustomer.value.fname} ${selectedCustomer.value.sname}` : ''),
          type: apiData.customer?.type || selectedCustomer.value?.type || '',
          phone: apiData.customer?.phone || selectedCustomer.value?.fphone || ''
        },
        warehouse: {
          id: apiData.warehouse?.id || Number(selectedWarehouseId.value) || 0,
          name: apiData.warehouse?.name || '',
          code: apiData.warehouse?.code || '',
          capacity: apiData.warehouse?.capacity || 0
        },
        payment_type: apiData.payment_type || selectedPaymentType.value,
        items: selectedItems.value.map((sel) => ({
          id: sel.item.id,
          name: sel.item.name,
          quantity: sel.quantity,
          unit_price: sel.unit_cost,
          solo_unit_price: sel.solo_unit_cost,
          bulk_unit_price: sel.bulk_unit_cost
        })),
        total_price: apiData.total_price || totalAfterDiscount.value,
        paid_price: apiData.paid_price || (selectedPaymentType.value === 'cash' ? (apiData.total_price || totalAfterDiscount.value) : 0),
        unpaid_price: apiData.unpaid_price || (selectedPaymentType.value === 'borrow' ? (apiData.total_price || totalAfterDiscount.value) : 0),
        usd_iqd_rate: apiData.usd_iqd_rate || usdIqdRate.value,
        note: apiData.note || note.value,
        status: apiData.status || transactionStatus.value,
        created_at: apiData.created_at || new Date().toISOString()
      };

      createdTransaction.value = transformedTransaction;
      showInvoiceModal.value = true;
    }

    // Refresh items to get updated quantities after transaction
    if (itemSelectorRef.value && typeof itemSelectorRef.value.refreshAfterTransaction === 'function') {
      itemSelectorRef.value.refreshAfterTransaction();
    }

    // Clear payment and return amount inputs after successful transaction
    iqdPrice.value = 0;
    usdPrice.value = 0;
    iqdReturnAmount.value = 0;
    usdReturnAmount.value = 0;

    $q.notify({
      type: 'positive',
      message: `🎉 ${props.transactionType === 'purchase' ? 'Purchase' : 'Sale'} completed successfully!`,
      caption: `Transaction total: ${formatCurrency(totalAfterDiscount.value)}`,
      timeout: 4000,
      position: 'top',
      avatar: props.transactionType === 'purchase' ? '🛒' : '💰',
      actions: [
        { icon: 'close', color: 'white', round: true, size: 'sm' }
      ]
    });
    show.value = false;
  } catch (error) {
    console.error('Transaction submission error:', error);
    $q.notify({
      type: 'negative',
      message: '😔 Transaction failed to process',
      caption: 'Please check your data and try again',
      timeout: 4000,
      position: 'top',
      avatar: '⚠️',
      actions: [
        { icon: 'close', color: 'white', round: true, size: 'sm' }
      ]
    });
  } finally {
    submitting.value = false;
  }
}

function close() {
  void clearModalData();
  show.value = false;
}

function handleTransactionUpdated(transaction: List) {
  // Handle any updates to the transaction if needed
  console.log('Transaction updated:', transaction);
}

function closeInvoiceModal() {
  showInvoiceModal.value = false;
  createdTransaction.value = null;

  // Clear the main modal data after invoice is closed
  void clearModalData();
}

const isFirstSectionComplete = computed(() => {
  return !!selectedCustomerId.value && !!selectedBranchId.value && !!selectedWarehouseId.value && !!selectedPaymentType.value;
});
const hasSelectedItems = computed(() => selectedItems.value.length > 0);

// New methods for professional design (currently unused but may be needed for future features)
function _getTransactionSubtitle() {
  if (props.transactionType === 'purchase') {
    return t('transactionAlpha.purchaseSubtitle', 'Record a purchase from a supplier');
  } else {
    return t('transactionAlpha.sellSubtitle', 'Complete a sale to a customer');
  }
}

function getProgressPercentage() {
  if (hasSelectedItems.value) return 100;
  if (isFirstSectionComplete.value) return 66;
  return 33;
}

</script>

<style scoped>
/* Cute and User-Friendly Modal Design */

/* Backdrop with cute gradient */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(255, 182, 193, 0.15) 0%,
      rgba(173, 216, 230, 0.15) 25%,
      rgba(221, 160, 221, 0.15) 50%,
      rgba(255, 218, 185, 0.15) 75%,
      rgba(144, 238, 144, 0.15) 100%);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Main modal container with cute design */
.professional-modal {
  width: 95vw;
  max-width: 1200px;
  height: 95vh;
  max-height: 900px;
  border-radius: 25px;
  box-shadow:
    0 25px 70px rgba(0, 0, 0, 0.12),
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(25px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Cute Header Design - Compact */
.cute-header {
  background: linear-gradient(135deg,
      #ff6b9d 0%,
      #c44569 25%,
      #f8b500 50%,
      #3742fa 75%,
      #2ed573 100%);
  padding: 12px 20px;
  position: relative;
  overflow: hidden;
  min-height: 50px;
}

.cute-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.3)"/><circle cx="5" cy="5" r="0.5" fill="rgba(255,255,255,0.2)"/><circle cx="15" cy="15" r="0.5" fill="rgba(255,255,255,0.2)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
  opacity: 0.4;
}

.cute-icon {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  animation: gentleBounce 2s ease-in-out infinite;
  width: 36px !important;
  height: 36px !important;
}

@keyframes gentleBounce {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-3px);
  }
}

.bouncy {
  animation: iconBounce 1.5s ease-in-out infinite;
}

@keyframes iconBounce {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.cute-title {
  font-size: 1.2rem !important;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cute-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 4px 0 0 0;
  font-weight: 400;
}

.cute-close {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  }

  50% {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  }
}

.cute-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Compact Progress Indicator */
.cute-progress {
  padding: 8px 20px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.cute-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rainbow-progress {
  height: 100%;
  background: linear-gradient(90deg,
      #ff6b9d 0%,
      #c44569 20%,
      #f8b500 40%,
      #3742fa 60%,
      #2ed573 80%,
      #ff6b9d 100%);
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }

  100% {
    background-position: 200px 0;
  }
}

/* Cute Section Headers */
.cute-section-header {
  background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
  padding: 12px 16px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.cute-section-icon {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%) !important;
  box-shadow: 0 3px 8px rgba(116, 185, 255, 0.3);
}

.cute-section-title {
  font-size: 1.2rem !important;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* Cute Summary Card */
.cute-summary-card {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.cute-summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hearts" width="30" height="30" patternUnits="userSpaceOnUse"><text x="15" y="20" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.1)">💖</text></pattern></defs><rect width="100" height="100" fill="url(%23hearts)"/></svg>');
  opacity: 0.2;
}

.cute-summary-header {
  position: relative;
  z-index: 2;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

/* Cute Buttons */
.cute-buttons {
  padding-top: 28px;
  border-top: 2px solid rgba(0, 0, 0, 0.04);
}

.cute-cancel {
  color: #636e72 !important;
  font-weight: 500;
  border-radius: 25px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.cute-cancel:hover {
  background: rgba(255, 107, 107, 0.1) !important;
  color: #ff6b6b !important;
  transform: translateY(-2px);
}

.cute-submit {
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%) !important;
  color: white !important;
  font-weight: 600;
  padding: 14px 36px;
  border-radius: 25px;
  box-shadow: 0 6px 20px rgba(0, 184, 148, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cute-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.cute-submit:hover::before {
  left: 100%;
}

.cute-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 184, 148, 0.4);
}

.cute-submit:disabled {
  background: linear-gradient(135deg, #ddd 0%, #bbb 100%) !important;
  color: #999 !important;
  transform: none;
  box-shadow: none;
}

/* Enhanced existing styles with cute touches */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.content-section {
  margin-bottom: 28px;
  opacity: 0.7;
  transition: all 0.4s ease;
  transform: translateY(10px);
}

.content-section.section-active {
  opacity: 1;
  transform: translateY(0);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-item {
  position: relative;
  transition: all 0.3s ease;
}

.form-item:hover {
  transform: translateY(-2px);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.summary-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Note Section */
.note-section {
  margin-bottom: 32px;
  background: linear-gradient(135deg, #e8f4fd 0%, #c3e8f8 100%);
  padding: 20px;
  border-radius: 15px;
  border: 2px solid rgba(116, 185, 255, 0.2);
}

/* Payment Section */
.payment-section {
  margin-bottom: 32px;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  padding: 20px;
  border-radius: 15px;
  border: 2px solid rgba(255, 107, 107, 0.2);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.1);
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.payment-item {
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

/* Required field styling */
.form-label.required-field {
  color: #2b6cb0;
  font-weight: 600;
}

.required-asterisk {
  color: #e53e3e;
  font-weight: bold;
  margin-left: 2px;
}

/* Payment input error styling */
.payment-input.q-field--error .q-field__control {
  border-color: #e53e3e !important;
  box-shadow: 0 0 0 1px rgba(229, 62, 62, 0.2) !important;
}

/* Payment notice styling */
.payment-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #60a5fa;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e40af;
}

.notice-text {
  flex: 1;
}

.payment-input {
  width: 100%;
}

.note-textarea {
  margin-top: 16px;
}

/* Cute animations for various elements */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

/* Responsive enhancements */
@media (max-width: 1024px) {
  .professional-modal {
    width: 98vw;
    height: 95vh;
    border-radius: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .payment-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cute-header {
    padding: 16px 20px;
  }

  .cute-title {
    font-size: 1.1rem !important;
  }

  .modal-content {
    padding: 24px;
  }

  .cute-buttons {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .cute-submit {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .professional-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .cute-header {
    padding: 14px 16px;
  }

  .modal-content {
    padding: 20px;
  }

  .cute-summary-card {
    padding: 20px;
  }
}
</style>
