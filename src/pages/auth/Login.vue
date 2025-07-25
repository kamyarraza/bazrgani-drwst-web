<template>
  <div class="login-container">
    <!-- Background overlay -->
    <div class="background-overlay"></div>

    <!-- Main content -->
    <div class="login-content">
      <!-- Left side - Brand/Image -->
      <div class="login-left">
        <div class="image-overlay"></div>
        <img src="/login-background.jpg" alt="Brand"
          class="full-background-image" />

        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-circle">
              <q-icon name="business" size="3rem" color="white" />
            </div>
          </div>

          <div class="brand-text">
            <h1 class="brand-title">Turn Clicks Into</h1>
            <h1 class="brand-title-accent">Customers</h1>
            <h2 class="brand-subtitle">Effortlessly</h2>

            <div class="testimonial-card">
              <div class="quote-icon">
                <q-icon name="format_quote" size="2rem" color="rgba(255,255,255,0.7)" />
              </div>

              <p class="testimonial-text">
                "The robust security measures give us peace of mind. We trust the platform to safeguard our project
                data."
              </p>

              <div class="testimonial-footer">
                <div class="stars">
                  <q-icon name="star" v-for="n in 5" :key="n" class="star" />
                </div>
                <div class="testimonial-author">
                  <strong>Bazrgani Drwst</strong>
                  <span>IT Project Lead</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="login-right">
        <!-- Language selector -->
        <div class="language-selector-container">
          <LanguageSelector class="language-selector" />
        </div>

        <div class="login-form-container">
          <div class="form-header">
            <div class="logo">
              <q-icon name="account_circle" size="2.5rem" color="primary" />
            </div>
            <h2 class="form-title">{{ $t('auth.login') }}</h2>
            <p class="form-subtitle">{{ $t('auth.welcomeBack') }}</p>
          </div>

          <q-form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group q-mb-xs">
              <label class="form-label q-mb-xs">{{ $t('auth.emailOrUsername') }}</label>
              <QInput v-model="formData.username" :placeholder="$t('auth.emailOrUsername')" type="text"
                :rules="[val => !!val || $t('auth.emailOrUsernameRequired')]" />
            </div>

            <div class="form-group q-mb-xs">
              <label class="form-label q-mb-xs">{{ $t('auth.password') }}</label>
              <QInput v-model="formData.password" :placeholder="$t('auth.password')"
                :type="showPassword ? 'text' : 'password'" :rules="[val => !!val || $t('auth.passwordRequired')]">
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer password-toggle"
                    @click="showPassword = !showPassword" />
                </template>
              </QInput>
            </div>

            <div class="form-options q-mb-xs">
              <q-checkbox v-model="formData.remember" :true-value="1" :false-value="0" :label="$t('auth.rememberMe')"
                class="remember-checkbox" />
              <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">
                {{ $t('auth.forgotPassword') }}
              </a>
            </div>

            <QBtn type="submit" :loading="authStore.loading" :btn-label="authStore.loading ? '' : $t('auth.login')"
              class="login-btn bg-primary q-mb-xs" size="md" no-caps style="min-height: 48px;">
              <template #loading>
                <q-spinner color="white" size="1.2em" />
              </template>
            </QBtn>

            <div class="signup-link">
              {{ $t('auth.noAccount') }}
              <a href="#" @click.prevent="handleContactAdmin">{{ $t('auth.contactAdmin') }}</a>
            </div>
          </q-form>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <q-dialog v-model="showForgotPasswordModal" persistent transition-show="slide-up" transition-hide="slide-down"
      position="bottom" class="mobile-modal-dialog">
      <q-card class="forgot-password-modal">
        <div class="modal-header">
          <div class="modal-icon">
            <q-icon name="admin_panel_settings" size="2.5rem" color="primary" />
          </div>
          <h3 class="modal-title">{{ $t('auth.passwordResetTitle') }}</h3>
          <p class="modal-subtitle">{{ $t('auth.passwordResetSubtitle') }}</p>
        </div>

        <q-card-section class="modal-content">
          <div class="info-message">
            <q-icon name="security" class="info-icon" />
            <p class="info-text">
              {{ $t('auth.passwordResetMessage') }}
            </p>
          </div>

          <div class="contact-section">
            <h4 class="contact-section-title">{{ $t('auth.adminContactInfo') }}</h4>
            <div class="contact-info">
              <div class="contact-item">
                <q-icon name="phone" class="contact-icon" />
                <div class="contact-details">
                  <span class="contact-name">{{ $t('auth.adminHardi') }}</span>
                  <span class="contact-phone" dir="ltr">+964 770 194 1549</span>
                </div>
              </div>
              <div class="contact-item">
                <q-icon name="phone" class="contact-icon" />
                <div class="contact-details">
                  <span class="contact-name">{{ $t('auth.adminKamyar') }}</span>
                  <span class="contact-phone" dir="ltr">+964 770 369 2917</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <QBtn is-flat :btn-label="$t('common.close')" class="close-btn" @click="showForgotPasswordModal = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Contact Admin Modal -->
    <q-dialog v-model="showContactAdminModal" persistent transition-show="slide-up" transition-hide="slide-down"
      position="bottom" class="mobile-modal-dialog">
      <q-card class="contact-admin-modal">
        <div class="modal-header">
          <div class="modal-icon">
            <q-icon name="support_agent" size="2.5rem" color="primary" />
          </div>
          <h3 class="modal-title">{{ $t('auth.contactAdminTitle') }}</h3>
          <p class="modal-subtitle">{{ $t('auth.contactAdminSubtitle') }}</p>
        </div>

        <q-card-section class="modal-content">
          <div class="info-message">
            <q-icon name="person_add" class="info-icon" />
            <p class="info-text">
              {{ $t('auth.contactAdminMessage') }}
            </p>
          </div>

          <div class="contact-section">
            <h4 class="contact-section-title">{{ $t('auth.adminContactInfo') }}</h4>
            <div class="contact-info">
              <div class="contact-item">
                <q-icon name="phone" class="contact-icon" />
                <div class="contact-details">
                  <span class="contact-name">{{ $t('auth.adminHardi') }}</span>
                  <span class="contact-phone" dir="ltr">+964 770 194 1549</span>
                </div>
              </div>
              <div class="contact-item">
                <q-icon name="phone" class="contact-icon" />
                <div class="contact-details">
                  <span class="contact-name">{{ $t('auth.adminKamyar') }}</span>
                  <span class="contact-phone" dir="ltr">+964 770 369 2917</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <QBtn is-flat :btn-label="$t('common.close')" class="close-btn" @click="showContactAdminModal = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import QBtn from '../../components/common/Qbtn.vue'
