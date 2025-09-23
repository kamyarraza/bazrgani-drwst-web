<template>
  <q-dialog v-model="isVisible" persistent class="cancel-confirmation-dialog">
    <q-card class="modal-card" style="width: 500px; max-width: 95vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <q-icon name="cancel" size="2rem" />
          </div>
          <div>
            <h4 class="modal-title">{{ t('transaction.cancelConfirmation.title') }}</h4>
            <p class="modal-subtitle">{{ t('transaction.cancelConfirmation.subtitle') }}</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="close" class="close-btn" />
      </q-card-section>

      <q-separator />

      <q-card-section class="modal-body" style="overflow-y: auto; flex: 1;">
        <!-- Transaction Info -->
        <div v-if="props.transactionData" class="transaction-info-card q-mb-md">
          <div class="info-header">
            <q-icon name="info" class="q-mr-sm" />
            <span class="info-title">{{ t('transaction.cancelConfirmation.transactionDetails') }}</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ t('transaction.cancelConfirmation.transactionId') }}:</span>
              <span class="info-value">#{{ props.transactionData.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('transaction.cancelConfirmation.customer') }}:</span>
              <span class="info-value">{{ props.transactionData.customer?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('transaction.cancelConfirmation.createdAt') }}:</span>
              <span class="info-value">{{ props.transactionData.created_at }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('transaction.cancelConfirmation.totalAmount') }}:</span>
              <span class="info-value total-amount">{{ formatCurrency(props.transactionData.total_price || 0) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('transaction.cancelConfirmation.paidAmount') }}:</span>
              <span class="info-value paid-amount">{{ formatCurrency(props.transactionData.paid_price || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="warning-card q-mb-md">
          <div class="warning-header">
            <q-icon name="warning" class="q-mr-sm" />
            <span class="warning-title">{{ t('transaction.cancelConfirmation.warningTitle') }}</span>
          </div>
          <p class="warning-text">{{ t('transaction.cancelConfirmation.warningMessage') }}</p>
        </div>

        <q-form @submit.prevent="handleSubmit" class="cancel-form">
          <!-- Password Verification -->
          <div class="form-group">
            <label class="form-label required">
              <q-icon name="lock" class="label-icon" />
              {{ t('transaction.cancelConfirmation.passwordLabel') }}
            </label>
            <q-input v-model="form.password" type="password" outlined dense
              :placeholder="t('transaction.cancelConfirmation.passwordPlaceholder')" class="form-input password-input"
              :rules="[val => !!val || t('transaction.cancelConfirmation.passwordRequired')]" @keyup.enter="handleSubmit">
              <template v-slot:prepend>
                <q-icon name="lock" color="red-6" />
              </template>
            </q-input>
          </div>

          <!-- Confirmation Checkbox -->
          <div class="form-group">
            <div class="checkbox-wrapper">
              <q-checkbox v-model="form.confirmCancellation" :label="t('transaction.cancelConfirmation.confirmationLabel')"
                color="red-6" class="confirmation-checkbox"
                :rules="[val => !!val || t('transaction.cancelConfirmation.confirmationRequired')]" />
            </div>
            <small class="checkbox-description">
              {{ t('transaction.cancelConfirmation.confirmationDescription') }}
            </small>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions class="modal-actions" style="flex-shrink: 0;">
        <q-btn :label="t('transaction.cancelConfirmation.cancelButton')" flat color="grey-7" @click="close" class="cancel-btn" />
        <q-btn :label="t('transaction.cancelConfirmation.confirmCancelButton')" color="red-6" unelevated :loading="loading"
          @click="handleSubmit" class="submit-btn" :disable="!isFormValid" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useItemTransactionStore } from 'src/stores/itemTransactionStore';
import { formatCurrency } from 'src/composables/useFormat';

// Props & Emits
interface Props {
  modelValue: boolean;
  transactionId?: string | number;
  transactionData?: {
    id?: number;
    customer?: {
      id: number;
      name: string;
    };
    created_at?: string;
    total_price?: number;
    paid_price?: number;
    unpaid_price?: number;
  } | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'success': [payload?: any];
  'cancel': [];
}>();

// Store
const itemStore = useItemTransactionStore();
const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();

// Local state
const isVisible = ref(false);
const loading = ref(false);

const form = ref({
  password: '',
  confirmCancellation: false
});

// Form validation
const isFormValid = computed(() => {
  return form.value.password.trim() !== '' &&
    form.value.confirmCancellation;
});

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
  if (newVal) {
    resetForm();
  }
});

