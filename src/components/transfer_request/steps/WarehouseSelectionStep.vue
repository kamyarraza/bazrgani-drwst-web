<template>
  <div class="warehouse-selection-step">
    <div class="step-container">
      <!-- Step Header -->
      <div class="step-header">
        <div class="step-title">
          <q-icon name="warehouse" size="md" class="q-mr-sm text-primary" />
          <span>{{ t('transferRequest.selectWarehouses') }}</span>
        </div>
        <div class="step-description">
          {{ transferTypeDescription }}
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <q-form class="q-gutter-lg">

          <!-- Transfer Type Display -->
          <div class="transfer-type-display">
            <q-card flat bordered class="type-card">
              <q-card-section class="q-py-md">
                <div class="row items-center">
                  <q-avatar
                    :color="formData.transferType === 'request' ? 'blue' : 'green'"
                    text-color="white"
                    size="lg"
                    class="q-mr-md"
                  >
                    <q-icon :name="formData.transferType === 'request' ? 'request_quote' : 'local_shipping'" />
                  </q-avatar>
                  <div class="col">
                    <div class="text-h6">
                      {{ formData.transferType === 'request' ? t('transferRequest.transferRequest') : t('transferRequest.directTransfer') }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ transferTypeDescription }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Source Warehouse Section -->
          <div class="warehouse-section">
            <div class="section-title">
              <q-icon name="outbound" class="q-mr-sm" />
              {{ t('transferRequest.sourceWarehouse') }}
            </div>

            <!-- Source Branch -->
            <div class="q-mb-md">
              <q-select
                v-model="formData.fromBranchId"
                :options="branchOptions"
                option-label="name"
                option-value="id"
                :label="t('transferRequest.fromBranch')"
                outlined
                map-options
                emit-value
                use-input
                input-debounce="300"
                @filter="filterBranches"
                @focus="() => { filterBranches('', (fn) => fn()); emit('clearValidationError', 'fromBranchId'); }"
                @update:model-value="onFromBranchChange"
                :loading="branchStore.loading"
                behavior="menu"
                :error="!!validationErrors?.fromBranchId"
                :error-message="validationErrors?.fromBranchId"
                :disable="isEmployee && formData.transferType === 'transfer'"
                :hint="isEmployee && formData.transferType === 'transfer' ? t('transferRequest.employeeFromBranchHint') : ''"
              >
                <template v-slot:selected v-if="isEmployee && formData.transferType === 'transfer' && currentUserBranchName">
                  <span>{{ currentUserBranchName }}</span>
                </template>
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.code }} • {{ scope.opt.phone }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ t('common.noResults') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Source Warehouse -->
            <div class="q-mb-md">
              <q-select
                v-model="formData.fromWarehouseId"
                :options="fromWarehouseOptions"
                option-label="name"
                option-value="id"
                :label="t('transferRequest.fromWarehouse')"
                outlined
                map-options
                emit-value
                :disable="!formData.fromBranchId"
                @update:model-value="onFromWarehouseChange"
                :error="!!validationErrors?.fromWarehouseId"
                :error-message="validationErrors?.fromWarehouseId"
                @focus="() => emit('clearValidationError', 'fromWarehouseId')"
              >
                <template v-slot:prepend>
                  <q-icon name="warehouse" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.location }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ !formData.fromBranchId ? t('transferRequest.selectBranchFirst') : t('common.noResults') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Destination Warehouse Section -->
          <div class="warehouse-section">
            <div class="section-title">
              <q-icon name="input" class="q-mr-sm" />
              {{ t('transferRequest.destinationWarehouse') }}
            </div>

            <!-- Destination Branch -->
            <div class="q-mb-md">
              <q-select
                v-model="formData.toBranchId"
                :options="branchOptions"
                option-label="name"
                option-value="id"
                :label="t('transferRequest.toBranch')"
                outlined
                map-options
                emit-value
                use-input
                input-debounce="300"
                @filter="filterBranches"
                @focus="() => { filterBranches('', (fn) => fn()); emit('clearValidationError', 'toBranchId'); }"
                @update:model-value="onToBranchChange"
                :loading="branchStore.loading"
                behavior="menu"
                :error="!!validationErrors?.toBranchId"
                :error-message="validationErrors?.toBranchId"
                :disable="isEmployee && formData.transferType === 'request'"
                :hint="isEmployee && formData.transferType === 'request' ? t('transferRequest.employeeToBranchHint') : ''"
              >
                <template v-slot:selected v-if="isEmployee && formData.transferType === 'request' && currentUserBranchName">
                  <span>{{ currentUserBranchName }}</span>
                </template>
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.code }} • {{ scope.opt.phone }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ t('common.noResults') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Destination Warehouse -->
            <div class="q-mb-md">
              <q-select
                v-model="formData.toWarehouseId"
                :options="toWarehouseOptions"
                option-label="name"
                option-value="id"
                :label="t('transferRequest.toWarehouse')"
                outlined
                map-options
                emit-value
                :disable="!formData.toBranchId"
                @update:model-value="onToWarehouseChange"
                :error="!!validationErrors?.toWarehouseId"
                :error-message="validationErrors?.toWarehouseId"
                @focus="() => emit('clearValidationError', 'toWarehouseId')"
              >
                <template v-slot:prepend>
                  <q-icon name="warehouse" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.location }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ !formData.toBranchId ? t('transferRequest.selectBranchFirst') : t('common.noResults') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Summary Card -->
          <div v-if="formData.fromWarehouseId && formData.toWarehouseId" class="summary-section">
            <q-card flat bordered class="summary-card">
              <q-card-section>
                <div class="section-title q-mb-md">
                  <q-icon name="summarize" class="q-mr-sm" />
                  {{ t('transferRequest.warehouseSelectionSummary') }}
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div class="summary-item">
                      <div class="summary-label">{{ t('transferRequest.from') }}:</div>
                      <div class="summary-value">
                        <strong>{{ formData.fromWarehouseName }}</strong>
                        <div class="text-caption text-grey-6">{{ formData.fromBranchName }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="summary-item">
                      <div class="summary-label">{{ t('transferRequest.to') }}:</div>
                      <div class="summary-value">
                        <strong>{{ formData.toWarehouseName }}</strong>
                        <div class="text-caption text-grey-6">{{ formData.toBranchName }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBranchStore } from 'src/stores/branchStore';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import { useAuthStore } from 'src/stores/authStore';

// Props & Emits
interface Props {
  formData: any;
  transferType: 'request' | 'transfer';
  validationErrors?: Record<string, string>;
}

interface Emits {
  (_e: 'update:formData', _value: any): void;
  (_e: 'validate', _stepNumber: number, _isValid: boolean): void;
  (_e: 'clearValidationError', _field: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const branchStore = useBranchStore();
const _warehouseStore = useWarehouseStore();
const authStore = useAuthStore();

// Local state
const branchOptions = ref<any[]>([]);

// Computed properties
const formData = computed({
  get: () => props.formData,
  set: (value) => emit('update:formData', value)
});

const transferTypeDescription = computed(() => {
  return formData.value.transferType === 'request'
    ? t('transferRequest.transferRequestDescription')
    : t('transferRequest.directTransferDescription');
});

// Check if current user is an employee
const isEmployee = computed(() => {
  return authStore.currentUser?.type === 'employee';
});

// Get current user's branch ID
const currentUserBranchId = computed(() => {
  return authStore.currentUser?.branch?.id || null;
});

// Get current user's branch name
const currentUserBranchName = computed(() => {
  return authStore.currentUser?.branch?.name || null;
});

// Auto-populate branch for employees and fetch warehouses
const initializeEmployeeBranches = async () => {
  console.log('Initializing employee branches...');
  console.log('Is employee:', isEmployee.value);
  console.log('Current user branch ID:', currentUserBranchId.value);
  console.log('Transfer type:', formData.value.transferType);

  if (!isEmployee.value || !currentUserBranchId.value) return;

  const updatedData = { ...formData.value };
  let hasChanges = false;

  // For direct transfers: set "from" branch as current user's branch and fetch its warehouses
  if (formData.value.transferType === 'transfer' && !formData.value.fromBranchId) {
    console.log('Setting from branch for transfer and fetching warehouses');
    updatedData.fromBranchId = currentUserBranchId.value;
    updatedData.fromBranchName = authStore.currentUser?.branch?.name || null;
    hasChanges = true;

    // Fetch warehouses for the current user's branch
    await fetchWarehousesForBranch(currentUserBranchId.value);
  }

  // For transfer requests: set "to" branch as current user's branch and fetch its warehouses
  if (formData.value.transferType === 'request' && !formData.value.toBranchId) {
    console.log('Setting to branch for request and fetching warehouses');
    updatedData.toBranchId = currentUserBranchId.value;
    updatedData.toBranchName = authStore.currentUser?.branch?.name || null;
    hasChanges = true;

    // Fetch warehouses for the current user's branch
    await fetchWarehousesForBranch(currentUserBranchId.value);
  }

  if (hasChanges) {
    console.log('Updating form data:', updatedData);
    emit('update:formData', updatedData);
  }
};

// Fetch warehouses for a specific branch
const fetchWarehousesForBranch = async (branchId: number) => {
  console.log('Fetching warehouses for branch:', branchId);

  try {
    // First try to use the warehouse store to fetch branch warehouses
    await _warehouseStore.fetchBranchWarehouses(branchId);

    // If we have branch warehouses data, update the branch options
    if (_warehouseStore.branchWarehouses && _warehouseStore.branchWarehouses.warehouses) {
      const branchWithWarehouses = {
        id: branchId,
        name: _warehouseStore.branchWarehouses.branch.name,
        code: _warehouseStore.branchWarehouses.branch.code,
        phone: _warehouseStore.branchWarehouses.branch.phone,
        warehouses: _warehouseStore.branchWarehouses.warehouses
      };

      // Update branchOptions to include this branch with warehouses
      const existingBranchIndex = branchOptions.value.findIndex(branch => branch.id === branchId);
      if (existingBranchIndex >= 0) {
        branchOptions.value[existingBranchIndex] = { ...branchOptions.value[existingBranchIndex], warehouses: branchWithWarehouses.warehouses };
      } else {
        branchOptions.value.push(branchWithWarehouses);
      }

      console.log('Successfully fetched warehouses using warehouse store:', branchWithWarehouses.warehouses);
    } else {
      // Fallback to searching branches if warehouse store doesn't work
      console.log('Fallback: using branch search to get warehouses');
      const branchWithWarehouses = await branchStore.searchBranches(''); // Gets all branches with warehouses
      const targetBranch = branchWithWarehouses.find(branch => branch.id === branchId);

      if (targetBranch) {
        console.log('Found branch with warehouses:', targetBranch);
        console.log('Warehouses for branch:', targetBranch.warehouses);

        // Update branchOptions to include this branch with warehouses
        const existingBranchIndex = branchOptions.value.findIndex(branch => branch.id === branchId);
        if (existingBranchIndex >= 0) {
          branchOptions.value[existingBranchIndex] = targetBranch;
        } else {
          branchOptions.value.push(targetBranch);
        }
      } else {
        console.error('Branch not found:', branchId);
      }
    }
  } catch (error) {
    console.error('Error fetching warehouses for branch:', error);
  }
};

// Ensure current user's branch is available in branch options
const _ensureCurrentUserBranchInOptions = async () => {
  if (!currentUserBranchId.value) return;

  console.log('Ensuring current user branch in options...');
  console.log('Current branch options length:', branchOptions.value.length);

  // Check if current user's branch is already in options
  const currentBranchExists = branchOptions.value.find(branch => branch.id === currentUserBranchId.value);
  console.log('Current branch exists:', !!currentBranchExists);

  if (!currentBranchExists) {
    console.log('Fetching branches...');
    // Load all branches to ensure current user's branch is available
    await branchStore.fetchBranches();
    branchOptions.value = branchStore.branches;
    console.log('Branch options after fetch:', branchOptions.value.length);
  }

  // Double check that the branch exists and has warehouses loaded
  const currentBranch = branchOptions.value.find(branch => branch.id === currentUserBranchId.value);
  console.log('Current branch after fetch:', currentBranch);
  console.log('Current branch warehouses:', currentBranch?.warehouses);

  if (currentBranch && !currentBranch.warehouses) {
    console.log('Branch exists but no warehouses, fetching again...');
    // If branch exists but doesn't have warehouses, fetch all branches again
    await branchStore.fetchBranches();
    branchOptions.value = branchStore.branches;
  }
};

const fromWarehouseOptions = computed(() => {
  if (!formData.value.fromBranchId) {
    return [];
  }
  const selectedBranch = branchOptions.value.find(branch => branch.id === formData.value.fromBranchId);
  return selectedBranch?.warehouses || [];
});

const toWarehouseOptions = computed(() => {
  if (!formData.value.toBranchId) {
    return [];
  }
  const selectedBranch = branchOptions.value.find(branch => branch.id === formData.value.toBranchId);
  return selectedBranch?.warehouses || [];
});

const isStepValid = computed(() => {
  return !!(formData.value.fromWarehouseId && formData.value.toWarehouseId);
});

// Methods
const filterBranches = async (val: string, doneFn: (_fn: () => void) => void) => {
  if (val === '') {
    doneFn(() => {
      branchOptions.value = branchStore.branches;
    });
    return;
  }

  try {
    const searchResults = await branchStore.searchBranches(val);
    doneFn(() => {
      branchOptions.value = searchResults;
    });
  } catch (error) {
    console.error('Error searching branches:', error);
    doneFn(() => {
      branchOptions.value = [];
    });
  }
};

const onFromBranchChange = async (branchId: number) => {
  // Clear dependent fields
  const updatedData = {
    ...formData.value,
    fromBranchId: branchId,
    fromWarehouseId: null,
    fromWarehouseName: null,
    fromBranchName: null
  };

  if (branchId) {
    // Find branch name
    const branch = branchStore.branches.find(b => b.id === branchId);
    updatedData.fromBranchName = branch?.name || null;

    // Fetch warehouses for the selected branch
    await fetchWarehousesForBranch(branchId);

    // Auto-select the first available warehouse for source
    const selectedBranch = branchOptions.value.find(branch => branch.id === branchId);
    if (selectedBranch?.warehouses && selectedBranch.warehouses.length > 0) {
      const firstWarehouse = selectedBranch.warehouses[0];
      updatedData.fromWarehouseId = firstWarehouse.id;
      updatedData.fromWarehouseName = firstWarehouse.name;
    }
  }

  emit('update:formData', updatedData);
  validateStep();
};

const onToBranchChange = async (branchId: number) => {
  // Clear dependent fields
  const updatedData = {
    ...formData.value,
    toBranchId: branchId,
    toWarehouseId: null,
    toWarehouseName: null,
    toBranchName: null
  };

  if (branchId) {
    // Find branch name
    const branch = branchStore.branches.find(b => b.id === branchId);
    updatedData.toBranchName = branch?.name || null;

    // Fetch warehouses for the selected branch
    await fetchWarehousesForBranch(branchId);

    // Auto-select the first available warehouse for destination
    const selectedBranch = branchOptions.value.find(branch => branch.id === branchId);
    if (selectedBranch?.warehouses && selectedBranch.warehouses.length > 0) {
      const firstWarehouse = selectedBranch.warehouses[0];
      updatedData.toWarehouseId = firstWarehouse.id;
      updatedData.toWarehouseName = firstWarehouse.name;
    }
  }

  emit('update:formData', updatedData);
  validateStep();
};

const onFromWarehouseChange = (warehouseId: number) => {
  const updatedData = {
    ...formData.value,
    fromWarehouseId: warehouseId,
    fromWarehouseName: null
  };

  if (warehouseId) {
    const warehouse = fromWarehouseOptions.value.find(w => w.id === warehouseId);
    updatedData.fromWarehouseName = warehouse?.name || null;
  }

  emit('update:formData', updatedData);
  validateStep();
};

const onToWarehouseChange = (warehouseId: number) => {
  const updatedData = {
    ...formData.value,
    toWarehouseId: warehouseId,
    toWarehouseName: null
  };

  if (warehouseId) {
    const warehouse = toWarehouseOptions.value.find(w => w.id === warehouseId);
    updatedData.toWarehouseName = warehouse?.name || null;
  }

  emit('update:formData', updatedData);
  validateStep();
};

const validateStep = () => {
  emit('validate', 1, isStepValid.value);
};

// Watchers
watch(() => props.formData, () => {
  validateStep();
}, { deep: true });

// Watch for transfer type changes to auto-populate employee branch
watch(() => formData.value.transferType, async () => {
  await initializeEmployeeBranches();
});

// Watch for toBranchId changes to fetch warehouses and auto-select first one
watch(() => formData.value.toBranchId, async (newToBranchId, oldToBranchId) => {
  if (newToBranchId && newToBranchId !== oldToBranchId) {
    await fetchWarehousesForBranch(newToBranchId);

    // Auto-select the first available warehouse for destination
    const selectedBranch = branchOptions.value.find(branch => branch.id === newToBranchId);
    if (selectedBranch?.warehouses && selectedBranch.warehouses.length > 0 && !formData.value.toWarehouseId) {
      const firstWarehouse = selectedBranch.warehouses[0];
      const updatedData = {
        ...formData.value,
        toWarehouseId: firstWarehouse.id,
        toWarehouseName: firstWarehouse.name
      };
      emit('update:formData', updatedData);
    }
  }
});

// Watch for fromBranchId changes to fetch warehouses and auto-select first one
watch(() => formData.value.fromBranchId, async (newFromBranchId, oldFromBranchId) => {
  if (newFromBranchId && newFromBranchId !== oldFromBranchId) {
    await fetchWarehousesForBranch(newFromBranchId);

    // Auto-select the first available warehouse for source
    const selectedBranch = branchOptions.value.find(branch => branch.id === newFromBranchId);
    if (selectedBranch?.warehouses && selectedBranch.warehouses.length > 0 && !formData.value.fromWarehouseId) {
      const firstWarehouse = selectedBranch.warehouses[0];
      const updatedData = {
        ...formData.value,
        fromWarehouseId: firstWarehouse.id,
        fromWarehouseName: firstWarehouse.name
      };
      emit('update:formData', updatedData);
    }
  }
});

// Lifecycle
onMounted(async () => {
  console.log('Component mounted');
  // Initialize employee branches which will also fetch warehouses if needed
  await initializeEmployeeBranches();
});

// Initial validation
validateStep();
</script>

<style lang="scss" scoped>
.warehouse-selection-step {
  max-width: 800px;
  margin: 0 auto;

  .step-container {
    .step-header {
      text-align: center;
      margin-bottom: 2rem;

      .step-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--q-dark);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .step-description {
        color: var(--q-grey-6);
        font-size: 1rem;
      }
    }

    .form-content {
      .transfer-type-display {
        .type-card {
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
      }

      .warehouse-section {
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--q-dark);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
        }
      }

      .summary-section {
        .summary-card {
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(var(--q-positive-rgb), 0.05);

          .summary-item {
            .summary-label {
              font-weight: 500;
              color: var(--q-grey-7);
              margin-bottom: 0.25rem;
            }

            .summary-value {
              strong {
                color: var(--q-dark);
              }
            }
          }
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .warehouse-selection-step {
    .step-container {
      .form-content {
        .summary-section {
          .row {
            flex-direction: column;
          }
        }
      }
    }
  }
}
</style>
