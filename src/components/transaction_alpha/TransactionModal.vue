<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="q-pa-none full-width full-height">
      <div class="transaction-modal-header bg-primary text-white flex items-center justify-between shadow-1">
        <div class="row items-center no-wrap">
          <q-icon :name="transactionTypeIcon" size="32px" class="q-mr-md" />
          <span class="text-h5 text-weight-bold">Transaction – {{ transactionTypeLabel }}</span>
        </div>
        <q-btn flat round dense icon="close" @click="close" class="close-btn" />
      </div>
      <div class="q-pa-lg">
        <div class="row q-gutter-md">
          <div class="col-4">
            <CustomerSelector :customerType="transactionType === 'purchase' ? 'supplier' : 'customer'" v-model="selectedCustomerId" @select="handleSelectCustomer" />
          </div>
          <div class="col-4">
            <BranchSelector v-model="selectedBranchId" @select="handleSelectBranch" />
          </div>
          <div class="col-4">
            <PaymentTypeSelector v-model="selectedPaymentType" />
          </div>
        </div>
        <!-- Future steps/components can go here -->
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { QDialog, QCard, QIcon, QBtn } from 'quasar';
import CustomerSelector from './CustomerSelector.vue';
import BranchSelector from './BranchSelector.vue';
import PaymentTypeSelector from './PaymentTypeSelector.vue';

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

const selectedCustomerId = ref(null);
const selectedBranchId = ref(null);
const selectedPaymentType = ref('cash');

function handleSelectCustomer(customer) {
  // For now, just log the selection
  // You can add logic for next steps here
  console.log('Selected customer/supplier:', customer);
}

function handleSelectBranch(branch) {
  // For now, just log the selection
  // You can add logic for next steps here
  console.log('Selected branch:', branch);
}

function close() {
  show.value = false;
}
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
</style>
