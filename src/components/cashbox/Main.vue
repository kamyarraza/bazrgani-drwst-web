<template>
  <div class="cashbox-container">
    <!-- Header Section with cute design -->
    <div class="cashbox-header">
      <div class="header-content">
        <div class="header-icon">
          <q-avatar size="80px" class="cashbox-avatar">
            <q-icon name="account_balance_wallet" size="40px" color="white" />
          </q-avatar>
        </div>
        <div class="header-text">
          <h4 class="cashbox-title">
            {{ t('cashbox.branchCashbox', 'Branch Cashbox') }}
            <q-icon name="auto_awesome" class="sparkle-icon" />
          </h4>
          <div class="branch-info" v-if="branch">
            <q-chip color="primary" text-color="white" size="md" icon="store" class="branch-chip">
              {{ branch.name }} • {{ branch.code || 'N/A' }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Cashbox Status and Balance Cards -->
    <div v-if="branch && cashboxStore.cashbox" class="cashbox-cards">
      <!-- Status Card -->
      <div class="status-card">
        <q-card class="cute-card status-specific">
          <q-card-section class="text-center">
            <div class="status-icon-container">
              <q-icon :name="cashboxStore.cashbox.is_opened ? 'lock_open' : 'lock'"
                :class="cashboxStore.cashbox.is_opened ? 'status-open' : 'status-closed'" size="3rem" />
            </div>
            <div class="status-text">
              <!-- <h6>{{ t('cashbox.status', 'Status') }}</h6> -->
              <q-chip :color="cashboxStore.cashbox.is_opened ? 'positive' : 'negative'" text-color="white" size="lg"
                :icon="cashboxStore.cashbox.is_opened ? 'lock_open' : 'lock'" class="status-chip" style="height: 48px;">
                {{ cashboxStore.cashbox.is_opened ? t('cashbox.opened', 'Opened') : t('cashbox.closed',
                  'Closed') }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Balance Cards -->
      <div class="balance-cards">
        <!-- IQD Balance -->
        <div class="balance-card iqd-card">
          <q-card class="cute-card balance-specific">
            <q-card-section>
              <div class="balance-header">
                <q-icon name="attach_money" class="currency-icon iqd-icon" />
                <span class="currency-label">{{ t('cashbox.iqdBalance', 'IQD Balance') }}</span>
              </div>
              <div class="balance-amount iqd-amount">
                {{ formatCurrency(cashboxStore.cashbox.iqd_balance, 'IQD') }}
              </div>
              <div class="balance-decoration">
                <q-icon name="trending_up" class="trend-icon" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- USD Balance -->
        <div class="balance-card usd-card">
          <q-card class="cute-card balance-specific">
            <q-card-section>
              <div class="balance-header">
                <q-icon name="attach_money" class="currency-icon usd-icon" />
                <span class="currency-label">{{ t('cashbox.usdBalance', 'USD Balance') }}</span>
              </div>
              <div class="balance-amount usd-amount">
                {{ formatCurrency(cashboxStore.cashbox.usd_balance, 'USD') }}
              </div>
              <div class="balance-decoration">
                <q-icon name="savings" class="trend-icon" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Action Buttons Section -->
    <div v-if="branch && cashboxStore.cashbox" class="action-section">
      <!-- Tabs for different sections -->
      <div class="cashbox-tabs">
        <q-tabs v-model="activeTab" class="cashbox-tabs-header" active-color="primary" indicator-color="primary"
          align="justify" narrow-indicator no-caps>
          <q-tab name="actions" class="tab-item">
            <div class="tab-content">
              <q-icon name="settings" size="20px" />
              <span class="tab-label">{{ t('common.actions', 'Actions') }}</span>
            </div>
          </q-tab>

          <q-tab name="transactions" class="tab-item">
            <div class="tab-content">
              <q-icon name="receipt_long" size="20px" />
              <span class="tab-label">{{ t('cashbox.transactionHistory', 'Transaction History') }}</span>
            </div>
          </q-tab>

          <q-tab name="sessions" class="tab-item">
            <div class="tab-content">
              <q-icon name="history" size="20px" />
              <span class="tab-label">{{ t('cashbox.sessionHistory', 'Session History') }}</span>
            </div>
          </q-tab>
        </q-tabs>

        <q-separator class="tab-separator" />

        <q-tab-panels v-model="activeTab" animated swipeable class="cashbox-tab-panels">
          <!-- Actions Tab -->
          <q-tab-panel name="actions" class="actions-panel">
            <!-- Main Actions (Open/Close) -->
            <div class="main-actions">
              <q-btn v-if="!cashboxStore.cashbox.is_opened" color="positive" @click="showOpenDialog = true"
                :loading="cashboxStore.loading" class="main-action-btn open-btn cute-btn" size="lg" rounded
                :disable="cashboxStore.loading">
                <div class="btn-content">
                  <q-icon name="lock_open" class="btn-icon unlock-icon"
                    :class="{ 'animating': cashboxStore.loading }" />
                  <span class="btn-text">{{ t('cashbox.openCashbox', 'Open Cashbox') }}</span>
                  <div class="sparkles">
                    <div class="sparkle sparkle-1"></div>
                    <div class="sparkle sparkle-2"></div>
                    <div class="sparkle sparkle-3"></div>
                  </div>
                </div>
                <q-tooltip class="cute-tooltip">
                  {{ t('cashbox.openTooltip', 'Open cashbox to start transactions') }}
                </q-tooltip>
              </q-btn>

              <q-btn v-if="cashboxStore.cashbox.is_opened" color="negative" @click="showCloseDialog = true"
                :loading="cashboxStore.loading" class="main-action-btn close-btn cute-btn" size="lg" rounded
                :disable="cashboxStore.loading">
                <div class="btn-content">
                  <q-icon name="lock" class="btn-icon lock-icon" :class="{ 'animating': cashboxStore.loading }" />
                  <span class="btn-text">{{ t('cashbox.closeCashbox', 'Close Cashbox') }}</span>
                  <div class="lock-glow"></div>
                </div>
                <q-tooltip class="cute-tooltip">
                  {{ t('cashbox.closeTooltip', 'Close cashbox and end session') }}
                </q-tooltip>
              </q-btn>
            </div>

            <!-- Transaction Actions (only when cashbox is open) -->
            <div v-if="cashboxStore.cashbox.is_opened" class="transaction-actions">
              <div class="actions-header">
                <h6>{{ t('cashbox.transactions', 'Transactions') }}</h6>
                <q-icon name="payments" class="transactions-icon" />
              </div>

              <div class="transaction-buttons">
                <q-btn color="green-6" icon="add_circle" :label="t('cashbox.deposit', 'Deposit')"
                  @click="showDepositDialog = true" class="transaction-btn deposit-btn" rounded outline>
                  <q-tooltip>{{ t('cashbox.depositTooltip', 'Add money to cashbox') }}</q-tooltip>
                </q-btn>

                <q-btn color="red-6" icon="remove_circle" :label="t('cashbox.withdraw', 'Withdraw')"
                  @click="showWithdrawDialog = true" class="transaction-btn withdraw-btn" rounded outline>
                  <q-tooltip>{{ t('cashbox.withdrawTooltip', 'Remove money from cashbox') }}</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Utility Actions -->
            <div class="utility-actions">
              <q-btn color="primary" icon="refresh" :label="t('cashbox.refresh', 'Refresh')" @click="refreshCashbox"
                :loading="cashboxStore.loading" flat class="utility-btn" rounded />

              <q-btn color="grey-7" :icon="goBackIcon" :label="t('common.back', 'Go Back')" @click="$emit('go-back')"
                flat class="utility-btn" rounded />
            </div>
          </q-tab-panel>

          <!-- Transactions Tab -->
          <q-tab-panel name="transactions" class="transactions-panel">
            <TransactionHistory :transactions="cashboxStore.cashbox.transactions" :loading="cashboxStore.loading"
              @refresh="refreshCashbox" />
          </q-tab-panel>

          <!-- Sessions Tab -->
          <q-tab-panel name="sessions" class="sessions-panel">
            <SessionHistory :sessions="cashboxStore.cashbox.sessions" :loading="cashboxStore.loading"
              @refresh="refreshCashbox" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- Loading State with cute animation -->
    <div class="loading-state" v-if="cashboxStore.loading && !cashboxStore.cashbox">
      <div class="loading-content">
        <div class="loading-cashbox">
          <q-icon name="account_balance_wallet" class="loading-icon" />
          <div class="loading-coins">
            <q-icon name="monetization_on" class="coin coin-1" />
            <q-icon name="monetization_on" class="coin coin-2" />
            <q-icon name="monetization_on" class="coin coin-3" />
          </div>
        </div>
        <h6>{{ t('cashbox.loadingCashbox', 'Loading Cashbox...') }}</h6>
        <p>{{ t('cashbox.pleaseWait', 'Please wait while we fetch the latest data') }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!branch" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <q-icon name="account_balance_wallet" />
        </div>
        <h5>{{ t('cashbox.selectBranch', 'Select a Branch First') }}</h5>
        <p>{{ t('cashbox.selectBranchDesc', 'Please select a branch to view its cashbox') }}</p>
        <q-btn color="primary" :icon="goBackIcon" :label="t('common.back', 'Go Back')" @click="$emit('go-back')" rounded
          class="back-btn" />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="cashboxStore.error && !cashboxStore.loading" class="error-state">
      <div class="error-content">
        <q-icon name="error_outline" class="error-icon" />
        <h5>{{ t('cashbox.errorLoading', 'Error Loading Cashbox') }}</h5>
        <p>{{ cashboxStore.error }}</p>
        <q-btn color="primary" icon="refresh" :label="t('cashbox.tryAgain', 'Try Again')" @click="refreshCashbox"
          rounded />
      </div>
    </div>

    <!-- Deposit Dialog -->
    <q-dialog v-model="showDepositDialog">
      <q-card class="transaction-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="add_circle" color="green-6" size="2rem" />
            <h6>{{ t('cashbox.deposit', 'Deposit') }}</h6>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="amount-inputs">
            <div class="amount-input">
              <q-input v-model.number="depositIqdAmount" type="number" :label="t('cashbox.iqdAmount', 'IQD Amount')"
                outlined suffix="IQD" :step="250" :min="0" class="transaction-input iqd-input"
                @input="(val) => depositIqdAmount = val ? Math.round(val / 250) * 250 : null" @focus="(e) => (e.target as HTMLInputElement)?.select()" />
            </div>

            <div class="amount-input">
              <q-input v-model.number="depositUsdAmount" type="number" :label="t('cashbox.usdAmount', 'USD Amount')"
                outlined suffix="USD" :step="0.01" :min="0" class="transaction-input usd-input" @focus="(e) => (e.target as HTMLInputElement)?.select()" />
            </div>
          </div>

          <div class="transaction-note">
            <q-input v-model="depositNote" :label="t('cashbox.note', 'Note (Optional)')" outlined type="textarea"
              rows="3" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel', 'Cancel')" @click="closeDepositDialog" />
          <q-btn color="green-6" :label="t('cashbox.deposit', 'Deposit')" @click="handleDeposit"
            :disable="((!depositIqdAmount || depositIqdAmount <= 0) && (!depositUsdAmount || depositUsdAmount <= 0)) || cashboxStore.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Withdraw Dialog -->
    <q-dialog v-model="showWithdrawDialog">
      <q-card class="transaction-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="remove_circle" color="red-6" size="2rem" />
            <h6>{{ t('cashbox.withdraw', 'Withdraw') }}</h6>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="amount-inputs">
            <div class="amount-input">
              <q-input v-model.number="withdrawIqdAmount" type="number" :label="t('cashbox.iqdAmount', 'IQD Amount')"
                outlined suffix="IQD" :step="250" :min="0" class="transaction-input iqd-input"
                @input="(val) => withdrawIqdAmount = val ? Math.round(val / 250) * 250 : null" @focus="(e) => (e.target as HTMLInputElement)?.select()" />
            </div>

            <div class="amount-input">
              <q-input v-model.number="withdrawUsdAmount" type="number" :label="t('cashbox.usdAmount', 'USD Amount')"
                outlined suffix="USD" :step="0.01" :min="0" class="transaction-input usd-input" @focus="(e) => (e.target as HTMLInputElement)?.select()" />
            </div>
          </div>

          <div class="transaction-note">
            <q-input v-model="withdrawNote" :label="t('cashbox.note', 'Note (Optional)')" outlined type="textarea"
              rows="3" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel', 'Cancel')" @click="closeWithdrawDialog" />
          <q-btn color="red-6" :label="t('cashbox.withdraw', 'Withdraw')" @click="handleWithdraw"
            :disable="((!withdrawIqdAmount || withdrawIqdAmount <= 0) && (!withdrawUsdAmount || withdrawUsdAmount <= 0)) || cashboxStore.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Open Cashbox Password Confirmation Dialog -->
    <q-dialog v-model="showOpenDialog" persistent>
      <q-card class="password-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="lock_open" color="positive" size="2rem" />
            <h6>{{ t('cashbox.openCashbox', 'Open Cashbox') }}</h6>
          </div>
          <p class="dialog-subtitle">{{ t('cashbox.enterPasswordToOpen', 'Enter your password to open the cashbox') }}
          </p>
        </q-card-section>

        <q-card-section>
          <div class="password-input">
            <q-input v-model="openPassword" :label="t('cashbox.password', 'Password')" type="password" outlined
              :error="!!openPasswordError" :error-message="openPasswordError || undefined"
              @keyup.enter="handleOpenCashbox" @input="openPasswordError = null" class="password-field" autofocus>
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
          </div>

          <div class="security-note">
            <q-icon name="security" class="security-icon" />
            <span>{{ t('cashbox.securityNote', 'Your password is required for security purposes') }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel', 'Cancel')" @click="closeOpenDialog" />
          <q-btn color="positive" :label="t('cashbox.openCashbox', 'Open Cashbox')" @click="handleOpenCashbox"
            :loading="cashboxStore.loading" :disable="!openPassword.trim()" icon="lock_open" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Close Cashbox Password Confirmation Dialog -->
    <q-dialog v-model="showCloseDialog" persistent>
      <q-card class="password-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon name="lock" color="negative" size="2rem" />
            <h6>{{ t('cashbox.closeCashbox', 'Close Cashbox') }}</h6>
          </div>
          <p class="dialog-subtitle">{{ t('cashbox.enterPasswordToClose', 'Enter your password to close the cashbox') }}
          </p>
        </q-card-section>

        <q-card-section>
          <div class="password-input">
            <q-input v-model="closePassword" :label="t('cashbox.password', 'Password')" type="password" outlined
              :error="!!closePasswordError" :error-message="closePasswordError || undefined"
              @keyup.enter="handleCloseCashbox" @input="closePasswordError = null" class="password-field" autofocus>
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
          </div>

          <div class="security-note">
            <q-icon name="security" class="security-icon" />
            <span>{{ t('cashbox.securityNote', 'Your password is required for security purposes') }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel', 'Cancel')" @click="closeCloseDialog" />
          <q-btn color="negative" :label="t('cashbox.closeCashbox', 'Close Cashbox')" @click="handleCloseCashbox"
            :loading="cashboxStore.loading" :disable="!closePassword.trim()" icon="lock" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCashboxStore } from 'src/stores/cashboxStore';
import { formatCurrency } from 'src/composables/useFormat';
import TransactionHistory from './TransactionHistory.vue';
import SessionHistory from './SessionHistory.vue';
import type { Branch } from 'src/types/branch';

const props = defineProps<{
  branch: Branch | null;
}>();

const _emit = defineEmits(['go-back']);

const { t, locale } = useI18n();
const cashboxStore = useCashboxStore();

// Active tab for the tab panels
const activeTab = ref('actions');

// Dialog states
const showDepositDialog = ref(false);
const showWithdrawDialog = ref(false);
const showOpenDialog = ref(false);
const showCloseDialog = ref(false);

// Transaction form states
const depositIqdAmount = ref<number | null>(0);
const depositUsdAmount = ref<number | null>(0);
const depositNote = ref('');

const withdrawIqdAmount = ref<number | null>(0);
const withdrawUsdAmount = ref<number | null>(0);
const withdrawNote = ref('');

// Password form states
const openPassword = ref('');
const closePassword = ref('');
const openPasswordError = ref<string | null>(null);
const closePasswordError = ref<string | null>(null);

// Check if current locale is RTL
const isRTL = computed(() => {
  return locale.value === 'ckb' || locale.value === 'ar';
});

// Go back icon based on RTL direction
const goBackIcon = computed(() => {
  return isRTL.value ? 'arrow_forward' : 'arrow_back';
});

// Watch for branch changes to load cashbox
watch(() => props.branch, async (newBranch) => {
  if (newBranch) {
    await loadCashboxForBranch(newBranch.id);
  }
}, { immediate: true });

// Load cashbox data for the selected branch
async function loadCashboxForBranch(branchId: number) {
  await cashboxStore.fetchCashbox(branchId);
}

// Handle opening cashbox
async function handleOpenCashbox() {
  if (!props.branch || !openPassword.value.trim()) {
    return;
  }

  openPasswordError.value = null;

  const success = await cashboxStore.openCashbox(props.branch.id, openPassword.value);

  if (success) {
    closeOpenDialog();
  } else {
    openPasswordError.value = t('cashbox.invalidPassword', 'Invalid password. Please try again.');
  }
}

// Handle closing cashbox
async function handleCloseCashbox() {
  if (!props.branch || !closePassword.value.trim()) {
    return;
  }

  closePasswordError.value = null;

  const success = await cashboxStore.closeCashbox(props.branch.id, closePassword.value);

  if (success) {
    closeCloseDialog();
  } else {
    closePasswordError.value = t('cashbox.invalidPassword', 'Invalid password. Please try again.');
  }
}

// Refresh cashbox data
async function refreshCashbox() {
  if (props.branch) {
    await loadCashboxForBranch(props.branch.id);
  }
}

// Dialog management functions
function closeDepositDialog() {
  showDepositDialog.value = false;
  depositIqdAmount.value = 0;
  depositUsdAmount.value = 0;
  depositNote.value = '';
}

function closeWithdrawDialog() {
  showWithdrawDialog.value = false;
  withdrawIqdAmount.value = 0;
  withdrawUsdAmount.value = 0;
  withdrawNote.value = '';
}

function closeOpenDialog() {
  showOpenDialog.value = false;
  openPassword.value = '';
  openPasswordError.value = null;
}

function closeCloseDialog() {
  showCloseDialog.value = false;
  closePassword.value = '';
  closePasswordError.value = null;
}

// Transaction handlers
async function handleDeposit() {
  if (!props.branch) {
    return;
  }

  // Validate that at least one amount is provided
  if ((!depositIqdAmount.value || depositIqdAmount.value <= 0) &&
    (!depositUsdAmount.value || depositUsdAmount.value <= 0)) {
    return;
  }

  const depositData: { iqd_amount?: number|null; usd_amount?: number|null; note?: string } = {};

    depositData.iqd_amount = depositIqdAmount.value;
    depositData.usd_amount = depositUsdAmount.value;

  if (depositNote.value.trim()) {
    depositData.note = depositNote.value.trim();
  }

  const success = await cashboxStore.depositToCashbox(props.branch.id, depositData);

  if (success) {
    closeDepositDialog();
  }
}

async function handleWithdraw() {
  if (!props.branch) {
    return;
  }

  // Validate that at least one amount is provided
  if ((!withdrawIqdAmount.value || withdrawIqdAmount.value <= 0) &&
    (!withdrawUsdAmount.value || withdrawUsdAmount.value <= 0)) {
    return;
  }

  const withdrawData: { iqd_amount?: number|null; usd_amount?: number|null; note?: string } = {};

    withdrawData.iqd_amount = withdrawIqdAmount.value;
    withdrawData.usd_amount = withdrawUsdAmount.value;

  if (withdrawNote.value.trim()) {
    withdrawData.note = withdrawNote.value.trim();
  }

  const success = await cashboxStore.withdrawFromCashbox(props.branch.id, withdrawData);

  if (success) {
    closeWithdrawDialog();
  }
}

// Commented by Kamyar: caused duplication of load on branch change. 23-08-2025
// Load cashbox on component mount if branch is already selected
// onMounted(async () => {
//   if (props.branch) {
//     await loadCashboxForBranch(props.branch.id);
//   }
// });
</script>

<style lang="scss" scoped>
.cashbox-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
  padding: 16px;
}

// Header with cute design
.cashbox-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: floating 6s ease-in-out infinite;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 24px;
    position: relative;
    z-index: 2;
  }

  .cashbox-avatar {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
    border: 3px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    animation: pulse 2s ease-in-out infinite;
  }

  .cashbox-title {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;

    .sparkle-icon {
      animation: sparkle 3s ease-in-out infinite;
      color: #ffd700;
      transform-origin: center;
    }
  }

  .branch-chip {
    font-size: 1rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

// Cashbox Cards
.cashbox-cards {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.cute-card {
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  }
}

// Status Card
.status-card {
  .status-specific {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

    .status-icon-container {
      margin-bottom: 16px;

      .status-open {
        color: #10b981;
        animation: unlocking 2s ease-in-out infinite;
      }

      .status-closed {
        color: #ef4444;
        animation: locking 2s ease-in-out infinite;
      }
    }

    .status-text {
      height: 48px;
    }

    .status-text h6 {
      margin: 0 0 12px 0;
      color: #475569;
      font-weight: 600;
    }

    .status-chip {
      font-size: 1rem;
      padding: 8px 16px;
      font-weight: 600;
    }
  }
}

// Balance Cards
.balance-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.balance-card {
  .balance-specific {
    position: relative;

    .balance-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .currency-icon {
        padding: 8px;
        border-radius: 12px;
        font-size: 1.5rem;
      }

      .currency-label {
        font-weight: 600;
        color: #475569;
      }
    }

    .balance-amount {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 8px;
      font-family: 'Inter', sans-serif;
    }

    .balance-decoration {
      position: absolute;
      bottom: 16px;
      right: 16px;
      opacity: 0.3;

      .trend-icon {
        font-size: 2rem;
      }
    }
  }
}

.iqd-card .balance-specific {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);

  .iqd-icon {
    background: #f59e0b;
    color: white;
  }

  .iqd-amount {
    color: #d97706;
  }
}

.usd-card .balance-specific {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);

  .usd-icon {
    background: #10b981;
    color: white;
  }

  .usd-amount {
    color: #059669;
  }
}

