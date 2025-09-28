<template>
    <QModalForm
        v-model="model"
        :title="t('itemCategory.addNew')"
        :show-user-info="false"
        :user-name="form.name"
        :default-user-name="t('itemCategory.newCategory')"
        :user-role="''">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                            <Qinput
                                v-model="form.name"
                                :label="t('itemCategory.name')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="category" color="primary" />
                                </template>
                            </Qinput>
                        </div>
                        <div class="col-12 col-md-6">
                            <Qinput
                                v-model="form.description"
                                :label="t('itemCategory.description')"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="description" color="primary" />
                                </template>
                            </Qinput>
                        </div>
                    </div>                    <q-separator class="q-my-md" />
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
                                :btn-label="t('itemCategory.addBtn')"
                                color="primary"
                                :is-rounded="false"
                                :no-caps="true"
                                class="full-width"
                                :loading="categoryStore.loading"
                                :disable="categoryStore.loading"
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
import { useItemCategoryStore } from 'src/stores/itemCategoryStore'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const categoryStore = useItemCategoryStore()
const emit = defineEmits(['submit'])

const form = reactive({
    name: '',
    description: ''
})

watch(model, (newVal) => {
    if (newVal === false) {
        resetForm()
    }
})

function resetForm() {
    form.name = ''
    form.description = ''
}

async function submitForm() {
    const payload = {
        name: form.name,
        description: form.description
    }
    const success = await categoryStore.createItemCategory(payload)
    if (success) {
        model.value = false
        emit('submit', form)
    }
}
</script>
