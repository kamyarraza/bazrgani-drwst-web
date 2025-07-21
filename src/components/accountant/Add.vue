<template>
    <QModalForm
        v-model="model"
        :title="t('accountant.addNew', 'Add New Accountant')"
        :show-user-info="true"
        :user-name="form.name"
        :default-user-name="t('accountant.newUser', 'New Accountant')"
        :user-role="t('accountant.role', 'Accountant')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('accountant.personalInfo', 'Personal Information') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('accountant.name', 'Full Name')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="person" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.username"
                                :label="t('accountant.username', 'Username')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="alternate_email" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password"
                                :label="t('accountant.password', 'Password')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                                type="password"
                            >
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.password_confirmation"
                                :label="t('accountant.passwordConfirmation', 'Confirm Password')"
                                :rules="[val => !!val || t('validation.required', 'This field is required'), val => val === form.password || t('validation.passwordMatch', 'Passwords must match')]"
                                outlined
                                class="enhanced-input"
                                type="password"
                            >
                                <template #before>
                                    <q-icon name="lock" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.role"
                                :label="t('accountant.role', 'Role')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="badge" color="primary" />
                                </template>
                            </Qinput>

                            <div class="q-mb-md">
                                <label class="text-grey-7 q-mb-sm block">{{ t('accountant.gender', 'Gender') }}</label>
                                <q-option-group
                                    v-model="form.is_male"
                                    :options="[
                                        { label: t('accountant.male', 'Male'), value: true },
                                        { label: t('accountant.female', 'Female'), value: false }
                                    ]"
                                    type="radio"
                                    inline
                                    color="primary"
                                    :rules="[val => val === true || val === false || t('validation.required', 'This field is required')]"
                                />
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('accountant.accountDetails', 'Account Details') }}</div>

                            <Qinput
                                v-model="form.phone"
                                :label="t('accountant.phone', 'Phone Number')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>
                        </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="row q-col-gutter-md">
                        <div class="col">
                            <Qbtn
                                :btn-label="t('common.cancel', 'Cancel')"
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
                                :btn-label="t('accountant.addBtn', 'Add Accountant')"
                                color="primary"
                                :is-rounded="false"
                                :no-caps="true"
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
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useAccountantStore } from 'src/stores/accountantStore'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const accountantStore = useAccountantStore()
const emit = defineEmits(['submit'])

// Form structure
const form = reactive({
    name: '',
    username: '',
    password: '',
    password_confirmation: '',
    gender: 'male',
    is_male: null,
    role: '',
    phone: ''
})

watch(model, (newVal) => {
    if (newVal === false) {
        resetForm()
    }
})

function resetForm() {
    form.name = ''
    form.username = ''
    form.password = ''
    form.password_confirmation = ''
    form.gender = 'male'
    form.is_male = null
    form.role = ''
    form.phone = ''
}

async function submitForm() {
    const payload = { ...form }
    // Ensure is_male and role are included
    payload.is_male = form.is_male
    payload.role = form.role
    const success = await accountantStore.createAccountant(payload)
    if (success) {
        model.value = false
        emit('submit', form)
    }
}
</script>
