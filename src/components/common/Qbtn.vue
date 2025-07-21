<template> <q-btn :push="isPush" :color="btnColor" :label="btnLabel" :disable="isDisabled" :flat="isFlat"
        :loading="isLoading" :no-caps="noCaps" :rounded="isRounded" :ripple="hasRipple" :fab="isFab"
        @click="handleClick">
        <template v-slot:loading>
            <slot name="loading">
                <q-spinner-dots />
            </slot>
        </template>
        <template v-slot:default>
            <slot></slot>
        </template>
    </q-btn>
</template>

<script setup lang="ts">
// Define props with TypeScript interface
interface ButtonProps {
    isPush?: boolean; // Controls push effect
    btnColor?: string; // Button color (primary, secondary, etc.)
    btnLabel: string; // Button text label
    isDisabled?: boolean; // Disable state
    isFlat?: boolean; // Flat style
    isLoading?: boolean; // Loading state
    noCaps?: boolean; // Controls text capitalization
    isRounded?: boolean; // Controls rounded corners
    hasRipple?: boolean; // Controls ripple effect
    isFab?: boolean; // Controls FAB style
}

// Define props with default values
withDefaults(defineProps<ButtonProps>(), {
    isPush: false,
    btnColor: 'primary',
    isDisabled: false,
    isFlat: false,
    isLoading: false,
    noCaps: true,
    isRounded: false,
    hasRipple: true,
    isFab: false
});

// Define emits for click event
const emit = defineEmits(['click']);

// Handle click event and emit it up to parent
function handleClick() {
    emit('click');
}
</script>
