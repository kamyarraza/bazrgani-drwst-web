<template>
    <q-dialog
        v-model="showDialog"
        persistent
        :backdrop-filter="backdropFilter"
        :maximized="$q.screen.lt.md"
        :full-width="$q.screen.lt.md"
        class="responsive-dialog"
    >
        <q-card class="q-pa-md q-rounded-borders responsive-dialog-card">
            <!-- Header -->
            <q-card-section class="row items-center q-pb-none">
                <q-avatar :icon="computedIcon" :color="colorClass" text-color="white" size="md" />
                <div class="text-h6 q-ml-sm">{{ title }}</div>
                <q-space />
            </q-card-section>

            <!-- Content -->
            <q-card-section class="q-pt-md">
                <slot>
                    <div class="text-body1">{{ message }}</div>
                </slot>
            </q-card-section>

            <!-- Actions -->
            <q-card-actions class="q-pt-md">
                <div class="row q-col-gutter-md full-width">
                    <div v-if="isConfirm" class="col">
                        <q-btn
                            flat
                            :label="cancelLabel"
                            color="grey-7"
                            v-close-popup
                            @click="onCancel"
                            class="full-width"
                        />
                    </div>
                    <div class="col">
                        <q-btn
                            :flat="!isPrimary"
                            :label="confirmLabel"
                            :color="colorClass"
                            v-close-popup
                            @click="onConfirm"
                            class="full-width"
                        />
                    </div>
                </div>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'

// Composables
const $q = useQuasar()

interface Props {
    modelValue: boolean
    title?: string
    message?: string
    type?: 'confirm' | 'warning'
    confirmLabel?: string
    cancelLabel?: string
    isPrimary?: boolean
    icon?: string
    backdropFilter?: string // NEW PROP
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    title: 'Confirmation',
    message: '',
    type: 'confirm',
    confirmLabel: 'OK',
    cancelLabel: 'Cancel',
    isPrimary: true,
    icon: '',
    backdropFilter: 'brightness(60%)' // DEFAULT
})


const emit = defineEmits<{
    (_e: 'update:modelValue', _value: boolean): void
    (_e: 'confirm'): void
    (_e: 'cancel'): void
}>()

const showDialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const isConfirm = computed(() => props.type === 'confirm')
const colorClass = computed(() => (props.type === 'warning' ? 'warning' : 'primary'))
const computedIcon = computed(() => props.icon || (props.type === 'warning' ? 'warning' : 'help'))

const onConfirm = () => {
    emit('confirm')
    showDialog.value = false
}

const onCancel = () => {
    emit('cancel')
    showDialog.value = false
}
</script>

<style scoped>
.responsive-dialog-card {
    min-width: 350px;
    max-width: 500px;
    width: 100%;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
    .responsive-dialog-card {
        border-radius: 0;
        min-width: unset;
        max-width: unset;

        /* Make buttons stack properly on mobile */
        .q-card-actions .row.q-col-gutter-md > .col {
            .q-btn {
                min-height: 44px;
            }
        }

        /* Adjust padding for mobile */
        .q-card-section {
            padding: 12px 16px;
        }

        .q-card-actions {
            padding: 12px 16px;
        }
    }
}

@media (max-width: 480px) {
    .responsive-dialog-card {
        font-size: 14px;

        .text-h6 {
            font-size: 1.1rem;
        }

        /* Make form more compact on very small screens */
        .q-card-section {
            padding: 8px 12px;
        }

        .q-card-actions {
            padding: 8px 12px;
        }
    }
}

/* Tablet responsive styles */
@media (min-width: 769px) and (max-width: 1024px) {
    .responsive-dialog-card {
        max-width: 90vw;
        width: 90vw;
    }
}

/* Ensure dialog is properly positioned */
.responsive-dialog .q-dialog__inner {
    padding: 0;
}

.responsive-dialog .q-dialog__inner--minimized {
    padding: 16px;
}

@media (max-width: 768px) {
    .responsive-dialog .q-dialog__inner {
        padding: 0 !important;
    }

    .responsive-dialog .q-dialog__inner--minimized {
        padding: 0 !important;
    }
}
</style>