watch(isVisible, (newVal) => {
  emit('update:modelValue', newVal);
});

// Methods
const close = () => {
  isVisible.value = false;
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  form.value = {
    password: '',
    confirmCancellation: false
  };
};

const handleSubmit = async () => {
  // Validate form
  if (!isFormValid.value) {
    $q.notify({
      type: 'negative',
      message: t('transaction.cancelConfirmation.errors.formInvalid'),
      position: 'top'
    });
    return;
  }

  // Get transaction ID
  const transactionId = props.transactionId ||
    props.transactionData?.id ||
    route.params.id ||
    route.params.transactionId;

  if (!transactionId) {
    $q.notify({
      type: 'negative',
      message: t('transaction.cancelConfirmation.errors.transactionIdRequired'),
      position: 'top'
    });
    return;
  }

  try {
    loading.value = true;

    const cancellationData = {
      _method: 'DELETE', // Method override for DELETE
      password: form.value.password,
    };

    const resp = await itemStore.cancelTransaction(transactionId.toString(), cancellationData);

    $q.notify({
      type: 'positive',
      message: t('transaction.cancelConfirmation.success.transactionCancelled'),
      position: 'top'
    });

    emit('success', resp?.data ?? null);
    close();
  } catch (error: any) {
    console.error('Transaction cancellation failed:', error);

    // Handle specific error messages
    const errorMessage = error?.response?.data?.message ||
      error?.message ||
      t('transaction.cancelConfirmation.errors.cancellationFailed');

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.cancel-confirmation-dialog {
  .modal-card {
    border-radius: 16px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.modal-header {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .icon-wrapper {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .modal-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .modal-subtitle {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }
  }

  .close-btn {
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-body {
  padding: 24px;
  background: #fafafa;
}

.transaction-info-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .info-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    color: #1976d2;
    font-weight: 600;
    font-size: 1.1rem;

    .info-title {
      font-weight: 600;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e8e8e8;

      .info-label {
        font-weight: 500;
        color: #666;
      }

      .info-value {
        font-weight: 700;
        font-size: 1.1rem;
        color: #333;

        &.total-amount {
          color: #1976d2;
        }

        &.paid-amount {
          color: #43a047;
        }
      }
    }
  }
}

.warning-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 1px solid #ffb74d;
  border-radius: 12px;
  padding: 20px;

  .warning-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: #f57c00;
    font-weight: 600;
    font-size: 1.1rem;

    .warning-title {
      font-weight: 600;
    }
  }

  .warning-text {
    margin: 0;
    color: #e65100;
    font-weight: 500;
    line-height: 1.5;
  }
}

.form-group {
  margin-bottom: 24px;

  .form-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    font-size: 0.95rem;

    &.required::after {
      content: ' *';
      color: #e53935;
    }

    .label-icon {
      font-size: 18px;
    }
  }

  .form-input {
    :deep(.q-field__control) {
      border-radius: 8px;
      background: white;
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;

      &:hover {
        border-color: #e53935;
      }
    }

    :deep(.q-field--focused .q-field__control) {
      border-color: #e53935 !important;
      box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
    }

    &.password-input {
      :deep(.q-field__control) {
        border-color: #e53935;
      }
    }
  }
}

.checkbox-wrapper {
  margin-bottom: 8px;

  .confirmation-checkbox {
    font-weight: 500;
  }
}

.checkbox-description {
  color: #666;
  font-style: italic;
  margin-left: 32px;
}

.modal-actions {
  background: white;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;

  .cancel-btn {
    min-width: 120px;
    font-weight: 600;
  }

  .submit-btn {
    min-width: 140px;
    font-weight: 600;
    background: linear-gradient(135deg, #e53935 0%, #c62828 100%);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .modal-card {
    width: 100% !important;
    height: 100% !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 16px;

    .header-content {
      .icon-wrapper {
        width: 48px;
        height: 48px;
      }

      .modal-title {
        font-size: 1.4rem;
      }
    }
  }

  .modal-body {
    padding: 16px;
  }

  .modal-actions {
    padding: 16px;
  }
}
</style>
