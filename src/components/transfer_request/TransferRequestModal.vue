<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="transfer-request-modal"
  >
    <q-card class="transfer-request-modal-card">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="row items-center justify-between">
          <div class="row items-center no-wrap">
            <q-icon
              :name="transferType === 'request' ? 'request_quote' : 'local_shipping'"
              size="sm"
              class="q-mr-sm text-primary"
            />
            <span class="text-h6">
              {{ transferType === 'request' ? t('transferRequest.newTransferRequest') : t('transferRequest.newTransfer') }}
            </span>
            <q-chip
              color="primary"
              text-color="white"
              size="sm"
              :label="`${t('transaction.steps.step')} ${currentStep}/${totalSteps}`"
              class="q-ml-md"
            />
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeModal"
            class="text-grey-6"
          >
            <q-tooltip>{{ t('common.close') }}</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <!-- Main Content -->
      <q-card-section class="modal-content">
        <div class="transfer-container">
          <!-- Step Content -->
          <div class="step-content">
            <transition
              :name="stepTransition"
              mode="out-in"
              appear
            >
              <component
                :is="currentStepComponent"
                :key="currentStep"
                v-model:form-data="formData"
                :transfer-type="transferType"
                :validation-errors="validationErrors"
                @validate="handleStepValidation"
                @next="nextStep"
                @previous="previousStep"
                @submit="submitTransferRequest"
                @clear-validation-error="handleClearValidationError"
              />
            </transition>
          </div>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-card-section class="modal-footer bg-grey-1">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <q-btn
              v-if="currentStep > 1"
              flat
              :icon="backIcon"
              :label="t('common.previous')"
              @click="previousStep"
              class="q-mr-sm"
            />
          </div>

          <div class="col-auto row q-gutter-sm">
            <q-btn
              flat
              :label="t('common.cancel')"
              @click="closeModal"
              class="text-grey-7"
            />

            <q-btn
              v-if="currentStep < totalSteps"
              color="primary"
                :icon-right="isRTL ? 'arrow_back':'arrow_forward'"
              :label="t('common.next')"
              :disable="!isCurrentStepValid"
              @click="nextStep"
            />

            <q-btn
              v-else
              color="positive"
              icon="check"
              :label="transferType === 'request' ? t('transferRequest.createRequest') : t('transferRequest.createTransfer')"
              :loading="submitting"
              :disable="!canSubmit"
              @click="submitTransferRequest"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useTransferRequestStore } from 'src/stores/transferRequestStore';
import { useBranchStore } from 'src/stores/branchStore';
import { useRTL } from 'src/composables/useRTL';

// Components
import WarehouseSelectionStep from './steps/WarehouseSelectionStep.vue';
import ItemSelectionStep from './steps/ItemSelectionStep.vue';
import SummaryStep from './steps/SummaryStep.vue';

// Props & Emits
interface Props {
  modelValue: boolean;
  initialTransferType?: 'request' | 'transfer';
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'transfer-created', _data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialTransferType: 'request'
});
const emit = defineEmits<Emits>();

// Composables
const { t, locale } = useI18n();
const $q = useQuasar();
const transferStore = useTransferRequestStore();
const branchStore = useBranchStore();
const { backIcon } = useRTL();

// RTL detection
const isRTL = computed(() => locale.value === 'ar' || locale.value === 'ckb');

// Dialog visibility
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

// Current step management
const currentStep = ref(1);
const totalSteps = 3;

// Step components mapping
const stepComponents = markRaw({
  1: WarehouseSelectionStep,
  2: ItemSelectionStep,
  3: SummaryStep
});

const currentStepComponent = computed(() => stepComponents[currentStep.value as keyof typeof stepComponents]);

// Step validation
const stepValidation = ref<Record<number, boolean>>({
  1: false,
  2: false,
  3: false
});

const isCurrentStepValid = computed(() => stepValidation.value[currentStep.value] || false);

// Transfer type
const transferType = ref<'request' | 'transfer'>(props.initialTransferType);

// Form data
interface TransferRequestFormData {
  // Step 1: Type Selection
  transferType: 'request' | 'transfer';

  // Step 2: Warehouse Selection
  fromBranchId: number | null;
  fromBranchName?: string | null;
  fromWarehouseId: number | null;
  fromWarehouseName?: string | null;
  toBranchId: number | null;
  toBranchName?: string | null;
  toWarehouseId: number | null;
  toWarehouseName?: string | null;

  // Step 3: Item Selection
  selectedItems: Array<{
    item: any;
    quantity: number;
    availableQuantity: number;
  }>;

  // Step 4: Summary/Details
  note: string;
}

