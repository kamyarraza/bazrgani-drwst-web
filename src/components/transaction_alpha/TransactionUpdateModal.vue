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
                  {{ transactionType === 'purchase' ? '�' : '�' }}
                  {{ t('transaction.updateTransaction') }} - {{ transactionTypeLabel }}
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
          <!-- Loading Transaction Banner -->
          <div v-if="loadingTransaction" class="loading-banner">
            <div class="loading-content">
              <q-spinner size="24px" color="primary" />
              <div class="loading-text">
                <div class="loading-title">{{ t('transactionAlpha.loadingTransaction') || 'Loading transaction details...' }}</div>
              </div>
            </div>
          </div>

          <!-- Non-Editable Transaction Warning -->
          <div v-if="transactionData && !isEditableTransaction" class="non-editable-banner">
            <div class="warning-content">
              <q-icon name="lock" size="24px" color="white" />
              <div class="warning-text">
                <div class="warning-title">{{ t('transactionAlpha.transactionNotEditable') || 'Transaction Not Editable' }}</div>
                <div class="warning-message">{{ t('transactionAlpha.transactionCannotBeModified') || 'This transaction cannot be modified' }}</div>
              </div>
            </div>
          </div>

          <!-- Cashbox Warning Banner -->
          <div v-if="selectedBranchId && cashboxStore.cashbox && !cashboxStore.cashbox.is_opened"
            class="cashbox-warning-banner">
            <div class="warning-content">
              <q-icon name="warning" size="24px" color="white" />
              <div class="warning-text">
                <div class="warning-title">{{ t('transactionAlpha.cashboxClosed') }}</div>
                <div class="warning-message">{{ t('transactionAlpha.cashboxMustBeOpened') }}</div>
              </div>
            </div>
          </div>

          <!-- Step 1: Basic Information -->
          <div class="content-section" :class="{ 'section-active': true }">
            <div class="section-header cute-section-header">
              <div class="section-icon cute-section-icon">
                <q-icon name="person" size="20px" />
              </div>
              <h2 class="section-title cute-section-title">
                👤 {{ t(`transactionAlpha.${isPurchase ? 'supplierAndTransactionDetails' : 'customerAndTransactionDetails'}`) }}
              </h2>
            </div>

            <div class="form-grid" style="margin-bottom: 9px;">
              <div class="form-item">
                <CustomerSelector
                  ref="customerSelectorRef"
                  :customerType="isPurchase ? 'supplier' : 'customer'"
                  v-model="selectedCustomerId"
                  @select="handleSelectCustomer"
                />
              </div>

              <div class="form-item" :style="isEmployee ? 'display:none' : ''">
                <BranchSelector v-model="selectedBranchId" @select="handleSelectBranch" />
                <!-- Cashbox Status Indicator -->
                <div v-if="selectedBranchId && cashboxStore.cashbox" class="cashbox-status-indicator">
                  <div v-if="cashboxStore.cashbox.is_opened" class="status-badge status-opened">
                    <q-icon name="lock_open" size="xs" />
                    <span>{{ t('transactionAlpha.cashboxOpened') }}</span>
                  </div>
                  <div v-else class="status-badge status-closed">
                    <q-icon name="lock" size="xs" />
                    <span>{{ t('transactionAlpha.cashboxClosed') }}</span>
                  </div>
                </div>
              </div>

              <div class="form-item">
                <WarehouseSelector ref="warehouseSelectorRef" v-model="selectedWarehouseId" :branchId="selectedBranchId" :disabled="!selectedBranchId" />
              </div>

              <div v-if="isSell" class="form-item status-item">
                <label class="form-label">{{ t('transactionAlpha.transactionStatus') }}</label>
                <q-option-group v-model="transactionStatus" :options="statusOptions" type="radio" color="primary" inline dense class="status-options" />
              </div>
            </div>

            <div class="form-item" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
              <div class="text-caption q-mb-xs">{{ t('transactionAlpha.selectPaymentType') }} <span class="text-negative">*</span></div>
              <PaymentTypeSelector v-model="selectedPaymentType" />
            </div>
          </div>

          <!-- Step 2: Item Selection -->
          <transition name="slide-fade">
            <div v-if="isFirstSectionComplete" class="content-section" :class="{ 'section-active': isFirstSectionComplete }">
              <!-- Branch Selection Notice for Update Modal -->
              <div v-if="!selectedBranchId && transactionData" class="branch-notice">
                <q-icon name="info" color="warning" size="16px" />
                <span class="notice-text">{{ t('transactionAlpha.selectBranchToUpdate') || 'Please select a branch to update this transaction' }}</span>
              </div>
              
              <div class="section-header cute-section-header">
                <div class="section-icon cute-section-icon">
                  <q-icon name="inventory_2" size="20px" />
                </div>
                <h2 class="section-title cute-section-title">🛍️ {{ t('transactionAlpha.itemSelection') }}</h2>
              </div>
              <ItemSelector ref="itemSelectorRef" v-model:selectedItems="selectedItems" :transactionType="transactionType" :warehouseId="selectedWarehouseId" />
            </div>
          </transition>

          <!-- Step 3: Review & Submit -->
          <transition name="slide-fade">
            <div v-if="isFirstSectionComplete && hasSelectedItems" class="content-section" :class="{ 'section-active': hasSelectedItems }">
              <div class="section-header cute-section-header">
                <div class="section-icon cute-section-icon">
                  <q-icon name="receipt_long" size="20px" />
                </div>
                <h2 class="section-title cute-section-title">💰 {{ t('transactionAlpha.debtPaymentSection') }}</h2>
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
                    <div class="summary-value">{{ formatCurrency(usdIqdRate, ' IQD') }}</div>
                  </div>

                  <template v-if="isPurchase">
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="store" color="primary" size="16px" />
                        {{ t('transactionAlpha.supplier') }}
                      </div>
                      <div class="summary-value">{{ selectedSupplier ? selectedSupplier.fname + ' ' + selectedSupplier.sname : '-' }}</div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="account_balance_wallet" color="primary" size="16px" />
                        {{ t('transactionAlpha.weOweSupplier') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge debt-badge">{{ formatCurrency(supplierDebt) }}</div>
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="shopping_cart" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceOfSelectedItems') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge total-badge">💰 {{ formatCurrency(totalSelectedItemsPrice) }}</div>
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="shopping_cart" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceOfSelectedItems') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge iqd-badge">🪙 {{ formatCurrency(totalSelectedItemsPrice * usdIqdRate, ' IQD') }}</div>
                      </div>
                    </div>
                    <div v-if="selectedPaymentType === 'borrow'" class="summary-row highlight">
                      <div class="summary-label">
                        <q-icon name="trending_up" color="warning" size="16px" />
                        {{ t('transactionAlpha.newTotalOwed') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge warning-badge">⚠️ {{ formatCurrency(newTotalOwed) }}</div>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="person" color="primary" size="16px" />
                        {{ t('transactionAlpha.customer') }}
                      </div>
                      <div class="summary-value">{{ selectedCustomer ? selectedCustomer.fname + ' ' + selectedCustomer.sname : '-' }}</div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="account_balance_wallet" color="primary" size="16px" />
                        {{ t('transactionAlpha.customerOwesUs') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge debt-badge">{{ formatCurrency(customerDebt) }}</div>
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="shopping_cart" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceBeforeDiscount') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge total-badge">💰 {{ formatCurrency(totalSelectedItemsPrice) }}</div>
                      </div>
                    </div>
                    <div class="summary-row discount-row">
                      <div class="summary-label">
                        <q-icon name="percent" color="primary" size="16px" />
                        {{ t('transactionAlpha.discountPercent') }}
                      </div>
                      <div class="summary-value">
                        <div class="discount-input-wrapper">
                          <q-input v-model.number="discountedRate" type="number" min="0" max="100" dense outlined class="discount-input cute-discount-input" :placeholder="t('transactionAlpha.enterDiscount')" :rules="[
                            val => val >= 0 || t('transactionAlpha.discountMustBePositive'),
                            val => val <= 100 || t('transactionAlpha.discountMaximum100')
                          ]" bg-color="grey-4">
                            <template v-slot:prepend>
                              <q-icon name="percent" color="primary" size="16px" />
                            </template>
                          </q-input>
                        </div>
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="attach_money" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceAfterDiscount') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge total-after-discount-badge">🎯 {{ formatCurrency(totalAfterDiscount) }}</div>
                      </div>
                    </div>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="shopping_cart" color="primary" size="16px" />
                        {{ t('transactionAlpha.totalPriceOfSelectedItems') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge iqd-badge">🪙 {{ formatCurrency(totalAfterDiscount * usdIqdRate, ' IQD') }}</div>
                      </div>
                    </div>
                    <div v-if="selectedPaymentType === 'borrow'" class="summary-row highlight">
                      <div class="summary-label">
                        <q-icon name="trending_up" color="warning" size="16px" />
                        {{ t('transactionAlpha.newTotalOwed') }}
                      </div>
                      <div class="summary-value">
                        <div class="price-badge warning-badge">⚠️ {{ formatCurrency(newTotalOwed) }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Payment input section -->
              <div class="payment-section" v-if="selectedPaymentType === 'cash' || selectedPaymentType === 'borrow'">
                <div class="section-header cute-section-header">
                  <div class="section-icon cute-section-icon">
                    <q-icon name="payments" size="20px" />
                  </div>
                  <h2 class="section-title cute-section-title">💰 {{ t(`transactionAlpha.${isPurchase ? 'paymentToSupplier' : 'paymentFromCustomer'}`) }}</h2>
                </div>

                <!-- Cash payment requirement notice -->
                <div v-if="selectedPaymentType === 'cash'" class="payment-notice">
                  <q-icon name="info" color="primary" size="16px" />
                  <span class="notice-text">{{ t('transactionAlpha.paymentAmountRequired') }}</span>
                </div>

                <div class="payment-grid">
                  <div class="payment-item">
                    <label class="form-label" :class="{ 'required-field': selectedPaymentType === 'cash' }">
                      <q-icon name="currency_exchange" color="primary" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'iqdAmountWePay' : 'iqdAmountCustomerPays'}`) }}
                      <span v-if="selectedPaymentType === 'cash'" class="required-asterisk">*</span>
                    </label>
                    <q-input v-model.number="iqdPrice" type="number" min="0" dense outlined suffix="IQD" class="payment-input" :placeholder="t('transactionAlpha.enterIqdAmount')" :rules="selectedPaymentType === 'cash' ? [(val) => val > 0 || usdPrice > 0 || t('transactionAlpha.paymentAmountRequired')] : []" :error="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice" :error-message="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice ? t('transactionAlpha.paymentAmountRequired') : ''" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label" :class="{ 'required-field': selectedPaymentType === 'cash' }">
                      <q-icon name="attach_money" color="primary" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'usdAmountWePay' : 'usdAmountCustomerPays'}`) }}
                      <span v-if="selectedPaymentType === 'cash'" class="required-asterisk">*</span>
                    </label>
                    <q-input v-model.number="usdPrice" type="number" min="0" step="0.01" dense outlined suffix="USD" class="payment-input" :placeholder="t('transactionAlpha.enterUsdAmount')" :rules="selectedPaymentType === 'cash' ? [(val) => val > 0 || iqdPrice > 0 || t('transactionAlpha.paymentAmountRequired')] : []" :error="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice" :error-message="selectedPaymentType === 'cash' && !iqdPrice && !usdPrice ? t('transactionAlpha.paymentAmountRequired') : ''" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label">
                      <q-icon name="keyboard_return" color="warning" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'iqdReturnFromSupplier' : 'iqdReturnToCustomer'}`) }}
                    </label>
                    <q-input v-model.number="iqdReturnAmount" type="number" min="0" dense outlined suffix="IQD" class="payment-input" :placeholder="t('transactionAlpha.enterIqdReturnAmount')" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label">
                      <q-icon name="keyboard_return" color="warning" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'usdReturnFromSupplier' : 'usdReturnToCustomer'}`) }}
                    </label>
                    <q-input v-model.number="usdReturnAmount" type="number" min="0" step="0.01" dense outlined suffix="USD" class="payment-input" :placeholder="t('transactionAlpha.enterUsdReturnAmount')" />
                  </div>

                  <div class="payment-item forgiven-price-item">
                    <label class="form-label forgiven-label">
                      <q-icon name="heart_broken" color="negative" size="16px" />
                      {{ t('transactionAlpha.forgivenPrice') }}
                    </label>
                    <q-input v-model.number="forgivenPrice" type="number" min="0" dense outlined suffix="IQD" class="payment-input forgiven-input" :placeholder="t('transactionAlpha.enterForgivenAmount')" :rules="[val => !val || val >= 0 || t('transactionAlpha.forgivenPriceMustBePositive')]">
                      <template v-slot:hint>
                        <div class="forgiven-hint">
                          <q-icon name="info" size="12px" />
                          {{ t('transactionAlpha.forgivenPriceHint') }}
                        </div>
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <!-- Note Section -->
              <div class="note-section">
                <div class="section-header">
                  <div class="section-icon"><q-icon name="note" size="20px" /></div>
                  <h3 class="section-title">{{ t('transactionAlpha.note') }}</h3>
                </div>
                <q-input v-model="note" type="textarea" :label="t('transactionAlpha.addNoteOptional')" outlined autogrow class="note-textarea" />
              </div>

              <!-- Cute Action Buttons -->
              <div class="action-buttons cute-buttons">
                <q-btn flat :label="'❌ ' + t('common.cancel')" @click="close" class="cancel-btn cute-cancel" />
                <q-btn 
                  color="primary" 
                  :label="'🚀 ' + t('transaction.updateTransaction')" 
                  :loading="submitting" 
                  :disable="!canSubmit || !isEditableTransaction" 
                  unelevated 
                  class="submit-btn cute-submit" 
                  @click="handleSubmit" 
                />
              </div>
            </div>
          </transition>
        </div>
      </q-card>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch, onMounted, nextTick, type Ref } from 'vue';
