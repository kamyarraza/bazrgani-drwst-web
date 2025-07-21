<template>
    <div></div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

interface Props {
    type?: 'positive' | 'negative' | 'warning' | 'info'
    message: string
    duration?: number
    position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'center'
}

const props = withDefaults(defineProps<Props>(), {
    type: 'positive',
    duration: 2500,
    position: 'top'
})

const $q = useQuasar()

const showNotification = (): void => {
    $q.notify({
        type: props.type,
        message: props.message,
        position: props.position,
        timeout: props.duration,
        actions: [
            { icon: 'close', color: 'white', handler: () => { /* closes notification */ } }
        ]
    })
}

defineExpose({
    show: showNotification
})
</script>
