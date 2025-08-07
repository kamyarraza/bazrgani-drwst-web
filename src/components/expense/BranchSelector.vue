<template>
    <q-dialog v-model="show" persistent transition-show="scale" transition-hide="scale" class="branch-modal">
        <q-card class="branch-selector-card">
            <!-- Header -->
            <q-card-section class="branch-header">
                <div class="header-content">
                    <div class="header-icon">
                        <q-icon name="business" size="2rem" class="header-icon-inner" />
                    </div>
                    <div class="header-text">
                        <div class="title">{{ t('expense.selectBranch') }}</div>
                        <div class="subtitle">{{ t('expense.selectBranchHelp', 'Please select a branch to continue') }}
                        </div>
                    </div>
                </div>
                <q-btn flat round icon="close" @click="close" class="close-btn" size="md" />
            </q-card-section>

            <!-- Content -->
            <q-card-section class="branch-content">
                <div v-if="branchStore.loading" class="text-center q-py-lg">
                    <q-spinner-dots size="40px" color="primary" />
                    <div class="q-mt-md text-grey-7">{{ t('common.loading') }}...</div>
                </div>

                <div v-else-if="branches.length === 0" class="text-center q-py-lg">
                    <q-icon name="business_center" size="60px" color="grey-5" />
                    <div class="q-mt-md text-grey-7">{{ t('expense.noBranchesAvailable') }}</div>
                </div>

                <div v-else class="branches-grid">
                    <q-card v-for="branch in branches" :key="branch.id" class="branch-card"
                        :class="{ 'selected': selectedBranchId === branch.id }" clickable @click="selectBranch(branch)">
                        <q-card-section class="text-center">
                            <q-icon name="store" size="40px" color="primary" class="q-mb-sm" />
                            <div class="branch-name">{{ branch.name }}</div>
                            <div class="branch-location text-grey-6">
                                {{ (branch as any).location?.name || t('common.notAvailable') }}
                            </div>

                            <!-- Selection indicator -->
                            <q-icon v-if="selectedBranchId === branch.id" name="check_circle" color="positive"
                                size="24px" class="selection-icon" />
                        </q-card-section>
                    </q-card>
                </div>
            </q-card-section>

            <!-- Actions -->
            <q-card-actions class="branch-actions">
                <q-btn flat :label="t('common.cancel')" color="grey-6" @click="close" class="action-btn" no-caps />
                <q-btn :label="t('common.submit')" color="primary" @click="confirmSelection"
                    :disabled="!selectedBranchId" class="action-btn primary-btn" no-caps />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useBranchStore } from 'src/stores/branchStore';
import type { Branch } from 'src/types/branch';

const { t } = useI18n();
const branchStore = useBranchStore();

// Props
interface Props {
    modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false
});

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'branch-selected': [branch: Branch];
}>();

// State
const selectedBranchId = ref<number | null>(null);

// Computed
const show = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
});

const { branches } = storeToRefs(branchStore);

// Methods
function close() {
    show.value = false;
    selectedBranchId.value = null;
}

function selectBranch(branch: Branch) {
    selectedBranchId.value = branch.id!;
}

function confirmSelection() {
    if (selectedBranchId.value) {
        const selectedBranch = branches.value.find(b => b.id === selectedBranchId.value);
        if (selectedBranch) {
            emit('branch-selected', selectedBranch);
            close();
        }
    }
}

// Lifecycle
onMounted(async () => {
    if (branches.value.length === 0) {
        await branchStore.fetchBranches();
    }
});
</script>

<style scoped>
.branch-modal :deep(.q-dialog__inner) {
    padding: 16px;
}

.branch-selector-card {
    width: 100%;
    max-width: 600px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Header styling */
.branch-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    position: relative;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 10px;
    backdrop-filter: blur(10px);
}

.header-icon-inner {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.header-text .title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 4px;
}

.header-text .subtitle {
    font-size: 0.9rem;
    opacity: 0.9;
}

.close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

/* Content styling */
.branch-content {
    padding: 24px;
    min-height: 200px;
}

.branches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.branch-card {
    border: 2px solid rgba(226, 232, 240, 0.8);
    border-radius: 12px;
    transition: all 0.3s ease;
    position: relative;
    cursor: pointer;
}

.branch-card:hover {
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
}

.branch-card.selected {
    border-color: #22c55e;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.branch-name {
    font-weight: 600;
    font-size: 1rem;
    color: #334155;
    margin-bottom: 4px;
}

.branch-location {
    font-size: 0.85rem;
}

.selection-icon {
    position: absolute;
    top: 8px;
    right: 8px;
}

/* Actions styling */
.branch-actions {
    padding: 16px 24px;
    background: rgba(248, 250, 252, 0.8);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.action-btn {
    padding: 8px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
}

.primary-btn:hover:not(:disabled) {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    transform: translateY(-1px);
}

.primary-btn:disabled {
    opacity: 0.6;
}

/* Responsive design */
@media (max-width: 768px) {
    .branch-selector-card {
        margin: 8px;
        max-width: calc(100vw - 16px);
    }

    .branches-grid {
        grid-template-columns: 1fr;
    }

    .branch-actions {
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
    }
}
</style>
