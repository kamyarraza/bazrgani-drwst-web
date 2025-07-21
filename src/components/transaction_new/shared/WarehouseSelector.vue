<template>
  <div class="warehouse-selector">
    <q-select
      v-model="selectedWarehouse"
      :options="warehouseOptions"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      outlined
      :label="t('warehouse.selectWarehouse') + ' *'"
      :loading="loading"
      clearable
      :disable="disabled"
      :error="!!error"
      :error-message="error"
      class="warehouse-select"
    >
      <template v-slot:prepend>
        <q-icon name="warehouse" />
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-avatar color="orange" text-color="white" size="sm">
              <q-icon name="warehouse" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption v-if="scope.opt.code">
              {{ t('warehouse.code') }}: {{ scope.opt.code }}
            </q-item-label>
            <q-item-label caption v-if="scope.opt.location">
              <q-icon name="location_on" size="xs" class="q-mr-xs" />
              {{ scope.opt.location }}
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="scope.opt.items_count !== undefined">
            <q-chip size="sm" color="grey-3" text-color="grey-8">
              {{ scope.opt.items_count }} {{ t('warehouse.items') }}
            </q-chip>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ noOptionsText }}
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:loading>
        <q-item>
          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
            <q-item-label caption>
              <q-skeleton type="text" width="60%" />
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Selected Warehouse Info -->
    <div v-if="selectedWarehouseInfo" class="selected-warehouse-info q-mt-sm">
      <q-card flat bordered class="info-card">
        <q-card-section class="q-py-sm">
          <div class="row items-center q-gutter-sm">
            <q-avatar color="orange" text-color="white" size="sm">
              <q-icon name="warehouse" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle2">{{ selectedWarehouseInfo.name }}</div>
              <div class="text-caption text-grey-6">
                <span v-if="selectedWarehouseInfo.code">
                  {{ t('warehouse.code') }}: {{ selectedWarehouseInfo.code }}
                </span>
                <span v-if="selectedWarehouseInfo.code && selectedWarehouseInfo.location"> • </span>
                <span v-if="selectedWarehouseInfo.location">
                  <q-icon name="location_on" size="xs" class="q-mr-xs" />
                  {{ selectedWarehouseInfo.location }}
                </span>
              </div>
            </div>
            <div v-if="selectedWarehouseInfo.items_count !== undefined" class="col-auto">
              <q-chip size="sm" color="orange-2" text-color="orange-8">
                {{ selectedWarehouseInfo.items_count }} {{ t('warehouse.items') }}
              </q-chip>
            </div>
            <q-btn
              flat
              round
              dense
              icon="clear"
              @click="clearSelection"
              size="sm"
              color="grey-6"
            >
              <q-tooltip>{{ t('common.clear') }}</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Help Text -->
    <div v-if="!modelValue && !disabled" class="help-text q-mt-xs">
      <div class="text-caption text-grey-6">
        <q-icon name="info" size="xs" class="q-mr-xs" />
        {{ helpText }}
      </div>
    </div>

    <!-- Disabled State Info -->
    <div v-if="disabled" class="disabled-info q-mt-xs">
      <div class="text-caption text-orange-6">
        <q-icon name="info" size="xs" class="q-mr-xs" />
        {{ disabledText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/authStore';

// Props & Emits
interface Props {
  modelValue: number | null;
  warehouses: any[];
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  branchRequired?: boolean;
}

interface Emits {
  (_e: 'update:modelValue', _value: number | null): void;
  (_e: 'warehouse-selected', _warehouse: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  required: true,
  loading: false,
  disabled: false,
  branchRequired: false
});

const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const _authStore = useAuthStore();

// Local state
const selectedWarehouseData = ref<any>(null);

// Computed properties
const selectedWarehouse = computed({
  get: () => props.modelValue,
  set: (value: number | null) => {
    emit('update:modelValue', value);
    if (value) {
      const warehouse = warehouseOptions.value.find(w => w.id === value);
      if (warehouse) {
        selectedWarehouseData.value = warehouse;
      }
      emit('warehouse-selected', warehouse);
    } else {
      selectedWarehouseData.value = null;
      emit('warehouse-selected', null);
    }
  }
});

const warehouseOptions = computed(() => {
  return props.warehouses.map(warehouse => ({
    id: warehouse.id,
    name: warehouse.name,
    code: warehouse.code || '',
    location: warehouse.location || '',
    items_count: warehouse.items_count
  }));
});

const selectedWarehouseInfo = computed(() => {
  if (!props.modelValue) return null;

  // First, try to find in current warehouse options
  const fromWarehouseOptions = warehouseOptions.value.find(warehouse => warehouse.id === props.modelValue);
  if (fromWarehouseOptions) return fromWarehouseOptions;

  // If not found in warehouse options, return the stored selected warehouse data
  return selectedWarehouseData.value;
});

const noOptionsText = computed(() => {
  if (props.branchRequired) {
    return t('warehouse.selectBranchFirst');
  }
  return t('warehouse.noWarehousesAvailable');
});

const helpText = computed(() => {
  if (props.branchRequired) {
    return t('warehouse.selectBranchFirstHelp');
  }
  return t('warehouse.selectWarehouseHelp');
});

const disabledText = computed(() => {
  if (props.branchRequired) {
    return t('warehouse.branchRequiredForSelection');
  }
  return t('warehouse.warehouseSelectionDisabled');
});

// Methods
const clearSelection = () => {
  selectedWarehouse.value = null;
  selectedWarehouseData.value = null;
};

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    selectedWarehouseData.value = null;
  } else if (newValue && !selectedWarehouseData.value) {
    // Find and store warehouse data if we have an ID but no stored data
    const warehouse = warehouseOptions.value.find(w => w.id === newValue);
    if (warehouse) {
      selectedWarehouseData.value = warehouse;
    }
  }
}, { immediate: true });