import { useQuasar } from 'quasar';
import CustomerSelector from './CustomerSelector.vue';
import BranchSelector from './BranchSelector.vue';
import PaymentTypeSelector from './PaymentTypeSelector.vue';
import ItemSelector from './ItemSelector.vue';
import WarehouseSelector from './WarehouseSelector.vue';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { useCustomerStore } from 'src/stores/customerStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { useAuthStore } from 'src/stores/authStore';
import { useCashboxStore } from 'src/stores/cashboxStore';
import type { List } from 'src/types/item_transaction';
import type { Customer } from 'src/types/customer';
import { formatCurrency } from 'src/composables/useFormat';
import { useI18n } from 'vue-i18n';

interface SelectedItem {
  item: any;
  unit_cost: number;
  solo_unit_cost: number;
  bulk_unit_cost: number;
  quantity: number;
  packages: number;
  packets: number;
}

const props = defineProps<{ 
  modelValue: boolean; 
  transactionId?: string | number | null;
  transactionData?: List | null; 
}>();
const emit = defineEmits(['update:modelValue', 'success']);

const show = computed({ get: () => props.modelValue, set: (v: boolean) => emit('update:modelValue', v) });

const { t } = useI18n();
const $q = useQuasar();
const itemTransactionStore = useItemTransactionStore();
const customerStore = useCustomerStore();
const exchangeRateStore = useExchangeRateStore();
const authStore = useAuthStore();
const cashboxStore = useCashboxStore();

