<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="blum-transaction-modal"
  >
    <q-card class="blum-transaction-modal-card">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="row items-center justify-between">
          <div class="row items-center no-wrap">
            <q-icon name="euro_symbol" size="sm" class="q-mr-sm text-primary" />
            <span class="text-h6">
              {{ transactionType === 'sell' ? t('blumTransaction.newSellTransaction') : t('blumTransaction.newPurchaseTransaction') }}
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
        <div class="transaction-container">
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
                :transaction-type="transactionType"
                :validation-errors="validationErrors"
                @validate="handleStepValidation"
                @next="nextStep"
                @previous="previousStep"
                @submit="submitTransaction"
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
              :icon-right="forwardIcon"
              :label="t('common.next')"
              :disable="!isCurrentStepValid"
              @click="nextStep"
            />

            <q-btn
              v-else
              color="positive"
              icon="check"
              :label="t('blumTransaction.createTransaction')"
              :loading="submitting"
              :disable="!canSubmit"
              @click="submitTransaction"
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
import { useBlumTransactionStore } from 'src/stores/blumTransactionStore';
import { useAuthStore } from 'src/stores/authStore';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import { useRTL } from 'src/composables/useRTL';

// Components
import BasicInfoStep from './steps/BasicInfoStep.vue';
import ItemSelectionStep from './steps/ItemSelectionStep.vue';
import SummaryStep from './steps/SummaryStep.vue';

// Props & Emits
interface Props {
  modelValue: boolean;
  transactionType: 'sell' | 'purchase';
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'transaction-added', _transaction: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const blumTransactionStore = useBlumTransactionStore();
const authStore = useAuthStore();
const exchangeRateStore = useExchangeRateStore();
const { backIcon, forwardIcon } = useRTL();

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
  1: BasicInfoStep,
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

// Form data based on the old Blum modal logic
interface BlumTransactionFormData {
  // Basic Info
  customer_id: number | null;
  customer_name?: string | null;
  warehouse_id: number | null;
  warehouse_name?: string | null;
  branch_id: number | null;
  branch_name?: string | null;
  payment_type: 'cash' | 'borrow' | null;
  note: string;

  // Exchange rates
  usd_iqd_rate: number;
  eur_usd_rate: number;

  // Selected items/sets
  details: Array<{
    item_id?: number;
    set_id?: number;
    quantity: number;
    unit_price: number;
    solo_unit_price: number;
    type: 'item' | 'set';
    item?: any;
    set?: any;
    set_items?: any[];
  }>;

  // Totals
  total_price: number;
  total_eur: number;
  total_usd: number;
}

const formData = ref<BlumTransactionFormData>({
  customer_id: null,
  customer_name: null,
  warehouse_id: null,
  warehouse_name: null,
  branch_id: null,
  branch_name: null,
  payment_type: null,
  note: '',
  usd_iqd_rate: 0,
  eur_usd_rate: 0,
  details: [],
  total_price: 0,
  total_eur: 0,
  total_usd: 0
});

// Validation errors
const validationErrors = ref<Record<string, string>>({});

// Submit state
const submitting = ref(false);

// Computed properties
const canSubmit = computed(() => {
  return Object.values(stepValidation.value).every(valid => valid) &&
         formData.value.details.length > 0 &&
         formData.value.customer_id &&
         formData.value.warehouse_id &&
         formData.value.payment_type;
});

// Step transition animation
const stepTransition = ref('slide-left');

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
  const hasData = formData.value.customer_id ||
                  formData.value.warehouse_id ||
                  formData.value.details.length > 0;

