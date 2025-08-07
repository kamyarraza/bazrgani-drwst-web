<template>
  <q-dialog v-model="localModel" persistent>
    <q-card class="expense-view-modal"
      style="width: 800px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column;">
      <!-- Enhanced Header with gradient background -->
      <q-card-section class="modal-header" style="flex-shrink: 0;">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="receipt_long" size="2rem" />
          </div>
          <div class="header-text">
            <div class="text-h5 text-weight-bold">{{ t('expense.viewDetails', 'Expense Details') }}</div>
            <div class="text-subtitle2 text-yellow-8" v-if="expense">{{ expense.reference_number }}</div>
          </div>
        </div>
        <!-- <q-btn icon="close" flat round dense size="lg" class="close-btn" v-close-popup /> -->
      </q-card-section>

      <!-- Content with improved spacing -->
      <q-card-section class="modal-content" style="flex: 1; overflow-y: auto;">
        <div v-if="expense" class="expense-details">


          <!-- Detailed Information Cards -->
          <div class="details-grid">
            <!-- Enhanced Summary & Basic Information Card -->
            <div class="summary-card enhanced-summary">
              <div class="card-header summary-header">
                <div class="header-left">
                  <q-icon name="summarize" class="header-icon summary-icon" />
                  <span class="header-title">{{ t('expense.summary', 'Expense Summary') }}</span>
                </div>
                <div class="header-decoration">
                  <div class="decoration-dots">
                    <div class="dot dot-1"></div>
                    <div class="dot dot-2"></div>
                    <div class="dot dot-3"></div>
                  </div>
                </div>
              </div>

              <div class="card-content summary-content-wrapper">
                <!-- Title Section -->
                <div class="title-section">
                  <div class="title-container">
                    <q-avatar size="56px" class="title-avatar-large">
                      <q-icon name="label" size="28px" />
                    </q-avatar>
                    <div class="title-info">
                      <div class="title-label">{{ t('expense.title', 'Title') }}</div>
                      <div class="title-value-large">{{ expense.title }}</div>
                    </div>
                  </div>
                </div>

                <!-- Summary Grid -->
                <div class="summary-grid">
                  <div class="summary-item cute-item">
                    <div class="item-wrapper">
                      <q-avatar size="48px" class="summary-avatar category-avatar">
                        <q-icon name="category" size="24px" />
                      </q-avatar>
                      <div class="item-sparkle sparkle-1">
                        <q-icon name="auto_awesome" size="12px" />
                      </div>
                    </div>
                    <div class="summary-details">
                      <div class="summary-label">{{ t('expense.category', 'Category') }}</div>
                      <div class="summary-value">{{ expense.category?.name || 'N/A' }}</div>
                    </div>
                  </div>

                  <div class="summary-item cute-item">
                    <div class="item-wrapper">
                      <q-avatar size="48px" class="summary-avatar payee-avatar">
                        <q-icon name="person" size="24px" />
                      </q-avatar>
                      <div class="item-sparkle sparkle-2">
                        <q-icon name="auto_awesome" size="12px" />
                      </div>
                    </div>
                    <div class="summary-details">
                      <div class="summary-label">{{ t('expense.payee', 'Payee') }}</div>
                      <div class="summary-value">{{ expense.payee }}</div>
                    </div>
                  </div>

                  <div class="summary-item cute-item">
                    <div class="item-wrapper">
                      <q-avatar size="48px" class="summary-avatar date-avatar">
                        <q-icon name="event" size="24px" />
                      </q-avatar>
                      <div class="item-sparkle sparkle-3">
                        <q-icon name="auto_awesome" size="12px" />
                      </div>
                    </div>
                    <div class="summary-details">
                      <div class="summary-label">{{ t('expense.createdAt', 'Created At') }}</div>
                      <div class="summary-value date-value">{{ formatDate(expense.created_at) }}</div>
                    </div>
                  </div>

                  <div class="summary-item cute-item">
                    <div class="item-wrapper">
                      <q-avatar size="48px" class="summary-avatar payment-avatar">
                        <q-icon name="credit_card" size="24px" />
                      </q-avatar>
                      <div class="item-sparkle sparkle-4">
                        <q-icon name="auto_awesome" size="12px" />
                      </div>
                    </div>
                    <div class="summary-details">
                      <div class="summary-label">{{ t('expense.paymentMethod', 'Payment Method') }}</div>
                      <div class="summary-value">
                        <q-chip :color="getPaymentMethodColor(expense.payment_method)" text-color="white"
                          icon="credit_card" size="sm" class="payment-chip">
                          {{ expense.payment_method }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Information Card -->
            <div class="detail-card">
              <div class="card-header financial-header">
                <q-icon name="account_balance_wallet" class="header-icon" />
                <span class="header-title">{{ t('expense.financialInformation', 'Financial Information') }}</span>
              </div>
              <div class="card-content">
                <div class="financial-grid">
                  <div class="financial-item" v-if="expense.expensed_usd">
                    <div class="financial-icon usd-icon">
                      <q-icon name="attach_money" />
                    </div>
                    <div class="financial-details">
                      <div class="financial-label">{{ t('expense.expensedUsd', 'Amount (USD)') }}</div>
                      <div class="financial-amount" :class="getAmountColorClass(expense.expensed_usd)">
                        ${{ formatAmountWithColor(expense.expensed_usd) }}
                      </div>
                    </div>
                  </div>

                  <div class="financial-item" v-if="expense.expensed_iqd">
                    <div class="financial-icon iqd-icon">
                      <q-icon name="paid" />
                    </div>
                    <div class="financial-details">
                      <div class="financial-label">{{ t('expense.expensedIqd', 'Amount (IQD)') }}</div>
                      <div class="financial-amount" :class="getAmountColorClass(expense.expensed_iqd)">
                        {{ formatAmountWithColor(expense.expensed_iqd, 0) }} IQD
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Return amounts if available -->
                <div v-if="expense.usd_return_amount || expense.iqd_return_amount" class="return-amounts">
                  <div class="return-header">
                    <q-icon name="keyboard_return" class="q-mr-sm" />
                    <span>{{ t('expense.returnAmounts', 'Return Amounts') }}</span>
                  </div>
                  <div class="return-grid">
                    <div class="return-item" v-if="expense.usd_return_amount">
                      <span class="return-label">USD Return:</span>
                      <span class="return-value" :class="getAmountColorClass(expense.usd_return_amount)">
                        ${{ formatAmountWithColor(expense.usd_return_amount) }}
                      </span>
                    </div>
                    <div class="return-item" v-if="expense.iqd_return_amount">
                      <span class="return-label">IQD Return:</span>
                      <span class="return-value" :class="getAmountColorClass(expense.iqd_return_amount)">
                        {{ formatAmountWithColor(expense.iqd_return_amount) }} IQD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- description -->
            <div class="detail-card">
              <div class="card-content">
                <div class="field-item" v-if="expense.description">
                  <div class="field-label">{{ t('expense.description', 'Description') }}</div>
                  <div class="field-value description-value">{{ expense.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Enhanced Actions with better styling -->
      <q-card-actions class="modal-actions" style="flex-shrink: 0;">
        <q-btn flat :label="t('common.close', 'Close')" color="grey-7" icon="close" class="action-btn close-btn"
          v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useMeStore } from 'src/stores/meStore';
import type { Expense } from 'src/types/expense';

// Props
interface Props {
  modelValue: boolean;
  expense?: Expense;
}

// Emits
interface Emits {
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'edit', _expense: Expense): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const meStore = useMeStore();
const { me } = storeToRefs(meStore);

// Local model for v-model
const localModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

// Check if user can edit expenses (only employees)
const canEdit = computed(() => me.value?.type === 'employee');

// Utility functions
function formatAmountWithColor(amount?: number, fractionDigits = 2): string {
  if (!amount && amount !== 0) return '0.00';
  const absAmount = Math.abs(amount);
  return absAmount.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
}

function getAmountColorClass(amount?: number): string {
  if (!amount && amount !== 0) return '';
  return amount < 0 ? 'amount-negative' : 'amount-positive';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPaymentMethodColor(method: string): string {
  const colorMap: Record<string, string> = {
    'cash': 'green',
    'check': 'blue',
    'bank transfer': 'purple',
    'credit card': 'orange',
    'debit card': 'teal',
    'online': 'indigo',
    'other': 'grey'
  };
  return colorMap[method?.toLowerCase()] || 'primary';
}

function handleEdit() {
  if (props.expense) {
    emit('edit', props.expense);
    localModel.value = false;
  }
}
</script>

<style scoped>
.expense-view-modal {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Content Area with Scrolling */
.modal-content {
  padding: 24px;
  background: #fafafa;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}

/* Enhanced Header */
.modal-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1e88e5 100%);
  color: white;
  padding: 24px;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-text {
  flex: 1;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.expense-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Enhanced Summary Card */
.enhanced-summary {
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 2px solid #e3f2fd;
  overflow: hidden;
  position: relative;
}

.enhanced-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2196f3, #21cbf3, #2196f3);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.summary-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
  color: white;
  padding: 8px;
  border-radius: 12px;
  font-size: 20px;
}

.header-decoration {
  display: flex;
  align-items: center;
}

.decoration-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
  animation: bounce 1.5s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.5s;
}

.dot-3 {
  animation-delay: 1s;
}

@keyframes bounce {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.summary-content-wrapper {
  padding: 24px;
}

.title-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%);
  border-radius: 16px;
  border: 2px solid #ffcc02;
  position: relative;
}

.title-section::before {
  content: '✨';
  position: absolute;
  top: -8px;
  right: 16px;
  font-size: 16px;
  background: white;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.title-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-avatar-large {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  color: white;
  border: 3px solid white;
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
}

.title-info {
  flex: 1;
}

.title-label {
  font-size: 12px;
  color: #f57c00;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.title-value-large {
  font-size: 20px;
  font-weight: 700;
  color: #e65100;
  line-height: 1.2;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.cute-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cute-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--item-color, #e0e0e0), transparent);
  transition: all 0.3s ease;
}

.cute-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--item-color, #e0e0e0);
}

.cute-item:hover::before {
  height: 4px;
}

.cute-item:nth-child(1) {
  --item-color: #2196f3;
}

.cute-item:nth-child(2) {
  --item-color: #9c27b0;
}

.cute-item:nth-child(3) {
  --item-color: #ff9800;
}

.cute-item:nth-child(4) {
  --item-color: #4caf50;
}

.item-wrapper {
  position: relative;
  flex-shrink: 0;
}

.item-sparkle {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ffd700;
  border-radius: 50%;
  padding: 3px;
  color: #ff6b35;
  animation: sparkle-rotate 2s linear infinite;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.sparkle-1 {
  animation-delay: 0s;
}

.sparkle-2 {
  animation-delay: 0.5s;
}

.sparkle-3 {
  animation-delay: 1s;
}

.sparkle-4 {
  animation-delay: 1.5s;
}

@keyframes sparkle-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(1.1);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}

.date-avatar {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  color: #f57c00;
}

.title-avatar {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  color: #f57c00;
}

.payment-avatar {
  background: linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%);
  color: #388e3c;
}

.payment-chip {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Old Summary Card Styles - keeping for compatibility */
.summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

.summary-avatar {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-avatar {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
}

.amount-avatar {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  color: #388e3c;
}

.payee-avatar {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #7b1fa2;
}

.summary-details {
  flex: 1;
}

.summary-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.amount-usd {
  color: #388e3c;
  font-weight: 700;
}

.amount-iqd {
  color: #1976d2;
  font-weight: 700;
}

.amount-separator {
  margin: 0 8px;
  color: #999;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: #e0e0e0;
  margin: 0 8px;
}

/* Detail Cards */
.details-grid {
  display: grid;
  gap: 20px;
}

.detail-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.detail-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 8px;
}

.financial-header {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  color: #2e7d32;
}

.payment-header {
  background: linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%);
  color: #7b1fa2;
}

.timestamps-header {
  background: linear-gradient(135deg, #fff3e0 0%, #ffeaa7 100%);
  color: #f57c00;
}

.header-icon {
  font-size: 18px;
}

.header-title {
  font-weight: 600;
  font-size: 14px;
}

.card-content {
  padding: 20px;
}

/* Field Groups */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 15px;
  color: #333;
  line-height: 1.4;
}

.title-value {
  font-weight: 600;
  font-size: 16px;
  color: #1976d2;
}

.description-value {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e3f2fd;
  font-style: italic;
}

/* Financial Grid */
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.financial-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #e0e0e0;
}