const transactionType = computed<'purchase' | 'sell'>(() => (transactionData.value?.type === 'purchase' ? 'purchase' : 'sell'));
const isPurchase = computed(() => transactionType.value === 'purchase');
const isSell = computed(() => transactionType.value === 'sell');
const transactionTypeLabel = computed(() => (isSell.value ? 'Sell' : 'Purchase'));
const transactionTypeIcon = computed(() => (isSell.value ? 'sell' : 'shopping_cart'));

const selectedCustomerId = ref<number | null>(null);
const selectedBranchId = ref<number | null>(null);
const selectedWarehouseId = ref<number | null>(null);
const selectedPaymentType = ref<string>('cash');
const transactionStatus = ref<'completed' | 'reserved'>('completed');
const discountedRate = ref<number>(0);
const note = ref('');
const iqdPrice = ref<number>(0);
const usdPrice = ref<number>(0);
const iqdReturnAmount = ref<number>(0);
const usdReturnAmount = ref<number>(0);
const forgivenPrice = ref<number>(0);

const selectedSupplier: Ref<Customer | null> = ref(null);
const selectedCustomer: Ref<Customer | null> = ref(null);
const supplierDebt = ref(0);
const customerDebt = ref(0);

const usdIqdRate = computed(() => transactionData.value?.usd_iqd_rate || exchangeRateStore.activeRate?.usd_iqd_rate || 0);

