<template>
  <q-dialog v-model="show" persistent transition-show="slide-up" transition-hide="slide-down">
    <q-card class="borrow-modal-card">
      <!-- Header with cute gradient -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <q-icon name="account_balance_wallet" size="28px" class="header-icon" />
            </div>
            <div class="header-text">
              <h1 class="modal-title">💰 {{ t('customer.borrow.title') }}</h1>
              <p class="modal-subtitle">{{ t('customer.borrow.subtitle') }}</p>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="close" class="close-button" size="md" />
        </div>
      </q-card-section>

      <!-- Customer Info Section -->
      <q-card-section class="customer-info-section">
        <div class="customer-card">
          <div class="customer-avatar">
            <q-icon name="person" size="24px" />
          </div>
          <div class="customer-details">
            <div class="customer-name">{{ customer?.fname }} {{ customer?.sname }}</div>
            <div class="customer-meta">
              <span class="customer-type">{{ t(`customer.${customer?.type}`) }}</span>
              <span class="separator">•</span>
              <span class="customer-phone">{{ customer?.fphone }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Previous Borrow Display Section -->
      <q-card-section class="previous-borrow-section">
        <div class="previous-borrow-card">
          <div class="previous-borrow-header">
            <div class="borrow-icon-wrapper">
              <q-icon name="history" size="20px" color="primary" />
            </div>
            <span class="previous-borrow-title">{{ t('customer.borrow.previousAmount') }}</span>
          </div>
          <div class="previous-borrow-amount">
            <!-- <span class="currency-symbol">$</span> -->
            <span class="amount-value">{{ formatCurrency(customer?.purchase_borrow || 0) }}</span>
            <span class="currency-label">USD</span>
          </div>
          <div class="borrow-status" :class="{ 'has-debt': (customer?.purchase_borrow || 0) > 0 }">
            <q-icon :name="(customer?.purchase_borrow || 0) > 0 ? 'trending_up' : 'check_circle'"
              :color="(customer?.purchase_borrow || 0) > 0 ? 'warning' : 'positive'" size="16px" />
            <span>{{ (customer?.purchase_borrow || 0) > 0 ? t('customer.borrow.hasDebt') : t('customer.borrow.noDebt')
              }}</span>
          </div>
        </div>
      </q-card-section>

      <!-- Form Section -->
      <q-card-section class="form-section">
        <q-form @submit="handleSubmit" class="borrow-form">
          <!-- Amount Input -->
          <div class="form-group">
            <label class="form-label">
              <q-icon name="attach_money" color="primary" size="20px" />
              {{ t('customer.borrow.amountLabel') }}
              <span class="required-asterisk">*</span>
            </label>
            <q-input v-model.number="borrowAmount" type="number" min="0" step="0.01" outlined
              :placeholder="t('customer.borrow.amountPlaceholder')" class="amount-input" :rules="[
                val => !!val || t('customer.borrow.amountRequired'),
                val => val > 0 || t('customer.borrow.amountMustBePositive')
              ]" :error="!!borrowAmountError" :error-message="borrowAmountError || undefined" suffix="USD"
              @input="borrowAmountError = null">
              <template v-slot:prepend>
                <q-icon name="usd" color="green" />
              </template>
            </q-input>
          </div>

          <!-- Summary Card -->
          <div class="summary-card">
            <div class="summary-header">
              <q-icon name="receipt" color="primary" size="20px" />
              <span class="summary-title">{{ t('customer.borrow.summary') }}</span>
            </div>
            <div class="summary-content">
              <!-- <div class="summary-row">
                <span class="summary-label">{{ t('customer.borrow.newBorrowAmount') }}:</span>
                <span class="summary-value">{{ formatCurrency(borrowAmount || 0) }}</span>
              </div> -->
              <!-- <div class="summary-row">
                <span class="summary-label">{{ t('customer.borrow.previousBorrowAmount') }}:</span>
                <span class="summary-value">{{ formatCurrency(customer?.purchase_borrow || 0) }}</span>
              </div> -->
              <div class="summary-row total-row">
                <span class="summary-label">{{ t('customer.borrow.totalBorrowAmount') }}:</span>
                <span class="summary-value total-value">{{ formatCurrency((borrowAmount || 0) +
                  (customer?.purchase_borrow || 0))
                  }}</span>
              </div>
              <!-- <div class="summary-row">
                <span class="summary-label">{{ t('customer.borrow.customer') }}:</span>
                <span class="summary-value">{{ customer?.fname }} {{ customer?.sname }}</span>
              </div> -->
            </div>
          </div>

          <!-- Action Buttons -->
          <q-card-actions class="action-buttons">
            <q-btn flat :label="t('common.cancel')" @click="close" class="cancel-btn" icon="close" />
            <q-btn type="submit" color="primary" :label="t('customer.borrow.createBorrow')" :loading="loading"
              :disable="!canSubmit" unelevated class="submit-btn" icon="add" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useCustomerStore } from 'src/stores/customerStore';
