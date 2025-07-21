<template>
  <QModalForm
    v-model="isOpen"
    :title="t('blum.addNewSet')"
    :show-user-info="false"
    class="blum-add-set-modal"
  >
    <template #default>
      <q-form @submit.prevent="onSubmit" class="blum-set-form">
        <div class="q-pa-lg">
          <!-- Basic Information Section -->
          <q-card flat class="form-section">
            <q-card-section>
              <div class="section-header">
                <q-icon name="info" color="primary" class="q-mr-sm" />
                <span class="text-h6">{{ t('blum.basicInfo', 'Basic Information') }}</span>
              </div>

              <div class="row q-col-gutter-lg q-mt-md">
                <div class="col-12 col-md-6">
                  <Qinput
                    v-model="form.name"
                    :label="t('blum.setName')"
                    :rules="[val => !!val || t('validation.required')]"
                    outlined
                    class="enhanced-input"
                  >
                    <template #before>
                      <q-icon name="folder" color="primary" />
                    </template>
                  </Qinput>
                </div>

                <div class="col-12 col-md-6">
                  <q-file
                    v-model="imageFile"
                    :label="t('blum.setImage')"
                    outlined
                    accept="image/*"
                    @update:model-value="onImageSelected"
                    class="enhanced-input"
                  >
                    <template #before>
                      <q-icon name="image" color="primary" />
                    </template>
                    <template #append>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </div>
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <Qinput
                    v-model="form.description"
                    :label="t('blum.setDescription')"
                    type="textarea"
                    outlined
                    class="enhanced-input"
                    autogrow
                    rows="3"
                  >
                    <template #before>
                      <q-icon name="description" color="primary" />
                    </template>
                  </Qinput>
                </div>

                <div class="col-12 col-md-6">
                  <div v-if="imagePreview" class="image-preview-container">
                    <div class="text-caption text-grey-6 q-mb-sm">{{ t('blum.imagePreview', 'Image Preview') }}</div>
                    <q-img
                      :src="imagePreview || ''"
                      class="preview-image"
                      fit="contain"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Items Selection Section -->
          <q-card flat class="form-section q-mt-lg">
            <q-card-section>
              <div class="section-header">
                <q-icon name="inventory_2" color="primary" class="q-mr-sm" />
                <span class="text-h6">{{ t('blum.setItems') }}</span>
              </div>

              <!-- Search Section -->
              <div class="search-section q-mt-md">
                <div class="row q-col-gutter-md items-end">
                  <div class="col-12 col-md-9">
                    <Qinput
                      v-model="itemSearchQuery"
                      :label="t('blum.searchItems')"
                      @keyup.enter="onSearchItems"
                      outlined
                      class="enhanced-input search-input"
                      clearable
                      :loading="blumStore.blumItemsLoading"
                    >
                      <template #before>
                        <q-icon name="search" color="primary" />
                      </template>
                    </Qinput>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-btn
                      color="primary"
                      icon="search"
                      :label="t('common.search')"
                      @click="onSearchItems"
                      :loading="blumStore.blumItemsLoading"
                      class="search-button"
                      no-caps
                      unelevated
                    />
                  </div>
                </div>
              </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="search-results-section">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="search" class="q-mr-sm" />
                {{ t('blum.searchResults') }} ({{ searchResults.length }})
                <q-space />
                <q-btn
                  flat
                  dense
                  round
                  icon="clear"
                  size="sm"
                  @click="clearSearchResults"
                  class="text-grey-6"
                >
                  <q-tooltip>{{ t('common.clear') }}</q-tooltip>
                </q-btn>
              </div>

              <q-list separator class="rounded-borders item-search-list">
                <q-item
                  v-for="item in searchResults"
                  :key="item.id"
                  clickable
                  v-ripple
                  @click="addItemToSet(item)"
                  class="item-list-item"
                >
                  <q-item-section avatar>
                    <q-avatar size="56px" rounded class="item-avatar-enhanced">
                      <img
                        v-if="item.image"
                        :src="item.image"
                        :alt="item.name"
                        style="object-fit: cover;"
                      />
                      <q-icon v-else name="precision_manufacturing" size="28px" color="blue-grey-5" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="item-name">
                      {{ item.name }}
                    </q-item-label>

                    <q-item-label caption class="item-details">
                      <div class="item-codes">
                        <span v-if="item.code" class="item-code-chip">
                          <q-icon name="qr_code" size="xs" />
                          {{ item.code }}
                        </span>
                        <span v-if="item.part_no" class="item-part-chip">
                          <q-icon name="tag" size="xs" />
                          {{ item.part_no }}
                        </span>
                      </div>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side class="item-action-section">
                    <q-btn
                      round
                      color="positive"
                      icon="add"
                      size="sm"
                      @click.stop="addItemToSet(item)"
                      :disable="isItemAlreadyAdded(item.id)"
                    >
                      <q-tooltip>{{ t('blum.addItem') }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            </q-card-section>
          </q-card>

          <!-- Selected Items Section -->
          <q-card v-if="form.items.length > 0" flat class="form-section q-mt-lg">
            <q-card-section>
              <div class="section-header">
                <q-icon name="playlist_add_check" color="primary" class="q-mr-sm" />
                <span class="text-h6">{{ t('blum.selectedItems') }} ({{ form.items.length }})</span>
              </div>

              <div class="selected-items-list q-mt-md">
                <div v-for="(setItem, index) in form.items" :key="index" class="row q-col-gutter-md q-mb-md items-center selected-item-row">
                  <div class="col-12 col-md-6">
                    <Qinput
                      :model-value="getItemDisplayName(setItem.item_id)"
                      :label="t('blum.selectedItem')"
                      outlined
                      readonly
                      class="enhanced-input"
                    >
                      <template #before>
                        <q-icon name="inventory_2" color="primary" />
                      </template>
                    </Qinput>
                  </div>
                  <div class="col-12 col-md-4">
                    <Qinput
                      v-model.number="setItem.quantity"
                      :label="t('blum.quantity')"
                      type="number"
                      outlined
                      class="enhanced-input"
                      :rules="[
                        val => (val && Number(val) > 0) || t('validation.positiveNumber'),
                        val => (val && Number.isInteger(Number(val))) || t('validation.integerRequired')
                      ]"
                    >
                      <template #before>
                        <q-icon name="tag" color="primary" />
                      </template>
                    </Qinput>
                  </div>
                  <div class="col-12 col-md-2 flex items-center justify-center">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeItemFromSet(index)"
                    >
                      <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-separator class="q-my-md" />

          <!-- Form Actions -->
          <q-card flat class="form-section">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col">
                  <q-btn
                    :label="t('common.cancel')"
                    color="grey-6"
                    flat
                    no-caps
                    @click="isOpen = false"
                    class="full-width action-button"
                    :disable="blumStore.blumSetsLoading"
                    icon="close"
                  />
                </div>
                <div class="col">
                  <q-btn
                    type="submit"
                    :label="t('common.save')"
                    color="primary"
                    no-caps
                    class="full-width action-button"
                    :loading="blumStore.blumSetsLoading"
                    icon="save"
                    unelevated
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-form>
    </template>
  </QModalForm>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumStore } from 'src/stores/blumStore';
