<template>
  <div class="fullscreen maintenance-page">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="maintenance-container">
      <!-- Animated Maintenance Icon -->
      <div class="maintenance-icon-container">
        <div class="maintenance-icon">
          <div class="gear-container">
            <q-icon name="build" class="gear-icon gear-1" />
            <q-icon name="settings" class="gear-icon gear-2" />
            <q-icon name="engineering" class="gear-icon gear-3" />
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="maintenance-content">
        <h1 class="maintenance-title">{{ $t('maintenance.title') }}</h1>
        <p class="maintenance-description">{{ $t('maintenance.description') }}</p>

        <!-- Features Section -->
        <div class="features-section">
          <q-icon name="auto_awesome" class="feature-icon" />
          <p class="feature-text">{{ $t('maintenance.featuresText') }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="maintenance-actions">
          <q-btn
            unelevated
            rounded
            size="lg"
            class="action-btn primary-btn modern-btn"
            @click="checkStatus"
            no-caps
          >
            <q-icon name="refresh" left size="1.2rem" />
            {{ $t('maintenance.checkStatus') }}
          </q-btn>

          <q-btn
            outline
            rounded
            size="lg"
            class="action-btn secondary-btn modern-btn"
            @click="goHome"
            no-caps
          >
            <q-icon name="home" left size="1.2rem" />
            {{ $t('maintenance.goHome') }}
          </q-btn>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <p class="features-title">{{ $t('maintenance.whatWeAreDoing') }}:</p>
          <div class="features-list">
            <div class="feature-item">
              <q-icon name="build_circle" />
              {{ $t('maintenance.features.improvements') }}
            </div>
            <div class="feature-item">
              <q-icon name="security" />
              {{ $t('maintenance.features.security') }}
            </div>
            <div class="feature-item">
              <q-icon name="speed" />
              {{ $t('maintenance.features.performance') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Particles Effect -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const checkStatus = () => {
  location.reload()
}

const goHome = () => {
  void router.push('/')
}

// Generate random styles for particles
const getParticleStyle = (_index: number) => {
  const delay = Math.random() * 5
  const duration = 3 + Math.random() * 4
  const size = 2 + Math.random() * 6
  const left = Math.random() * 100

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
  }
}
</script>

<style scoped lang="scss">
.maintenance-page {
  background: var(--q-primary);
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

// Animated Background
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float-around 20s infinite linear;

  &.shape-1 {
    width: 80px;
    height: 80px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &.shape-2 {
    width: 120px;
    height: 120px;
    top: 60%;
    right: 15%;
    animation-delay: -5s;
    animation-duration: 25s;
  }

  &.shape-3 {
    width: 60px;
    height: 60px;
    bottom: 20%;
    left: 20%;
    animation-delay: -10s;
    animation-duration: 30s;
  }

  &.shape-4 {
    width: 100px;
    height: 100px;
    top: 30%;
    right: 30%;
    animation-delay: -15s;
  }

  &.shape-5 {
    width: 40px;
    height: 40px;
    bottom: 40%;
    right: 10%;
    animation-delay: -8s;
    animation-duration: 22s;
  }
}

// Main Container
.maintenance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  z-index: 2;
  position: relative;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 3rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

// Maintenance Icon Design
.maintenance-icon-container {
  margin-bottom: 2rem;
}

.maintenance-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.gear-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gear-icon {
  position: absolute;
  color: white;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  &.gear-1 {
    font-size: 4rem;
    animation: spin 8s linear infinite;
    z-index: 3;
  }

  &.gear-2 {
    font-size: 2.5rem;
    top: -10px;
    right: -10px;
    animation: counter-spin 6s linear infinite;
    z-index: 2;
    opacity: 0.8;
  }

  &.gear-3 {
    font-size: 2rem;
    bottom: -5px;
    left: -5px;
    animation: spin 10s linear infinite;
    z-index: 1;
    opacity: 0.6;
  }
}

// Content Styling
.maintenance-content {
  color: white;
  width: 100%;
}

.maintenance-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: fade-in-up 1s ease-out;
}

.maintenance-description {
  font-size: 1.2rem;
  margin: 1.5rem 0 2rem;
  opacity: 0.9;
  line-height: 1.6;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: fade-in-up 1s ease-out 0.2s both;
}

// Features Section
.features-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fade-in-up 1s ease-out 0.4s both;

  .feature-icon {
    font-size: 1.5rem;
    color: #ffd700;
    margin-right: 0.5rem;
    animation: glow 2s ease-in-out infinite alternate;
  }

  .feature-text {
    font-size: 0.95rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.85;
    font-style: italic;
  }
}

// Action Buttons
.maintenance-actions {
  display: flex;
  gap: 1.5rem;
  margin: 2rem 0;
  animation: fade-in-up 1s ease-out 0.6s both;
  flex-wrap: wrap;
  justify-content: center;
}

.modern-btn {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  text-transform: none;
  letter-spacing: 0.025em;
  min-width: 160px;

  &.primary-btn {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    color: var(--q-primary);
    border: 2px solid transparent;
    box-shadow:
      0 4px 14px 0 rgba(255, 255, 255, 0.2),
      0 2px 6px 0 rgba(255, 255, 255, 0.1);

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 6px 20px 0 rgba(255, 255, 255, 0.25),
        0 4px 12px 0 rgba(255, 255, 255, 0.15);
      background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &.secondary-btn {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// Features Grid
.features-grid {
  margin-top: 2.5rem;
  animation: fade-in-up 1s ease-out 0.8s both;

  .features-title {
    font-size: 1rem;
    margin-bottom: 1.2rem;
    opacity: 0.9;
    font-weight: 600;
    color: white;
  }

  .features-list {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .feature-item {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 10px;
    backdrop-filter: blur(5px);
    min-width: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: translateY(0);
    }

    .q-icon {
      font-size: 1rem;
    }
  }
}

// Particles Effect
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-fall linear infinite;
}

// Animations
@keyframes float-around {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(20px) rotate(240deg);
  }
  100% {
    transform: translateY(0px) rotate(360deg);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes counter-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #ffd700;
  }
  to {
    text-shadow: 0 0 20px #ffd700, 0 0 30px #ffd700;
  }
}

@keyframes particle-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .maintenance-container {
    padding: 2rem 1rem;
    margin: 1rem;
  }

  .gear-container {
    width: 80px;
    height: 80px;
  }

  .gear-icon {
    &.gear-1 {
      font-size: 2.5rem;
    }

    &.gear-2 {
      font-size: 1.8rem;
    }

    &.gear-3 {
      font-size: 1.5rem;
    }
  }

  .maintenance-title {
    font-size: 2rem;
  }

  .maintenance-description {
    font-size: 1rem;
  }

  .maintenance-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }

  .modern-btn {
    width: 100%;
    max-width: 280px;
  }

  .features-list {
    flex-direction: column;
    align-items: center;
  }

  .feature-item {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .maintenance-page {
    padding: 1rem;
  }

  .gear-container {
    width: 60px;
    height: 60px;
  }

  .gear-icon {
    &.gear-1 {
      font-size: 2rem;
    }

    &.gear-2 {
      font-size: 1.4rem;
    }

    &.gear-3 {
      font-size: 1.2rem;
    }
  }

  .features-section {
    padding: 0.8rem 1rem;
  }

  .feature-text {
    font-size: 0.85rem;
  }
}
</style>
