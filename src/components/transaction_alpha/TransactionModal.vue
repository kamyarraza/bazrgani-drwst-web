<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="q-pa-none full-width full-height">
      <div class="transaction-modal-header bg-primary text-white flex items-center justify-between shadow-1">
        <div class="row items-center no-wrap">
          <q-icon :name="transactionTypeIcon" size="32px" class="q-mr-md" />
          <span class="text-h5 text-weight-bold">{{ t('transactionAlpha.transactionTitle', { type: transactionTypeLabel }) }}</span>
        </div>
        <q-btn flat round dense icon="close" @click="close" class="close-btn" />
      </div>
      <div class="q-pa-lg">
        <q-separator color="primary" class="q-mb-md" />
        <div class="section-title q-mb-md">{{ t('transactionAlpha.customerAndTransactionDetails') }}</div>
        <div class="flex-row items-center">
          <div class="flex-item">
            <CustomerSelector ref="customerSelectorRef" :customerType="transactionType === 'purchase' ? 'supplier' : 'customer'" v-model="selectedCustomerId" @select="handleSelectCustomer" />
          </div>
          <div class="flex-item">
            <BranchSelector v-model="selectedBranchId" @select="handleSelectBranch" />
          </div>
          <div class="flex-item">
            <WarehouseSelector ref="warehouseSelectorRef" v-model="selectedWarehouseId" :branchId="selectedBranchId" :disabled="!selectedBranchId" />
          </div>
          <div class="flex-item items-center q-mt-none q-mb-none">
            <PaymentTypeSelector v-model="selectedPaymentType" />
          </div>
          <div v-if="transactionType === 'sell'" class="flex-item items-center q-mt-none q-mb-none">
            <div class="text-caption q-mb-xs">{{ t('transactionAlpha.transactionStatus') }}</div>
            <q-option-group
              v-model="transactionStatus"
              :options="statusOptions"
              type="radio"
              color="primary"
              inline
              dense
              class="q-mt-none q-mb-none"
            />
          </div>
        </div>
        <transition name="fade">
          <div v-if="isFirstSectionComplete">
            <q-separator color="primary" class="q-my-lg" />
            <div class="section-title q-mb-md">{{ t('transactionAlpha.itemSelection') }}</div>
            <ItemSelector ref="itemSelectorRef" v-model:selectedItems="selectedItems" :transactionType="transactionType" :warehouseId="selectedWarehouseId" />
          </div>
        </transition>
        <transition name="fade">
          <div v-if="isFirstSectionComplete && hasSelectedItems">
            <q-separator color="primary" class="q-my-lg" />
            <div class="section-title q-mb-md">{{ t('transactionAlpha.debtPaymentSection') }}</div>
            <q-markup-table flat bordered class="q-mb-md" style="min-width: 350px;">
              <tbody>
                <tr>
                  <td class="text-left">
                    <q-icon name="paid" color="primary" class="q-mr-sm" />
                    {{ t('transactionAlpha.usdIqd') }}
                  </td>
                  <td class="text-right text-weight-bold">
                    {{ usdIqdRate }} <span class="text-grey-7 q-ml-xs">IQD</span>
                  </td>
                </tr>
                <template v-if="transactionType === 'purchase'">
                  <tr>
                    <td class="text-left">
                      <q-icon name="store" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.supplier') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ selectedSupplier ? selectedSupplier.fname + ' ' + selectedSupplier.sname : '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      <q-icon name="account_balance_wallet" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.weOweSupplier') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(supplierDebt) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      <q-icon name="shopping_cart" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.totalPriceOfSelectedItems') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(totalSelectedItemsPrice) }}
                    </td>
                  </tr>
                  <tr v-if="selectedPaymentType === 'borrow'">
                    <td class="text-left">
                      <q-icon name="trending_up" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.newTotalOwed') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(newTotalOwed) }}
                    </td>
                  </tr>
                </template>
                <template v-if="transactionType === 'sell'">
                  <tr>
                    <td class="text-left">
                      <q-icon name="person" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.customer') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ selectedCustomer ? selectedCustomer.fname + ' ' + selectedCustomer.sname : '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      <q-icon name="account_balance_wallet" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.customerOwesUs') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(customerDebt) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      <q-icon name="shopping_cart" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.totalPriceBeforeDiscount') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(totalSelectedItemsPrice) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      <q-icon name="percent" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.discountPercent') }}
                    </td>
                    <td class="text-right">
                      <q-input v-model.number="discountedRate" type="number" min="0" max="100" dense outlined style="max-width: 90px; display: inline-block;" />
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      <q-icon name="attach_money" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.totalPriceAfterDiscount') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(totalAfterDiscount) }}
                    </td>
                  </tr>
                  <tr v-if="selectedPaymentType === 'borrow'">
                    <td class="text-left">
                      <q-icon name="trending_up" color="primary" class="q-mr-sm" />
                      {{ t('transactionAlpha.newTotalOwed') }}
                    </td>
                    <td class="text-right text-weight-bold">
                      {{ formatCurrency(newCustomerTotalOwed) }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </q-markup-table>
            <q-separator color="primary" class="q-my-lg" />
            <div class="section-title q-mb-md q-mt-xl">{{ t('transactionAlpha.note') }}</div>
            <q-input
              v-model="note"
              type="textarea"
              :label="t('transactionAlpha.addNoteOptional')"
              outlined
              autogrow
              class="note-textarea"
              style="width: 100%;"
            />
            <div class="row justify-end q-mt-md">
              <q-btn
                color="primary"
                class="submit-btn"
                :label="t('transactionAlpha.submitTransaction')"
                :loading="submitting"
                :disable="!canSubmit"
                unelevated
                rounded
                size="md"
                @click="handleSubmit"
              />
            </div>
          </div>
        </transition>
      </div>
    </q-card>
  </q-dialog>
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
import type { Ref } from 'vue';
import { formatCurrency } from 'src/composables/useFormat';
import { useI18n } from 'vue-i18n';
import type { Customer } from 'src/types/customer';
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
  { label: 'Complete', value: 'completed' },
  { label: 'Reserved', value: 'reserved' }
];

