<template>
  <div class="page-header" :class="{ 'no-wave': !showWaves }">
    <div class="header-content">
      <div class="header-left">
        <h1 class="header-title">{{ title }} <span v-if="titleSecondary" class="">{{ titleSecondary }}</span></h1>
        <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-illustration" v-if="icon">
        <div v-if="showWaves" class="animated-waves"></div>
        <div v-if="showWaves" class="animated-waves second"></div>
        <div v-if="showWaves" class="animated-waves third"></div>
        <div class="header-icon">
          <q-icon :name="icon" :size="iconSize" :color="iconColor" />
        </div>
      </div>
      <!-- Optional slot for additional content on the right side -->
      <div class="header-right" v-if="$slots.right">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps({
  // Main title text
  title: {
    type: String,
    required: true
  },
  // Optional secondary title (with different color)
  titleSecondary: {
    type: String,
    default: ''
  },
  // Optional subtitle text
  subtitle: {
    type: String,
    default: ''
  },
  // Icon name (from material icons)
  icon: {
    type: String,
    default: ''
  },
  // Icon size (with unit)
  iconSize: {
    type: String,
    default: '3rem'
  },
  // Icon color
  iconColor: {
    type: String,
    default: 'white'
  },
  // Whether to show animated waves
  showWaves: {
    type: Boolean,
    default: true
  },
  // Header background color (CSS value)
  backgroundColor: {
    type: String,
    default: ''
  }
});
</script>

<style lang="scss" scoped>
// Amazing, eye-relaxing header
.page-header {
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  height: 200px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  box-shadow: 0 10px 30px rgba(42, 123, 155, 0.15);

  .header-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
  }

  .header-left {
    color: white;
  }

  .header-title {
    font-size: 2.5rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-top: 0.5rem;
  }

  .header-illustration {
    position: relative;
    height: 160px;
    width: 160px;
  }

  .header-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.15);
    height: 80px;
    width: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    z-index: 5;
  }

  .animated-waves {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 160px;
    width: 160px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 45% 55% 70% 30% / 30% 40% 60% 70%;
    animation: morphing 8s ease-in-out infinite;
    opacity: 0.6;

    &.second {
      height: 120px;
      width: 120px;
      animation-delay: -2s;
      opacity: 0.4;
      background: rgba(255, 255, 255, 0.15);
    }

    &.third {
      height: 90px;
      width: 90px;
      animation-delay: -4s;
      background: rgba(255, 255, 255, 0.2);
    }
  }

  @keyframes morphing {
    0% {
      border-radius: 45% 55% 70% 30% / 30% 40% 60% 70%;
    }
    25% {
      border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%;
    }
    50% {
      border-radius: 30% 60% 70% 40% / 50% 30% 70% 50%;
    }
    75% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    }
    100% {
      border-radius: 45% 55% 70% 30% / 30% 40% 60% 70%;
    }
  }

  &.no-wave {
    .header-illustration {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon {
      position: static;
      transform: none;
    }
  }
}

// Responsive styles
@media (max-width: 1023px) {
  .page-header {
    height: 180px;

    .header-title {
      font-size: 2rem;
    }

    .header-subtitle {
      font-size: 1rem;
    }
  }
}

@media (max-width: 599px) {
  .page-header {
    height: auto;
    padding: 2rem 1rem;

    .header-content {
      flex-direction: column;
      text-align: center;
      padding: 1rem;
    }

    .header-left {
      margin-bottom: 1rem;
    }

    .header-title {
      font-size: 1.75rem;
    }

    .header-subtitle {
      font-size: 0.9rem;
    }

    .header-illustration {
      height: 120px;
      width: 120px;
    }
  }
}
</style>
