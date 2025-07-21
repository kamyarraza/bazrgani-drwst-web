<template>
  <QModalForm
    v-model="isOpen"
    :title="t('blum.updateItem')"
    :show-user-info="true"
    :user-name="form.name || props.item?.name"
    :default-user-name="t('blum.itemDetails', 'Item Details')"
    :user-role="t('blum.item', 'Blum Item')"
    v-if="props.item"
  >
    <template #default>
      <q-form @submit.prevent="onSubmit">
        <div class="q-pa-md">
          <!-- Form content in a two-column grid -->
          <div class="row q-col-gutter-md">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('blum.basicInfo', 'Basic Information') }}</div>

              <Qinput
                v-model="form.code"
                :label="t('blum.itemCode')"
                :rules="[val => !!val || t('validation.required')]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="tag" color="primary" />
                </template>
              </Qinput>

              <Qinput
                v-model="form.part_no"
                :label="t('blum.partNumber')"
                :rules="[val => !!val || t('validation.required')]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="qr_code" color="primary" />
                </template>
              </Qinput>

              <Qinput
                v-model="form.name"
                :label="t('blum.itemName')"
                :rules="[val => !!val || t('validation.required')]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="inventory_2" color="primary" />
                </template>
              </Qinput>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('blum.imageUpload', 'Image Upload') }}</div>

              <q-file
                v-model="imageFile"
                :label="t('blum.itemImage')"
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

              <div v-if="imagePreview || currentItemImage" class="image-preview-container q-mt-md">
                <div class="text-caption text-grey-6 q-mb-sm">
                  {{ imagePreview ? t('blum.newImagePreview', 'New Image Preview') : t('blum.currentImage', 'Current Image') }}
                </div>
                <q-img
                  :src="imagePreview || currentItemImage || ''"
                  style="max-width: 200px; max-height: 200px; border-radius: 8px;"
                  fit="contain"
                  class="bordered-image"
                />
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
                :disable="blumStore.blumItemsLoading"
              />
            </div>
            <div class="col">
              <q-btn
                type="submit"
                :label="t('common.save')"
                color="primary"
                no-caps
                class="full-width"
                :loading="blumStore.blumItemsLoading"
              />
            </div>
          </div>
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
import type { CreateOrUpdateBlumItem, BlumItem } from 'src/types/blumTypes';

const { t } = useI18n();
const blumStore = useBlumStore();

const props = defineProps<{
  modelValue: boolean;
  item?: BlumItem | undefined;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'item-updated'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const form = ref<CreateOrUpdateBlumItem>({
  code: '',
  part_no: '',
  name: '',
  image: '',
});

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const currentItemImage = ref<string | null>(null);

function onImageSelected(file: File | null) {
  if (!file) {
    imagePreview.value = null;
    imageFile.value = null;
    return;
  }

  // Store the file for FormData submission
  imageFile.value = file;

  // Create image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      imagePreview.value = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
}

function loadItemData() {
  if (props.item) {
    form.value.code = props.item.code || '';
    form.value.part_no = props.item.part_no || '';
    form.value.name = props.item.name || '';

    // If there's an existing image, display it
    if (props.item.image) {
      currentItemImage.value = props.item.image;
    } else {
      currentItemImage.value = null;
    }

    // Clear new image preview when loading existing item
    imagePreview.value = null;
    imageFile.value = null;
  }
}

async function onSubmit() {
  if (!form.value.code || !form.value.part_no || !form.value.name) {
    showNotify({
      type: 'negative',
      message: t('validation.fillRequiredFields'),
      position: 'top',
      duration: 3000,
    });
    return;
  }

  if (!props.item?.id) {
    showNotify({
      type: 'negative',
      message: 'Item ID is missing',
      position: 'top',
      duration: 3000,
    });
    return;
  }

  // Use FormData if there's a new image file, otherwise use regular JSON
  if (imageFile.value) {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('code', form.value.code);
    formData.append('part_no', form.value.part_no);
    formData.append('name', form.value.name);
    formData.append('image', imageFile.value);

    const success = await blumStore.updateBlumItem(props.item.id, formData);
    if (success) {
      resetForm();
      emit('item-updated');
      isOpen.value = false;
    }
  } else {
    // No new image, use regular JSON update (excluding image field to keep existing)
    const updateData = {
      code: form.value.code,
      part_no: form.value.part_no,
      name: form.value.name,
      image: '' // Empty string to keep existing image
    };

    const success = await blumStore.updateBlumItem(props.item.id, updateData);
    if (success) {
      resetForm();
      emit('item-updated');
      isOpen.value = false;
    }
  }
}

function resetForm() {
  form.value = {
    code: '',
    part_no: '',
    name: '',
    image: '',
  };
  imageFile.value = null;
  imagePreview.value = null;
  currentItemImage.value = null;
}

watch(isOpen, (newVal) => {
  if (newVal && props.item) {
    // When dialog opens and item is available, load the data
    loadItemData();
  } else if (!newVal) {
    // When dialog closes, reset form
    resetForm();
  }
});

// Watch for changes in the item prop
watch(() => props.item, (newItem) => {
  if (newItem && isOpen.value) {
    // If item changes while dialog is open, reload data
    loadItemData();
  }
}, { deep: true, immediate: true });

// Watch for both modelValue and item changes together
watch([() => props.modelValue, () => props.item], ([newModelValue, newItem]) => {
  if (newModelValue && newItem) {
    // Both dialog is open and item is available
    loadItemData();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.enhanced-input {
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
</style>
