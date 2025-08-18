<template>
  <div class="payment-type-selector q-pa-md">
    <!-- <div class="text-caption q-mb-xs">{{ t('transactionAlpha.selectPaymentType') }} <span class="text-negative">*</span></div> -->
    <!-- <q-option-group
      v-model="selectedType"
      :options="options"
      color="primary"
      inline
      dense
      @update:model-value="onChange"
      class="q-mb-sm"
    /> -->

    <!-- <q-separator class="q-my-sm" /> -->

    <div class="q-gutter-md">
      <q-btn
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :icon="option.icon"
        :class="{ 'q-btn-selected': selectedType === option.value }"
        @click="onChange(option.value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
  modelValue: { type: String, default: 'cash' }
});
const emit = defineEmits(['update:modelValue']);
// Simple payment options - only the 4 required
const options = [
  {
    label: t('transactionAlpha.cash'),
    value: 'cash',
    icon: 'payments'
  },
  {
    label: t('transactionAlpha.borrow'),
    value: 'borrow',
    icon: 'handshake'
  },
  {
    label: t('transactionAlpha.bank'),
    value: 'bank',
    icon: 'account_balance' // Material icon for bank
  },
  {
    label: t('transactionAlpha.transfer'),
    value: 'transfer',
    icon: 'swap_horiz' // Material icon for transfer/exchange
  },
  {
    label: t('transactionAlpha.credit'),
    value: 'credit',
    icon: 'credit_card'
  },
  {
    label: t('transactionAlpha.debit'),
    value: 'debit',
    icon: 'credit_card'
  },
  {
    label: t('transactionAlpha.other'),
    value: 'other',
    icon: 'more_horiz' // Material icon for "other"
  }
];
const selectedType = ref(props.modelValue || 'cash');
watch(() => props.modelValue, (val) => {
  selectedType.value = val || 'cash';
});
function onChange(val: string) {
  emit('update:modelValue', val);
}
onMounted(() => {
  if (!props.modelValue) {
    emit('update:modelValue', 'cash');
  }
});
</script>

<style scoped>
.q-btn-selected {
  background-color: var(--q-primary);
  color: white;
}
</style>