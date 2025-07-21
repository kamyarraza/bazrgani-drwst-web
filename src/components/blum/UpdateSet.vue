<template>
  <QModalForm
    v-model="isOpen"
    :title="t('blum.updateSet')"
    :show-user-info="false"
    :user-name="form.name || props.set?.name"
    :default-user-name="t('blum.setDetails', 'Set Details')"
    :user-role="t('blum.set', 'Blum Set')"
    v-if="props.set"
  >
    <template #default>
      <q-form @submit.prevent="onSubmit">
        <div class="q-pa-md">
          <!-- Form content in a two-column grid -->
          <div class="row q-col-gutter-md">
            <!-- Left Column - Basic Info -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('blum.basicInfo', 'Basic Information') }}</div>

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

              <Qinput
                v-model="form.description"
                :label="t('blum.setDescription')"
                type="textarea"
                outlined
                class="enhanced-input"
                autogrow
              >
                <template #before>
                  <q-icon name="description" color="primary" />
                </template>
              </Qinput>
            </div>

            <!-- Right Column - Image Upload -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('blum.imageUpload', 'Image Upload') }}</div>

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

              <div v-if="imagePreview || currentSetImage" class="image-preview-container q-mt-md">
                <div class="text-caption text-grey-6 q-mb-sm">
                  {{ imagePreview ? t('blum.newImagePreview', 'New Image Preview') : t('blum.currentImage', 'Current Image') }}
                </div>
                <q-img
                  :src="imagePreview || currentSetImage || ''"
                  style="max-width: 200px; max-height: 200px; border-radius: 8px;"
                  fit="contain"
                  class="bordered-image"
                />
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Items Management Section -->
          <div class="items-section">
            <div class="text-subtitle1 text-primary q-mb-md">{{ t('blum.setItems') }}</div>

            <!-- Item Search Section -->
            <div class="row q-col-gutter-md q-mb-xl search-section">
              <div class="col-12 col-md-8">
                <Qinput
                  v-model="itemSearchQuery"
                  :label="t('blum.searchItems', 'Search Items')"
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
              <div class="col-12 col-md-4">
                <q-btn
                  color="primary"
                  icon="search"
                  :label="t('common.search', 'Search')"
                  @click="onSearchItems"
                  :loading="blumStore.blumItemsLoading"
                  class="full-width search-button"
                  no-caps
                  unelevated
                />
              </div>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="search-results-section q-mb-xl">
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
                  class="item-list-item q-mb-sm"
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

            <!-- Existing Items -->
            <div v-if="form.items.length > 0" class="selected-items-section q-mt-xl">
              <div class="text-subtitle2 text-primary q-mb-md">{{ t('blum.currentItems', 'Current Items') }} ({{ form.items.length }})</div>
              <div v-for="(item, index) in form.items" :key="index" class="row q-col-gutter-md q-mb-xl items-center selected-item-row">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="item.item_id"
                    :options="itemOptions"
                    :label="t('blum.selectItem')"
                    outlined
                    emit-value
                    map-options
                    class="enhanced-input"
                    :rules="[val => val !== null || t('validation.required')]"
                  >
                    <template #before>
                      <q-icon name="inventory_2" color="primary" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-4">
                  <Qinput
                    v-model.number="item.quantity"
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
                    @click="removeItem(index)"
                    :disable="form.items.length <= 1"
                  >
                    <q-tooltip>{{ t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Add New Item Button -->
              <div class="row q-mt-md">
                <div class="col-12">
                  <q-btn
                    color="positive"
                    icon="add"
                    :label="t('blum.addItem')"
                    @click="addItem"
                    outline
                    no-caps
                    class="full-width"
                  />
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Form Actions -->
          <div class="row q-col-gutter-md">
            <div class="col">
              <q-btn
                :label="t('common.cancel')"
                color="negative"
                flat
                no-caps
                @click="isOpen = false"
                class="full-width"
                :disable="blumStore.blumSetsLoading"
              />
            </div>
            <div class="col">
              <q-btn
                type="submit"
                :label="t('common.save')"
                color="primary"
                no-caps
                class="full-width"
                :loading="blumStore.blumSetsLoading"
              />
            </div>
          </div>
        </div>
      </q-form>
    </template>
  </QModalForm>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumStore } from 'src/stores/blumStore';
import { showNotify } from 'src/composables/Notify';
import QModalForm from 'src/components/common/QModalForm.vue';
import Qinput from 'src/components/common/Qinput.vue';
import type { CreateOrUpdateBlumSet, BlumSetItem, BlumSet, BlumItem } from 'src/types/blumTypes';

const { t } = useI18n();
const blumStore = useBlumStore();

const props = defineProps<{
  modelValue: boolean;
  set?: BlumSet | undefined;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'set-updated'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const form = ref<CreateOrUpdateBlumSet>({
  name: '',
  description: '',
  image: '',
  items: [{ item_id: 0, name: '', quantity: 1 }] as BlumSetItem[],
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const currentSetImage = ref<string | null>(null);
const itemSearchQuery = ref('');
const searchResults = ref<BlumItem[]>([]);

// Computed property for item selection options
const itemOptions = computed(() => {
  return blumStore.blumItems.map(item => ({
    label: `${item.name} (${item.code})`,
    value: item.id
  }));
});

function onImageSelected(file: File | null) {
  if (!file) {
    imagePreview.value = null;
    return;
  }

  // Create image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      imagePreview.value = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);

  // Convert image to base64 for API
  const readerForBase64 = new FileReader();
  readerForBase64.onload = (e) => {
    if (e.target?.result) {
      const base64String = (e.target.result as string).split(',')[1];
      form.value.image = base64String || '';
    }
  };
  readerForBase64.readAsDataURL(file);
}

async function loadSetData() {
  if (props.set) {
    // Ensure blum items are loaded first so the dropdown options are available
    if (blumStore.blumItems.length === 0) {
      await blumStore.fetchBlumItems();
    }

    form.value.name = props.set.name || '';
    form.value.description = props.set.description || '';

    // If there's an existing image, display it
    if (props.set.image) {
      currentSetImage.value = props.set.image;
    } else {
      currentSetImage.value = null;
    }

    // Load items - map id to item_id for proper form handling
    if (props.set.items && props.set.items.length > 0) {
      form.value.items = props.set.items.map(item => ({
        item_id: item.id || 0, // Map id to item_id with fallback
        name: item.name || '',
        code: item.code || '',
        part_no: item.part_no || '',
        quantity: item.quantity || 1
      }));
      console.log('Loaded set items:', form.value.items); // Debug log
      console.log('Available item options:', itemOptions.value); // Debug log

      // Debug: Check if the item_id values match available options
      form.value.items.forEach((item, index) => {
        const matchingOption = itemOptions.value.find(opt => opt.value === item.item_id);
        console.log(`Item ${index}: item_id=${item.item_id}, name="${item.name}", has matching option:`, !!matchingOption);
        if (matchingOption) {
          console.log(`  Matching option:`, matchingOption);
        }
      });
    } else {
      form.value.items = [{ item_id: 0, name: '', quantity: 1 }];
    }

    // Clear new image preview when loading existing set
    imagePreview.value = null;
    imageFile.value = null;
  }
}

function addItem() {
  form.value.items.push({ item_id: 0, name: '', quantity: 1 });
}

function removeItem(index: number) {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
  }
}

function validateForm() {
  console.log('Validating form with items:', form.value.items); // Debug log

  // Check name
  if (!form.value.name) {
    showNotify({
      type: 'negative',
      message: t('validation.nameRequired'),
      position: 'top',
      duration: 3000,
    });
    return false;
  }

  // For updating existing sets, we need to be more flexible with validation
  // Items might come from database with valid item_id values
  const validItems = form.value.items.filter(item => {
    // An item is valid if it has:
    // 1. A valid item_id (greater than 0)
    // 2. A positive quantity
    const hasValidId = item.item_id && item.item_id > 0;
    const hasValidQuantity = item.quantity && item.quantity > 0;

    // TEMPORARY: For debugging, let's be more lenient
    // If this is an update and we have items with names, allow them through
    const isExistingSetItem = props.set && item.name && item.name.trim() !== '';

    const isValid = (hasValidId && hasValidQuantity) || isExistingSetItem;

    console.log(`Item validation - item_id: ${item.item_id}, quantity: ${item.quantity}, name: '${item.name}', hasValidId: ${hasValidId}, hasValidQuantity: ${hasValidQuantity}, isExistingSetItem: ${isExistingSetItem}, final valid: ${isValid}`);

    return isValid;
  });

  console.log('Valid items count:', validItems.length); // Debug log
  console.log('Total items count:', form.value.items.length); // Debug log

  if (validItems.length === 0) {
    showNotify({
      type: 'negative',
      message: t('blum.addAtLeastOneItem', 'Please add at least one item to the set'),
      position: 'top',
      duration: 3000,
    });
    return false;
  }

  // Update the form items to only include valid items
  form.value.items = validItems;

  return true;
}

async function onSubmit() {
  if (!validateForm()) return;

  if (!props.set?.id) {
    showNotify({
      type: 'negative',
      message: 'Set ID is missing',
      position: 'top',
      duration: 3000,
    });
    return;
  }

  // Create FormData for proper submission (similar to AddSet)
  const formData = new FormData();
  formData.append('name', form.value.name);
  formData.append('description', form.value.description || '');

  // Append each item properly instead of JSON.stringify
  form.value.items.forEach((item, index) => {
    formData.append(`items[${index}][item_id]`, item.item_id.toString());
    formData.append(`items[${index}][quantity]`, item.quantity.toString());
  });

  // Handle image - if new image is selected, use it; otherwise keep existing
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  } else if (!currentSetImage.value) {
    // Only append empty image if there was no existing image
    formData.append('image', '');
  }

  const success = await blumStore.updateBlumSet(props.set.id, formData);
  if (success) {
    resetForm();
    emit('set-updated');
    isOpen.value = false;
  }
}

function resetForm() {
  form.value = {
    name: '',
    description: '',
    image: '',
    items: [{ item_id: 0, name: '', quantity: 1 }],
  };
  imageFile.value = null;
  imagePreview.value = null;
  currentSetImage.value = null;
}

watch(isOpen, async (newVal) => {
  if (newVal && props.set) {
    // When dialog opens and set is available, load the data
    await loadSetData();
  } else if (!newVal) {
    // When dialog closes, reset form
    resetForm();
  }
});

// Watch for changes in the set prop
watch(() => props.set, async (newSet) => {
  if (newSet && isOpen.value) {
    // If set changes while dialog is open, reload data
    await loadSetData();
  }
}, { deep: true, immediate: true });

// Watch for both modelValue and set changes together
watch([() => props.modelValue, () => props.set], async ([newModelValue, newSet]) => {
  if (newModelValue && newSet) {
    // Both dialog is open and set is available
    await loadSetData();
  }
}, { immediate: true });

onMounted(async () => {
  // Load items if not already loaded
  if (blumStore.blumItems.length === 0) {
    await blumStore.fetchBlumItems();
  }
});

// Search functionality methods
async function onSearchItems() {
  if (!itemSearchQuery.value.trim()) {
    // Allow searching even if the query is empty - this will show all items
    try {
      await blumStore.fetchBlumItems();
      if (blumStore.blumItems && blumStore.blumItems.length > 0) {
        searchResults.value = blumStore.blumItems;
      } else {
        searchResults.value = [];
        showNotify({
          type: 'info',
          message: t('blum.noItemsFound', 'No items found'),
          position: 'top',
          duration: 3000,
        });
      }
    } catch {
      searchResults.value = [];
      showNotify({
        type: 'negative',
        message: t('common.errorOccurred', 'An error occurred'),
        position: 'top',
        duration: 3000,
      });
    }
    return;
  }

  try {
    await blumStore.searchBlumItems(itemSearchQuery.value);
    if (blumStore.blumItems && blumStore.blumItems.length > 0) {
      searchResults.value = blumStore.blumItems;
    } else {
      searchResults.value = [];
      showNotify({
        type: 'info',
        message: t('blum.noItemsFound', 'No items found'),
        position: 'top',
        duration: 3000,
      });
    }
  } catch {
    searchResults.value = [];
    showNotify({
      type: 'negative',
      message: t('common.errorOccurred', 'An error occurred'),
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
      message: t('blum.itemAlreadyAdded', 'Item already added to set'),
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
    message: t('blum.itemAddedToSet', `${item.name} added to set`),
    position: 'top',
    duration: 2000,
  });
}

function isItemAlreadyAdded(itemId: number): boolean {
  return form.value.items.some(setItem => setItem.item_id === itemId);
}
</script>

<style lang="scss" scoped>
.enhanced-input {
  margin-bottom: 1rem;
}

.search-section {
  .search-input {
    margin-bottom: 0;

    .q-field__control {
      height: 56px;
    }
  }

  .search-button {
    height: 56px;
    margin-bottom: 0;
    font-weight: 500;

    &.q-btn {
      min-height: 56px;
    }
  }
}

.search-button {
  margin-bottom: 1rem;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bordered-image {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.items-section {
  .text-subtitle1 {
    margin-bottom: 24px !important;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .search-section {
    margin-bottom: 32px !important;
    padding: 16px;
    border-radius: 8px;
    background-color: rgba(25, 118, 210, 0.02);
    border: 1px solid rgba(25, 118, 210, 0.08);
  }

  .search-results-section {
    margin-bottom: 40px !important;
    padding: 16px;
    border-radius: 8px;
    background-color: rgba(76, 175, 80, 0.02);
    border: 1px solid rgba(76, 175, 80, 0.08);

    .text-subtitle2 {
      color: rgba(76, 175, 80, 0.8);
      font-weight: 600;
    }
  }

  .selected-items-section {
    margin-top: 40px !important;
    padding: 16px;
    border-radius: 8px;
    background-color: rgba(255, 193, 7, 0.02);
    border: 1px solid rgba(255, 193, 7, 0.08);

    .text-subtitle2 {
      margin-bottom: 20px !important;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 193, 7, 0.1);
    }
  }
  .search-results-section {
    .item-search-list {
      border: 1px solid rgba(0, 0, 0, 0.08);
      background-color: rgba(255, 255, 255, 0.8);

      .item-list-item {
        margin-bottom: 8px;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;

        &:hover {
          background-color: rgba(25, 118, 210, 0.04);
          border-color: rgba(25, 118, 210, 0.2);
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      .item-avatar-enhanced {
        border: 2px solid rgba(25, 118, 210, 0.1);
        background-color: rgba(255, 255, 255, 0.9);
      }

      .item-name {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }

      .item-details {
        .item-codes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .item-code-chip, .item-part-chip {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .item-code-chip {
            background-color: rgba(25, 118, 210, 0.1);
            color: rgba(25, 118, 210, 0.8);
          }

          .item-part-chip {
            background-color: rgba(76, 175, 80, 0.1);
            color: rgba(76, 175, 80, 0.8);
          }
        }
      }

      .item-action-section {
        padding-left: 16px;
      }
    }
  }

  .selected-items-section {
    .selected-item-row {
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background-color: rgba(25, 118, 210, 0.02);
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(25, 118, 210, 0.2);
        background-color: rgba(25, 118, 210, 0.04);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
