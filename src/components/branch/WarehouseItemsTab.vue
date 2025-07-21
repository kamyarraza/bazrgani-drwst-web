<template>
  <div>
    <WarehouseItems
      :selected-warehouse="warehouse"
      :show-items-tab="true"
      @back="$emit('go-back')"
    />
  </div>
</template>

<script setup lang="ts">

import WarehouseItems from 'src/components/warehouse_item/WarehouseItems.vue';
import type { Warehouse } from 'src/types/warehouse';

 defineProps<{
  warehouse: Warehouse | null;
}>();

defineEmits(['go-back']);


</script>

<style lang="scss" scoped>
// Add any WarehouseItems specific styling here
</style>