// Action Section with Tabs
.action-section {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .cashbox-tabs {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .cashbox-tabs-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

      .tab-item {
        padding: 16px 24px;
        transition: all 0.3s ease;

        .tab-content {
          display: flex;
          align-items: center;
          gap: 8px;

          .tab-label {
            font-weight: 600;
            font-size: 0.95rem;
          }
        }

        &.q-tab--active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }
      }
    }

    .tab-separator {
      border-color: #e2e8f0;
    }

    .cashbox-tab-panels {
      min-height: 400px;

      .actions-panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
      }

      .transactions-panel,
      .sessions-panel {
        padding: 16px;
      }
    }
  }
}

.main-actions {
  display: flex;
  justify-content: center;

  .main-action-btn {
    min-width: 200px;
    padding: 16px 32px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateY(-1px) scale(0.98);
    }

    &.cute-btn {
      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        position: relative;
        z-index: 2;
      }

      .btn-icon {
        font-size: 1.3rem;
        transition: all 0.3s ease;

        &.animating {
          animation: bounce 1s infinite;
        }
      }

      .btn-text {
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    &.open-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);

      &:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
        box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
      }

      .sparkles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;

        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, #ffffff 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0;
          animation: sparkle-twinkle 3s ease-in-out infinite;

          &.sparkle-1 {
            top: 20%;
            left: 15%;
            animation-delay: 0s;
          }

          &.sparkle-2 {
            top: 60%;
            right: 20%;
            animation-delay: 1s;
          }

          &.sparkle-3 {
            bottom: 25%;
            left: 70%;
            animation-delay: 2s;
          }
        }
      }

      .unlock-icon {
        &.animating {
          animation: unlocking 0.8s ease-in-out infinite;
        }
      }
    }

    &.close-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);

      &:hover {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
        box-shadow: 0 12px 35px rgba(239, 68, 68, 0.4);
      }

      .lock-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 50%;
        pointer-events: none;
      }

      &:hover .lock-glow {
        opacity: 1;
        animation: pulse-glow 2s infinite;
      }

      .lock-icon {
        &.animating {
          animation: locking 0.6s ease-in-out infinite;
        }
      }
    }
  }
}

