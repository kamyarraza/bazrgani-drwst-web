<template>
    <QModalForm
        v-model="model"
        :title="t('employee.updateEmployee')"
        :show-user-info="true"
        :user-image="(imagePreview || form.image) || null"
        :user-name="form.name"
        :default-user-name="t('employee.employee')"
        :user-role="form.role || t('employee.role')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('employee.personalInfo') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('employee.name')"
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
                                :label="t('employee.username')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="alternate_email" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.phone"
                                :label="t('employee.phone')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>

                            <q-select
                                v-model="form.branch_id"
                                :options="branchOptions"
                                :label="t('employee.branch')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                emit-value
                                map-options
                                option-value="id"
                                option-label="name"
                                use-input
                                input-debounce="300"
                                @filter="filterBranches"
                                :loading="branchLoading"
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="store" color="primary" />
                                </template>
                                <template #no-option>
                                    <q-item>
                                        <q-item-section class="text-grey">
                                            {{ t('common.noResults') }}
                                        </q-item-section>
                                    </q-item>
                                </template>
                            </q-select>

                            <q-select
                                v-model="form.is_male"
                                :options="genderOptions"
                                :label="t('employee.gender')"
                                :rules="[val => val !== null || t('validation.required')]"
                                outlined
                                emit-value
                                map-options
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="wc" color="primary" />
                                </template>
                            </q-select>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('employee.accountInfo') }}</div>

                            <Qinput
                                v-model="form.role"
                                :label="t('employee.role')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                                :placeholder="t('employee.rolePlaceholder', 'Enter employee role')"
                            >
                                <template #before>
                                    <q-icon name="badge" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password"
                                :label="t('employee.password')"
                                :rules="[
                                    val => !val || (typeof val === 'string' ? val.length >= 8 : false) || t('validation.minLength', { min: 8 })
                                ]"
                                type="password"
                                outlined
                                class="enhanced-input"
                                :hint="t('employee.passwordHint')"
                            >
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password_confirmation"
                                :label="t('employee.confirmPassword')"
                                :rules="[
                                    val => !form.password || !!val || t('validation.required'),
                                    val => !form.password || val === form.password || t('validation.passwordMatch')
                                ]"
                                type="password"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>

                            <!-- Image Upload -->
                            <div class="q-mb-md">
                                <label class="text-grey-7 q-mb-sm block">{{ t('employee.profileImage') }} *</label>
                                <q-uploader
                                    url="http://localhost:4444/upload"
                                    :label="t('employee.profileImage')"
                                    accept=".jpg,.jpeg,.png"
                                    color="primary"
                                    class="full-width enhanced-uploader"
                                    @added="onFileAdded"
                                    @removed="onFileRemoved"
                                />
                                <div v-if="!form.image && !imageFile" class="text-red text-caption q-mt-xs">
                                    {{ t('validation.required') }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="row justify-end q-mt-md">
                        <q-btn
                            :label="t('common.cancel')"
                            color="grey-7"
                            flat
                            class="q-mr-sm"
                            @click="() => $emit('update:modelValue', false)"
                        />
                        <q-btn
                            :label="t('common.save', 'Save')"
                            type="submit"
                            color="primary"
                            :loading="loading"
                            :disable="!form.image && !imageFile"
                        />
                    </div>
                </div>
            </q-form>
        </template>
    </QModalForm>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps, watch } from 'vue';
import Qinput from 'src/components/common/Qinput.vue';
import QModalForm from 'src/components/common/QModalForm.vue';
import { useI18n } from 'vue-i18n';
import { useEmployeeStore } from 'src/stores/employeeStore';
import type { Employee } from 'src/types/employee';

// Props and Emits
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    employee: {
        type: Object as () => Employee,
        default: null
    }
});

const emit = defineEmits(['update:modelValue']);

// Composables
const { t } = useI18n();
const employeeStore = useEmployeeStore();

// Reactive states
const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const loading = ref(false);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const branchLoading = ref(false);
const branchOptions = ref<{ id: string; name: string }[]>([]);

const form = ref<Employee & { password?: string; password_confirmation?: string; image?: string }>({
    name: '',
    is_male: 'Male',
    role: '',
    phone: '',
    username: '',
    password: '',
    password_confirmation: '',
    branch_id: '',
    image: ''
});

// Options for dropdowns
const genderOptions = computed(() => [
    { label: t('employee.male'), value: 'Male' },
    { label: t('employee.female'), value: 'Female' }
]);

// Methods
// Methods
const onFileAdded = (files: readonly File[]) => {
    if (files && files.length > 0) {
        const file = files[0]
        if (file) {
            imageFile.value = file

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                imagePreview.value = e.target?.result as string
            }
            reader.readAsDataURL(file)
        }
    }
};

const onFileRemoved = () => {
    imageFile.value = null
    imagePreview.value = null
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const filterBranches = async (val: string, update: Function) => {
    branchLoading.value = true;
    try {
        const branches = await employeeStore.searchBranches(val);
        update(() => {
            branchOptions.value = branches.map(branch => ({
                id: String(branch.id),
                name: branch.name
            }));
        });
    } catch (error) {
        console.error('Failed to search branches:', error);
        update(() => {
            branchOptions.value = [];
        });
    } finally {
        branchLoading.value = false;
    }
};

const submitForm = async () => {
    if (!form.value.id) return;

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('name', form.value.name);
        formData.append('username', form.value.username);
        formData.append('phone', form.value.phone);
        formData.append('is_male', (form.value.is_male === 'Male' ? 1 : 0).toString());
        formData.append('role', form.value.role);
        formData.append('branch_id', form.value.branch_id.toString());

        // Add password fields if they're provided
        if (form.value.password) {
            formData.append('password', form.value.password);
            formData.append('password_confirmation', form.value.password_confirmation || '');
        }

        // Only append image if a new one is selected
        if (imageFile.value) {
            formData.append('image', imageFile.value);
        }

        const success = await employeeStore.updateEmployee(form.value.id, formData);
        if (success) {
            model.value = false;
        }
    } catch (error) {
        console.error('Failed to update employee:', error);
    } finally {
        loading.value = false;
    }
};

// Watchers
watch(() => props.employee, (newValue) => {
    if (newValue) {
        // Ensure we have a complete employee object with all needed properties
        form.value = {
            ...newValue,
            password: '',
            is_male: newValue.gender as 'Male' | 'Female',
            branch_id: newValue.branch?.id ? String(newValue.branch.id) : (newValue.branch_id || ''),
            password_confirmation: '',
            image: newValue.image || ''
        };

        // Initialize branch options with current employee's branch
        if (newValue.branch) {
            branchOptions.value = [{
                id: String(newValue.branch.id),
                name: newValue.branch.name
            }];
        }

        // Reset image upload state when switching employees
        imageFile.value = null;
        imagePreview.value = null;
        console.log('Employee data loaded into form:', form.value.name);
    }
}, { immediate: true });

// Lifecycle hooks
// No need to fetch branches since each employee already has branch data
</script>

<style lang="scss" scoped>
.enhanced-input {
    margin-bottom: 16px;
}
</style>
