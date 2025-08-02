<template>
    <q-page class="test-notifications-page q-pa-lg">
        <h2>Test Notifications Page</h2>
        <p>If you can see this page, the routing is working correctly.</p>

        <q-btn label="Go Back Home" color="primary" @click="$router.push('/')" class="q-mt-md" />

        <div class="q-mt-lg">
            <h4>Trying to load NotificationSender component...</h4>
            <div class="notification-test">
                <Suspense>
                    <template #default>
                        <NotificationSender />
                    </template>
                    <template #fallback>
                        <div>Loading notification sender...</div>
                    </template>
                </Suspense>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// Import the NotificationSender component
const NotificationSender = defineAsyncComponent(() => import('src/components/admin/NotificationSender.vue'));
</script>

<style scoped>
.test-notifications-page {
    max-width: 800px;
    margin: 0 auto;
}

.notification-test {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
}
</style>
