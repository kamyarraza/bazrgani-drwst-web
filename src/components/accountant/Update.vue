<template>
    <QModalForm v-model="model" :title="t('accountant.updateTitle', 'Update Accountant')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-gutter-md q-mt-lg">
                    <Qinput v-model="form.name" :label="t('accountant.name', 'Full Name')"
                        :rules="[val => !!val || t('validation.required', 'This field is required')]" />

                    <Qinput v-model="form.username" :label="t('accountant.username', 'Username')"
                        :rules="[val => !!val || t('validation.required', 'This field is required')]" />

                    <Qinput v-model="form.phone" :label="t('accountant.phone', 'Phone Number')"
                        :rules="[val => !!val || t('validation.required', 'This field is required')]" />

                    <div>
                        <label class="text-grey-7 q-mb-xs">{{ t('accountant.gender', 'Gender') }}</label>
                        <q-option-group v-model="form.gender" :options="[
                            { label: t('accountant.male', 'Male'), value: 'Male' },
                            { label: t('accountant.female', 'Female'), value: 'Female' }
                        ]" type="radio" inline />
                    </div>



                    <div>
                        <label class="text-grey-7 q-mb-xs">{{ t('accountant.image', 'Profile Image') }}</label>
                        <div class="q-gutter-sm row items-start">
                          <q-uploader
                            url="http://localhost:4444/upload"
                            label="Individual upload"
                            multiple
                            class="full-width"
                            @added="onFileAdded"
                            @removed="onFileRemoved"
                          />
                        </div>
                    </div>

                    <div class="q-gutter-sm">
                        <Qbtn type="submit" class="full-width"
                            :btn-label="t('accountant.updateBtn', 'Update Accountant')" color="primary" />
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
import type { Accountant } from 'src/types/accountant'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const accountantStore = useAccountantStore()


const props = defineProps<{
    accountant?: Accountant
}>()

const emit = defineEmits(['submit'])

// Form structure matching the Accountant interface
const form = reactive({
    id: 0,
    name: '',
    username: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female',
    image: null as File | null,
    role: 'accountant' as const
})

// Initialize form with accountant data when provided
watch(() => props.accountant, (newVal) => {
    if (newVal) {
        form.id = newVal.id
        form.name = newVal.name
        form.username = newVal.username
        form.phone = newVal.phone
        form.gender = newVal.gender?'Male':'Female'
        // Image is not set as it's not part of the data structure yet
    }
}, { immediate: true })

// Reset form when modal closes
watch(model, (newVal) => {
    if (!newVal && !props.accountant) {
        resetForm()
    }
})

function resetForm() {
    form.id = 0
    form.name = ''
    form.username = ''
    form.phone = ''
    form.gender = 'Male'
    form.image = null
}

// In submitForm, removed branch_id from formData
async function submitForm() {
    if (!form.id) return

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('username', form.username)
    formData.append('phone', form.phone)
    formData.append('is_male', form.gender?'male':'false')
    formData.append('role', form.role)

    if (form.image) {
        formData.append('image', form.image)
    }

    const success = await accountantStore.updateAccountant(form.id.toString(), formData)
    if (success) {
        // Close modal
        model.value = false
        // Emit success event
        emit('submit', { ...form })
    }
}

function onFileAdded(files: readonly {name: string, size: number, type: string, file: File}[]) {
    if (files.length > 0 && files[0]?.file) {
        form.image = files[0].file
    }
}

function onFileRemoved() {
    form.image = null
}
</script>
