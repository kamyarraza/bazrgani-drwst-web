<!-- Error page for unauthorized access -->
<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <q-icon name="block" size="4rem" color="negative" class="q-mb-md" />
      <h2 class="unauthorized-title">{{ $t('error.unauthorized.title') }}</h2>
      <p class="unauthorized-message">
        {{ message || $t('error.unauthorized.message') }}
      </p>
      <div class="unauthorized-actions">
        <q-btn
          color="primary"
          @click="goToDashboard"
          :label="$t('common.backToDashboard')"
          class="q-mr-md"
        />
        <q-btn
          color="secondary"
          outline
          @click="goBack"
          :label="$t('common.goBack')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/authStore';

interface Props {
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: ''
});

const router = useRouter();
const { t: _t } = useI18n();
const authStore = useAuthStore();

// Set unauthorized error in auth store for global notification
if (props.message) {
  authStore.setUnauthorizedError(props.message);
}

const goToDashboard = async () => {
  await router.push('/');
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.unauthorized-card {
  text-align: center;
  max-width: 500px;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.unauthorized-title {
  color: #e53e3e;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.unauthorized-message {
  color: #4a5568;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
}

.unauthorized-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
