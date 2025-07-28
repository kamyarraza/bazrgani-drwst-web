<template>
    <q-input :id="id" v-model="model" :type="inputType" :label="label" :hint="hint" :placeholder="placeholder" :dense="dense"
        :outlined="outlined" :borderless="borderless" :clearable="clearable" :disable="disable" :readonly="readonly"
        :error="error" :error-message="errorMessage" :prefix="prefix" :suffix="suffix" :rules="rules" class="q-mb-md ov"
        @blur="$emit('blur', $event as FocusEvent)" @focus="$emit('focus', $event as FocusEvent)">
        <template v-if="$slots.before" #before>
            <slot name="before" />
        </template>

        <template v-if="$slots.after" #after>
            <slot name="after" />
        </template>
        <template v-slot:append>
            <q-icon v-if="type === 'password'" :name="isPwd ? 'visibility_off' : 'visibility'" 
              :class="isPwd ? 'cursor-pointer text-grey-5' : 'cursor-pointer text-indigo'" 
              @click="isPwd = !isPwd" />
        </template>
    </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const model = defineModel<string | number>()
const isPwd = ref(false)

const inputType = computed(() => {
    if (props.type === 'password') {
        return isPwd.value ? 'text' : 'password'
    }
    return props.type
})
defineEmits<{
    blur: [event: FocusEvent]
    focus: [event: FocusEvent]
}>()

interface Props {
  id?:string,
    label?: string
    hint?: string
    placeholder?: string
    type?: 'text' | 'password' | 'textarea' | 'email' | 'search' | 'tel' | 'file' | 'url' | 'number' | 'time' | 'date' | 'datetime-local'
    dense?: boolean
    outlined?: boolean,
    borderless?: boolean
    clearable?: boolean
    disable?: boolean
    readonly?: boolean
    error?: boolean
    errorMessage?: string
    prefix?: string
    suffix?: string

    rules?: ((_: string | number | null | undefined) => boolean | string)[]
}

const props = withDefaults(defineProps<Props>(), {

    label: '',
    hint: '',
    placeholder: '',
    borderless: false,
    type: 'text',
    dense: false,
    outlined: false,
    clearable: true,
    disable: false,
    readonly: false,
    error: false,
    errorMessage: '',
    prefix: '',
    suffix: '',
    rules: () => []
})
</script>

<style scoped>
.white-icon {
    color: white !important;
}
.ov :deep(.q-field__native) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ov :deep(.q-field__input) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ov :deep(.q-field__control) {
    overflow: hidden;
}

/* For textarea inputs, allow proper text wrapping */
.ov :deep(.q-field__native[type="textarea"]),
.ov :deep(.q-field__input[type="textarea"]) {
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    overflow-y: auto;
}
</style>
