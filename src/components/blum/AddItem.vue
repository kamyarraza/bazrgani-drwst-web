<template>
  <QModalForm
    v-model="isOpen"
    :title="t('blum.addNewItem')"
    :show-user-info="false"
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

              <div v-if="imagePreview" class="image-preview-container q-mt-md">
                <div class="text-caption text-grey-6 q-mb-sm">{{ t('blum.imagePreview', 'Image Preview') }}</div>
                <q-img
                  :src="imagePreview"
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
import type { CreateOrUpdateBlumItem } from 'src/types/blumTypes';

const { t } = useI18n();
const blumStore = useBlumStore();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_event: 'update:modelValue', _value: boolean): void;
  (_event: 'item-added'): void;
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
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
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

  // Create FormData for submission
  const formData = new FormData();
  formData.append('code', form.value.code);
  formData.append('part_no', form.value.part_no);
  formData.append('name', form.value.name);

  // Add image file if selected
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }

  const success = await blumStore.createBlumItem(formData);
  if (success) {
    resetForm();
    emit('item-added');
    isOpen.value = false;
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
}

watch(isOpen, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
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
