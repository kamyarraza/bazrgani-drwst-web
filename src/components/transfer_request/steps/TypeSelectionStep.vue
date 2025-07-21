<template>
  <div class="type-selection-step">
    <!-- Step Header -->
    <div class="step-header q-mb-xl">
      <div class="step-icon-container">
        <q-icon name="settings" size="2.5rem" class="text-primary" />
      </div>
      <h5 class="step-title">{{ t('transferRequest.selectTransferType') }}</h5>
      <p class="step-subtitle text-grey-6">
        {{ t('transferRequest.selectTransferTypeDescription') }}
      </p>
    </div>

    <!-- Transfer Type Options -->
    <div class="transfer-type-options">
      <div class="row q-col-gutter-lg">
        <!-- Request Option -->
        <div class="col-12 col-md-6">
          <q-card
            :class="[
              'transfer-option-card',
              { 'selected': formData.transferType === 'request' }
            ]"
            @click="selectTransferType('request')"
            clickable
          >
            <q-card-section class="text-center">
              <div class="option-icon-container q-mb-md">
                <q-icon
                  name="call_received"
                  size="3rem"
                  :class="formData.transferType === 'request' ? 'text-primary' : 'text-grey-5'"
                />
              </div>
              <div class="option-title">
                {{ t('transferRequest.transferRequest') }}
              </div>
              <div class="option-description text-grey-6">
                {{ t('transferRequest.transferRequestDescription') }}
              </div>

              <!-- Selected indicator -->
              <q-icon
                v-if="formData.transferType === 'request'"
                name="check_circle"
                size="1.5rem"
                class="text-positive option-check"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Transfer Option -->
        <div class="col-12 col-md-6">
          <q-card
            :class="[
              'transfer-option-card',
              { 'selected': formData.transferType === 'transfer' }
            ]"
            @click="selectTransferType('transfer')"
            clickable
          >
            <q-card-section class="text-center">
              <div class="option-icon-container q-mb-md">
                <q-icon
                  name="swap_horiz"
                  size="3rem"
                  :class="formData.transferType === 'transfer' ? 'text-primary' : 'text-grey-5'"
                />
              </div>
              <div class="option-title">
                {{ t('transferRequest.directTransfer') }}
              </div>
              <div class="option-description text-grey-6">
                {{ t('transferRequest.directTransferDescription') }}
              </div>

              <!-- Selected indicator -->
              <q-icon
                v-if="formData.transferType === 'transfer'"
                name="check_circle"
                size="1.5rem"
                class="text-positive option-check"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Selected Type Information -->
    <div v-if="formData.transferType" class="selected-info q-mt-xl">
      <q-card flat bordered class="info-card">
        <q-card-section>
          <div class="row items-center">
            <q-icon
              :name="formData.transferType === 'request' ? 'move_to_inbox' : 'swap_horiz'"
              size="1.5rem"
              class="text-primary q-mr-md"
            />
            <div>
              <div class="text-subtitle1 text-weight-medium">
                {{ formData.transferType === 'request'
                    ? t('transferRequest.transferRequest')
                    : t('transferRequest.directTransfer')
                }}
              </div>
              <div class="text-caption text-grey-6">
                {{ formData.transferType === 'request'
                    ? t('transferRequest.transferRequestDetailedDescription')
                    : t('transferRequest.directTransferDetailedDescription')
                }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Props & Emits
interface Props {
  formData: {
    transferType: 'request' | 'transfer';
    [key: string]: any;
  };
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

// Computed
const formData = computed({
  get: () => props.formData,
  set: (value) => emit('update:formData', value)
});

// Validation
const isStepValid = computed(() => {
  return !!formData.value.transferType;
});

// Methods
const selectTransferType = (type: 'request' | 'transfer') => {
  const updatedData = {
    ...formData.value,
    transferType: type
  };

  emit('update:formData', updatedData);
  emit('clearValidationError', 'transferType');

  // Validate step
  emit('validate', 1, true);
};

// Watch for initial validation
const validateStep = () => {
  emit('validate', 1, isStepValid.value);
};

// Initial validation
validateStep();
</script>

<style lang="scss" scoped>
.type-selection-step {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;

  .step-header {
    text-align: center;

    .step-icon-container {
      margin-bottom: 1rem;
    }

    .step-title {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: var(--q-primary);
    }

    .step-subtitle {
      margin: 0;
      font-size: 1rem;
    }
  }

  .transfer-option-card {
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
    cursor: pointer;
    min-height: 200px;
    display: flex;
    align-items: center;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    &.selected {
      border-color: var(--q-primary);
      background: rgba(var(--q-primary-rgb), 0.05);
    }

    .option-icon-container {
      transition: all 0.3s ease;
    }

    .option-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--q-dark);
    }

    .option-description {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .option-check {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
  }

  .selected-info {
    .info-card {
      background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.05) 0%, rgba(var(--q-primary-rgb), 0.1) 100%);
      border-color: rgba(var(--q-primary-rgb), 0.2);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .type-selection-step {
    padding: 1rem 0.5rem;

    .transfer-option-card {
      min-height: 160px;
    }

    .option-title {
      font-size: 1.1rem;
    }

    .option-description {
      font-size: 0.85rem;
    }
  }
}
</style>
