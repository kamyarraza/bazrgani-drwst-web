import { ref } from 'vue'

// Type definitions for Google reCAPTCHA v3
interface ReCaptchaV3API {
  ready(_callback: () => void): void
  execute(_siteKey: string, _options: { action: string }): Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: ReCaptchaV3API
  }
}

export const useRecaptcha = () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LelnUcrAAAAAAB85vcm__jiaYTkfML0GH_BfiE1'
  const isReady = ref(false)
  const isScriptLoaded = ref(false)

  const loadRecaptchaScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.grecaptcha || isScriptLoaded.value) {
        resolve()
        return
      }

      // Check if script tag already exists
      if (document.querySelector('script[src*="recaptcha/api.js"]')) {
        isScriptLoaded.value = true
        resolve()
        return
      }

      console.log('🔄 Loading reCAPTCHA script...')

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log('✅ reCAPTCHA script loaded successfully')
        isScriptLoaded.value = true
        resolve()
      }

      script.onerror = () => {
        console.error('❌ Failed to load reCAPTCHA script')
        reject(new Error('Failed to load reCAPTCHA script'))
      }

      document.head.appendChild(script)
    })
  }

  const initRecaptcha = (): Promise<void> => {
    return new Promise((resolve) => {
      const initAsync = async () => {
        try {
          // First load the script if not already loaded
          await loadRecaptchaScript()

          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              isReady.value = true
              console.log('✅ reCAPTCHA v3 initialized successfully')
              resolve()
            })
          } else {
            console.error('❌ reCAPTCHA script not loaded')
            resolve()
          }
        } catch (error) {
          console.error('❌ reCAPTCHA initialization failed:', error)
          resolve()
        }
      }

      void initAsync()
    })
  }

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!isReady.value || !window.grecaptcha) {
      console.error('❌ reCAPTCHA not ready')
      return null
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action })
      console.log('✅ reCAPTCHA token generated for action:', action)
      console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...')
      return token
    } catch (error) {
      console.error('❌ reCAPTCHA execution failed:', error)
      return null
    }
  }
  const cleanup = () => {
    // Hide reCAPTCHA badge when component unmounts
    const badge = document.querySelector('.grecaptcha-badge') as HTMLElement
    if (badge) {
      badge.classList.remove('show-badge')
      badge.style.visibility = 'hidden'
      badge.style.opacity = '0'
    }
  }

  const showBadge = () => {
    // Show reCAPTCHA badge when needed
    const badge = document.querySelector('.grecaptcha-badge') as HTMLElement
    if (badge) {
      badge.classList.add('show-badge')
      badge.style.visibility = 'visible'
      badge.style.opacity = '1'
    }
  }

  return {
    isReady,
    isScriptLoaded,
    initRecaptcha,
    executeRecaptcha,
    cleanup,
    showBadge
  }
}
