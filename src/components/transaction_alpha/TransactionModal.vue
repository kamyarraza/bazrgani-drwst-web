<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <div class="modal-backdrop">
      <q-card class="professional-modal">
        <!-- Enhanced Header with Glassmorphism -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-left">
              <div class="transaction-icon-wrapper">
                <q-icon :name="transactionTypeIcon" size="28px" class="transaction-icon" />
              </div>
              <div class="header-text">
                <h1 class="modal-title">{{ t('transactionAlpha.transactionTitle', { type: transactionTypeLabel }) }}</h1>
              </div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="close"
              class="close-button"
              size="lg"
            />
          </div>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${getProgressPercentage()}%` }"
            ></div>
          </div>
          <div class="progress-steps">
            <div class="step" :class="{ active: true, completed: isFirstSectionComplete }">
              <div class="step-number">1</div>
              <span class="step-label">{{ t('transactionAlpha.basicInfo') }}</span>
            </div>
            <div class="step" :class="{ active: isFirstSectionComplete, completed: hasSelectedItems }">
              <div class="step-number">2</div>
              <span class="step-label">{{ t('transactionAlpha.itemSelection') }}</span>
            </div>
            <div class="step" :class="{ active: hasSelectedItems }">
              <div class="step-number">3</div>
              <span class="step-label">{{ t('transactionAlpha.review') }}</span>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="modal-content">
          <!-- Step 1: Basic Information -->
          <div class="content-section" :class="{ 'section-active': true }">
            <div class="section-header">
              <div class="section-icon">
                <q-icon name="person" size="20px" />
              </div>
              <h2 class="section-title">{{ t('transactionAlpha.customerAndTransactionDetails') }}</h2>
            </div>

            <div class="form-grid">
              <div class="form-item">
                <CustomerSelector
                  ref="customerSelectorRef"
                  :customerType="transactionType === 'purchase' ? 'supplier' : 'customer'"
                  v-model="selectedCustomerId"
                  @select="handleSelectCustomer"
                />
              </div>
              <div class="form-item" :style="isEmployee ? 'display:none' : ''">
                <BranchSelector v-model="selectedBranchId" @select="handleSelectBranch" />
              </div>
              <div class="form-item">
                <WarehouseSelector
                  ref="warehouseSelectorRef"
                  v-model="selectedWarehouseId"
                  :branchId="selectedBranchId"
                  :disabled="!selectedBranchId"
                />
              </div>
              <div class="form-item">
                <PaymentTypeSelector v-model="selectedPaymentType" />
              </div>
              <div v-if="transactionType === 'sell'" class="form-item status-item">
                <label class="form-label">{{ t('transactionAlpha.transactionStatus') }}</label>
                <q-option-group
                  v-model="transactionStatus"
                  :options="statusOptions"
                  type="radio"
                  color="primary"
                  inline
                  dense
                  class="status-options"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Item Selection -->
          <transition name="slide-fade">
            <div v-if="isFirstSectionComplete" class="content-section" :class="{ 'section-active': isFirstSectionComplete }">
              <div class="section-header">
                <div class="section-icon">
                  <q-icon name="inventory_2" size="20px" />
                </div>
                <h2 class="section-title">{{ t('transactionAlpha.itemSelection') }}</h2>
              </div>
              <ItemSelector
                ref="itemSelectorRef"
                v-model:selectedItems="selectedItems"
                :transactionType="transactionType"
                :warehouseId="selectedWarehouseId"
              />
            </div>
          </transition>

          <!-- Step 3: Review & Submit -->
          <transition name="slide-fade">
            <div v-if="isFirstSectionComplete && hasSelectedItems" class="content-section" :class="{ 'section-active': hasSelectedItems }">
              <div class="section-header">
                <div class="section-icon">
                  <q-icon name="receipt_long" size="20px" />
                </div>
                <h2 class="section-title">{{ t('transactionAlpha.debtPaymentSection') }}</h2>
              </div>

              <!-- Financial Summary Card -->
              <div class="summary-card">
                <div class="summary-header">
                  <q-icon name="account_balance_wallet" size="24px" color="primary" />
                  <h3 class="summary-title">{{ t('transactionAlpha.financialSummary') }}</h3>
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
                        <q-input
                          v-model.number="discountedRate"
                          type="number"
                          min="0"
                          max="100"
                          dense
                          outlined
                          class="discount-input"
                        />
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

              <!-- Note Section -->
              <div class="note-section">
                <div class="section-header">
                  <div class="section-icon">
                    <q-icon name="note" size="20px" />
                  </div>
                  <h3 class="section-title">{{ t('transactionAlpha.note') }}</h3>
                </div>
                <q-input
                  v-model="note"
                  type="textarea"
                  :label="t('transactionAlpha.addNoteOptional')"
                  outlined
                  autogrow
                  class="note-textarea"
                />
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <q-btn
                  flat
                  :label="t('common.cancel')"
                  @click="close"
                  class="cancel-btn"
                />
                <q-btn
                  color="primary"
                  :label="t('transactionAlpha.submitTransaction')"
                  :loading="submitting"
                  :disable="!canSubmit"
                  unelevated
                  class="submit-btn"
                  @click="handleSubmit"
                />
              </div>
            </div>
          </transition>
        </div>
      </q-card>
    </div>
  </q-dialog>

  <!-- Invoice Modal -->
  <PrintableInvoice
    v-model="showInvoiceModal"
    :transaction="createdTransaction"
    @transaction-updated="handleTransactionUpdated"
    @close="closeInvoiceModal"
  />
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

const selectedCustomerId = ref<number|null>(null);
const selectedBranchId = ref(null);
const selectedPaymentType = ref('cash');
const selectedItems: Ref<SelectedItem[]> = ref([]);
const note = ref("");
const selectedWarehouseId = ref(null);
const discountedRate = ref(0);
const transactionStatus = ref<'completed' | 'reserved'>('completed');
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

const $q = useQuasar();
const itemTransactionStore = useItemTransactionStore();
const submitting = ref(false);

// Invoice modal state
const showInvoiceModal = ref(false);
const createdTransaction = ref<List | null>(null);

const canSubmit = computed(() => {
  return selectedCustomerId.value && selectedBranchId.value && selectedPaymentType.value && selectedItems.value.length > 0;
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
    $q.notify({ type: 'negative', message: 'Please fill all required fields and select at least one item.' });
    return;
  }
  submitting.value = true;
  try {
    const transaction: any = {
      customer_id: selectedCustomerId.value as number, // ensure number
      branch_id: Number(selectedBranchId.value),
      warehouse_id: Number(selectedWarehouseId.value),
      payment_type: selectedPaymentType.value,
      note: note.value,
      usd_iqd_rate: usdIqdRate.value,
      details: selectedItems.value.map(sel => {
        const base = {
          item_id: sel.item.id,
          quantity: sel.quantity,
          unit_price: sel.unit_cost
        };
        if (props.transactionType === 'purchase') {
          return {
            ...base,
            solo_unit_price: sel.solo_unit_cost,
            bulk_unit_price: sel.bulk_unit_cost
          };
        }
        return base;
      })
    };
    if (props.transactionType === 'sell') {
      transaction.discounted_rate = discountedRate.value;
      transaction.status = transactionStatus.value;
    }
    const response = await itemTransactionStore.createTransaction(transaction, props.transactionType === 'sell' ? 'sale' : 'purchase');

    // Transform the API response to match the List interface for invoice
    if (response && response.data) {
      const apiData = response.data as any; // Use any to handle the actual API response structure

      // Get warehouse information from the store since it's not in the API response
      const selectedWarehouse = itemTransactionStore.warehouses.find(w => w.id === selectedWarehouseId.value);

      const transformedTransaction: List = {
        id: apiData.id,
        type: apiData.type,
        customer: {
          id: apiData.customer?.id || 0,
          name: apiData.customer?.name || '',
          type: apiData.customer?.type || '',
          phone: apiData.customer?.fphone || apiData.customer?.phone || ''
        },
        warehouse: {
          id: selectedWarehouse?.id || selectedWarehouseId.value || 0,
          name: selectedWarehouse?.name || '',
          code: selectedWarehouse?.code || '',
          capacity: selectedWarehouse?.capacity || 0
        },
        payment_type: apiData.payment_type,
        items: apiData.items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          solo_unit_price: item.solo_unit_price || item.unit_price,
          bulk_unit_price: item.bulk_unit_price || item.unit_price
        })) || [],
        total_price: apiData.total_price,
        paid_price: apiData.paid_price,
        unpaid_price: apiData.unpaid_price || 0,
        usd_iqd_rate: apiData.usd_iqd_rate || 0,
        note: apiData.note || '',
        status: apiData.status || 'completed',
        created_at: apiData.created_at
      };

            createdTransaction.value = transformedTransaction;
      showInvoiceModal.value = true;
    }

    $q.notify({ type: 'positive', message: 'Transaction submitted successfully!' });
    // Don't clear modal data immediately - let the invoice show first
    // void clearModalData();
    show.value = false;
  } catch (_err) {
    $q.notify({ type: 'negative', message: 'Failed to submit transaction.' });
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

// New methods for professional design
function getTransactionSubtitle() {
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
/* Professional Modal Design - Inspired by modern SaaS applications */

/* Backdrop with glassmorphism effect */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Main modal container */
.professional-modal {
  width: 95vw;
  max-width: 1200px;
  height: 95vh;
  max-height: 900px;
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Enhanced Header - Compact for laptops */
.modal-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  padding: 16px 24px;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.transaction-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.transaction-icon {
  color: white;
}

.header-text {
  color: white;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.close-button {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.05);
}

/* Progress Indicator - Compact */
.progress-container {
  padding: 12px 24px;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.progress-bar {
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
}

/* Main Content - More space for content */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: white;
}

.content-section {
  margin-bottom: 24px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.content-section.section-active {
  opacity: 1;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.25px;
}

/* Form Grid - Optimized for laptops */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-item {
  position: relative;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.status-item {
  grid-column: 1 / -1;
}

.status-options {
  margin-top: 8px;
}

/* Summary Card - Compact */
.summary-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
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
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.highlight {
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0 -16px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
}

.summary-value.debt {
  color: #d32f2f;
}

.summary-value.total {
  color: #1976d2;
  font-size: 1rem;
}

.summary-value.warning {
  color: #f57c00;
}

.currency {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 4px;
}

.summary-input {
  flex-shrink: 0;
}

.discount-input {
  width: 100px;
}

.discount-row {
  align-items: flex-start;
}

/* Note Section */
.note-section {
  margin-bottom: 32px;
}

.note-textarea {
  margin-top: 16px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.cancel-btn {
  color: #6b7280 !important;
  font-weight: 500;
}

.submit-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  color: white !important;
  font-weight: 600;
  padding: 12px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  transition: all 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.submit-btn:disabled {
  background: #e5e7eb !important;
  color: #9ca3af !important;
  transform: none;
  box-shadow: none;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .professional-modal {
    width: 98vw;
    height: 95vh;
  }

  .modal-content {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modal-header {
    padding: 20px 24px;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-subtitle {
    font-size: 0.875rem;
  }

  .transaction-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .progress-container {
    padding: 16px 24px;
  }

  .modal-content {
    padding: 20px;
  }

  .summary-card {
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .professional-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-content {
    padding: 16px;
  }

  .summary-card {
    padding: 16px;
  }

  .form-grid {
    gap: 16px;
  }
}
</style>
