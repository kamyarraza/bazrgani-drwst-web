<template>
    <QModalForm
        v-model="model"
        :title="t('itemCategory.update')"
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
                            :btn-label="t('itemCategory.updateBtn')"
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
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useItemCategoryStore } from 'src/stores/itemCategoryStore'
import { defineProps } from 'vue'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const categoryStore = useItemCategoryStore()
const emit = defineEmits(['submit'])
const props = defineProps({
    category: {
        type: Object,
        default: () => ({ name: '', description: '' })
    }
})

const form = reactive({
    id: null,
    name: '',
    description: ''
})

// Sync form when modal opens or category changes
watch(model, (newVal) => {
    // console.log('Modal state changed:', newVal, 'Category:', props.category);
    if (newVal && props.category) {
        populateForm(props.category)
    }
    if (newVal === false) {
        resetForm()
    }
})

watch(() => props.category, (cat) => {
    // console.log('Category prop changed:', cat);
    if (model.value && cat) {
        populateForm(cat)
    }
}, { immediate: true })

function populateForm(category) {
    // console.log('Populating form with category:', category);
    form.id = category.id
    form.name = category.name
    // Use nullish coalescing for maximum safety
    form.description = category.description ?? ''
    // console.log('Form after population:', form);
}

function resetForm() {
    form.id = null
    form.name = ''
    form.description = ''
}

async function submitForm() {
    if (!form.id) return
    const payload = {
        name: form.name,
        description: form.description
    }
    const success = await categoryStore.updateItemCategory(form.id, payload)
    if (success) {
        model.value = false
        emit('submit', form)
    }
}
</script>
