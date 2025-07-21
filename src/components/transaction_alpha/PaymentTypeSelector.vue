<template>
  <div class="payment-type-selector q-pa-md">
    <div class="text-caption q-mb-xs">Select Payment Type <span class="text-negative">*</span></div>
    <q-option-group
      v-model="selectedType"
      :options="options"
      color="primary"
      inline
      dense
      @update:model-value="onChange"
      class="q-mb-sm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: 'cash' }
});
const emit = defineEmits(['update:modelValue']);

const options = [
  { label: 'Cash', value: 'cash', icon: 'payments' },
  { label: 'Borrow', value: 'borrow', icon: 'credit_card' }
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