const customerStore = useCustomerStore();
const selectedSupplier: Ref<Customer | null> = ref(null);
const supplierDebt = ref(0);
const selectedCustomer: Ref<Customer | null> = ref(null);
const customerDebt = ref(0);

const exchangeRateStore = useExchangeRateStore();

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
      details: selectedItems.value.map(sel => ({
        item_id: sel.item.id,
        quantity: sel.quantity,
        unit_price: sel.unit_cost,
        solo_unit_price: sel.solo_unit_cost,
        bulk_unit_price: sel.bulk_unit_cost
      }))
    };
    if (props.transactionType === 'sell') {
      transaction.discounted_rate = discountedRate.value;
      transaction.status = transactionStatus.value;
    }
    await itemTransactionStore.createTransaction(transaction, props.transactionType === 'sell' ? 'sale' : 'purchase');
    $q.notify({ type: 'positive', message: 'Transaction submitted successfully!' });
    void clearModalData();
    show.value = false;
    // Optionally close modal or reset form here
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

const isFirstSectionComplete = computed(() => {
  return !!selectedCustomerId.value && !!selectedBranchId.value && !!selectedWarehouseId.value && !!selectedPaymentType.value;
});
const hasSelectedItems = computed(() => selectedItems.value.length > 0);
</script>

<style scoped>
.full-width { width: 100vw; }
.full-height { height: 100vh; }

.transaction-modal-header {
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.text-h5 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.close-btn {
  margin-left: 16px;
  color: white;
  background: rgba(255,255,255,0.08);
  transition: background 0.2s;
}
.close-btn:hover {
  background: rgba(255,255,255,0.18);
}
.flex-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.flex-item {
  flex: 1 1 0;
  min-width: 0;
}
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976d2;
  letter-spacing: 0.5px;
}
.note-textarea {
  min-height: 80px;
  margin-bottom: 32px;
}
.submit-btn {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: 140px;
  max-width: 220px;
  margin-top: 12px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