const selectedItems = ref<SelectedItem[]>([]);

const statusOptions = [
  { label: t('transaction.statusTypes.completed'), value: 'completed' },
  { label: t('transaction.statusTypes.reserved'), value: 'reserved' }
];

const submitting = ref(false);
const loadingTransaction = ref(false);
const currentTransactionData = ref<List | null>(null);
const isEditableTransaction = ref(true);

const isEmployee = computed(() => authStore.user?.type === 'employee');

// Combined transaction data (from prop or fetched)
const transactionData = computed(() => props.transactionData || currentTransactionData.value);

// Fetch transaction details when transactionId is provided
const fetchTransactionDetails = async (transactionId: string | number) => {
  try {
    loadingTransaction.value = true;
    const fetchedData = await itemTransactionStore.fetchSingleTransaction(transactionId);
    if (fetchedData) {
      currentTransactionData.value = fetchedData;
      isEditableTransaction.value = fetchedData.is_editable !== false; // Default to true if not specified
    }
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    $q.notify({
      type: 'negative',
      message: t('transaction.errors.failedToLoadTransaction'),
      position: 'top'
    });
  } finally {
    loadingTransaction.value = false;
  }
};

// Watch for transactionId changes
watch(
  () => props.transactionId,
  (newTransactionId) => {
    if (newTransactionId && props.modelValue) {
      void fetchTransactionDetails(newTransactionId);
    }
  },
  { immediate: true }
);