.cute-tooltip {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 0.9rem;
  padding: 8px 12px;
}

// Transaction Actions
.transaction-actions {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 20px;
  padding: 24px;
  border: 2px dashed #cbd5e1;

  .actions-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;

    h6 {
      margin: 0;
      color: #475569;
      font-weight: 600;
    }

    .transactions-icon {
      color: #667eea;
      font-size: 1.5rem;
    }
  }

  .transaction-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    .transaction-btn {
      padding: 16px 24px;
      border-radius: 16px;
      font-weight: 600;
      border-width: 2px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      &.deposit-btn:hover {
        background: #16a34a;
        color: white;
        border-color: #16a34a;
      }

      &.withdraw-btn:hover {
        background: #dc2626;
        color: white;
        border-color: #dc2626;
      }
    }
  }
}

// Utility Actions
.utility-actions {
  display: flex;
  justify-content: center;
  gap: 16px;

  .utility-btn {
    padding: 12px 24px;
    border-radius: 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

// Loading State with animation
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .loading-content {
    text-align: center;

    .loading-cashbox {
      position: relative;
      margin-bottom: 24px;

      .loading-icon {
        font-size: 4rem;
        color: #667eea;
        animation: bounce 1s ease-in-out infinite;
      }

      .loading-coins {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .coin {
          position: absolute;
          font-size: 1.5rem;
          color: #ffd700;

          &.coin-1 {
            animation: coin-fall 2s ease-in-out infinite;
            animation-delay: 0s;
          }

          &.coin-2 {
            animation: coin-fall 2s ease-in-out infinite;
            animation-delay: 0.3s;
          }

          &.coin-3 {
            animation: coin-fall 2s ease-in-out infinite;
            animation-delay: 0.6s;
          }
        }
      }
    }

    h6 {
      margin: 0 0 8px 0;
      color: #475569;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #64748b;
    }
  }
}

// Empty and Error States
.empty-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .empty-content,
  .error-content {
    text-align: center;
    max-width: 400px;

    .empty-icon,
    .error-icon {
      font-size: 5rem;
      margin-bottom: 24px;
      opacity: 0.6;
    }

    .empty-icon {
      color: #94a3b8;
    }

    .error-icon {
      color: #ef4444;
    }

    h5 {
      margin: 0 0 12px 0;
      color: #475569;
      font-weight: 600;
    }

    p {
      margin: 0 0 24px 0;
      color: #64748b;
      line-height: 1.6;
    }

    .back-btn {
      padding: 12px 32px;
      border-radius: 16px;
      font-weight: 600;
    }
  }
}

