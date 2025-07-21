<template>
  <div class="fullscreen error-page">
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
    <div class="error-container">
      <!-- Animated 404 Number -->
      <div class="error-number-container">
        <div class="error-number">
          <span class="digit digit-4-1">4</span>
          <div class="digit digit-0">
            <div class="zero-inner">
              <div class="astronaut">
                <q-icon name="person" class="astronaut-icon" />
              </div>
            </div>
          </div>
          <span class="digit digit-4-2">4</span>
        </div>
      </div>

      <!-- Content Section -->
      <div class="error-content">
        <h1 class="error-title">{{ $t('error.pageNotFound.title') }}</h1>
        <p class="error-description">{{ $t('error.pageNotFound.description') }}</p>

        <!-- Fun Facts or Tips -->
        <div class="fun-section">
          <q-icon name="lightbulb" class="tip-icon" />
          <p class="tip-text">Did you know? The term "404" comes from Room 404 at CERN where the web was born!</p>
        </div>

        <!-- Action Buttons -->
        <div class="error-actions">
          <q-btn
            unelevated
            rounded
            size="lg"
            class="action-btn primary-btn modern-btn"
            @click="goHome"
            no-caps
          >
            <q-icon name="home" left size="1.2rem" />
            {{ $t('error.pageNotFound.goHome') }}
          </q-btn>


        </div>

        <!-- Quick Links -->
        <div class="quick-links">
          <p class="quick-links-title">{{ $t('error.pageNotFound.quickLinks') }}:</p>
          <div class="links-grid">
            <q-btn
              flat
              rounded
              class="quick-link modern-link"
              @click="navigateTo('/dashboard')"
              no-caps
            >
              <q-icon name="dashboard" left />
              {{ $t('sidebar.dashboard') }}
            </q-btn>
            <q-btn
              flat
              rounded
              class="quick-link modern-link"
              @click="navigateTo('/items')"
              no-caps
            >
              <q-icon name="inventory" left />
              {{ $t('sidebar.items') }}
            </q-btn>
            <q-btn
              flat
              rounded
              class="quick-link modern-link"
              @click="navigateTo('/reports')"
              no-caps
            >
              <q-icon name="assessment" left />
              {{ $t('sidebar.reports') }}
            </q-btn>
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

const goHome = () => {
  void router.push('/')
}

const navigateTo = (path: string) => {
  void router.push(path)
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
.error-page {
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
.error-container {
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

// 404 Number Design
.error-number-container {
  margin-bottom: 2rem;
}

.error-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 8rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.digit {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;

  &.digit-4-1 {
    animation-delay: 0s;
  }

  &.digit-4-2 {
    animation-delay: 0.4s;
  }
}

.digit-0 {
  position: relative;
  width: 120px;
  height: 120px;
  border: 8px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 10s linear infinite;

  .zero-inner {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: counter-spin 10s linear infinite;
  }
}

.astronaut {
  .astronaut-icon {
    font-size: 2.5rem;
    color: white;
    animation: wave 2s ease-in-out infinite;
  }
}

// Content Styling
.error-content {
  color: white;
  width: 100%;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: fade-in-up 1s ease-out;
}

.error-description {
  font-size: 1.2rem;
  margin: 1.5rem 0 2rem;
  opacity: 0.9;
  line-height: 1.6;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: fade-in-up 1s ease-out 0.2s both;
}

// Fun Section
.fun-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fade-in-up 1s ease-out 0.4s both;

  .tip-icon {
    font-size: 1.5rem;
    color: #ffd700;
    margin-right: 0.5rem;
    animation: glow 2s ease-in-out infinite alternate;
  }

  .tip-text {
    font-size: 0.95rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.85;
    font-style: italic;
  }
}

// Action Buttons
.error-actions {
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

// Quick Links
.quick-links {
  margin-top: 2.5rem;
  animation: fade-in-up 1s ease-out 0.8s both;

  .quick-links-title {
    font-size: 1rem;
    margin-bottom: 1.2rem;
    opacity: 0.9;
    font-weight: 600;
    color: white;
  }

  .links-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .modern-link {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 10px;
    backdrop-filter: blur(5px);
    min-width: 120px;

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
      margin-right: 0.5rem;
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

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
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

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(20deg);
  }
  75% {
    transform: rotate(-20deg);
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
  .error-container {
    padding: 2rem 1rem;
    margin: 1rem;
  }

  .error-number {
    font-size: 4rem;
    gap: 0.5rem;
  }

  .digit-0 {
    width: 80px;
    height: 80px;

    .zero-inner {
      width: 50px;
      height: 50px;
    }
  }

  .astronaut-icon {
    font-size: 1.5rem !important;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }

  .action-btn {
    width: 100%;
    max-width: 280px;
  }

  .links-grid {
    flex-direction: column;
    align-items: center;
  }

  .quick-link {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .error-page {
    padding: 1rem;
  }

  .error-number {
    font-size: 3rem;
  }

  .digit-0 {
    width: 60px;
    height: 60px;

    .zero-inner {
      width: 35px;
      height: 35px;
    }
  }

  .astronaut-icon {
    font-size: 1rem !important;
  }

  .fun-section {
    padding: 0.8rem 1rem;
  }

  .tip-text {
    font-size: 0.85rem;
  }
}
</style>
