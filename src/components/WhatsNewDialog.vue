<template>
    <q-dialog v-model="show" persistent>
        <q-card class="changelog-card" style="min-width: 400px; max-width: 500px;">
            <q-card-section class="bg-primary text-white text-center q-pa-lg">
                <q-icon name="celebration" size="3em" class="q-mb-md" />
                <div class="text-h5 text-weight-bold">{{ t('version.whatsNew') }}</div>
                <div class="text-subtitle2 q-mt-xs opacity-80">{{ t('version.subtitle', { version }) }}</div>
            </q-card-section>

            <q-card-section class="q-pa-lg">
                <div v-if="changes.length === 0" class="text-center text-grey-6">
                    <q-icon name="info" size="2em" class="q-mb-md" />
                    <div>{{ t('version.noChanges') }}</div>
                </div>
                <div v-else>
                    <br>
                    <div class="text-subtitle1 text-weight-medium q-mb-md text-grey-8">
                        ✨ {{ t('version.changelog') }}:
                    </div>
                    <q-list separator>
                        <q-item v-for="(change, idx) in changes" :key="idx" class="q-px-none">
                            <q-item-section avatar>
                                <q-icon name="bolt" color="teal-5" size="xs" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-body2">{{ change }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="center" class="q-pa-md">
                <q-btn unelevated rounded color="primary" icon="thumb_up" :label="t('version.gotItThanks')"
                    @click="close" class="q-px-xl" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import changelog from 'src/changelog'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const version = import.meta.env.VITE_APP_VERSION
const changes = changelog[version] || []

const show = ref(false)

onMounted(() => {
    const lastSeenVersion = localStorage.getItem('app_version')
    if (lastSeenVersion !== version) {
        show.value = true
        localStorage.setItem('app_version', version)
    }
})

function close() {
    show.value = false
}
</script>

<style scoped>
.changelog-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.changelog-card .q-card__section--vert {
    padding: 0;
}
</style>