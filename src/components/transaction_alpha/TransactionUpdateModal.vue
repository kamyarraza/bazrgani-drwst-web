<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <div class="modal-backdrop">
      <q-card class="professional-modal">
        <!-- Header -->
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

        <!-- Progress -->
        <div class="progress-container cute-progress">
          <div class="progress-bar cute-progress-bar">
            <div class="progress-fill rainbow-progress" :style="{ width: `${getProgressPercentage()}%` }"></div>
          </div>
        </div>

        <!-- Content -->
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
                <h2 class="section-title cute-section-title">💰 {{ t(`transactionAlpha.${isPurchase ? 'paymentToSupplier' : 'paymentFromCustomer'}`) }}</h2>
              </div>

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
                        <q-icon name="percent" color="primary" size="16px" />
                        {{ t('transactionAlpha.discountPercent') }}
                      </div>
                      <div class="summary-value">
                        <q-input v-model.number="discountedRate" type="number" min="0" max="100" dense outlined class="discount-input cute-discount-input" :placeholder="t('transactionAlpha.enterDiscount')" />
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

              <!-- Payment input section -->
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

              <!-- Actions -->
              <div class="action-buttons cute-buttons">
                <q-btn flat :label="t('common.cancel')" @click="close" class="cancel-btn cute-cancel" />
                <q-btn color="primary" :label="t('transaction.updateTransaction')" :loading="submitting" :disable="!canSubmit" unelevated class="submit-btn cute-submit" @click="handleSubmit" />
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
import ItemSelector from './ItemSelector.vue';
import WarehouseSelector from './WarehouseSelector.vue';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { useCustomerStore } from 'src/stores/customerStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { useAuthStore } from 'src/stores/authStore';
import { useCashboxStore } from 'src/stores/cashboxStore';
import type { List } from 'src/types/item_transaction';
import { formatCurrency } from 'src/composables/useFormat';

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
  { label: 'Completed', value: 'completed' },
  { label: 'Reserved', value: 'reserved' }
];

const submitting = ref(false);

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

    // Branch default from user (if not employee hidden)
    selectedBranchId.value = authStore.user?.branch?.id || selectedBranchId.value || null;

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

const { t } = useI18n();
import { useI18n } from 'vue-i18n';

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
  if (authStore.user?.branch?.id && !isEmployee.value) {
    selectedBranchId.value = authStore.user.branch.id;
  }
});

const isEmployee = computed(() => authStore.user?.type === 'employee');
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

.modal-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  color: white;
  padding: 16px 20px;
}

.progress-container { padding: 8px 16px; }
.progress-bar { width: 100%; height: 6px; background: #e0e0e0; border-radius: 6px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #42a5f5, #66bb6a); }

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 24px;
}
.content-section { margin-bottom: 16px; }
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.section-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
.form-item { min-width: 0; }
.payment-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.note-textarea { width: 100%; }
.action-buttons { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }

/* Cute badges */
.price-badge { display: inline-block; padding: 4px 8px; border-radius: 10px; font-weight: 600; background: #e3f2fd; }
.total-badge { background: #e8eaf6; }
.iqd-badge { background: #e0f2f1; }
.total-after-discount-badge { background: #f1f8e9; }

/* Cashbox badges */
.cashbox-status-indicator { margin-top: 6px; display: flex; gap: 6px; }
.status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 2px 6px; border-radius: 6px; }
.status-opened { background: #e8f5e9; color: #2e7d32; }
.status-closed { background: #ffebee; color: #c62828; }

@media (max-width: 768px) {
  .professional-modal { width: 100vw; height: 100vh; max-height: 100vh; border-radius: 0; }
  .modal-backdrop { padding: 0; }
}
</style>

