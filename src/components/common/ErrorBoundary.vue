<template>
  <div v-if="error" class="error-boundary q-pa-xl text-center">
    <div class="q-mb-lg">
      <q-icon name="error_outline" size="4rem" color="negative" />
    </div>

    <h4 class="text-h4 q-mb-md">{{ $t('error.somethingWentWrong', 'Something went wrong') }}</h4>

    <p class="text-body1 q-mb-xl text-grey-7">
      {{ $t('error.appCrashed', 'The application encountered an unexpected error. You can try refreshing the page or contact support if the problem persists.') }}
    </p>

    <div class="q-gutter-md">
      <q-btn
        color="primary"
        :label="$t('error.refreshPage', 'Refresh Page')"
        icon="refresh"
        @click="refreshPage"
      />

      <q-btn
        color="secondary"
        flat
        :label="$t('error.goHome', 'Go to Home')"
        icon="home"
        @click="goHome"
      />

      <q-btn
        v-if="showErrorDetails"
        color="grey"
        flat
        :label="$t('error.hideDetails', 'Hide Details')"
        icon="expand_less"
        @click="toggleErrorDetails"
      />
      <q-btn
        v-else
        color="grey"
        flat
        :label="$t('error.showDetails', 'Show Details')"
        icon="expand_more"
        @click="toggleErrorDetails"
      />
    </div>

    <div v-if="showErrorDetails" class="q-mt-xl">
      <q-card flat bordered class="text-left">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ $t('error.technicalDetails', 'Technical Details') }}</div>
          <pre class="text-caption text-red-7">{{ errorMessage }}</pre>
          <pre v-if="errorStack" class="text-caption text-grey-6 q-mt-md">{{ errorStack }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const error = ref<Error | null>(null);
const errorMessage = ref<string>('');
const errorStack = ref<string>('');
const showErrorDetails = ref(false);

// Capture errors from child components
onErrorCaptured((err: Error, instance, info) => {
  console.error('Error captured by ErrorBoundary:', err, info);

  // error.value = err;
  // errorMessage.value = err.message || 'Unknown error';
  // errorStack.value = err.stack || '';

  // Prevent the error from propagating further
  return false;
});

function refreshPage() {
  window.location.reload();
}

async function goHome() {
  try {
    await router.push('/');
    error.value = null;
  } catch {
    // If router fails, fallback to window location
    window.location.href = '/';
  }
}

function toggleErrorDetails() {
  showErrorDetails.value = !showErrorDetails.value;
}

// Reset error when navigating
router.afterEach(() => {
  error.value = null;
  showErrorDetails.value = false;
});
</script>

<style scoped>
.error-boundary {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}
</style>
