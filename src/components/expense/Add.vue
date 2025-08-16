<template>
  <q-dialog v-model="show" persistent transition-show="scale" transition-hide="scale" class="cute-modal" maximized
    :full-width="false" :full-height="false">
    <q-card class="cute-expense-card scrollable-card">
      <!-- Header with gradient background -->
      <q-card-section class="cute-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="receipt_long" size="2rem" class="header-icon-inner" />
          </div>
          <div class="header-text">
            <div class="title">{{ t('expense.addNew') }}</div>
            <div class="subtitle">{{ t('expense.trackBusinessExpenses') }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" @click="close" class="close-btn" size="md" />
      </q-card-section>

      <!-- Main form section -->
      <q-card-section class="form-section scroll-area">
        <div class="form-container">
          <q-form @submit="onSubmit" @reset="onReset" class="cute-form">
            <!-- Category and Title Section -->
            <div class="form-section-wrapper">
              <div class="section-header">
                <q-icon name="category" class="section-icon" />
                <span class="section-title">{{ t('expense.basicInformation') }}</span>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-5">
                  <q-select v-model="form.category_id" :options="categoryOptions" option-value="value"
                    option-label="label" :label="t('expense.category')" :hint="t('expense.categoryHint')" lazy-rules
                    :rules="[
                      val => val !== null && val !== undefined || t('expense.categoryRequired')
                    ]" outlined dense map-options emit-value clearable class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="folder" color="primary" />
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-md-6">
                  <q-input v-model="form.title" :label="t('expense.title')" :hint="t('expense.titleHint')" lazy-rules
                    :rules="[
                      val => val && val.length > 0 || t('expense.titleRequired'),
                      val => val && val.length <= 200 || t('expense.titleTooLong')
                    ]" outlined dense class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="title" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>

              <q-input v-model="form.description" :label="t('expense.description')" :hint="t('expense.descriptionHint')"
                type="textarea" rows="3" outlined dense class="cute-input full-width">
                <template v-slot:prepend>
                  <q-icon name="description" color="primary" />
                </template>
              </q-input>
            </div>

            <!-- Amount Section -->
            <div class="form-section-wrapper">
              <div class="section-header">
                <q-icon name="payments" class="section-icon" />
                <span class="section-title">{{ t('expense.amountDetails') }}</span>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model.number="form.expensed_usd" :label="t('expense.usdPrice')"
                    :hint="t('expense.usdPriceHint')" type="number" step="0.01" min="0" outlined dense prefix="$"
                    :rules="[
                      val => val >= 0 || t('expense.amountPositive')
                    ]" class="cute-input amount-input">
                    <template v-slot:prepend>
                      <q-icon name="attach_money" color="green" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-5">
                  <q-input v-model.number="form.usd_return_amount" :label="t('expense.usdReturnAmount')"
                    :hint="t('expense.usdReturnAmountHint')" type="number" step="0.01" min="0" outlined dense prefix="$"
                    :rules="[
                      val => val >= 0 || t('expense.amountPositive')
                    ]" class="cute-input amount-input">
                    <template v-slot:prepend>
                      <q-icon name="assignment_return" color="teal" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <q-input v-model.number="form.expensed_iqd" :label="t('expense.iqdPrice')"
                    :hint="t('expense.iqdPriceHint')" type="number" step="250" min="0" outlined dense suffix="IQD" :rules="[
                      val => val >= 0 || t('expense.amountPositive')
                    ]" class="cute-input amount-input" @wheel.prevent>
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" color="orange" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-5">
                  <q-input v-model.number="form.iqd_return_amount" :label="t('expense.iqdReturnAmount')"
                    :hint="t('expense.iqdReturnAmountHint')" type="number" step="250" min="0" outlined dense suffix="IQD"
                    :rules="[
                      val => val >= 0 || t('expense.amountPositive')
                    ]" class="cute-input amount-input" @wheel.prevent>
                    <template v-slot:prepend>
                      <q-icon name="assignment_return" color="blue" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Payment Details Section -->
            <div class="form-section-wrapper">
              <div class="section-header">
                <q-icon name="payment" class="section-icon" />
                <span class="section-title">{{ t('expense.paymentDetails') }}</span>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.payee" :label="t('expense.payee')" :hint="t('expense.payeeHint')" lazy-rules
                    :rules="[
                      val => val && val.length > 0 || t('expense.payeeRequired'),
                      val => val && val.length <= 100 || t('expense.payeeTooLong')
                    ]" outlined dense class="cute-input" @wheel.prevent>
                    <template v-slot:prepend>
                      <q-icon name="person" color="purple" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-5">
                  <q-input v-model="form.paid_at" :label="t('expense.paidAt')" :hint="t('expense.paidAtHint')"
                    type="date" lazy-rules :rules="[
                      val => val && val.length > 0 || t('expense.paidAtRequired')
                    ]" outlined dense class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="schedule" color="blue" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.reference_number" :label="t('expense.referenceNumber')"
                    :hint="t('expense.referenceNumberHint')" outlined dense class="cute-input" @wheel.prevent>
                    <template v-slot:prepend>
                      <q-icon name="confirmation_number" color="brown" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-5">
                  <q-select v-model="form.payment_method" :options="paymentMethodOptions"
                    :label="t('expense.paymentMethod')" :hint="t('expense.paymentMethodHint')" lazy-rules :rules="[
                      val => val && val.length > 0 || t('expense.paymentMethodRequired')
                    ]" outlined dense class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="credit_card" color="teal" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-section">
              <q-btn :label="t('common.submit')" type="submit" color="primary" :loading="expenseStore.loading"
                class="action-btn primary-btn" no-caps rounded>
                <q-icon name="save" class="q-mr-sm" />
              </q-btn>

              <q-btn :label="t('common.reset')" type="reset" color="grey-6" flat class="action-btn" no-caps rounded>
                <q-icon name="refresh" class="q-mr-sm" />
              </q-btn>

              <q-btn :label="t('common.cancel')" color="grey-6" flat @click="close" class="action-btn" no-caps rounded>
                <q-icon name="close" class="q-mr-sm" />
              </q-btn>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from 'src/stores/expenseStore';