import QInput from '../../components/common/Qinput.vue'
import LanguageSelector from '../../components/common/LanguageSelector.vue'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'src/stores/notificationStore'
import { useRecaptcha } from 'src/composables/useRecaptcha'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const { initRecaptcha, executeRecaptcha, isReady: _isReady, cleanup, showBadge } = useRecaptcha()

const formData = ref<{ username: string; password: string; remember: 1 | 0 }>({
  username: '',
  password: '',
  remember: 0,
})

const showPassword = ref(false)
const showForgotPasswordModal = ref(false)
const showContactAdminModal = ref(false)

// Initialize reCAPTCHA when component mounts
onMounted(async () => {
  // Ensure notifications are stopped on login page
  notificationStore.stopAutoRefresh()

  await initRecaptcha()

  // Show the badge on login page after a delay to ensure DOM is ready
  const showBadgeWithRetry = () => {
    const attempts = 10
    let currentAttempt = 0

    const tryShowBadge = () => {
      const badge = document.querySelector('.grecaptcha-badge')
      if (badge) {
        showBadge()
      } else if (currentAttempt < attempts) {
        currentAttempt++
        setTimeout(tryShowBadge, 500)
      }
    }

    tryShowBadge()
  }

  setTimeout(showBadgeWithRetry, 1000)
})

// Clean up when component unmounts
onUnmounted(() => {
  // Ensure notifications remain stopped when leaving login page
  notificationStore.stopAutoRefresh()
  cleanup()
})