// Dialog Styles
.transaction-dialog,
.password-dialog {
  min-width: 400px;
  border-radius: 20px;

  .dialog-header {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h6 {
        margin: 0;
        font-weight: 600;
        color: #475569;
      }
    }

    .dialog-subtitle {
      margin: 8px 0 0 0;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }

  .currency-tabs {
    margin-bottom: 20px;

    .currency-tab-list {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 4px;
    }
  }

  .amount-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    .amount-input {
      .transaction-input {
        font-size: 1.1rem;
        font-weight: 600;

        &.iqd-input {
          border-color: #f59e0b;

          &:focus {
            border-color: #d97706;
            box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
          }
        }

        &.usd-input {
          border-color: #10b981;

          &:focus {
            border-color: #059669;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          }
        }
      }
    }
  }

  .amount-input,
  .transaction-note,
  .password-input {
    margin-bottom: 16px;

    .transaction-input,
    .password-field {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .security-note {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 12px;
    margin-top: 16px;

    .security-icon {
      color: #d97706;
      font-size: 1.2rem;
    }

    span {
      color: #92400e;
      font-size: 0.85rem;
      font-weight: 500;
    }
  }
}

// Animations
@keyframes floating {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes sparkle {

  0%,
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }

  20% {
    transform: rotate(18deg) scale(1.02);
    opacity: 0.9;
  }

  40% {
    transform: rotate(36deg) scale(1.05);
    opacity: 1;
  }

  60% {
    transform: rotate(54deg) scale(1.02);
    opacity: 0.9;
  }

  80% {
    transform: rotate(72deg) scale(1);
    opacity: 0.8;
  }
}

@keyframes unlocking {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-5deg);
  }

  75% {
    transform: rotate(5deg);
  }
}

