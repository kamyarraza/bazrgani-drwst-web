<template>
  <div class="warehouse-selector q-pa-md">
    <div class="text-caption q-mb-xs">{{ t('transactionAlpha.selectWarehouse') }} <span class="text-negative">*</span></div>
    <q-input
      v-model="searchQuery"
      outlined
      clearable
      dense
      :loading="loading"
      @focus="onFocus"
      @blur="onBlur"
      hide-bottom-space
      class="warehouse-input"
      ref="inputRef"
      :disable="disabled"
      :hint="t('transactionAlpha.typeToSearchWarehouses')"
    >
      <template v-slot:prepend>
        <q-icon name="warehouse" />
      </template>
    </q-input>
    <div v-if="error" class="text-negative q-mt-xs">{{ error }}</div>
    <!-- Warehouse Results List -->
    <div v-if="showResultsList" class="warehouse-results q-mt-sm">
      <q-card flat bordered class="results-card">
        <q-list separator class="results-list">
          <q-item
            v-for="warehouse in warehouseOptions"
            :key="warehouse.id"
            clickable
            v-ripple
            @click="selectWarehouse(warehouse)"
            class="warehouse-item"
            :class="{ 'selected': modelValue === warehouse.id }"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="md">
                {{ warehouse.name.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="warehouse-name">
                {{ warehouse.name }}
              </q-item-label>
              <q-item-label caption v-if="warehouse.code || (warehouse.location && warehouse.location.name)" class="warehouse-details">
                <span v-if="'code' in warehouse && warehouse.code">{{ warehouse.code ?? '' }}</span>
                <span v-if="'code' in warehouse && warehouse.code && 'location' in warehouse && warehouse.location && 'name' in warehouse.location && warehouse.location.name"> • </span>
                <span v-if="'location' in warehouse && warehouse.location && 'name' in warehouse.location && warehouse.location.name">{{ warehouse.location.name }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="modelValue === warehouse.id">
              <q-icon name="check_circle" color="positive" size="sm" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  modelValue: { type: [Number, null], default: null },
  branchId: { type: [Number, null], default: null },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);

const itemTransactionStore = useItemTransactionStore();
const loading = ref(false);
interface WarehouseOption {
  id: number;
  name: string;
  code?: string;
  location?: { name?: string };
}
const warehouseOptions = ref<WarehouseOption[]>([]);
const selectedWarehouseId = ref(props.modelValue);
const searchQuery = ref('');
const inputRef = ref(null);
const isFocused = ref(false);

const showResultsList = computed(() => isFocused.value && warehouseOptions.value.length > 0);

defineExpose({
  getOptions: () => warehouseOptions.value,
  selectWarehouse
});

watch(() => props.modelValue, (val) => {
  selectedWarehouseId.value = val;
});

watch(selectedWarehouseId, (val) => {
  emit('update:modelValue', val);
});

watch(() => props.branchId, async (branchId) => {
  if (branchId) {
    loading.value = true;
    await itemTransactionStore.fetchBranchWarehouses(branchId);
    warehouseOptions.value = itemTransactionStore.warehouses.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      location: { name: (w as any).location?.name || '' }
    }));
    // Auto-select first warehouse if none is selected
    if (warehouseOptions.value.length > 0 && (props.modelValue === null || props.modelValue === undefined)) {
      const first = warehouseOptions.value[0];
      if (first) {
        emit('update:modelValue', first.id);
        selectedWarehouseId.value = first.id;
        searchQuery.value = first.name;
      }
    }
    loading.value = false;
  } else {
    warehouseOptions.value = [];
  }
});

watch(searchQuery, (val) => {
  // Simple client-side filter for now
  if (!val || !val.trim()) {
    warehouseOptions.value = itemTransactionStore.warehouses.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      location: { name: (w as any).location?.name || '' }
    }));
    return;
  }
  const lower = val.trim().toLowerCase();
  warehouseOptions.value = itemTransactionStore.warehouses
    .filter(w => w.name.toLowerCase().includes(lower) || (w.code && w.code.toLowerCase().includes(lower)))
    .map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      location: { name: (w as any).location?.name || '' }
    }));
});

onMounted(async () => {
  if (props.branchId) {
    loading.value = true;
    await itemTransactionStore.fetchBranchWarehouses(props.branchId);
    warehouseOptions.value = itemTransactionStore.warehouses.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      location: { name: (w as any).location?.name || '' }
    }));
    // Auto-select first warehouse if none is selected
    if (warehouseOptions.value.length > 0 && (props.modelValue === null || props.modelValue === undefined)) {
      const first = warehouseOptions.value[0];
      if (first) {
        emit('update:modelValue', first.id);
        selectedWarehouseId.value = first.id;
        searchQuery.value = first.name;
      }
    }
    loading.value = false;
  }
});

function selectWarehouse(warehouse: any) {
  emit('update:modelValue', warehouse.id);
  selectedWarehouseId.value = warehouse.id;
  searchQuery.value = warehouse.name;
  isFocused.value = false;
}

function onFocus() {
  isFocused.value = true;
}
function onBlur() {
  setTimeout(() => { isFocused.value = false; }, 200);
}
</script>

<style scoped>
.warehouse-selector {
  max-width: 340px;
  padding-top: 0;
}
.warehouse-input {
  width: 100%;
  margin-top: 0;
}
.warehouse-item.selected {
  background: #e0f7fa;
}
</style>
