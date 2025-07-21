<template>
  <!-- Pass the transaction to the new PrintableBlumInvoice component -->
  <PrintableBlumInvoice
    v-model="dialogVisible"
    :blumTransaction="transaction"
    @blum-transaction-updated="handleTransactionUpdated"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useBlumTransactionStore } from 'src/stores/blumTransactionStore';
import PrintableBlumInvoice from 'src/components/invoice/PrintableBlumInvoice.vue';

// Props & Emits
const props = defineProps<{
  modelValue: boolean;
  transactionId: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// Composables
const blumTransactionStore = useBlumTransactionStore();

// Dialog visibility
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Data
const transaction = computed(() => blumTransactionStore.currentTransaction);

// Methods
const handleClose = () => {
  emit('update:modelValue', false);
};

const handleTransactionUpdated = async () => {
  // Refresh the transaction data when updated
  if (props.transactionId) {
    await blumTransactionStore.getBlumTransaction(props.transactionId);
  }
};

// Watch for transaction ID changes
watch(() => props.transactionId, async (newId) => {
  if (newId && props.modelValue) {
    await blumTransactionStore.getBlumTransaction(newId);
  }
});

// Watch for dialog opening
watch(() => props.modelValue, async (isVisible) => {
  if (isVisible && props.transactionId) {
    await blumTransactionStore.getBlumTransaction(props.transactionId);
  } else if (!isVisible) {
    blumTransactionStore.resetCurrentTransaction();
  }
});

// Lifecycle
onMounted(async () => {
  if (props.modelValue && props.transactionId) {
    await blumTransactionStore.getBlumTransaction(props.transactionId);
  }
});
</script>

<style scoped>
/* No additional styles needed - using BlumTransactionInvoice styles directly */
</style>
