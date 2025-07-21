<template>
    <div class="row q-col-gutter-md q-mb-md">
        <!-- Search Input -->
        <div class="col-md-4 col-sm-6 col-xs-12" v-if="showSearchInput">
            <q-input v-model="localFilters.search" outlined dense clearable
                :label="searchLabel || $t('common.search', 'Search')" class="full-width"
                @update:model-value="emitFilterChange">
                <template v-slot:prepend>
                    <q-icon name="search" />
                </template>
            </q-input>
        </div>

        <!-- Dynamic Filter Selects -->
        <template v-for="(filter, index) in filterOptions" :key="index">
            <div :class="getColumnClass()">
                <q-select v-model="localFilters[filter.field]" outlined dense clearable :options="filter.options"
                    :option-label="filter.optionLabel || 'label'" :option-value="filter.optionValue || 'value'"
                    emit-value map-options
                    :label="filter.label" class="full-width" @update:model-value="emitFilterChange">
                    <template v-slot:prepend>
                        <q-icon :name="filter.icon || 'filter_list'" />
                    </template>
                </q-select>
            </div>
        </template>

        <!-- Reset Button -->
        <div :class="getColumnClass(true)" v-if="showResetButton">
            <q-btn color="primary" class="full-width elegant-reset-btn" icon="refresh" outline
                :label="resetLabel || $t('common.reset', 'Reset')" @click="resetFilters" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

export interface FilterOption {
    field: string;
    label: string;
    options: Array<{ label: string; value: string | number } | string>;
    icon?: string;
    optionLabel?: string;
    optionValue?: string;
}

export interface FilterState {
    search?: string;
    [key: string]: string | number | null | undefined;
}

interface Props {
    filters?: FilterState;
    filterOptions?: FilterOption[];
    showSearchInput?: boolean;
    searchLabel?: string;
    resetLabel?: string;
    showResetButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    filters: () => ({ search: '' }),
    filterOptions: () => [],
    showSearchInput: true,
    searchLabel: '',
    resetLabel: '',
    showResetButton: true,
});

const emit = defineEmits<{
    'update:filters': [filters: FilterState];
    'filter-change': [filters: FilterState];
    'reset': [];
}>();

// Create a reactive copy of the filters
const localFilters = reactive<FilterState>({
    search: '',
    ...props.filters
});

// Watch for changes from parent
watch(() => props.filters, (newFilters) => {
    // Only update if the values are actually different
    Object.keys(newFilters).forEach(key => {
        if (localFilters[key] !== newFilters[key]) {
            localFilters[key] = newFilters[key];
        }
    });
}, { deep: true });

// Calculate column width based on total number of filters
function getColumnClass(isResetButton = false) {
    // Calculate total elements (filters + search + reset)
    let totalElements = props.filterOptions.length;
    if (props.showSearchInput) totalElements++;
    if (props.showResetButton) totalElements++;

    // If there are 4 or fewer total elements, use a more generous width
    if (totalElements <= 2) {
        return isResetButton ? 'col-md-4 col-sm-6 col-xs-12' : 'col-md-4 col-sm-6 col-xs-12';
    } else if (totalElements <= 4) {
        return isResetButton ? 'col-md-2 col-sm-6 col-xs-12' : 'col-md-3 col-sm-6 col-xs-12';
    }

    // For more elements, use narrower columns
    return isResetButton ? 'col-md-2 col-sm-6 col-xs-12' : 'col-md-2 col-sm-6 col-xs-12';
}

// Reset all filters to their initial state
function resetFilters() {
    Object.keys(localFilters).forEach(key => {
        localFilters[key] = '';
    });
    emit('reset');
    emit('update:filters', { ...localFilters });
    emit('filter-change', { ...localFilters });
}

// Emit filter changes to parent
function emitFilterChange() {
    emit('update:filters', { ...localFilters });
    emit('filter-change', { ...localFilters });
}
</script>

<style lang="scss" scoped>
// You can add custom styling here if needed</style>