const formData = ref<TransferRequestFormData>({
  transferType: props.initialTransferType,
  fromBranchId: null,
  fromBranchName: null,
  fromWarehouseId: null,
  fromWarehouseName: null,
  toBranchId: null,
  toBranchName: null,
  toWarehouseId: null,
  toWarehouseName: null,
  selectedItems: [],
  note: ''
});

// Validation errors
const validationErrors = ref<Record<string, string>>({});

// Submit state
const submitting = ref(false);

// Computed properties
const canSubmit = computed(() => {
  return Object.values(stepValidation.value).every(valid => valid) &&
         formData.value.selectedItems.length > 0 &&
         formData.value.note.length > 0 &&
         formData.value.fromWarehouseId &&
         formData.value.toWarehouseId;
});

// Step transition animation
const stepTransition = ref('slide-left');

// Watch for transfer type changes
watch(() => props.initialTransferType, (newType) => {
  transferType.value = newType;
  formData.value.transferType = newType;
});

// Methods
const handleStepValidation = (stepNumber: number, isValid: boolean) => {
  stepValidation.value[stepNumber] = isValid;
};

const handleClearValidationError = (field: string) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const nextStep = () => {
  if (currentStep.value < totalSteps && isCurrentStepValid.value) {
    stepTransition.value = 'slide-left';
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    stepTransition.value = 'slide-right';
    currentStep.value--;
  }
};

const closeModal = () => {
  // Show confirmation if user has started filling the form
  const hasData = formData.value.fromWarehouseId ||
                  formData.value.toWarehouseId ||
                  formData.value.selectedItems.length > 0;

  if (hasData) {
    $q.dialog({
      title: t('common.confirmClose'),
      message: t('transferRequest.confirmCloseMessage'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      resetForm();
      dialogVisible.value = false;
    });
  } else {
    resetForm();
    dialogVisible.value = false;
  }
};

const resetForm = () => {
  currentStep.value = 1;
  stepValidation.value = {
    1: false,
    2: false,
    3: false
  };
  formData.value = {
    transferType: props.initialTransferType,
    fromBranchId: null,
    fromBranchName: null,
    fromWarehouseId: null,
    fromWarehouseName: null,
    toBranchId: null,
    toBranchName: null,
    toWarehouseId: null,
    toWarehouseName: null,
    selectedItems: [],
    note: ''
  };
  validationErrors.value = {};
  submitting.value = false;
  transferType.value = props.initialTransferType;
};

const submitTransferRequest = async () => {
  if (!canSubmit.value) return;

  submitting.value = true;
  validationErrors.value = {};

  try {
    // Validate required fields
    if (!formData.value.fromWarehouseId || !formData.value.toWarehouseId) {
      throw new Error('Warehouse selection is required');
    }

    const submitData = {
      transfer_type: formData.value.transferType,
      from_warehouse_id: formData.value.fromWarehouseId,
      to_warehouse_id: formData.value.toWarehouseId,
      note: formData.value.note,
      details: formData.value.selectedItems.map(item => ({
        item_id: item.item.id,
        quantity: item.quantity
      }))
    };

    let result;
    if (formData.value.transferType === 'request') {
      result = await transferStore.createTransferRequest(submitData);
    } else {
      result = await transferStore.createTransfer(submitData);
    }

    // $q.notify({
    //   type: 'positive',
    //   message: formData.value.transferType === 'request'
    //     ? t('transferRequest.requestCreatedSuccessfully')
    //     : t('transferRequest.transferCreatedSuccessfully'),
    //   position: 'top'
    // });

    emit('transfer-created', result);
    resetForm();
    dialogVisible.value = false;

  } catch (error: any) {
    console.error('Error creating transfer request:', error);

    // Handle validation errors
    if (error.response?.data?.errors) {
      validationErrors.value = error.response.data.errors;
    }

    // $q.notify({
    //   type: 'negative',
    //   message: error.response?.data?.message || t('transferRequest.errorCreatingRequest'),
    //   position: 'top'
    // });
  } finally {
    submitting.value = false;
  }
};

// Watch for dialog opening to load required data
watch(dialogVisible, (isOpen) => {
  if (isOpen) {
    // Load branches if not already loaded
    if (branchStore.branches.length === 0) {
      void branchStore.fetchBranches();
    }
  }
});
</script>

<style lang="scss" scoped>
.transfer-request-modal {
  .transfer-request-modal-card {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
    color: white;
    padding: 1rem 1.5rem;
    flex-shrink: 0;

    .text-h6 {
      font-weight: 600;
    }
  }

  .modal-content {
    flex: 1;
    padding: 0;
    overflow: hidden;

    .transfer-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .step-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
  }

  .modal-footer {
    flex-shrink: 0;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
}

// Step transition animations
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