import { useExpenseCategoryStore } from 'src/stores/expenseCategoryStore';
import type { Expense } from 'src/types/expense';

const { t } = useI18n();
const $q = useQuasar();
const expenseStore = useExpenseStore();
const expenseCategoryStore = useExpenseCategoryStore();

// Props
interface Props {
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const { allCategories } = storeToRefs(expenseCategoryStore);

const categoryOptions = computed(() => {
  return allCategories.value.map(category => ({
    label: category.name,
    value: category.id
  }));
});

const paymentMethodOptions = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Check',
  'Digital Wallet',
  'Other'
];

// Form data
const form = ref<Expense>({
  category_id: 0,
  title: '',
  description: '',
  expensed_usd: 0,
  expensed_iqd: 0,
  iqd_return_amount: 0,
  usd_return_amount: 0,
  payee: '',
  paid_at: '',
  payment_method: '',
  reference_number: ''
});

// Methods
function close() {
  show.value = false;
}

async function onSubmit() {
  try {
    // Convert date to ISO string and map field names for API
    const formData = {
      ...form.value,
      paid_at: new Date(form.value.paid_at + 'T00:00:00').toISOString(),
      // Map form fields to API field names
      iqd_price: form.value.expensed_iqd,
      usd_price: form.value.expensed_usd
    };

    // Remove the old field names from the payload
    delete formData.expensed_iqd;
    delete formData.expensed_usd;

    await expenseStore.createExpense(formData);

    // Show success animation
    const card = document.querySelector('.cute-expense-card');
    if (card) {
      card.classList.add('success-animation');
      setTimeout(() => {
        card.classList.remove('success-animation');
      }, 600);
    }

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'Expense created successfully! 🎉',
      position: 'top',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white' }]
    });

    onReset();

    // Delay close to show animation
    setTimeout(() => {
      close();
    }, 800);
  } catch (error) {
    console.error('Error creating expense:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to create expense. Please try again.',
      position: 'top',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white' }]
    });
  }
}

function onReset() {
  form.value = {
    category_id: 0,
    title: '',
    description: '',
    expensed_usd: 0,
    expensed_iqd: 0,
    iqd_return_amount: 0,
    usd_return_amount: 0,
    payee: '',
    paid_at: '',
    payment_method: '',
    reference_number: ''
  };
  setDefaultDate();
}

// Set default date to today
function setDefaultDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - (offset * 60 * 1000));
  form.value.paid_at = localTime.toISOString().slice(0, 10);
}

// Lifecycle
onMounted(async () => {
  await expenseCategoryStore.fetchAllCategories();
  setDefaultDate();
});
</script>

<style scoped>
/* Modal container */
.cute-modal :deep(.q-dialog__inner) {
  padding: 16px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Main card styling */
.cute-expense-card {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  display: flex;
  flex-direction: column;
}

.scrollable-card {
  position: relative;
}

/* Header styling */
.cute-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.cute-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }

  50% {
    transform: scale(1.1) rotate(180deg);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-icon-inner {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.header-text .title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-text .subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 400;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(90deg);
}

/* Form section */
.form-section {
  padding: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
  flex: 1;
  overflow: hidden;
}

.scroll-area {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-container {
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.cute-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* Form section wrappers */
.form-section-wrapper {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-section-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.section-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Input styling */
.cute-input {
  margin-bottom: 8px;
}

.cute-input :deep(.q-field__control) {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
}

.cute-input :deep(.q-field__control):hover {
  border-color: rgba(102, 126, 234, 0.4);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.cute-input :deep(.q-field--focused .q-field__control) {
  border-color: #667eea;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.cute-input :deep(.q-field__prepend) {
  padding-right: 12px;
}

.cute-input :deep(.q-icon) {
  font-size: 1.2rem;
}

/* Amount input special styling */
.amount-input :deep(.q-field__control) {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 2px solid rgba(34, 197, 94, 0.2);
}

.amount-input :deep(.q-field__control):hover {
  border-color: rgba(34, 197, 94, 0.4);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
}

.amount-input :deep(.q-field--focused .q-field__control) {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Action section */
.action-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.action-btn {
  padding: 12px 32px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  min-width: 120px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .cute-expense-card {
    margin: 8px;
    border-radius: 20px;
    max-height: 95vh;
  }

  .cute-header {
    padding: 20px;
  }

  .form-container {
    padding: 20px;
  }

  .form-section-wrapper {
    padding: 16px;
  }

  .header-text .title {
    font-size: 1.3rem;
  }

  .action-section {
    flex-direction: column;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .cute-modal :deep(.q-dialog__inner) {
    padding: 8px;
    height: 100vh;
  }

  .cute-expense-card {
    margin: 4px;
    border-radius: 16px;
    max-height: 98vh;
  }

  .form-container {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

/* Custom scrollbar */
.scroll-area::-webkit-scrollbar {
  width: 6px;
}

.scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.scroll-area::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* Loading state */
.action-btn :deep(.q-spinner) {
  margin-right: 8px;
}

/* Success animation */
@keyframes success-bounce {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.success-animation {
  animation: success-bounce 0.6s ease-in-out;
}

/* Focus styles for accessibility */
.cute-input :deep(.q-field__control):focus-within {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
