<template>
  <q-dialog v-model="show" persistent transition-show="slide-up" transition-hide="slide-down">
    <q-card class="update-category-card">
      <!-- Header with gradient background -->
      <q-card-section class="card-header">
        <div class="header-content">
          <div class="header-icon-wrapper">
            <q-icon name="edit" class="header-icon" />
          </div>
          <div class="header-text">
            <div class="text-h6">{{ t('expenseCategory.updateCategory') }}</div>
            <div class="text-caption text-grey-6">{{ t('expenseCategory.updateSubtitle', 'Edit expense category details') }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" @click="close" class="close-btn" v-close-popup />
      </q-card-section>

      <!-- Form content -->
      <q-card-section class="form-content">
        <q-form @submit="onSubmit" @reset="onReset" class="form-container">
          <!-- Name input with icon -->
          <div class="input-group">
            <q-input v-model="form.name" :label="t('expenseCategory.name')"
              :hint="t('expenseCategory.nameHint', 'Enter a descriptive name for this category')" lazy-rules :rules="[
                val => val && val.length > 0 || t('expenseCategory.nameRequired'),
                val => val && val.length <= 100 || t('expenseCategory.nameTooLong', 'Name must be less than 100 characters')
              ]" outlined class="cute-input">
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Description input with icon -->
          <div class="input-group">
            <q-input v-model="form.description" :label="t('expenseCategory.description')"
              :hint="t('expenseCategory.descriptionHint', 'Add an optional description for this category')"
              type="textarea" rows="4" outlined class="cute-input">
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Action buttons -->
          <div class="button-group">
            <q-btn :label="t('expenseCategory.updateCategory', 'Update Category')" type="submit" color="primary"
              :loading="expenseCategoryStore.loading" class="action-btn primary-btn" icon="save" no-caps>
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                {{ t('common.updating', 'Updating...') }}
              </template>
            </q-btn>

            <q-btn :label="t('common.reset')" type="reset" color="grey-7" flat class="action-btn secondary-btn"
              icon="refresh" no-caps />

            <q-btn :label="t('common.cancel')" color="grey-7" flat @click="close" class="action-btn secondary-btn"
              icon="close" no-caps />
          </div>
        </q-form>
      </q-card-section>

      <!-- Success animation overlay -->
      <div v-if="showSuccess" class="success-overlay">
        <div class="success-content">
          <q-icon name="check_circle" class="success-icon" />
          <div class="success-text">{{ t('expenseCategory.categoryUpdated', 'Category Updated Successfully!') }}</div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExpenseCategoryStore } from 'src/stores/expenseCategoryStore';
import type { ExpenseCategory } from 'src/types/expense';

const { t } = useI18n();
const expenseCategoryStore = useExpenseCategoryStore();

// Props
interface Props {
  modelValue: boolean;
  category?: ExpenseCategory | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  category: null
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// Reactive variables
const showSuccess = ref(false);

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

// Form data
const form = ref<ExpenseCategory>({
  name: '',
  description: ''
});

// Methods
function close() {
  showSuccess.value = false;
  show.value = false;
}

async function onSubmit() {
  try {
    if (props.category?.id) {
      await expenseCategoryStore.updateCategory(String(props.category.id), form.value);

      // Show success animation
      showSuccess.value = true;

      // Hide success animation and close modal after 1.5 seconds
      setTimeout(() => {
        showSuccess.value = false;
        setTimeout(() => {
          close();
        }, 300);
      }, 1500);
    }
  } catch (error) {
    console.error('Error updating expense category:', error);
  }
}

function onReset() {
  if (props.category) {
    form.value = {
      name: props.category.name || '',
      description: props.category.description || ''
    };
  }
}

// Watch for category changes
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    form.value = {
      name: newCategory.name || '',
      description: newCategory.description || ''
    };
  }
}, { immediate: true });

// Watch for modal close to reset success state
watch(show, (newVal) => {
  if (!newVal) {
    showSuccess.value = false;
  }
});
</script>

<style scoped>
/* Main card styling */
.update-category-card {
  max-width: 380px;
  width: 100%;
  margin: 0 auto;
  border-radius: 16px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header styling */
.card-header {
  background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
  color: white;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {

  0%,
  100% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
  position: relative;
}

.header-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 10px;
  backdrop-filter: blur(10px);
}

.header-icon {
  font-size: 28px;
  color: white;
}

.header-text {
  flex: 1;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;
  z-index: 2;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Form content */
.form-content {
  padding: 24px 20px 20px;
  background: linear-gradient(145deg, #fafafa 0%, #ffffff 100%);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  animation: fadeInUp 0.4s ease-out;
}

.input-group:nth-child(2) {
  animation-delay: 0.1s;
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Cute input styling */
.cute-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cute-input :deep(.q-field--outlined .q-field__control) {
  border-width: 2px;
}

.cute-input :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.1);
  transform: translateY(-2px);
}

.cute-input :deep(.q-field__prepend) {
  padding-right: 12px;
}

.cute-input :deep(.q-icon) {
  transition: all 0.3s ease;
}

.cute-input :deep(.q-field--focused .q-icon) {
  transform: scale(1.1);
}

/* Button group */
.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 12px;
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.action-btn {
  min-width: 100px;
  height: 40px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
  box-shadow: 0 4px 15px rgba(255, 111, 0, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 111, 0, 0.4);
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.primary-btn:hover::before {
  left: 100%;
}

.secondary-btn {
  border: 2px solid #e0e0e0;
  background: white;
}

.secondary-btn:hover {
  border-color: #ff6f00;
  color: #ff6f00;
  transform: translateY(-1px);
}

/* Success overlay */
.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.success-content {
  text-align: center;
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(1.05);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  font-size: 64px;
  color: #4caf50;
  margin-bottom: 16px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.success-text {
  font-size: 18px;
  font-weight: 600;
  color: #2e7d32;
}

/* Responsive design */
@media (max-width: 600px) {
  .update-category-card {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }

  .form-content {
    padding: 20px 16px;
  }

  .button-group {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

/* Loading state enhancements */
.action-btn :deep(.q-spinner) {
  color: white;
}

/* Focus states for accessibility */
.cute-input :deep(.q-field--focused) {
  outline: 2px solid #ff6f00;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #ff6f00;
  outline-offset: 2px;
}
</style>