  if (hasData) {
    $q.dialog({
      title: t('common.confirmClose'),
      message: t('blumTransaction.confirmCloseMessage'),
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
  formData.value = {
    customer_id: null,
    customer_name: null,
    warehouse_id: null,
    warehouse_name: null,
    branch_id: null,
    branch_name: null,
    payment_type: null,
    note: '',
    usd_iqd_rate: exchangeRateStore.activeRate?.usd_iqd_rate || 0,
    eur_usd_rate: exchangeRateStore.activeRate?.eur_usd_rate || 0,
    details: [],
    total_price: 0,
    total_eur: 0,
    total_usd: 0
  };
  stepValidation.value = {
    1: false,
    2: false,
    3: false
  };
  validationErrors.value = {};
};

const submitTransaction = async () => {
  if (!canSubmit.value) {
    $q.notify({
      type: 'negative',
      message: t('blumTransaction.fillAllRequiredFields'),
      position: 'top-right'
    });
    return;
  }

  try {
    submitting.value = true;

    // Set branch ID for admin users or use current user's branch
    if (authStore.currentUser?.type === 'admin') {
      if (!formData.value.branch_id) {
        $q.notify({
          type: 'negative',
          message: t('blumTransaction.selectBranchRequired'),
          position: 'top'
        });
        return;
      }
    } else {
      formData.value.branch_id = authStore.currentUser?.branch?.id || null;
    }

    // Prepare transaction data using the correct types
    let result;
    if (props.transactionType === 'purchase') {
      const purchaseTransactionData = {
        customer_id: formData.value.customer_id!,
        warehouse_id: formData.value.warehouse_id!,
        branch_id: formData.value.branch_id!,
        payment_type: formData.value.payment_type!,
        usd_iqd_rate: formData.value.usd_iqd_rate,
        eur_usd_rate: formData.value.eur_usd_rate,
        note: formData.value.note,
        details: formData.value.details.map((detail: any) => ({
          item_id: detail.item_id!,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          solo_unit_price: detail.solo_unit_price || detail.unit_price
        }))
      };
      result = await blumTransactionStore.createPurchaseTransaction(purchaseTransactionData);
    } else {
      const sellTransactionData = {
        customer_id: formData.value.customer_id!,
        warehouse_id: formData.value.warehouse_id!,
        branch_id: formData.value.branch_id!,
        payment_type: formData.value.payment_type!,
        discounted_rate: 0, // Add default discount rate
        note: formData.value.note,
        details: formData.value.details.map((detail: any) => ({
          item_id: detail.item_id,
          set_id: detail.set_id,
          quantity: detail.quantity,
          unit_price: detail.unit_price
        }))
      };
      result = await blumTransactionStore.createSellTransaction(sellTransactionData);
    }

    if (result) {
      $q.notify({
        type: 'positive',
        message: t('blumTransaction.createdSuccessfully'),
        position: 'top-right',
        timeout: 3000
      });

      emit('transaction-added', result);
      resetForm();
      dialogVisible.value = false;
    } else {
      throw new Error('Failed to create transaction');
    }
  } catch (error) {
    console.error('Error creating Blum transaction:', error);
    $q.notify({
      type: 'negative',
      message: t('blumTransaction.errorCreatingTransaction'),
      position: 'top-right'
    });
  } finally {
    submitting.value = false;
  }
};

// Fetch exchange rate function
const fetchExchangeRate = async () => {
  try {
    await exchangeRateStore.fetchActiveExchangeRate();
    if (exchangeRateStore.activeRate?.usd_iqd_rate) {
      formData.value.usd_iqd_rate = exchangeRateStore.activeRate.usd_iqd_rate;
      formData.value.eur_usd_rate = exchangeRateStore.activeRate.eur_usd_rate;
    } else {
      console.warn('No active exchange rate found');
      formData.value.usd_iqd_rate = 1500; // Default fallback rate
      formData.value.eur_usd_rate = 1.1; // Default fallback rate
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    formData.value.usd_iqd_rate = 1500; // Default fallback rate
    formData.value.eur_usd_rate = 1.1; // Default fallback rate
  }
};

// Watch for dialog opening
watch(dialogVisible, async (isOpen) => {
  if (isOpen) {
    // Fetch exchange rate first before resetting form
    await fetchExchangeRate();
    resetForm();
  }
});
</script>

<style lang="scss" scoped>
.blum-transaction-modal {
  .blum-transaction-modal-card {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    flex-shrink: 0;
    padding: 12px 20px;
    border-bottom: 1px solid $grey-3;
    background: white;
    z-index: 1;
  }

  .modal-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-footer {
    flex-shrink: 0;
    padding: 12px 20px;
    border-top: 1px solid $grey-3;
    background: white;
    z-index: 1;
  }

  .transaction-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // Important for flex child scrolling
  }

  .step-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;

    // Ensure proper scrolling
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $grey-2;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: $grey-5;
      border-radius: 3px;

      &:hover {
        background: $grey-6;
      }
    }
  }
}

// Step transition animations
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// Mobile responsive
@media (max-width: 768px) {
  .blum-transaction-modal {
    .modal-header {
      padding: 10px 16px;

      .text-h6 {
        font-size: 1.1rem;
      }

      .q-chip {
        font-size: 0.7rem;
      }
    }

    .step-content {
      padding: 16px;
    }

    .modal-footer {
      padding: 10px 16px;
    }
  }
}
</style>