import { showNotify } from 'src/composables/Notify';
import QModalForm from 'src/components/common/QModalForm.vue';
import Qinput from 'src/components/common/Qinput.vue';
import type { CreateOrUpdateBlumSet, BlumSetItem, BlumItem } from 'src/types/blumTypes';

const { t } = useI18n();
const blumStore = useBlumStore();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_event: 'update:modelValue', _value: boolean): void;
  (_event: 'set-created'): void;
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

function isItemAlreadyAdded(itemId: number): boolean {
  return form.value.items.some(setItem => setItem.item_id === itemId);
}

function getItemDisplayName(itemId: number): string {
  const item = searchResults.value.find(item => item.id === itemId);
  return item ? `${item.name} (${item.code || item.part_no})` : `Item ID: ${itemId}`;
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
    emit('set-created');
    isOpen.value = false;
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

<style lang="scss" scoped>
.blum-add-set-modal {
  .blum-set-form {
    .q-pa-lg {
      padding: 24px;
    }
  }
}

.form-section {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
}

.enhanced-input {
  margin-bottom: 1rem;

  .q-field__control {
    border-radius: 6px;
  }
}

.search-section {
  .search-input {
    margin-bottom: 0;
  }

  .search-button {
    height: 56px; // Match the input field height
    width: 100%;
    font-weight: 500;
    border-radius: 6px;
    margin-bottom: 1rem; // Match the input margin
  }
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .preview-image {
    max-width: 180px;
    max-height: 180px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.action-button {
  height: 48px;
  font-weight: 600;
  border-radius: 6px;
}

.selected-items-list {
  .selected-item-row {
    padding: 16px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background-color: rgba(25, 118, 210, 0.02);
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.bordered-image {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-results-section {
  .item-search-list {
    max-height: 320px; // Fixed height to prevent long scrolling
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;

    // Custom scrollbar styling
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .item-list-item {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--q-primary);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .item-avatar-enhanced {
    border: 2px solid rgba(0, 0, 0, 0.08);
  }

  .item-name {
    font-weight: 600;
    color: var(--q-primary);
  }

  .item-codes {
    display: flex;
    gap: 8px;
    margin-top: 4px;

    .item-code-chip,
    .item-part-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      font-size: 0.75rem;
      color: var(--q-primary);
    }
  }
}
</style>
