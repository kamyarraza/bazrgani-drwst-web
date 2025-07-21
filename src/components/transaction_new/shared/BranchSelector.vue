<template>
  <div class="branch-selector">
    <q-select
      v-model="selectedBranch"
      :options="filteredBranchOptions"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      outlined
      :label="t('common.branch') + ' *'"
      :loading="loading"
      clearable
      use-input
      input-debounce="300"
      @filter="filterBranches"
      @focus="() => filterBranches('', (fn) => fn())"
      @update:model-value="handleBranchChange"
      behavior="menu"
      :error="!!error"
      :error-message="error"
      class="branch-select"
    >
      <template v-slot:prepend>
        <q-icon name="business" />
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="sm">
              <q-icon name="business" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption>
              {{ scope.opt.code }} • {{ scope.opt.phone }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ t('branch.noResults') }}
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

    <!-- Selected Branch Info -->
    <div v-if="selectedBranchInfo" class="selected-branch-info q-mt-sm">
      <q-card flat bordered class="info-card">
        <q-card-section class="q-py-sm">
          <div class="row items-center q-gutter-sm">
            <q-avatar color="primary" text-color="white" size="sm">
              <q-icon name="business" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle2">{{ selectedBranchInfo.name }}</div>
              <div class="text-caption text-grey-6">
                {{ selectedBranchInfo.code }} • {{ selectedBranchInfo.phone }}
              </div>
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
    <div v-if="!modelValue" class="help-text q-mt-xs">
      <div class="text-caption text-grey-6">
        <q-icon name="info" size="xs" class="q-mr-xs" />
        {{ t('branch.selectBranchHelp') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBranchStore } from 'src/stores/branchStore';

// Props & Emits
interface Props {
  modelValue: number | null;
  error?: string;
  required?: boolean;
}

interface Emits {
  (_e: 'update:modelValue', _value: number | null): void;
  (_e: 'branch-selected', _branch: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  required: true
});

const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const branchStore = useBranchStore();

// Local state
const filteredBranchOptions = ref<Array<{ id: number; name: string; code: string; phone: string }>>([]);
const loading = ref(false);
const selectedBranchData = ref<any>(null);

// Computed properties
const selectedBranch = computed({
  get: () => props.modelValue,
  set: (value: number | null) => emit('update:modelValue', value)
});

const selectedBranchInfo = computed(() => {
  if (!props.modelValue) return null;

  // First, try to find in current filtered options
  const fromFilteredOptions = filteredBranchOptions.value.find(branch => branch.id === props.modelValue);
  if (fromFilteredOptions) return fromFilteredOptions;

  // If not found in filtered options, return the stored selected branch data
  return selectedBranchData.value;
});

// Methods
const filterBranches = async (val: string, update: (_fn: () => void) => void) => {
  try {
    loading.value = true;

    // If no search query, load initial branches
    const searchQuery = val.trim() || '';
    const searchResults = await branchStore.searchBranches(searchQuery);

    update(() => {
      filteredBranchOptions.value = searchResults.map(branch => ({
        id: branch.id,
        name: branch.name,
        code: branch.code || '',
        phone: branch.phone || ''
      }));
    });
  } catch (error) {
    console.error('Error searching branches:', error);
    update(() => {
      filteredBranchOptions.value = [];
    });
  } finally {
    loading.value = false;
  }
};

const handleBranchChange = (branchId: number | null) => {
  if (branchId) {
    const selectedBranch = filteredBranchOptions.value.find(branch => branch.id === branchId);
    if (selectedBranch) {
      selectedBranchData.value = selectedBranch;
    }
    emit('branch-selected', selectedBranch);
  } else {
    selectedBranchData.value = null;
    emit('branch-selected', null);
  }
};

const clearSelection = () => {
  selectedBranch.value = null;
  selectedBranchData.value = null;
  emit('branch-selected', null);
};

// Watch for external value changes
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    selectedBranchData.value = null;
  } else if (newValue && !selectedBranchData.value) {
    // Load branch data if we have an ID but no stored data
    try {
      const searchResults = await branchStore.searchBranches('');
      const branch = searchResults.find(b => b.id === newValue);
      if (branch) {
        selectedBranchData.value = {
          id: branch.id,
          name: branch.name,
          code: branch.code,
          phone: branch.phone
        };
      }
    } catch (error) {
      console.error('Error loading branch data:', error);
    }
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.branch-selector {
  .branch-select {
    :deep(.q-field__control) {
      border-radius: 8px;
    }

    :deep(.q-field__append) {
      .q-icon {
        color: $primary;
      }
    }
  }

  .selected-branch-info {
    .info-card {
      border-radius: 8px;
      border: 1px solid $blue-3;
      background: $blue-1;

      .q-card-section {
        padding: 12px 16px;
      }
    }
  }

  .help-text {
    padding-left: 12px;
    display: flex;
    align-items: center;
  }
}

// Dark mode support
.body--dark {
  .branch-selector {
    .selected-branch-info {
      .info-card {
        background: rgba(33, 150, 243, 0.1);
        border-color: rgba(33, 150, 243, 0.3);
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .branch-selector {
    .selected-branch-info {
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
