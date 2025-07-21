<template>
    <QModalForm
        v-model="model"
        :title="t('admin.addNew')"
        :show-user-info="true"
        :user-name="form.name"
        :default-user-name="t('admin.newUser')"
        :user-role="form.role || t('admin.role')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('admin.personalInfo') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('admin.name')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="person" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.username"
                                :label="t('admin.username')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                              id="admin_username"
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="alternate_email" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.phone"
                                :label="t('admin.phone')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>

                            <div class="q-mb-md">
                                <label class="text-grey-7 q-mb-sm block">{{ t('admin.gender') }}</label>
                                <q-option-group
                                    v-model="form.is_male"
                                    :options="[
                                        { label: t('admin.male'), value: true },
                                        { label: t('admin.female'), value: false }
                                    ]"
                                    type="radio"
                                    inline
                                    color="primary"
                                />
                            </div>

                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('admin.accountDetails') }}</div>

                            <Qinput
                                v-model="form.role"
                                :label="t('admin.role')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="badge" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password"
                                :label="t('admin.password')"
                                type="password"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password_confirmation"
                                :label="t('admin.confirmPassword')"
                                type="password"
                                :rules="[
                                    val => !!val || t('validation.required'),
                                    val => val === form.password || t('admin.passwordMismatch')
                                ]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="lock_reset" color="primary" />
                                </template>
                            </Qinput>

                            <!-- Image Upload Section -->
                            <div class="text-subtitle1 text-primary q-mt-md q-mb-sm">
                                {{ t('admin.profileImage') }}
                            </div>
                            <div class="row q-col-gutter-sm">
                                <div class="col-12">
                                    <q-file
                                        v-model="imageFile"
                                        :label="t('admin.selectImage')"
                                        accept="image/*"
                                        outlined
                                        class="enhanced-input"
                                        @update:model-value="onImageSelected"
                                    >
                                        <template #prepend>
                                            <q-icon name="image" color="primary" />
                                        </template>
                                    </q-file>
                                </div>
                            </div>

                            <!-- Image Preview -->
                            <div v-if="imagePreview" class="image-preview-container q-mt-md">
                                <div class="text-caption text-grey-6 q-mb-sm">{{ t('admin.imagePreview', 'Image Preview') }}</div>
                                <q-img
                                    :src="imagePreview"
                                    style="max-width: 150px; max-height: 150px; border-radius: 8px;"
                                    fit="contain"
                                    class="bordered-image"
                                />
                            </div>
                        </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="row q-col-gutter-md">
                        <div class="col">
                            <Qbtn
                                :btn-label="t('common.cancel')"
                                color="negative"
                                :is-flat="true"
                                :no-caps="true"
                                @click="model = false"
                                class="full-width"
                            />
                        </div>
                        <div class="col">
                            <Qbtn
                                type="submit"
                                :btn-label="t('admin.addBtn')"
                                color="primary"
                                :is-rounded="false"
                                :no-caps="true"
                                :loading="loading"
                                class="full-width"
                            />
                        </div>
                    </div>
                </div>
            </q-form>
        </template>
    </QModalForm>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useAdminStore } from 'src/stores/adminStore'
import type { AdminForm } from 'src/types/admin'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const adminStore = useAdminStore()
const emit = defineEmits(['submit'])

const loading = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

// Form structure
const form = reactive({
    name: '',
    username: '',
    phone: '',
    is_male: true,
    role: '',
    password: '',
    password_confirmation: ''
})

// Reset form when modal closes
watch(model, (newVal) => {
    if (newVal === false) {
        resetForm()
    }
})

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

function resetForm() {
    form.name = ''
    form.username = ''
    form.phone = ''
    form.is_male = true
    form.role = ''
    form.password = ''
    form.password_confirmation = ''
    imageFile.value = null
    imagePreview.value = null
}

async function submitForm() {
    loading.value = true
    try {
        let payload: FormData | AdminForm;

        if (imageFile.value) {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('username', form.username);
            formData.append('phone', form.phone);
            formData.append('is_male', form.is_male ? '1' : '0');
            formData.append('role', form.role);
            formData.append('password', form.password);
            formData.append('password_confirmation', form.password_confirmation);
            formData.append('image', imageFile.value);

            payload = formData;
        } else {
            // Send the form object directly to the store
            payload = {
                name: form.name,
                username: form.username,
                phone: form.phone,
                is_male: form.is_male,
                role: form.role,
                password: form.password,
                password_confirmation: form.password_confirmation
            };
        }

        const success = await adminStore.createAdmin(payload)
        if (success) {
            // Close modal
            model.value = false
            // Reset form is handled by the watcher
            // Emit success event
            emit('submit', form)
        }
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.enhanced-input {
  margin-bottom: 12px;
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