// Watch for modal opening with transactionId
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.transactionId && !props.transactionData) {
      void fetchTransactionDetails(props.transactionId);
    }
  }
);

// Prefill when data arrives
watch(
  () => transactionData.value,
  async (tx) => {
    if (!tx) return;

    selectedCustomerId.value = tx.customer?.id || null;
    selectedWarehouseId.value = tx.warehouse?.id || null;
    selectedPaymentType.value = normalizePaymentType(tx.payment_type);
    note.value = tx.note || '';
    discountedRate.value = tx.discounted_rate || 0;
    transactionStatus.value = (tx.status as 'completed' | 'reserved') || 'completed';
    forgivenPrice.value = tx.forgiven_price || 0;
    
    // Map payment amounts from transaction data payment object
    if (tx.payment) {
      // Extract payment amounts from the payment object based on API response structure
      iqdPrice.value = Number(tx.payment.total_iqd_in || 0);
      usdPrice.value = Number(tx.payment.total_usd_in || 0);
      iqdReturnAmount.value = Number(tx.payment.total_iqd_out || 0);
      usdReturnAmount.value = Number(tx.payment.total_usd_out || 0);
    } else {
      // Initialize with defaults if no payment data
      iqdPrice.value = 0;
      usdPrice.value = 0;
      iqdReturnAmount.value = 0;
      usdReturnAmount.value = 0;
    }

    // Prefill selected items from transaction
    selectedItems.value = (tx.items || []).map((it) => ({
      item: { id: it.id, name: it.name, solo_unit_price: it.solo_unit_price, bulk_unit_price: it.bulk_unit_price },
      unit_cost: Number(it.unit_price) || 0,
      solo_unit_cost: Number(it.solo_unit_price || it.unit_price || 0),
      bulk_unit_cost: Number(it.bulk_unit_price || it.unit_price || 0),
      quantity: Number(it.quantity) || 0,
      packages: 0,
      packets: 0
    }));

    // Load related data
    const customerType = isPurchase.value ? 'supplier' : 'customer';
    await customerStore.fetchCustomers(1, customerType as any);

    // For update modal, if we have transaction data and warehouse, allow sections to show
    // even if branch is not explicitly selected yet
    selectedBranchId.value = null;

    // For sell, once warehouse is known, ensure items list is fetched so user can add/change items
    if (isSell.value && selectedWarehouseId.value) {
      await nextTick();
      if (itemSelectorRef.value && typeof itemSelectorRef.value.fetchItemsForWarehouse === 'function') {
        itemSelectorRef.value.fetchItemsForWarehouse();
      }
    }
  },
  { immediate: true }
);

