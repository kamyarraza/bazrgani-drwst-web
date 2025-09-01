<template>
  <div class="maintenance-page">
    <!-- Background with subtle gradient -->
    <div class="background"></div>

    <!-- Main content container -->
    <div class="content">
      <!-- Icon with animation -->
      <div class="icon-container">
        <div class="icon-wrapper">
          <q-icon name="build" class="main-icon" />
          <div class="pulse-ring"></div>
        </div>
      </div>

      <!-- Text content -->
      <div class="text-content">
        <h1 class="title">{{ $t('maintenance.title', 'Under Maintenance') }}</h1>
        <p class="description">
          {{ $t('maintenance.description', 'We\'re currently performing some maintenance on our site. We\'ll be back shortly!') }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <q-btn
          unelevated
          color="primary"
          size="lg"
          class="action-btn"
          @click="checkStatus"
          :loading="checking"
          no-caps
        >
          <q-icon name="refresh" left />
          {{ $t('maintenance.checkStatus', 'Check Status') }}
        </q-btn>

        <q-btn
          outline
          color="primary"
          size="lg"
          class="action-btn"
          @click="goHome"
          no-caps
        >
          <q-icon name="home" left />
          {{ $t('maintenance.goHome', 'Go Home') }}
        </q-btn>

        <!-- Test button for development -->
        <q-btn
          flat
          color="grey"
          size="sm"
          class="action-btn"
          @click="testMaintenanceMode"
          no-caps
        >
          <q-icon name="bug_report" left />
          Test 503
        </q-btn>
      </div>

      <!-- Status indicator -->
      <div class="status-indicator">
        <div class="status-dot"></div>
        <span class="status-text">{{ $t('maintenance.autoChecking', 'Auto-checking every 30 seconds') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'

const router = useRouter()
const checking = ref(false)
let statusCheckInterval: NodeJS.Timeout | null = null

// Get the same base URL as axios configuration
const getApiBaseUrl = () => {
  // You can easily change this to any of the 3 APIs:
  // 1. https://dev-warehouse-api.bazrganidrwst.com/api
  // 2. https://warehouse-api.bazrganidrwst.com/api
  // 3. http://localhost:4000/api
  // return 'https://dev-warehouse-api.bazrganidrwst.com/api'
  return 'https://warehouse-api.bazrganidrwst.com/api'
  // return 'http://localhost:4000/api'
}

// Auto-check server status every 30 seconds
const startAutoStatusCheck = () => {
  statusCheckInterval = setInterval(() => {
    void (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${getApiBaseUrl()}/details`, {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // Server is back online, clear flag and reload
          sessionStorage.removeItem('maintenance_mode');
          // location.reload();
          sessionStorage.removeItem('maintenance_mode');
          void router.push('/')
          console.log('Server is back online, redirecting to home');

        }
      } catch {
        // Server still down, continue waiting
      }
    })();
  }, 30000); // Check every 30 seconds
}

onMounted(() => {
  startAutoStatusCheck();
})

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
})

const checkStatus = async () => {
  checking.value = true
  try {
    // Clear maintenance mode flag
    sessionStorage.removeItem('maintenance_mode');

    // Try to check if server is back online with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${getApiBaseUrl()}/details`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      // Server is back online, reload the page
      // location.reload();
      goHome();
    } else {
      // Still in maintenance, show message
      alert('Server is still under maintenance. Please try again later.');
    }
  } catch {
    // Network error or server still down
    alert('Server is still under maintenance. Please try again later.');
  } finally {
    checking.value = false
  }
}

const goHome = () => {
  // Clear maintenance mode flag when user manually tries to go home
  sessionStorage.removeItem('maintenance_mode');
  void router.push('/')
}

const testMaintenanceMode = () => {
  // Simulate a 503 error for testing
  console.log('Testing maintenance mode');
  sessionStorage.setItem('maintenance_mode', 'true');
  alert('Maintenance mode activated! Refresh the page to test the redirect.');
}
</script>

<style scoped lang="scss">
.maintenance-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.content {
  text-align: center;
  max-width: 500px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease-out;
}

.icon-container {
  margin-bottom: 2rem;
}

.icon-wrapper {
  position: relative;
  display: inline-block;
}

.main-icon {
  font-size: 4rem;
  color: #667eea;
  animation: float 3s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.text-content {
  margin-bottom: 2.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.description {
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.6;
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 140px;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0.7;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #48bb78;
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}

.status-text {
  font-size: 0.9rem;
  color: #718096;
}

// Animations
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

// Responsive design
@media (max-width: 768px) {
  .maintenance-page {
    padding: 1rem;
  }

  .content {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .description {
    font-size: 1rem;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
  }

  .main-icon {
    font-size: 3rem;
  }

  .pulse-ring {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 1.5rem 1rem;
  }

  .title {
    font-size: 1.8rem;
  }

  .main-icon {
    font-size: 2.5rem;
  }

  .pulse-ring {
    width: 80px;
    height: 80px;
  }
}
</style>
