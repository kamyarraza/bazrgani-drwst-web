<template>
    <q-page class="simple-notifications-page q-pa-lg">
        <div class="test-container">
            <h1>🔔 Admin Notifications</h1>
            <p>This is the simple notifications page - if you can see this, the routing is working!</p>

            <div class="test-info">
                <h3>Current Route Info:</h3>
                <ul>
                    <li><strong>Path:</strong> {{ $route.path }}</li>
                    <li><strong>Name:</strong> {{ $route.name }}</li>
                    <li><strong>Timestamp:</strong> {{ new Date().toLocaleString() }}</li>
                </ul>
            </div>

            <q-btn label="Go Back to Dashboard" color="primary" icon="home" @click="$router.push('/')"
                class="q-mt-lg" />

            <q-btn label="Try Loading Notification Sender" color="secondary" icon="notifications"
                @click="showNotificationSender = true" class="q-mt-lg q-ml-md" />

            <div v-if="showNotificationSender" class="q-mt-lg">
                <q-card class="q-pa-md">
                    <q-card-section>
                        <h4>Loading NotificationSender Component...</h4>
                        <div v-if="componentError" class="text-negative">
                            <strong>Error loading component:</strong> {{ componentError }}
                        </div>
                        <div v-else>
                            <NotificationSender />
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const showNotificationSender = ref(false);
const componentError = ref('');

// Import the component conditionally
let NotificationSender: any = null;
try {
    NotificationSender = (await import('src/components/admin/NotificationSender.vue')).default;
} catch (error) {
    console.error('Failed to import NotificationSender:', error);
    componentError.value = String(error);
}

// Catch any errors from the component
onErrorCaptured((error) => {
    console.error('Component error:', error);
    componentError.value = String(error);
    return false;
});
</script>

<style scoped>
.simple-notifications-page {
    max-width: 1000px;
    margin: 0 auto;
    background: #f5f5f5;
    min-height: 100vh;
}

.test-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.test-info {
    background: #e3f2fd;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
}

.test-info ul {
    margin: 0;
    padding-left: 20px;
}

.test-info li {
    margin: 5px 0;
}
</style>