@keyframes locking {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes bounce {

  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translateY(0);
  }

  40%,
  43% {
    transform: translateY(-15px);
  }

  70% {
    transform: translateY(-7px);
  }
}

@keyframes coin-fall {
  0% {
    transform: translateY(-30px) rotate(0deg);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: translateY(30px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes sparkle-twinkle {

  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }

  25% {
    opacity: 0.3;
    transform: scale(0.3) rotate(45deg);
  }

  50% {
    opacity: 0.8;
    transform: scale(1) rotate(90deg);
  }

  75% {
    opacity: 0.3;
    transform: scale(0.3) rotate(135deg);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .cashbox-container {
    padding: 12px;
    gap: 16px;
  }

  .cashbox-header {
    padding: 24px 20px;

    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .cashbox-title {
      font-size: 1.5rem;
    }
  }

  .cashbox-cards {
    grid-template-columns: 1fr;
  }

  .balance-cards {
    grid-template-columns: 1fr;
  }

  .transaction-actions .transaction-buttons {
    grid-template-columns: 1fr;
  }

  .utility-actions {
    flex-direction: column;
  }

  .main-actions .main-action-btn {
    min-width: auto;
    width: 100%;
  }

  .transaction-dialog {
    min-width: auto;
    margin: 16px;
    max-width: calc(100vw - 32px);

    .amount-inputs {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
}

@media (max-width: 480px) {
  .cashbox-header {
    padding: 20px 16px;

    .cashbox-avatar {
      width: 60px !important;
      height: 60px !important;

      .q-icon {
        font-size: 30px !important;
      }
    }

    .cashbox-title {
      font-size: 1.25rem;
    }
  }
}
</style>
