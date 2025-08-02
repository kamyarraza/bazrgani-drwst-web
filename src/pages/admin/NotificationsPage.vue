<template>
    <q-page class="admin-notifications-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="row items-center justify-between">
                <div class="col-auto">
                    <div class="page-title-section">
                        <h2 class="page-title">{{ t('admin.sendNotification.title', 'Send Notification') }}</h2>
                        <p class="page-subtitle">{{ t('admin.sendNotification.subtitle', 'Send notifications to users
                            across the system') }}</p>
                    </div>
                </div>
                <div class="col-auto">
                    <q-btn :label="t('common.back', 'Back')" :icon="isRTL ? 'arrow_forward' : 'arrow_back'"
                        color="grey-6" flat @click="goBack" />
                </div>
            </div>
        </div>

        <!-- Notification Sender Component -->
        <NotificationSender />
    </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useRTL } from 'src/composables/useRTL';
import NotificationSender from 'src/components/admin/NotificationSender.vue';

const { t } = useI18n();
const router = useRouter();
const { isRTL } = useRTL();

function goBack() {
    router.back();
}
</script>

<style lang="scss" scoped>
.admin-notifications-page {
    padding: 24px;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
    margin-bottom: 32px;
}

.page-title-section {
    .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: #1976d2;
        margin: 0 0 8px 0;
    }

    .page-subtitle {
        font-size: 1rem;
        color: #666;
        margin: 0;
    }
}

@media (max-width: 768px) {
    .admin-notifications-page {
        padding: 16px;
    }

    .page-title {
        font-size: 1.5rem;
    }
}
</style>
