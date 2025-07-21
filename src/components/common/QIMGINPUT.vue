<template>
  <div class="q-gutter-sm row items-start">
    <q-uploader
      :url="url"
      style="max-width: 300px"
      accept="image/*"
      @added="onFileAdded"
      @uploaded="onUploaded"
      @failed="onFailed"
      label="Upload Image"
      color="primary"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({
  url: {
    type: String,
    default: "http://localhost:9000/"
  }
})

const emit = defineEmits(['file-selected', 'uploaded', 'failed'])

const onFileAdded = (files: readonly File[]) => {
  // Emit the file to parent when added to uploader
  if (files && files.length > 0) {
    emit('file-selected', files[0])
  }
}

interface UploadResponse {
  xhr: {
    response: string
  }
}

const onUploaded = (info: UploadResponse) => {
  emit('uploaded', info.xhr.response)
}

interface FailedResponse {
  xhr?: unknown;
  error?: string;
  status?: number;
}

const onFailed = (info: FailedResponse) => {
  emit('failed', info)
}
</script>

<style scoped>
/* You can add custom styles here */
</style>
