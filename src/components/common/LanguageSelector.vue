<template>
    <div class="language-selector">
        <q-btn flat dense round icon="language" color="primary">
            <q-menu anchor="bottom right" self="top right">
                <q-list style="min-width: 100px">
                    <q-item clickable v-close-popup @click="setLocale('en-US')">
                        <q-item-section>English</q-item-section>
                        <q-item-section avatar v-if="locale === 'en-US'">
                            <q-icon name="check" color="primary" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="setLocale('ar')">
                        <q-item-section>العربية</q-item-section>
                        <q-item-section avatar v-if="locale === 'ar'">
                            <q-icon name="check" color="primary" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="setLocale('ckb')">
                        <q-item-section>کوردی</q-item-section>
                        <q-item-section avatar v-if="locale === 'ckb'">
                            <q-icon name="check" color="primary" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </div>
</template>

<script setup lang="ts">
import { useLocale } from 'src/composables/useLocale';

const { locale, setLocale } = useLocale();
</script>

<style scoped>
.language-selector {
    z-index: 9999;
    position: absolute;
    top: 1rem;
    right: 1rem;
}
</style>