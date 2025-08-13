<template>
  <div v-if="showBottom" class="pagination-container q-mt-md">
    <div class="row no-wrap items-center justify-end q-pa-sm q-gutter-sm">
      <q-pagination
        v-model="localPage"
        :max="Math.max(1, maxPage)"
        :max-pages="6"
        direction-links
        boundary-links
        color="primary"
        active-color="primary"
        :ripple="false"
        size="sm"
        :icon-first="isRtl ? 'last_page' : 'first_page'"
        :icon-last="isRtl ? 'first_page' : 'last_page'"
        :icon-prev="isRtl ? 'chevron_right' : 'chevron_left'"
        :icon-next="isRtl ? 'chevron_left' : 'chevron_right'"
        @update:model-value="emit('page-change', localPage)"
      />
      <div class="page-info">{{ localPage }} / {{ Math.max(1, maxPage) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  showBottom: boolean;
  currentPage: number;
  maxPage: number;
  total: number;
  isRtl?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isRtl: false
});

const emit = defineEmits<{ 'page-change': [page: number] }>();

const localPage = ref(props.currentPage || 1);
const isRtl = props.isRtl;

watch(() => props.currentPage, (newPage) => {
  localPage.value = newPage || 1;
});
</script>

<style scoped>
.pagination-container {
  background: transparent;
}

.page-info {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(107, 114, 128, 0.08);
}

:deep(.q-pagination) {
  --q-btn-padding: 0 8px;
}

:deep(.q-pagination .q-btn) {
  border-radius: 6px;
}
</style>
