<template>
    <QModalForm
        v-model="model"
        :title="t('customer.update')"
        :show-user-info="true"
        :user-name="form.fname + ' ' + form.sname"
        :default-user-name="t('customer.customer')"
        :user-role="form.type === 'supplier' ? t('customer.supplier') : t('customer.customer')">
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
                                v-model="form.sphone"
                                :label="t('customer.secondPhone', 'Second Phone Number')"
                                :rules="[]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="secondary" />
                                </template>
                            </Qinput>

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
                            :btn-label="t('customer.updateBtn')"
                            color="primary"
                            :is-rounded="false"
                            :no-caps="true"
                        />
                    </div>
                </div>
            </q-form>
        </template>
    </QModalForm>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useCustomerStore } from 'src/stores/customerStore'
import { useLocationStore } from 'src/stores/locationStore'
import type { Customer, CustomerPayload } from 'src/types/customer'

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

// Customer prop for receiving existing customer data
const props = defineProps<{
  customer?: Customer
}>()

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

    if (props.customer) {
        updateFormFromCustomer(props.customer)
    }
})

// Reset form when modal closes
watch(model, (newVal) => {
    if (newVal === false) {
        resetForm()
    }
})

// Watch for customer prop changes to update form
watch(() => props.customer, (newCustomer) => {
    if (newCustomer) {
        updateFormFromCustomer(newCustomer)
    }
}, { immediate: true })

function updateFormFromCustomer(customer: Customer) {
    form.fname = customer.fname || '';
    form.sname = customer.sname || '';
    form.type = customer.type_value || 'customer';
    form.location_id = customer.location?.id || 0;
    form.place = customer.place || '';
    form.fphone = customer.fphone || '';
    form.sphone = customer.sphone || '';
    form.note = customer.note || '';
}

function resetForm() {
    if (props.customer) {
        updateFormFromCustomer(props.customer)
    } else {
        form.fname = '';
        form.sname = '';
        form.type = 'customer';
        form.location_id = 0;
        form.place = '';
        form.fphone = '';
        form.sphone = '';
        form.note = '';
    }
}

async function submitForm() {
    if (!props.customer?.id) {
        return;
    }

    // Send the form object directly to the store
    const payload: CustomerPayload = { ...form };
    const success = await customerStore.updateCustomer(props.customer.id.toString(), payload);
    if (success) {
        // Show success notification
        // console.log(t('customer.updateSuccess'));

        // Close modal
        model.value = false;

        // Emit success event
        emit('submit', form);
    }
}
</script>