.financial-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.usd-icon {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
}

.iqd-icon {
  background: linear-gradient(135deg, #2196f3 0%, #03a9f4 100%);
}

.financial-details {
  flex: 1;
}

.financial-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.financial-amount {
  font-size: 18px;
  font-weight: 700;
}

.amount-positive {
  color: #4caf50 !important;
}

.amount-negative {
  color: #f44336 !important;
}

.usd-amount {
  color: #388e3c;
}

.iqd-amount {
  color: #1976d2;
}

/* Return Amounts */
.return-amounts {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 16px;
}

.return-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #ff9800;
  font-weight: 600;
  font-size: 14px;
}

.return-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.return-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff3e0;
  border-radius: 8px;
  border: 1px solid #ffcc02;
}

.return-label {
  font-size: 13px;
  color: #f57c00;
  font-weight: 500;
}

.return-value {
  font-weight: 600;
  color: #e65100;
}

.return-value.amount-positive {
  color: #4caf50 !important;
}

.return-value.amount-negative {
  color: #f44336 !important;
}

/* Payment Grid */
.payment-grid {
  display: grid;
  gap: 16px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.payment-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
  color: #7b1fa2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.payment-details {
  flex: 1;
}

.payment-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.payment-value {
  font-size: 14px;
  color: #333;
}

