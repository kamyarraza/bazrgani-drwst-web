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
                  {{ isSell ? '💰' : '🛒' }}
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
              <div class="section-header cute-section-header">
                <div class="section-icon cute-section-icon">
                  <q-icon name="inventory_2" size="20px" />
                </div>
                <h2 class="section-title cute-section-title">🛍️ {{ t('transactionAlpha.itemSelection') }}</h2>
              </div>
              <ItemSelectorUpdate ref="itemSelectorRef" v-model:selectedItems="selectedItems" :transactionType="transactionType" :warehouseId="selectedWarehouseId" />
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
                  </template>

                  <template v-else>
                    <div class="summary-row">
                      <div class="summary-label">
                        <q-icon name="person" color="primary" size="16px" />
                        {{ t('transactionAlpha.customer') }}
                      </div>
                      <div class="summary-value">{{ selectedCustomer ? selectedCustomer.fname + ' ' + selectedCustomer.sname : '-' }}</div>
                    </div>
                    <div class="summary-row discount-row">
                      <div class="summary-label">
                        <q-icon name="percent" color="primary" size="16px" />
                        {{ t('transactionAlpha.discountPercent') }}
                      </div>
                      <div class="summary-value">
                        <div class="discount-input-wrapper">
                          <q-input v-model.number="discountedRate" type="number" min="0" max="100" dense outlined
                            class="discount-input cute-discount-input"
                            :placeholder="t('transactionAlpha.enterDiscount')" :rules="[
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
                  </template>
                </div>
              </div>

              <!-- Payment and Return Amount Section -->
              <div class="payment-section" v-if="selectedPaymentType === 'cash' || selectedPaymentType === 'borrow'">
                <div class="section-header cute-section-header">
                  <div class="section-icon cute-section-icon">
                    <q-icon name="payments" size="20px" />
                  </div>
                  <h2 class="section-title cute-section-title">💰 {{ t(`transactionAlpha.${isPurchase ? 'paymentToSupplier' : 'paymentFromCustomer'}`) }}</h2>
                </div>

                <div class="payment-grid">
                  <div class="payment-item">
                    <label class="form-label" :class="{ 'required-field': selectedPaymentType === 'cash' }">
                      <q-icon name="currency_exchange" color="primary" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'iqdAmountWePay' : 'iqdAmountCustomerPays'}`) }}
                      <span v-if="selectedPaymentType === 'cash'" class="required-asterisk">*</span>
                    </label>
                    <q-input v-model.number="iqdPrice" type="number" min="0" dense outlined suffix="IQD" class="payment-input" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label" :class="{ 'required-field': selectedPaymentType === 'cash' }">
                      <q-icon name="attach_money" color="primary" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'usdAmountWePay' : 'usdAmountCustomerPays'}`) }}
                      <span v-if="selectedPaymentType === 'cash'" class="required-asterisk">*</span>
                    </label>
                    <q-input v-model.number="usdPrice" type="number" min="0" step="0.01" dense outlined suffix="USD" class="payment-input" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label">
                      <q-icon name="keyboard_return" color="warning" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'iqdReturnFromSupplier' : 'iqdReturnToCustomer'}`) }}
                    </label>
                    <q-input v-model.number="iqdReturnAmount" type="number" min="0" dense outlined suffix="IQD" class="payment-input" />
                  </div>

                  <div class="payment-item">
                    <label class="form-label">
                      <q-icon name="keyboard_return" color="warning" size="16px" />
                      {{ t(`transactionAlpha.${isPurchase ? 'usdReturnFromSupplier' : 'usdReturnToCustomer'}`) }}
                    </label>
                    <q-input v-model.number="usdReturnAmount" type="number" min="0" step="0.01" dense outlined suffix="USD" class="payment-input" />
                  </div>

                  <div class="payment-item forgiven-price-item">
                    <label class="form-label forgiven-label">
                      <q-icon name="heart_broken" color="negative" size="16px" />
                      {{ t('transactionAlpha.forgivenPrice') }}
                    </label>
                    <q-input v-model.number="forgivenPrice" type="number" min="0" dense outlined suffix="IQD" class="payment-input forgiven-input" />
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
                <q-btn color="primary" :label="'🔄 ' + t('transaction.updateTransaction')" :loading="submitting" :disable="!canSubmit" unelevated class="submit-btn cute-submit" @click="handleSubmit" />
              </div>
            </div>
          </transition>
        </div>
      </q-card>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import CustomerSelector from './CustomerSelector.vue';
import BranchSelector from './BranchSelector.vue';
import PaymentTypeSelector from './PaymentTypeSelector.vue';
import ItemSelectorUpdate from './ItemSelectorUpdate.vue';
import WarehouseSelector from './WarehouseSelector.vue';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { useCustomerStore } from 'src/stores/customerStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { useAuthStore } from 'src/stores/authStore';
import { useCashboxStore } from 'src/stores/cashboxStore';
import type { List } from 'src/types/item_transaction';
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

const props = defineProps<{ modelValue: boolean; transactionData: List | null }>();
const emit = defineEmits(['update:modelValue', 'success']);

const show = computed({ get: () => props.modelValue, set: (v: boolean) => emit('update:modelValue', v) });

const $q = useQuasar();
const { t } = useI18n();
const itemTransactionStore = useItemTransactionStore();
const customerStore = useCustomerStore();
const exchangeRateStore = useExchangeRateStore();
const authStore = useAuthStore();
const cashboxStore = useCashboxStore();

const transactionType = computed<'purchase' | 'sell'>(() => (props.transactionData?.type === 'purchase' ? 'purchase' : 'sell'));
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

const selectedSupplier = ref<any | null>(null);
const selectedCustomer = ref<any | null>(null);

const usdIqdRate = computed(() => props.transactionData?.usd_iqd_rate || exchangeRateStore.activeRate?.usd_iqd_rate || 0);

const selectedItems = ref<SelectedItem[]>([]);

const statusOptions = [
  { label: t('transaction.statusTypes.completed'), value: 'completed' },
  { label: t('transaction.statusTypes.reserved'), value: 'reserved' }
];

const submitting = ref(false);

const isFirstSectionComplete = computed(() => {
  return !!selectedCustomerId.value && !!selectedBranchId.value && !!selectedWarehouseId.value && !!selectedPaymentType.value;
});

const canSubmit = computed(() => {
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

// Prefill when data arrives
watch(
  () => props.transactionData,
  async (tx) => {
    if (!tx) return;

    selectedCustomerId.value = tx.customer?.id || null;
    selectedWarehouseId.value = tx.warehouse?.id || null;
    selectedPaymentType.value = normalizePaymentType(tx.payment_type);
    note.value = tx.note || '';
    discountedRate.value = tx.discounted_rate || 0;
    transactionStatus.value = (tx.status as 'completed' | 'reserved') || 'completed';
    forgivenPrice.value = tx.forgiven_price || 0;

    // Prefill selected items from transaction with complete item object
    selectedItems.value = (tx.items || []).map((it) => ({
      item: {
        id: it.id,
        name: it.name,
        solo_unit_price: Number(it.solo_unit_price || it.unit_price || 0),
        bulk_unit_price: Number(it.bulk_unit_price || it.unit_price || 0),
        unit_cost: Number(it.unit_price) || 0,
        sku: '',
        category: null,
        quantity: 0,
        package_units: 0,
        packet_units: 0
      },
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

    // Branch default from user (if not employee hidden)
    selectedBranchId.value = (authStore.user as any)?.branch?.id || selectedBranchId.value || null;

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

function close() {
  show.value = false;
}

async function handleSelectCustomer(customer: any) {
  try {
    await customerStore.getCustomerDetails(String(customer.id));
    if (customerStore.currentCustomer) {
      if (isPurchase.value) {
        selectedSupplier.value = customerStore.currentCustomer;
      } else {
        selectedCustomer.value = customerStore.currentCustomer;
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

async function handleSubmit() {
  if (!props.transactionData) return;
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
      created_at: (props.transactionData.created_at || new Date().toISOString().split('T')[0]),
      iqd_price: Number((isSell.value ? totalAfterDiscount.value : totalSelectedItemsPrice.value) * Number(usdIqdRate.value)),
      usd_price: Number(isSell.value ? totalAfterDiscount.value : totalSelectedItemsPrice.value),
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

    const endpoint = isSell.value
      ? `/transactions/update/sell/${props.transactionData.id}`
      : `/transactions/update/purchase/${props.transactionData.id}`;

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

onMounted(() => {
  // Default branch for non-employees
  if ((authStore.user as any)?.branch?.id && !isEmployee.value) {
    selectedBranchId.value = (authStore.user as any).branch.id;
  }
});

const isEmployee = computed(() => authStore.user?.type === 'employee');
</script>

<style lang="scss" scoped>
/* Cute and User-Friendly Modal Design - Matching Create Modal */

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

/* Header Content */
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.transaction-icon {
  color: white;
}

.header-text {
  color: white;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-button {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
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
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.bouncy {
  animation: iconBounce 1.5s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.cute-title {
  font-size: 1.2rem !important;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cute-close {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
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
  background: linear-gradient(90deg, #ff6b9d 0%, #c44569 20%, #f8b500 40%, #3742fa 60%, #2ed573 80%, #ff6b9d 100%);
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
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
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.cute-section-title {
  font-size: 1.2rem !important;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
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

.cute-summary-header {
  position: relative;
  z-index: 2;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.summary-content {
  position: relative;
  z-index: 2;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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

.discount-input {
  max-width: 120px;
}

/* Price Badge Styles */
.price-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.total-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.iqd-badge {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.total-after-discount-badge {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.form-label.required-field {
  color: #2b6cb0;
  font-weight: 600;
}

.required-asterisk {
  color: #e53e3e;
  font-weight: bold;
  margin-left: 2px;
}

.payment-input {
  width: 100%;
}

/* Note Section */
.note-section {
  margin-bottom: 32px;
  background: linear-gradient(135deg, #e8f4fd 0%, #c3e8f8 100%);
  padding: 20px;
  border-radius: 15px;
  border: 2px solid rgba(116, 185, 255, 0.2);
}

.note-textarea {
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #2d3436;
}

/* Cashbox Status Indicator */
.cashbox-status-indicator {
  margin-top: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-opened {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.status-closed {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: white;
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

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Cute animations */
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

/* Responsive Design */
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

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .payment-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-content {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