function normalizePaymentType(val: string) {
  const v = (val || '').toString().toLowerCase();
  if (v.includes('borrow') || v.includes('قەرز')) return 'borrow';
  if (v.includes('cash') || v.includes('نەقد')) return 'cash';
  if (v.includes('bank')) return 'bank';
  if (v.includes('credit')) return 'credit';
  if (v.includes('debit')) return 'debit';
  if (v.includes('transfer')) return 'transfer';
  return 'cash';
}

const itemSelectorRef = ref<any>(null);
const customerSelectorRef = ref<any>(null);
const warehouseSelectorRef = ref<any>(null);

const isFirstSectionComplete = computed(() => {
  // For update modal, if we have transaction data, be more lenient with the requirements
  if (transactionData.value) {
    return !!selectedCustomerId.value && !!selectedWarehouseId.value && !!selectedPaymentType.value;
  }
  // For new transactions, require all fields including branch
  return !!selectedCustomerId.value && !!selectedBranchId.value && !!selectedWarehouseId.value && !!selectedPaymentType.value;
});

const canSubmit = computed(() => {
  // Check if transaction is editable
  if (transactionData.value && !isEditableTransaction.value) {
    return false;
  }
  
  // For update modal, if we have transaction data, be more lenient with branch requirement
  if (transactionData.value) {
    const basic = selectedCustomerId.value && selectedWarehouseId.value && selectedPaymentType.value && selectedItems.value.length > 0;
    // Still require branch for submission, but show a warning if missing
    return !!basic && !!selectedBranchId.value;
  }
  // For new transactions, require all fields
  const basic = selectedCustomerId.value && selectedBranchId.value && selectedWarehouseId.value && selectedPaymentType.value && selectedItems.value.length > 0;
  return !!basic;
});

const hasSelectedItems = computed(() => selectedItems.value.length > 0);

function getProgressPercentage(): number {
  let progress = 0;
  if (selectedCustomerId.value && selectedBranchId.value && selectedWarehouseId.value && selectedPaymentType.value) progress += 50;
  if (selectedItems.value.length > 0) progress += 40;
  if (canSubmit.value) progress += 10;
  return Math.min(100, progress);
}

function close() {
  show.value = false;
}

async function handleSelectCustomer(customer: any) {
  try {
    await customerStore.getCustomerDetails(String(customer.id));
    if (customerStore.currentCustomer) {
      if (isPurchase.value) {
        selectedSupplier.value = customerStore.currentCustomer;
        supplierDebt.value = customerStore.currentCustomer.sell_borrow || 0;
      } else {
        selectedCustomer.value = customerStore.currentCustomer;
        customerDebt.value = customerStore.currentCustomer.purchase_borrow || 0;
      }
    }
  } catch {
    // ignore
  }
}

function handleSelectBranch() {
  selectedWarehouseId.value = null;
  if (isSell.value) {
    void nextTick(() => {
      if (itemSelectorRef.value && typeof itemSelectorRef.value.clearItems === 'function') {
        itemSelectorRef.value.clearItems();
      }
    });
  }
}

watch(selectedWarehouseId, (warehouseId) => {
  if (isSell.value && warehouseId) {
    void nextTick(() => {
      if (itemSelectorRef.value && typeof itemSelectorRef.value.fetchItemsForWarehouse === 'function') {
        itemSelectorRef.value.fetchItemsForWarehouse();
      }
    });
  }
});

const totalSelectedItemsPrice = computed(() => selectedItems.value.reduce((sum, sel) => sum + (Number(sel.quantity || 0) * Number(sel.unit_cost || 0)), 0));
const totalAfterDiscount = computed(() => (isSell.value ? totalSelectedItemsPrice.value * (1 - Math.max(0, Math.min(discountedRate.value, 100)) / 100) : totalSelectedItemsPrice.value));

