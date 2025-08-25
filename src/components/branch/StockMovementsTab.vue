<template>
  <div>
    <StockMovements
      :selected-warehouse="warehouse"
      :show-items-tab="true"
      @back="$emit('go-back')"
    />
  </div>
</template>

<script setup lang="ts">

import type { Warehouse } from 'src/types/warehouse';
import StockMovements from '../warehouse_item/StockMovements.vue';

 defineProps<{
  warehouse: Warehouse | null;
}>();

defineEmits(['go-back']);


</script>

<style lang="scss" scoped>
// Add any WarehouseItems specific styling here
</style>
