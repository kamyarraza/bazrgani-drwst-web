<template>
    <q-layout view="lHh Lpr lFf">
        <q-page-container>
            <ErrorBoundary>
                <router-view />
            </ErrorBoundary>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import ErrorBoundary from 'src/components/common/ErrorBoundary.vue';
</script>

<style scoped>
.fullscreen {
    min-height: 100vh;
}
</style>