// Watch for warehouses changes to validate current selection
watch(() => props.warehouses, (newWarehouses) => {
  if (props.modelValue && newWarehouses.length > 0) {
    const foundWarehouse = newWarehouses.find(w => w.id === props.modelValue);
    if (foundWarehouse) {
      // Store the selected warehouse data when warehouses are loaded
      selectedWarehouseData.value = {
        id: foundWarehouse.id,
        name: foundWarehouse.name,
        code: foundWarehouse.code || '',
        location: foundWarehouse.location || '',
        items_count: foundWarehouse.items_count
      };
    } else {
      // Current selection is no longer valid
      selectedWarehouse.value = null;
      selectedWarehouseData.value = null;
    }
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.warehouse-selector {
  .warehouse-select {
    :deep(.q-field__control) {
      border-radius: 8px;
    }

    :deep(.q-field__append) {
      .q-icon {
        color: $orange;
      }
    }

    &.q-field--disabled {
      :deep(.q-field__control) {
        background: $grey-2;
      }
    }
  }

  .selected-warehouse-info {
    .info-card {
      border-radius: 8px;
      border: 1px solid $orange-3;
      background: $orange-1;

      .q-card-section {
        padding: 12px 16px;
      }
    }
  }

  .help-text,
  .disabled-info {
    padding-left: 12px;
    display: flex;
    align-items: center;
  }
}

// Dark mode support
.body--dark {
  .warehouse-selector {
    .selected-warehouse-info {
      .info-card {
        background: rgba(255, 152, 0, 0.1);
        border-color: rgba(255, 152, 0, 0.3);
      }
    }

    .warehouse-select {
      &.q-field--disabled {
        :deep(.q-field__control) {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .warehouse-selector {
    .selected-warehouse-info {
      .info-card {
        .q-card-section {
          padding: 8px 12px;

          .row {
            gap: 8px;
          }

          .text-subtitle2 {
            font-size: 0.875rem;
          }

          .text-caption {
            font-size: 0.75rem;
          }
        }
      }
    }
  }
}
</style>
