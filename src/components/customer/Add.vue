<template>
    <QModalForm
        v-model="model"
        :title="t('customer.addNew')"
        :show-user-info="true"
        :user-name="form.fname + ' ' + form.sname"
        :default-user-name="t('customer.newCustomer')"
        :user-role="t('customer.customer')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('customer.customerInfo') }}</div>

                            <Qinput
                                v-model="form.fname"
                                :label="t('customer.firstName')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="person" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.sname"
                                :label="t('customer.lastName')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="person" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.fphone"
                                :label="t('customer.primaryPhone')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.sphone"
                                :label="t('customer.secondPhone', 'Second Phone Number')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="secondary" />
                                </template>
                            </Qinput>

                            <q-select
                                v-model="form.type"
                                :options="typeOptions"
                                :label="t('customer.type')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                                emit-value
                                map-options
                            >
                                <template #before>
                                    <q-icon name="category" color="primary" />
                                </template>
                            </q-select>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('customer.locationInfo') }}</div>

                            <q-select
                                v-model="form.location_id"
                                :options="locationOptions"
                                :label="t('customer.location')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input q-mb-md"
                                emit-value
                                map-options
                            >
                                <template #before>
                                    <q-icon name="location_on" color="primary" />
                                </template>
                            </q-select>

                            <Qinput
                                v-model="form.place"
                                :label="t('customer.place')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="place" color="primary" />
                                </template>
                            </Qinput>
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
                                :btn-label="t('customer.addBtn')"
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
import { reactive, watch, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useCustomerStore } from 'src/stores/customerStore'
import { useLocationStore } from 'src/stores/locationStore'
import type { CustomerPayload } from 'src/types/customer'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const customerStore = useCustomerStore()
const locationStore = useLocationStore()
const emit = defineEmits(['submit'])
const locationOptions = ref<Array<{label: string, value: number}>>([])
const typeOptions = ref<Array<{label: string, value: string}>>([
    { label: t('customer.customer'), value: 'customer' },
    { label: t('customer.supplier'), value: 'supplier' }
])

// Form structure
const form = reactive<CustomerPayload>({
    fname: '',
    sname: '',
    type: 'customer',
    location_id: 0,
    place: '',
    fphone: '',
    sphone: '',
    note: ''
})

// Load locations
onMounted(async () => {
    await locationStore.fetchLocations()
    locationOptions.value = locationStore.locations.map(loc => ({
        label: loc.name,
        value: loc.id
    }))
})

// Reset form when modal closes
watch(model, (newVal) => {
    if (newVal === false) {
        resetForm()
    }
})

function resetForm() {
    form.fname = ''
    form.sname = ''
    form.type = 'customer'
    form.location_id = 0
    form.place = ''
    form.fphone = ''
    form.sphone = ''
    form.note = ''
}

async function submitForm() {
    // Send the form object directly to the store
    const payload: CustomerPayload = { ...form }
    const success = await customerStore.createCustomer(payload)
    if (success) {
        // Show success notification
        console.log(t('customer.createSuccess'))

        // Close modal
        model.value = false

        // Reset form is handled by the watcher
        // Emit success event
        emit('submit', form)
    }
}
</script>