// Computed for new total owed
const newCustomerTotalOwed = computed(() => {
  if (!selectedCustomer.value) return totalAfterDiscount.value;
  return customerDebt.value + totalAfterDiscount.value;
});

const newTotalOwed = computed(() => {
  if (isPurchase.value) {
    if (!selectedSupplier.value) return totalSelectedItemsPrice.value;
    return supplierDebt.value + totalSelectedItemsPrice.value;
  } else {
    return newCustomerTotalOwed.value;
  }
});

async function handleSubmit() {
  const currentTransaction = transactionData.value;
  if (!currentTransaction) return;
  
  // Check if transaction is editable
  if (!isEditableTransaction.value) {
    $q.notify({ 
      type: 'warning', 
      message: t('transactionAlpha.transactionNotEditable') || 'This transaction cannot be edited', 
      position: 'top' 
    });
    return;
  }
  
  // Check if branch is selected for update
  if (!selectedBranchId.value) {
    $q.notify({ type: 'warning', message: t('transactionAlpha.pleaseSelectBranch') || 'Please select a branch', position: 'top' });
    return;
  }
  
  if (!canSubmit.value) {
    $q.notify({ type: 'negative', message: t('transactionAlpha.completeRequiredFields') || 'Complete required fields', position: 'top' });
    return;
  }

  try {
    submitting.value = true;

    const payload: any = {
      branch_id: Number(selectedBranchId.value),
      customer_id: Number(selectedCustomerId.value),
      warehouse_id: Number(selectedWarehouseId.value),
      payment_type: selectedPaymentType.value,
      usd_iqd_rate: Number(usdIqdRate.value),
      note: note.value || '',
      created_at: (currentTransaction.created_at || new Date().toISOString().split('T')[0]),
      iqd_price: Number(iqdPrice.value || 0),
      usd_price: Number(usdPrice.value || 0),
      iqd_return_amount: Number(iqdReturnAmount.value || 0),
      usd_return_amount: Number(usdReturnAmount.value || 0),
      forgiven_price: Number(forgivenPrice.value || 0),
      details: selectedItems.value.map((sel) => ({
        item_id: sel.item.id,
        quantity: Number(sel.quantity || 0),
        unit_price: Number(sel.unit_cost || 0),
        solo_unit_price: Number(sel.solo_unit_cost || sel.unit_cost || 0),
        bulk_unit_price: Number(sel.bulk_unit_cost || sel.unit_cost || 0)
      }))
    };

    if (isSell.value) {
      payload.discounted_rate = Number(discountedRate.value || 0);
      payload.status = transactionStatus.value;
    }

    // Use PUT method for update
    const endpoint = isSell.value
      ? `/transactions/update/sell/${currentTransaction.id}`
      : `/transactions/update/purchase/${currentTransaction.id}`;

    await itemTransactionStore.updateTransaction(endpoint, payload);

    $q.notify({ type: 'positive', message: t('transaction.transactionUpdatedSuccessfully'), position: 'top-right' });
    show.value = false;
    emit('success');
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error?.message || t('transaction.errorUpdatingTransaction'), position: 'top-right' });
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  // Load exchange rate if not available
  if (!exchangeRateStore.activeRate) {
    await exchangeRateStore.fetchActiveExchangeRate();
  }
});
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
  width: 95vw;
  max-width: 1200px;
  height: 95vh;
  max-height: 95vh;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header styles */
.modal-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  color: white;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

/* Progress styles */
.progress-container { 
  padding: 8px 16px; 
  background: #f5f5f5;
}
.progress-bar { 
  width: 100%; 
  height: 6px; 
  background: #e0e0e0; 
  border-radius: 6px; 
  overflow: hidden; 
}
.progress-fill { 
  height: 100%; 
  background: linear-gradient(90deg, #42a5f5, #66bb6a); 
  transition: width 0.3s ease;
}

/* Main content */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 24px;
  background: #fafafa;
}

