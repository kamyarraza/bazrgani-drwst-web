<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale" class="cute-modal" maximized
    :full-width="false" :full-height="false">
    <q-card class="cute-addset-card scrollable-card">
      <!-- Header with gradient background -->
      <q-card-section class="cute-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="category" size="2rem" class="header-icon-inner" />
          </div>
          <div class="header-text">
            <div class="title">{{ t('blum.addNewSet') }}</div>
            <div class="subtitle">{{ t('blum.createSetSubtitle', 'Create and manage Blum component sets') }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" @click="isOpen = false" class="close-btn" size="md" />
      </q-card-section>

      <!-- Main form section -->
      <q-card-section class="form-section scroll-area">
        <div class="form-container">
          <q-form @submit.prevent="onSubmit" class="cute-form">

            <!-- Basic Information Card -->
            <div class="form-section-wrapper">
              <div class="section-header">
                <q-icon name="info" class="section-icon" />
                <span class="section-title">{{ t('blum.basicInfo', 'Basic Information') }}</span>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.name" :label="t('blum.setName')"
                    :hint="t('blum.setNameHint', 'Enter a descriptive name for your set')" lazy-rules :rules="[
                      val => val && val.length > 0 || t('validation.required'),
                      val => val && val.length <= 100 || t('blum.setNameTooLong', 'Name too long')
                    ]" outlined dense class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="folder" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <q-file v-model="imageFile" :label="t('blum.setImage')"
                    :hint="t('blum.setImageHint', 'Upload an image to represent your set')" outlined dense
                    accept="image/*" @update:model-value="onImageSelected" class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="image" color="purple" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </div>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.description" :label="t('blum.setDescription')"
                    :hint="t('blum.setDescriptionHint', 'Describe the purpose of this set')" type="textarea" rows="3"
                    outlined dense class="cute-input full-width" autogrow>
                    <template v-slot:prepend>
                      <q-icon name="description" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <div v-if="imagePreview" class="image-preview-container">
                    <div class="preview-label">{{ t('blum.imagePreview', 'Image Preview') }}</div>
                    <div class="preview-wrapper">
                      <q-img :src="imagePreview" class="preview-image" fit="cover" loading="lazy">
                        <template v-slot:loading>
                          <q-spinner-gears color="primary" size="2em" />
                        </template>
                      </q-img>
                      <q-btn round dense flat icon="close" color="negative" size="sm" class="remove-image-btn"
                        @click="removeImage">
                        <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <div v-else class="upload-placeholder">
                    <q-icon name="cloud_upload" size="3rem" color="grey-5" />
                    <div class="upload-text">{{ t('blum.uploadImagePlaceholder', 'Upload an image to see preview') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Search & Selection Card -->
            <div class="form-section-wrapper">
              <div class="section-header">
                <q-icon name="search" class="section-icon" />
                <span class="section-title">{{ t('blum.findItems', 'Find Items') }}</span>
              </div>

              <div class="row q-gutter-sm">
                <div class="col-12 col-md-8">
                  <q-input v-model="itemSearchQuery" :label="t('blum.searchItems')"
                    :hint="t('blum.searchItemsHint', 'Search by name, code, or part number')"
                    @keyup.enter="onSearchItems" outlined dense clearable :loading="blumStore.blumItemsLoading"
                    class="cute-input">
                    <template v-slot:prepend>
                      <q-icon name="search" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-btn color="primary" icon="search" :label="t('common.search')" @click="onSearchItems"
                    :loading="blumStore.blumItemsLoading" class="search-button full-width" no-caps rounded />
                </div>
              </div>

              <!-- Search Results -->
              <div v-if="searchResults.length > 0" class="search-results-section">
                <div class="results-header">
                  <q-icon name="inventory_2" color="primary" />
                  <span class="results-title">{{ t('blum.searchResults') }} ({{ searchResults.length }})</span>
                  <q-space />
                  <q-btn flat dense round icon="clear" size="sm" @click="clearSearchResults" class="clear-btn">
                    <q-tooltip>{{ t('common.clear') }}</q-tooltip>
                  </q-btn>
                </div>

                <div class="items-grid">
                  <div v-for="item in searchResults" :key="item.id" class="item-card"
                    :class="{ 'item-disabled': isItemAlreadyAdded(item.id) }" @click="addItemToSet(item)">
                    <div class="item-image">
                      <q-img v-if="item.image" :src="item.image" :alt="item.name" class="item-img" fit="cover" />
                      <div v-else class="item-placeholder">
                        <q-icon name="precision_manufacturing" size="2rem" color="blue-grey-5" />
                      </div>
                    </div>

                    <div class="item-info">
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-codes">
                        <span v-if="item.code" class="item-chip">
                          <q-icon name="qr_code" size="xs" />
                          {{ item.code }}
                        </span>
                        <span v-if="item.part_no" class="item-chip">
                          <q-icon name="tag" size="xs" />
                          {{ item.part_no }}
                        </span>
                      </div>
                    </div>

                    <div class="item-action">
                      <q-btn round :color="isItemAlreadyAdded(item.id) ? 'grey-5' : 'positive'"
                        :icon="isItemAlreadyAdded(item.id) ? 'check' : 'add'" size="sm"
                        :disable="isItemAlreadyAdded(item.id)" @click.stop="addItemToSet(item)">
                        <q-tooltip>
                          {{ isItemAlreadyAdded(item.id) ? t('blum.itemAlreadyAdded') : t('blum.addItem') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Items Card -->
            <div v-if="form.items.length > 0" class="form-section-wrapper">
              <div class="section-header">
                <q-icon name="playlist_add_check" class="section-icon" />
                <span class="section-title">{{ t('blum.selectedItems') }} ({{ form.items.length }})</span>
                <q-space />
                <q-btn flat dense icon="clear_all" :label="t('blum.clearAll', 'Clear All')" size="sm" color="negative"
                  @click="clearAllItems" no-caps>
                  <q-tooltip>{{ t('blum.clearAllItems', 'Remove all selected items') }}</q-tooltip>
                </q-btn>
              </div>

              <div class="selected-items-grid">
                <div v-for="(setItem, index) in form.items" :key="index" class="selected-item-card">
                  <div class="selected-item-info">
                    <div class="selected-item-name">{{ getItemDisplayName(setItem.item_id) }}</div>
                    <div class="selected-item-codes">
                      <span v-if="setItem.code" class="selected-item-chip">{{ setItem.code }}</span>
                      <span v-if="setItem.part_no" class="selected-item-chip">{{ setItem.part_no }}</span>
                    </div>
                  </div>

                  <div class="quantity-control">
                    <q-input v-model.number="setItem.quantity" :label="t('blum.quantity')" type="number" dense outlined
                      class="quantity-input" :rules="[
                        val => (val && Number(val) > 0) || t('validation.positiveNumber'),
                        val => (val && Number.isInteger(Number(val))) || t('validation.integerRequired')
                      ]" />
                  </div>

                  <div class="remove-action">
                    <q-btn flat round color="negative" icon="delete" size="sm" @click="removeItemFromSet(index)">
                      <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="form.items.length === 0" class="empty-state">
              <q-icon name="inventory_2" size="4rem" color="grey-5" />
              <div class="empty-title">{{ t('blum.noItemsSelected', 'No items selected yet') }}</div>
              <div class="empty-subtitle">{{ t('blum.searchAndAddItems', 'Search for items above and click to add them to your set') }}</div>
            </div>

            <!-- Action Buttons -->
            <div class="action-section">
              <q-btn :label="t('common.cancel')" color="grey-6" flat @click="isOpen = false" class="action-btn" no-caps
                rounded :disable="blumStore.blumSetsLoading">
                <q-icon name="close" class="q-mr-sm" />
              </q-btn>

              <q-btn type="submit" :label="t('common.create')" color="primary" :loading="blumStore.blumSetsLoading"
                class="action-btn primary-btn" no-caps rounded>
                <q-icon name="add" class="q-mr-sm" />
              </q-btn>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumStore } from 'src/stores/blumStore';
import { showNotify } from 'src/composables/Notify';
import type { CreateOrUpdateBlumSet, BlumSetItem, BlumItem } from 'src/types/blumTypes';

const { t } = useI18n();
const blumStore = useBlumStore();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_event: 'update:modelValue', _value: boolean): void;
  (_event: 'set-added'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const form = ref<CreateOrUpdateBlumSet>({
  name: '',
  description: '',
  image: '',
  items: []
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const itemSearchQuery = ref('');
const searchResults = ref<BlumItem[]>([]);

function onImageSelected(file: File | null) {
  if (!file) {
    imagePreview.value = null;
    imageFile.value = null;
    return;
  }

  imageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  imageFile.value = null;
  imagePreview.value = null;
}

async function onSearchItems() {
  try {
    // If search query is empty, fetch all items instead of searching
    if (!itemSearchQuery.value.trim()) {
      await blumStore.fetchBlumItems();
    } else {
      await blumStore.searchBlumItems(itemSearchQuery.value);
    }

    if (blumStore.blumItems && blumStore.blumItems.length > 0) {
      searchResults.value = blumStore.blumItems;
    } else {
      searchResults.value = [];
      showNotify({
        type: 'info',
        message: t('blum.noItemsFound'),
        position: 'top',
        duration: 3000,
      });
    }
  } catch {
    searchResults.value = [];
    showNotify({
      type: 'negative',
      message: t('common.errorOccurred'),
      position: 'top',
      duration: 3000,
    });
  }
}

function clearSearchResults() {
  searchResults.value = [];
  itemSearchQuery.value = '';
}

function addItemToSet(item: BlumItem) {
  if (isItemAlreadyAdded(item.id)) {
    showNotify({
      type: 'warning',
      message: t('blum.itemAlreadyAdded'),
      position: 'top',
      duration: 3000,
    });
    return;
  }

  const setItem: BlumSetItem = {
    item_id: item.id,
    name: item.name,
    code: item.code,
    part_no: item.part_no,
    quantity: 1
  };

  form.value.items.push(setItem);

  showNotify({
    type: 'positive',
    message: t('blum.itemAddedToSet', { itemName: item.name }),
    position: 'top',
    duration: 2000,
  });
}

function removeItemFromSet(index: number) {
  form.value.items.splice(index, 1);
}

function clearAllItems() {
  form.value.items = [];
  showNotify({
    type: 'info',
    message: t('blum.allItemsCleared', 'All items have been removed'),
    position: 'top',
    duration: 2000,
  });
}

function isItemAlreadyAdded(itemId: number): boolean {
  return form.value.items.some(setItem => setItem.item_id === itemId);
}

function getItemDisplayName(itemId: number): string {
  const item = searchResults.value.find(item => item.id === itemId);
  return item ? `${item.name}` : `Item ID: ${itemId}`;
}

async function onSubmit() {
  if (!form.value.name) {
    showNotify({
      type: 'negative',
      message: t('validation.fillRequiredFields'),
      position: 'top',
      duration: 3000,
    });
    return;
  }

  if (form.value.items.length === 0) {
    showNotify({
      type: 'negative',
      message: t('blum.selectAtLeastOneItem'),
      position: 'top',
      duration: 3000,
    });
    return;
  }

  const formData = new FormData();
  formData.append('name', form.value.name);
  formData.append('description', form.value.description || '');

  // Append each item properly instead of JSON.stringify
  form.value.items.forEach((item, index) => {
    formData.append(`items[${index}][item_id]`, item.item_id.toString());
    formData.append(`items[${index}][quantity]`, item.quantity.toString());
  });

  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }

  const success = await blumStore.createBlumSet(formData);
  if (success) {
    resetForm();
    emit('set-added');
    isOpen.value = false;

    showNotify({
      type: 'positive',
      message: t('blum.setCreatedSuccessfully', 'Set created successfully!'),
      position: 'top',
      duration: 3000,
    });
  }
}

function resetForm() {
  form.value = {
    name: '',
    description: '',
    image: '',
    items: []
  };
  imageFile.value = null;
  imagePreview.value = null;
  itemSearchQuery.value = '';
  searchResults.value = [];
}

watch(isOpen, (newVal) => {
  if (!newVal) {
    resetForm();
  }
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
.cute-addset-card {
  width: 100%;
  max-width: 1000px;
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
  background: linear-gradient(135deg, #3949ab 0%, #1976d2 100%);
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
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-section-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(57, 73, 171, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(57, 73, 171, 0.1);
}

.section-icon {
  background: linear-gradient(135deg, #3949ab 0%, #1976d2 100%);
  color: white;
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(57, 73, 171, 0.3);
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
  border-color: rgba(57, 73, 171, 0.4);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(57, 73, 171, 0.1);
}

.cute-input :deep(.q-field--focused .q-field__control) {
  border-color: #3949ab;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.1);
}

.cute-input :deep(.q-field__prepend) {
  padding-right: 12px;
}

.cute-input :deep(.q-icon) {
  font-size: 1.2rem;
}

/* Image preview */
.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.preview-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  backdrop-filter: blur(10px);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  border: 2px dashed rgba(148, 163, 184, 0.5);
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.5);
}

.upload-text {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 8px;
  text-align: center;
}

/* Search button */
.search-button {
  height: 56px;
  font-weight: 600;
  border-radius: 16px;
  background: linear-gradient(135deg, #3949ab 0%, #1976d2 100%);
  box-shadow: 0 4px 16px rgba(57, 73, 171, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(57, 73, 171, 0.4);
}

/* Search results */
.search-results-section {
  margin-top: 16px;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 16px;
  background: rgba(57, 73, 171, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(57, 73, 171, 0.1);
}

.results-title {
  font-weight: 600;
  color: #3949ab;
}

.clear-btn {
  color: #64748b;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: #ef4444;
  transform: scale(1.1);
}

/* Items grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.3);
}

.item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-card:hover {
  border-color: #3949ab;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(57, 73, 171, 0.15);
}

.item-card.item-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: rgba(148, 163, 184, 0.5);
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(226, 232, 240, 0.8);
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.8);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-codes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.item-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(57, 73, 171, 0.1);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #3949ab;
  font-weight: 500;
}

.item-action {
  flex-shrink: 0;
}

/* Selected items */
.selected-items-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.02);
}

.selected-item-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.selected-item-card:hover {
  border-color: #22c55e;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.1);
}

.selected-item-info {
  flex: 1;
  min-width: 0;
}

.selected-item-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.selected-item-codes {
  display: flex;
  gap: 6px;
}

.selected-item-chip {
  padding: 2px 8px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 500;
}

.quantity-control {
  width: 120px;
  flex-shrink: 0;
}

.quantity-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid rgba(34, 197, 94, 0.2);
}

.remove-action {
  flex-shrink: 0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #64748b;
  margin: 12px 0 8px;
}

.empty-subtitle {
  color: #94a3b8;
  max-width: 400px;
  line-height: 1.5;
}

/* Action section */
.action-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.action-btn {
  padding: 12px 32px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  min-width: 140px;
}

.primary-btn {
  background: linear-gradient(135deg, #3949ab 0%, #1976d2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(57, 73, 171, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(57, 73, 171, 0.4);
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .cute-addset-card {
    margin: 8px;
    border-radius: 20px;
    max-height: 95vh;
  }

  .cute-header {
    padding: 20px;
  }

  .form-container {
    padding: 16px;
  }

  .form-section-wrapper {
    padding: 16px;
  }

  .header-text .title {
    font-size: 1.3rem;
  }

  .items-grid {
    grid-template-columns: 1fr;
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

  .cute-addset-card {
    margin: 4px;
    border-radius: 16px;
    max-height: 98vh;
  }

  .form-container {
    padding: 12px;
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

  .item-card {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .selected-item-card {
    flex-direction: column;
    gap: 12px;
  }

  .quantity-control {
    width: 100%;
  }
}

/* Custom scrollbar */
.scroll-area::-webkit-scrollbar,
.items-grid::-webkit-scrollbar,
.selected-items-grid::-webkit-scrollbar {
  width: 6px;
}

.scroll-area::-webkit-scrollbar-track,
.items-grid::-webkit-scrollbar-track,
.selected-items-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.scroll-area::-webkit-scrollbar-thumb,
.items-grid::-webkit-scrollbar-thumb,
.selected-items-grid::-webkit-scrollbar-thumb {
  background: rgba(57, 73, 171, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.scroll-area::-webkit-scrollbar-thumb:hover,
.items-grid::-webkit-scrollbar-thumb:hover,
.selected-items-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(57, 73, 171, 0.5);
}

/* Loading state */
.action-btn :deep(.q-spinner) {
  margin-right: 8px;
}

/* Focus styles for accessibility */
.cute-input :deep(.q-field__control):focus-within {
  outline: 2px solid #3949ab;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #3949ab;
  outline-offset: 2px;
}

.item-card:focus {
  outline: 2px solid #3949ab;
  outline-offset: 2px;
}
</style>
