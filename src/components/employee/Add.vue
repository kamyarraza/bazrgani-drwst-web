<template>
    <QModalForm v-model="model" :title="t('employee.addNew')" :show-user-info="true" :user-name="form.name"
        :default-user-name="t('employee.newUser')" :user-role="form.role || t('employee.role')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('employee.personalInfo') }}</div>

                            <Qinput v-model="form.name" :label="t('employee.name')"
                                :rules="[val => !!val || t('validation.required')]" outlined class="enhanced-input">
                                <template #before>
                                    <q-icon name="person" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput v-model="form.phone" :label="t('employee.phone')"
                                :rules="[val => !!val || t('validation.required')]" outlined class="enhanced-input">
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>

                            <q-select v-model="form.branch_id" :options="branchOptions" :label="t('employee.branch')"
                                :rules="[val => !!val || t('validation.required')]" outlined emit-value map-options
                                option-value="id" option-label="name" use-input input-debounce="300"
                                @filter="filterBranches" :loading="branchLoading" class="enhanced-input">
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

                            <q-select v-model="form.is_male" :options="genderOptions" :label="t('employee.gender')"
                                :rules="[val => val !== null || t('validation.required')]" outlined emit-value
                                map-options class="enhanced-input">
                                <template #before>
                                    <q-icon name="wc" color="primary" />
                                </template>
                            </q-select>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('employee.accountInfo') }}</div>

                            <Qinput v-model="form.username" :label="t('employee.username')"
                                :rules="[val => !!val || t('validation.required')]" outlined class="enhanced-input">
                                <template #before>
                                    <q-icon name="alternate_email" color="primary" />
                                </template>
                            </Qinput>

                            <!-- <Qinput v-model="form.role" :label="t('employee.role')"
                                :rules="[val => !!val || t('validation.required')]" outlined class="enhanced-input"
                                :placeholder="t('employee.rolePlaceholder', 'Enter employee role')">
                                <template #before>
                                    <q-icon name="badge" color="primary" />
                                </template>
                            </Qinput> -->

                            <Qinput v-model="form.password" :label="t('employee.password')" :rules="[
                                val => !!val || t('validation.required'),
                                val => (typeof val === 'string' ? val.length >= 8 : false) || t('validation.minLength', { min: 8 })
                            ]" type="password" outlined class="enhanced-input">
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput v-model="form.password_confirmation" :label="t('employee.confirmPassword')" :rules="[
                                val => !!val || t('validation.required'),
                                val => val === form.password || t('validation.passwordMatch')
                            ]" type="password" outlined class="enhanced-input">
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>
                        </div>

                        <!-- Permissions -->
                        <div class="col-12" style="padding-bottom: 1rem;">
                            <!-- Title -->
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('employee.permissions.title') }}</div>

                            <!-- Permissions Grid -->
                            <div class="permissions-grid q-mb-md">
                                <q-card v-for="permission in permissionOptions" :key="permission.key"
                                    class="permission-card q-pa-sm" flat bordered>
                                    <q-checkbox :model-value="form.permissions?.includes(permission.key) || false"
                                        @update:model-value="(val) => togglePermission(permission.key, val)"
                                        :label="permission.label" color="primary" class="full-width" />
                                </q-card>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="row q-col-gutter-md q-mt-md">
                        <div class="col">
                            <q-btn :label="t('common.cancel')" color="grey-7" flat class="full-width"
                                @click="() => $emit('update:modelValue', false)" />
                        </div>
                        <div class="col">
                            <q-btn :label="t('common.save', 'Save')" type="submit" color="primary" :loading="loading"
                                class="full-width" />
                        </div>
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

const permissionOptions = ref<{ key: string; label: string }[]>([
    { key: 'adjustments', label: t('employee.permissions.adjustments', 'Stock Adjustments') },
]);

const loading = ref(false);
const branchLoading = ref(false);
const branchOptions = ref<{ id: string; name: string }[]>([]);

const form = ref<Employee>({
    name: '',
    is_male: null,
    role: '',
    phone: '',
    username: '',
    password: '',
    password_confirmation: '',
    branch_id: '',
    permissions: []
});

// Options for dropdowns
const genderOptions = computed(() => [
    { label: t('employee.male'), value: true },
    { label: t('employee.female'), value: false }
]);

// Methods
const togglePermission = (permissionKey: string, isChecked: boolean) => {
    if (!form.value.permissions) {
        form.value.permissions = [];
    }

    if (isChecked) {
        // Add permission if not already present
        if (!form.value.permissions.includes(permissionKey)) {
            form.value.permissions.push(permissionKey);
        }
    } else {
        // Remove permission
        const index = form.value.permissions.indexOf(permissionKey);
        if (index > -1) {
            form.value.permissions.splice(index, 1);
        }
    }
};

// MethodsP
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
    loading.value = true;
    try {
        await employeeStore.createEmployee(form.value);
        resetForm();
        model.value = false;
    } catch (error) {
        console.error('Failed to create employee:', error);
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    form.value = {
        name: '',
        is_male: null,
        role: '',
        phone: '',
        username: '',
        password: '',
        password_confirmation: '',
        branch_id: '',
        permissions: []
    };
};

// Watchers
watch(() => props.modelValue, async (newValue) => {
    if (newValue && branchOptions.value.length === 0) {
        // Load initial branches when modal opens
        branchLoading.value = true;
        try {
            const branches = await employeeStore.searchBranches('');
            branchOptions.value = branches.map(branch => ({
                id: String(branch.id),
                name: branch.name
            }));
        } catch (error) {
            console.error('Failed to load initial branches:', error);
        } finally {
            branchLoading.value = false;
        }
    }
});

// Lifecycle hooks
// No need to fetch branches - we load them when modal opens
</script>

<style lang="scss" scoped>
.enhanced-input {
    margin-bottom: 16px;
}

.permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    background: #fafafa;
}

.permission-card {
    background: white;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

// Responsive design for permissions
@media (max-width: 768px) {
    .permissions-grid {
        grid-template-columns: 1fr;
        max-height: 150px;
    }
}
</style>