/* Warning banner */
.cashbox-warning-banner,
.loading-banner,
.non-editable-banner {
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.cashbox-warning-banner {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.loading-banner {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.non-editable-banner {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.warning-content,
.loading-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-text,
.loading-text {
  flex: 1;
}

.warning-title,
.loading-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.warning-message {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Content sections */
.content-section { 
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.section-header { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #e3f2fd;
  border-radius: 8px;
}

.section-title { 
  font-size: 1.1rem; 
  font-weight: 700; 
  margin: 0;
  color: #1976d2;
}

/* Form styles */
.form-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); 
  gap: 16px; 
}

.form-item { 
  min-width: 0; 
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #424242;
}

.required-field {
  color: #d32f2f;
}

.required-asterisk {
  color: #d32f2f;
}

/* Summary card */
.summary-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e3f2fd;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e3f2fd;
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #1976d2;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row.highlight {
  background: #fff3e0;
  padding: 12px;
  border-radius: 8px;
  border-bottom: none;
}

.summary-row.discount-row {
  align-items: flex-start;
  gap: 16px;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #424242;
  flex: 1;
}

.summary-value {
  font-weight: 600;
  color: #1976d2;
}

.discount-input-wrapper {
  width: 140px;
}

/* Payment section */
.payment-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.payment-notice,
.branch-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e3f2fd;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #1976d2;
}

.branch-notice {
  background: #fff3e0;
  color: #f57c00;
}

.notice-text {
  font-weight: 500;
}

.payment-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
  gap: 16px; 
}

.payment-item {
  display: flex;
  flex-direction: column;
}

.payment-input {
  margin-top: 4px;
}

.forgiven-price-item {
  grid-column: 1 / -1;
  max-width: 300px;
}

.forgiven-label {
  color: #d32f2f;
}

.forgiven-input {
  border-color: #ffcdd2;
}

.forgiven-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
}

/* Note section */
.note-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.note-textarea { 
  width: 100%; 
}

/* Action buttons */
.action-buttons { 
  display: flex; 
  justify-content: flex-end; 
  gap: 12px; 
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.cancel-btn {
  min-width: 120px;
}

.submit-btn {
  min-width: 150px;
}

/* Badges */
.price-badge { 
  display: inline-block; 
  padding: 6px 12px; 
  border-radius: 16px; 
  font-weight: 600; 
  font-size: 0.9rem;
  background: #e3f2fd;
  color: #1976d2;
}

.total-badge { 
  background: #e8eaf6; 
  color: #3f51b5;
}

.iqd-badge { 
  background: #e0f2f1; 
  color: #00695c;
}

.total-after-discount-badge { 
  background: #f1f8e9; 
  color: #388e3c;
}

.debt-badge {
  background: #fff3e0;
  color: #f57c00;
}

.warning-badge {
  background: #ffebee;
  color: #d32f2f;
}

/* Cashbox status */
.cashbox-status-indicator { 
  margin-top: 8px; 
  display: flex; 
  gap: 8px; 
}

.status-badge { 
  display: inline-flex; 
  align-items: center; 
  gap: 4px; 
  font-size: 0.75rem; 
  padding: 4px 8px; 
  border-radius: 12px; 
  font-weight: 500;
}

.status-opened { 
  background: #e8f5e9; 
  color: #2e7d32; 
}

.status-closed { 
  background: #ffebee; 
  color: #c62828; 
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.bouncy {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.rainbow-progress {
  background: linear-gradient(90deg, 
    #ff6b6b 0%, 
    #4ecdc4 25%, 
    #45b7d1 50%, 
    #96ceb4 75%, 
    #ffeaa7 100%);
  background-size: 200% 100%;
  animation: rainbow 3s ease infinite;
}

@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .professional-modal { 
    width: 100vw; 
    height: 100vh; 
    max-height: 100vh; 
    border-radius: 0; 
  }
  
  .modal-backdrop { 
    padding: 0; 
  }
  
  .modal-content {
    padding: 12px 16px 20px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.1rem;
  }
  
  .header-left {
    gap: 8px;
  }
  
  .transaction-icon-wrapper {
    width: 40px;
    height: 40px;
  }
}
</style>

