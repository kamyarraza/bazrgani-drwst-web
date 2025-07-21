<template>
    <q-menu @hide="$emit('hide-menu')" v-model="model" transition-show="scale" transition-hide="scale">
        <q-list :style="{ minWidth }">
            <q-item v-for="(item, index) in menuItems" :key="index" clickable @click="onItemClick(item, index)">
                <q-item-section avatar v-if="item.icon">
                    <q-icon :name="item.icon" />
                </q-item-section>
                <q-item-section>{{ item.label }}</q-item-section>
            </q-item>

            <q-separator v-if="hasSeparator && extraItem" />

            <q-item v-if="extraItem" clickable @click="onItemClick(extraItem, menuItems.length)">
                <q-item-section avatar v-if="extraItem.icon">
                    <q-icon :name="extraItem.icon" />
                </q-item-section>
                <q-item-section>{{ extraItem.label }}</q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface MenuItem {
    label: string
    icon?: string
    value?: unknown
}
const model = defineModel<boolean | null>({ default: false })
const props = defineProps<{
    menuItems: MenuItem[]
    extraItem?: MenuItem
    hasSeparator?: boolean
    minWidth?: string
}>()

const emit = defineEmits(['item-click', 'hide-menu'])

const minWidth = props.minWidth ?? '100px'
const hasSeparator = props.hasSeparator ?? true

function onItemClick(item: MenuItem, index: number) {
    emit('item-click', { item, index })
    model.value = false
}
</script>