import type { Customer } from 'src/types/customer';
import { formatCurrency } from 'src/composables/useFormat';

interface Props {
  modelValue: boolean;
  customer?: Customer | null;
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();
const $q = useQuasar();
const customerStore = useCustomerStore();

// State
const borrowAmount = ref<number | null>(null);
const loading = ref(false);
const borrowAmountError = ref<string | null>(null);

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
});

const canSubmit = computed(() => {
  return borrowAmount.value && borrowAmount.value > 0;
});

// Methods
const resetForm = () => {
  borrowAmount.value = null;
  borrowAmountError.value = null;
};

const close = () => {
  resetForm();
  show.value = false;
};

const handleSubmit = async () => {
  if (!props.customer || !borrowAmount.value) {
    borrowAmountError.value = t('customer.borrow.amountRequired');
    return;
  }

  if (borrowAmount.value <= 0) {
    borrowAmountError.value = t('customer.borrow.amountMustBePositive');
    return;
  }

  loading.value = true;
  borrowAmountError.value = null;

  try {
    const borrowData = {
      borrowed_usd: borrowAmount.value
    };

    const success = await customerStore.createBorrow(props.customer.id, borrowData);

    if (success) {
      $q.notify({
        type: 'positive',
        message: t('customer.borrow.success.title'),
        caption: t('customer.borrow.success.message', {
          amount: borrowAmount.value,
          customer: `${props.customer.fname} ${props.customer.sname}`
        }),
        timeout: 3000,
        position: 'top',
        avatar: '💰',
        actions: [
          { icon: 'close', color: 'white', round: true, size: 'sm' }
        ]
      });

      emit('success');
      close();
    }
  } catch (error) {
    console.error('Borrow creation error:', error);

    $q.notify({
      type: 'negative',
      message: t('customer.borrow.error.title'),
      caption: t('customer.borrow.error.message'),
      timeout: 4000,
      position: 'top',
      avatar: '❌',
      actions: [
        { icon: 'close', color: 'white', round: true, size: 'sm' }
      ]
    });
  } finally {
    loading.value = false;
  }
};

// Watch for modal open/close to reset form
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>

<style lang="scss" scoped>
.borrow-modal-card {
  min-width: 500px;
  max-width: 600px;
  width: 90vw;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.2)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  padding: 12px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.header-icon {
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 4px 0 0 0;
  font-weight: 400;
}

.close-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.customer-info-section {
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.customer-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.customer-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.customer-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.customer-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.customer-type {
  background: #ecf0f1;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: capitalize;
}

.separator {
  opacity: 0.5;
}

// Previous Borrow Section Styles
.previous-borrow-section {
  padding: 16px 24px;
  background: linear-gradient(135deg, #fff5f5 0%, #f0f9ff 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.previous-borrow-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.previous-borrow-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.previous-borrow-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.borrow-icon-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.previous-borrow-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.previous-borrow-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
  justify-content: center;
}

.currency-symbol {
  font-size: 1.2rem;
  font-weight: 600;
  color: #27ae60;
}

.amount-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.currency-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #7f8c8d;
  margin-left: 2px;
}

.borrow-status {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #d5f4e6;
  color: #27ae60;
  transition: all 0.3s ease;
}

.borrow-status.has-debt {
  background: #fef3cd;
  color: #f39c12;
}

.form-section {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
}

.required-asterisk {
  color: #e74c3c;
  font-weight: bold;
}

.amount-input {
  .q-field__control {
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  &.q-field--focused .q-field__control {
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.summary-card {
  background: linear-gradient(135deg, #f1f8ff 0%, #e8f5e8 100%);
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="money" width="40" height="40" patternUnits="userSpaceOnUse"><text x="20" y="25" text-anchor="middle" font-size="16" fill="rgba(102,126,234,0.05)">💰</text></pattern></defs><rect width="100" height="100" fill="url(%23money)"/></svg>');
  opacity: 0.3;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.summary-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.summary-content {
  position: relative;
  z-index: 2;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.summary-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

// Special styling for total row
.total-row {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.1));
  border-radius: 8px;
  padding: 12px 16px !important;
  margin: 8px -8px;
  border: 1px solid rgba(25, 118, 210, 0.2) !important;

  .summary-label {
    font-weight: 700;
    color: #1976d2;
    font-size: 1rem;
  }
}

.total-value {
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  color: #1976d2 !important;
}

.action-buttons {
  padding: 0;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  color: #7f8c8d;
  font-weight: 500;
  border-radius: 10px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #bdc3c7;
  color: #7f8c8d;
  transform: none;
  box-shadow: none;
}
</style>
