<template>
    <q-dialog
        v-model="internalModel"
        persistent
        class="enhanced-dialog"
        :maximized="$q.screen.lt.md"
        :full-width="$q.screen.lt.md"
    >
        <q-card class="q-pa-md q-modal-form">
          <div class="row items-center q-mb-md modal-header">
              <div class="text-h5 col text-uppercase">{{ title }}</div>
              <q-space />
              <q-btn flat round dense icon="close" @click="close" />
            </div>

            <!-- User Info Section - Optional -->
            <div v-if="showUserInfo" class="row items-center q-mb-lg user-info-section">
                <q-avatar size="80px" class="q-mr-md">
                    <q-icon v-if="!userImage" :name="userIcon || 'person'" color="white" size="40px" class="absolute-center"
                           style="background-color: var(--q-primary); border-radius: 50%; padding: 10px;" />
                    <img v-else :src="userImage" />
                </q-avatar>
                <div>
                    <div class="text-h6">{{ userName || defaultUserName }}</div>
                    <div class="text-subtitle1">{{ userRole }}</div>
                </div>
            </div>

            <div v-if="tabs?.length" class="q-mb-md">
                <q-tabs v-model="activeTab" class="text-primary" align="justify" swipeable>
                    <q-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="tab.label" :icon="tab.icon" />
                </q-tabs>
                <q-separator />
            </div>

            <q-tab-panels v-if="tabs?.length" v-model="activeTab" animated swipeable class="q-mt-md">
                <q-tab-panel v-for="tab in tabs" :key="tab.name" :name="tab.name">
                    <slot :name="tab.name" />
                </q-tab-panel>
            </q-tab-panels>

            <div v-else>
                <slot />
            </div>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'

// Composables
const $q = useQuasar()

// Props
interface TabItem {
    name: string
    label: string
    icon?: string
}

const props = defineProps<{
    modelValue: boolean
    title?: string
    tabs?: TabItem[]
    // User info section props
    showUserInfo?: boolean
    userImage?: string | null
    userName?: string
    defaultUserName?: string
    userRole?: string
    userIcon?: string
}>()

const emit = defineEmits<{
    (_e: 'update:modelValue', _value: boolean): void
}>()

// Internal model (v-model)
const internalModel = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

// Active tab
const activeTab = ref(props.tabs?.[0]?.name ?? '')

watch(
    () => props.modelValue,
    (val) => {
        if (val && props.tabs?.length) {
            activeTab.value = props.tabs?.[0]?.name ?? ''
        }
    }
)

function close() {
    internalModel.value = false
}
</script>

<style lang="scss">
.enhanced-dialog {
    .q-dialog__backdrop {
        backdrop-filter: blur(8px);
        background: rgba(0, 0, 0, 0.3);
    }
}

.q-modal-form {
    width: 100%;
    max-width: 900px;
    min-width: 300px;
    border-radius: 18px;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
    background: #fff !important;
    overflow: hidden;
    max-height: 90vh;
    overflow-y: auto;

    .modal-header {
        background: #2A7B9B;
        padding: 16px 24px;
        margin: -16px -16px 16px -16px !important;

        .text-h5 {
            color: white !important;
            text-transform: none !important;
        }

        .q-btn {
            color: white !important;
        }
    }

    .user-info-section {
        padding: 0 8px;
    }

    .enhanced-input {
        .q-field__control {
            height: 52px;
        }

        &.q-field--outlined .q-field__control:before {
            border: 2px solid rgba(0, 0, 0, 0.1);
        }

        &.q-field--outlined.q-field--focused .q-field__control:before {
            border-color: var(--q-primary);
            border-width: 2px;
        }

        /* Fix: Remove Quasar's default blue box-shadow on focus to prevent double border */
        &.q-field--outlined.q-field--focused .q-field__control:after {
            box-shadow: none !important;
            border: none !important;
        }
    }

    .enhanced-uploader {
        border-radius: 8px;

        .q-uploader__header {
            background: #f5f8ff;
        }

        .q-uploader__list {
            background: #ffffff;
        }

        .q-uploader__file {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
    }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
    .q-modal-form {
        display: flex;
        flex-direction: column;
        border-radius: 0;
        max-height: 100vh;

        .modal-header {
            margin: -16px -16px 16px -16px !important;
            padding: 12px 16px;

            .text-h5 {
                font-size: 1.1rem;
                line-height: 1.2;
            }
        }

        .user-info-section {
            padding: 0 4px;

            .q-avatar {
                margin-right: 12px;
            }
        }

        .q-card-section:last-child {
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            background: white;
            position: sticky;
            bottom: 0;
            z-index: 1;
        }

        /* Make form fields stack vertically on mobile - ONLY within this modal form */
        .q-modal-form .row.q-col-gutter-md > .col-12.col-md-6 {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
        }

        .q-modal-form .row.q-col-gutter-md > .col-12.col-md-4 {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
        }

        /* Improve button layout on mobile */
        .row.justify-end {
            justify-content: stretch !important;
            gap: 8px;

            .q-btn {
                flex: 1;
                max-width: none;
                min-height: 44px;
            }
        }

        /* Adjust padding for mobile */
        .q-pa-md {
            padding: 12px 16px;
        }

        /* Make text inputs more mobile-friendly */
        .enhanced-input {
            .q-field__control {
                min-height: 44px;
            }
        }
    }
}

@media (max-width: 480px) {
    .q-modal-form {
        .modal-header {
            padding: 8px 12px;

            .text-h5 {
                font-size: 1rem;
            }
        }

        .q-pa-md {
            padding: 8px 12px;
        }

        .enhanced-input {
            margin-bottom: 12px;

            .q-field__control {
                min-height: 40px;
            }
        }
    }
}

/* Tablet responsive styles */
@media (min-width: 769px) and (max-width: 1024px) {
    .q-modal-form {
        max-width: 90vw;
        width: 90vw;
    }
}

/* Ensure dialog is properly positioned */
.enhanced-dialog .q-dialog__inner {
    padding: 0;
}

.enhanced-dialog .q-dialog__inner--minimized {
    padding: 16px;
}

@media (max-width: 768px) {
    .enhanced-dialog .q-dialog__inner {
        padding: 0 !important;
    }

    .enhanced-dialog .q-dialog__inner--minimized {
        padding: 0 !important;
    }
}
</style>