.method-chip {
  margin-top: 4px;
}

.date-value {
  font-weight: 500;
  color: #1976d2;
}

.reference-value {
  margin-top: 4px;
}

/* Timestamps */
.timestamps-card {
  background: linear-gradient(135deg, #fff 0%, #fffbf0 100%);
}

.timestamps-grid {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.timestamp-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

.timestamp-icon {
  font-size: 20px;
}

.created-icon {
  color: #4caf50;
}

.updated-icon {
  color: #ff9800;
}

.timestamp-details {
  flex: 1;
}

.timestamp-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.timestamp-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* Actions */
.modal-actions {
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f5f5f5;
}

.edit-btn {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1e88e5 100%);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.edit-btn:hover {
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 600px) {
  .expense-view-modal {
    max-height: 95vh !important;
    margin: 8px !important;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-content {
    padding: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .title-container {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .title-section {
    padding: 16px;
  }

  .title-value-large {
    font-size: 18px;
  }

  .cute-item {
    padding: 12px;
    gap: 12px;
  }

  .item-sparkle {
    display: none;
  }

  .decoration-dots {
    display: none;
  }

  .summary-content {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-divider {
    display: none;
  }

  .financial-grid {
    grid-template-columns: 1fr;
  }

  .timestamps-grid {
    flex-direction: column;
  }

  .return-grid {
    flex-direction: column;
  }
}

/* Animation */
.expense-view-modal {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