const handleLogin = async () => {
  try {
    // Execute reCAPTCHA before login
    const recaptchaToken = await executeRecaptcha('login')

    if (!recaptchaToken) {
      console.error('❌ Failed to get reCAPTCHA token')
      return
    }

    // Login and wait for it to complete
    await authStore.loginUser(
      formData.value.username,
      formData.value.password,
      formData.value.remember,
      recaptchaToken
    )

    // Check if login was successful by checking both token and user data
    if (authStore.token && authStore.currentUser && authStore.loggedIn) {
      // Use router navigation instead of window.location for smoother transition
      await router.replace('/')
    } else {
      console.error('❌ Login appeared to succeed but user data or token is missing')
    }
  } catch (err) {
    console.error('❌ Login failed:', err)
  }
}

const handleForgotPassword = () => {
  showForgotPasswordModal.value = true
}

const handleContactAdmin = () => {
  showContactAdminModal.value = true
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2A7B9B 0%, #2A9B8F 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(42, 123, 155, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  z-index: 1;
}

.login-content {
  display: flex;
  width: 100%;
  max-width: 1100px;
  /* Reduced from 1400px for better laptop display */
  min-height: 560px;
  /* Reduced from 680px to prevent scrolling */
  background: white;
  border-radius: 20px;
  /* Slightly reduced for better proportions */
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  z-index: 2;
  margin: 1rem;
  /* Keep margin for spacing */
}

.login-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      rgba(42, 123, 155, 0.85) 0%,
      rgba(42, 155, 143, 0.75) 50%,
      rgba(30, 107, 130, 0.85) 100%);
  z-index: 2;
}

.brand-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: white;
  max-width: 450px;
  /* Reduced from 550px for better proportions */
  padding: 2rem;
  /* Reduced from 2.5rem */
  width: 100%;
}

