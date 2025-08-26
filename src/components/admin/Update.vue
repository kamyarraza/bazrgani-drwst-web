<template>
    <QModalForm
        v-model="model"
        :title="t('admin.update')"
        :show-user-info="true"
        :user-image="(imagePreview || form.image) || null"
        :user-name="form.name"
        :default-user-name="t('admin.newUser')">
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
                                v-model="form.username"
                                :label="t('admin.username')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="alternate_email" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password"
                                :label="t('admin.password') + ' (' + t('common.optional') + ')'"
                                type="password"
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
                                    form.password ? val => !!val || t('validation.required') : () => true,
                                    val => !form.password || val === form.password || t('admin.passwordMismatch')
                                ]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="lock_reset" color="primary" />
                                </template>
                            </Qinput>

                            <!-- Image Upload -->
                            <div class="q-mb-md">
                                <label class="text-grey-7 q-mb-sm block">{{ t('admin.profileImage') }}</label>
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

                            <!-- Image Preview -->
                            <div v-if="imagePreview || form.image" class="image-preview-container q-mt-md">
                                <div class="text-caption text-grey-6 q-mb-sm">
                                    {{ imagePreview ? t('admin.newImagePreview', 'New Image Preview') : t('admin.currentImage', 'Current Image') }}
                                </div>
                                <q-img
                                    :src="imagePreview || form.image || ''"
                                    style="max-width: 150px; max-height: 150px; border-radius: 8px;"
                                    fit="contain"
                                    class="bordered-image"
                                />
                            </div>
                        </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="row justify-end q-gutter-sm">
                        <Qbtn
                            :btn-label="t('common.cancel')"
                            color="negative"
                            :is-flat="true"
                            :no-caps="true"
                            @click="model = false"
                        />
                        <Qbtn
                            type="submit"
                            :btn-label="t('admin.updateBtn')"
                            color="primary"
                            :is-rounded="false"
                            :no-caps="true"
                            :loading="loading"
                        />
                    </div>
                </div>
            </q-form>
        </template>
    </QModalForm>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import type { AdminForm } from 'src/types/admin'
import { useAdminStore } from 'src/stores/adminStore'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const adminStore = useAdminStore()
const props = defineProps<{
    admin?: AdminForm
}>()

const loading = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = reactive<AdminForm>({
    name: '',
    username: '',
    image: '',
    phone: '',
    is_male: true,
    role: '',
    password: '',
    password_confirmation: '',
    gender: ''
})

// Sync form when modal opens or admin changes
watch(model, (newVal) => {
    if (newVal && props.admin) {
        populateForm(props.admin);
    }
})

watch(() => props.admin, (admin) => {
    if (model.value && admin) {
        populateForm(admin);
    }
}, { immediate: true })

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

function populateForm(admin: AdminForm) {
    Object.assign(form, admin)
    form.is_male = admin.gender === 'female' ? false : true
    form.password = ''
    form.password_confirmation = ''
    imageFile.value = null
    imagePreview.value = null
}

async function submitForm() {
    if (!form.id) return
    loading.value = true
    try {
        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('username', form.username)
        formData.append('phone', form.phone)
        formData.append('is_male', form.is_male ? '1' : '0')
        formData.append('role', form.role)
        if (form.password) {
            formData.append('password', form.password)
            formData.append('password_confirmation', form.password_confirmation)
        }
        if (imageFile.value) {
            formData.append('image', imageFile.value)
        }
        const success = await adminStore.updateAdmin(form.id, formData)
        if (success) {
            model.value = false
        }
    } finally {
        loading.value = false;
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