.brand-logo {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.logo-circle {
  width: 70px;
  /* Reduced from 80px */
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.brand-title {
  font-size: 2.2rem;
  /* Reduced from 2.5rem */
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-title-accent {
  font-size: 2.2rem;
  /* Reduced from 2.5rem */
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  line-height: 1.1;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.brand-subtitle {
  font-size: 1.3rem;
  /* Reduced from 1.5rem */
  font-weight: 300;
  margin: 0 0 2.5rem 0;
  /* Reduced bottom margin from 3rem */
  opacity: 0.9;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  /* Reduced from 20px */
  padding: 1.5rem;
  /* Reduced from 2rem */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

.quote-icon {
  position: absolute;
  top: -10px;
  left: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
}

.testimonial-text {
  font-size: 1rem;
  line-height: 1.6;
  margin: 1rem 0 1.5rem 0;
  opacity: 0.95;
  font-style: italic;
  text-align: left;
}

.testimonial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: #FFD700;
  font-size: 1.2rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.testimonial-author {
  text-align: right;
}

.testimonial-author strong {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.testimonial-author span {
  font-size: 0.85rem;
  opacity: 0.8;
}

.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fefefe;
  position: relative;
}

.language-selector-container {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

.language-selector {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
}

.login-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.5rem;
  /* Reduced from 3rem */
  max-width: 420px;
  /* Reduced from 500px */
  margin: 0 auto;
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  /* Reduced from 2.5rem */
}

.logo {
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.password-toggle {
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-checkbox :deep(.q-checkbox__label) {
  font-size: 0.875rem;
  color: #374151;
}

.remember-checkbox :deep(.q-checkbox__inner) {
  color: #2A7B9B;
}

.forgot-link {
  font-size: 0.875rem;
  color: #2A7B9B;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  color: #2A9B8F;
  text-decoration: underline;
}

.login-btn {
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(42, 123, 155, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.signup-link {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.signup-link a {
  color: #2A7B9B;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  color: #2A9B8F;
  text-decoration: underline;
}

/* Error states */
.form-input :deep(.q-field--error .q-field__control) {
  border-color: #ef4444;
}

.form-input :deep(.q-field--error .q-field__messages) {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Responsive design */
@media (max-width: 1024px) {
  .login-content {
    max-width: 500px;
    margin: 1rem;
  }

  .login-left {
    display: none;
    /* Hide the left side completely on tablets and below */
  }

  .login-right {
    flex: 1;
    width: 100%;
  }

  .login-form-container {
    padding: 2rem;
    max-width: none;
    /* Remove max-width constraint */
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 0.5rem;
    align-items: stretch;
    /* Allow full height on mobile */
  }

  .login-content {
    margin: 0.5rem;
    border-radius: 16px;
    min-height: auto;
    /* Allow content to determine height */
    display: flex;
    flex-direction: column;
  }

  .login-left {
    display: none;
    /* Ensure left side is hidden on mobile */
  }

  .login-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .login-form-container {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: calc(100vh - 4rem);
    /* Full height minus container padding */
  }

  .form-title {
    font-size: 1.5rem;
  }

  .language-selector-container {
    top: 1rem;
    right: 1rem;
  }

  .form-header {
    margin-bottom: 1.5rem;
    /* Reduce header margin on mobile */
    text-align: center;
  }

  .login-btn {
    font-size: 0.95rem;
  }

  /* Improve input field appearance on mobile */
  .form-group :deep(.q-field__control) {
    min-height: 48px;
    /* Better touch target */
  }

  .form-group :deep(.q-field__native) {
    font-size: 16px;
    /* Prevent zoom on iOS */
  }
}

/* Laptop specific optimizations */
@media (min-width: 1025px) and (max-width: 1366px) {
  .login-content {
    max-width: 1000px;
    /* Reduced from 1200px for better laptop fit */
    min-height: 520px;
    /* Reduced from 600px to prevent scrolling */
  }

  .brand-content {
    padding: 1.8rem;
    /* Reduced from 2rem */
    max-width: 400px;
    /* Reduced from 500px */
  }

  .brand-title,
  .brand-title-accent {
    font-size: 2rem;
    /* Reduced from 2.2rem */
  }

  .brand-subtitle {
    font-size: 1.2rem;
    /* Reduced from 1.4rem */
    margin-bottom: 2rem;
  }

  .logo-circle {
    width: 65px;
    /* Reduced from 75px */
    height: 65px;
  }

  .testimonial-card {
    padding: 1.5rem;
    /* Reduced from 1.8rem */
  }

  .login-form-container {
    padding: 2rem;
    /* Reduced from 2.5rem */
    max-width: 380px;
    /* Reduced from 450px */
  }
}

/* Larger laptop/desktop optimizations */
@media (min-width: 1367px) {
  .login-content {
    max-width: 1100px;
    /* Controlled size for larger screens */
    min-height: 560px;
  }

  .brand-content {
    padding: 2rem;
    max-width: 450px;
  }

  .login-form-container {
    padding: 2.5rem;
    max-width: 420px;
  }
}

/* Animation for smooth transitions */
.login-content {
  animation: slideUp 0.6s ease-out;
}

.brand-content {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.testimonial-card {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.logo-circle {
  transition: all 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.2);
}

.testimonial-card {
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Focus visible for accessibility */
.login-btn:focus-visible,
.forgot-link:focus-visible,
.signup-link a:focus-visible {
  outline: 2px solid #2A7B9B;
  outline-offset: 2px;
}

/* Forgot Password Modal Styles */
.forgot-password-modal {
  min-width: 400px;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(42, 123, 155, 0.1);
}

/* Mobile dialog positioning */
:deep(.mobile-modal-dialog .q-dialog__inner) {
  padding: 0 !important;
}

@media (max-width: 640px) {
  .forgot-password-modal {
    border-radius: 20px 20px 0 0 !important;
    min-width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    max-height: 85vh !important;
    position: fixed;
    bottom: 0;
  }

  :deep(.mobile-modal-dialog .q-dialog__inner) {
    align-items: flex-end !important;
    justify-content: center !important;
  }

  :deep(.mobile-modal-dialog) {
    align-items: flex-end !important;
  }
}

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #2A7B9B 0%, #2A9B8F 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

.modal-icon {
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.modal-icon .q-icon {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  position: relative;
  z-index: 2;
}

.modal-subtitle {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.9;
  position: relative;
  z-index: 2;
}

.modal-content {
  padding: 2rem;
}

.info-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #bae6fd;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.info-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #2A7B9B 0%, #2A9B8F 100%);
}

.info-icon {
  color: #2A7B9B;
  font-size: 1.5rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.info-text {
  margin: 0;
  line-height: 1.6;
  color: #1e40af;
  font-size: 0.95rem;
}

.contact-section {
  margin-top: 1.5rem;
}

.contact-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #2A7B9B 0%, #2A9B8F 100%);
  border-radius: 2px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(42, 123, 155, 0.1);
  border-color: #2A7B9B;
}

.contact-icon {
  color: #2A7B9B;
  font-size: 1.25rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 0.5rem;
  border-radius: 8px;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.contact-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.contact-phone {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.9rem;
  direction: ltr !important;
  text-align: left !important;
  unicode-bidi: embed;
}

/* RTL support for contact details */
[dir="rtl"] .contact-details {
  align-items: flex-end;
}

/* Contact Admin Modal Styles */
.contact-admin-modal {
  min-width: 400px;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(42, 123, 155, 0.1);
}

[dir="rtl"] .contact-phone {
  text-align: left !important;
  direction: ltr !important;
}

.contact-item span {
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.modal-actions {
  padding: 1rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.close-btn {
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

@keyframes shimmer {

  0%,
  100% {
    transform: translateX(-100%) translateY(-100%);
  }

  50% {
    transform: translateX(-50%) translateY(-50%);
  }
}

/* Mobile responsive for modal */
@media (max-width: 640px) {
  .forgot-password-modal {
    min-width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    max-height: 90vh !important;
    display: flex !important;
    flex-direction: column !important;
    border-radius: 20px 20px 0 0 !important;
  }

  .modal-header {
    padding: 1.5rem 1rem 1rem;
    flex-shrink: 0;
  }

  .modal-content {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    /* Allow flex child to shrink */
  }

  .modal-actions {
    padding: 1rem 1.5rem 2rem;
    /* Extra bottom padding for safe area */
    flex-direction: column;
    gap: 0.75rem;
    flex-shrink: 0;
    background: white;
    border-top: 1px solid #e2e8f0;
    position: sticky;
    bottom: 0;
    justify-content: center;
  }

  .modal-actions .close-btn {
    width: 100%;
    min-height: 52px;
    /* Larger touch target */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 12px;
  }

  .contact-info {
    gap: 0.75rem;
  }

  .contact-item {
    padding: 0.75rem;
  }

  .contact-details {
    gap: 0.2rem;
  }

  .contact-name {
    font-size: 0.9rem;
  }

  .contact-phone {
    font-size: 0.85rem;
  }

  .info-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .contact-section {
    margin-top: 1rem;
  }

  .contact-section-title {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-subtitle {
    font-size: 0.875rem;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .forgot-password-modal {
    max-height: 95vh !important;
  }

  .modal-header {
    padding: 1.25rem 1rem 0.75rem;
  }

  .modal-content {
    padding: 0.75rem 1rem;
  }

  .modal-actions {
    padding: 1rem 1rem 2.5rem;
    /* Even more bottom padding for very small screens */
    gap: 0.5rem;
    justify-content: center;
  }

  .modal-actions .close-btn {
    min-height: 54px;
    /* Even larger touch target */
    font-size: 1rem;
    font-weight: 600;
  }

  .modal-icon .q-icon {
    padding: 0.75rem;
  }

  .contact-item {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .contact-name {
    font-size: 0.88rem;
  }

  .contact-phone {
    font-size: 0.82rem;
  }

  .contact-icon {
    font-size: 1.1rem;
    padding: 0.4rem;
  }

  .contact-admin-modal {
    min-width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    max-height: 90vh !important;
    display: flex !important;
    flex-direction: column !important;
    border-radius: 20px 20px 0 0 !important;
  }
}

/* Extra small screens for contact admin modal */
@media (max-width: 480px) {
  .contact-admin-modal {
    max-height: 95vh !important;
  }
}

/* Mobile-first responsive improvements */
@media (max-width: 480px) {
  .login-container {
    padding: 0;
    min-height: 100vh;
    min-height: 100dvh;
    /* Dynamic viewport height for better mobile support */
  }

  .login-content {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    min-height: 100dvh;
    box-shadow: none;
  }

  .login-form-container {
    padding: 2rem 1.5rem;
    min-height: 100vh;
    min-height: 100dvh;
  }

  .language-selector-container {
    top: 1.5rem;
    right: 1.5rem;
  }

  /* Adjust form spacing for very small screens */
  .form-header {
    margin-bottom: 1.5rem;
    /* Reduced from 2rem */
  }

  /* Make buttons more touch-friendly */
  .login-btn {
    font-size: 1rem;
    /* Reduced from 1.1rem */
    border-radius: 10px;
    /* Reduced from 12px */
  }
}
</style>
