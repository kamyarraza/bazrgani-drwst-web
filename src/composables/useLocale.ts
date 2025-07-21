import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { api } from 'boot/axios';

export function useLocale() {
  const { locale } = useI18n();

  // Watch for changes and persist to localStorage
  watch(locale, (newLocale) => {
    localStorage.setItem('locale', newLocale);
    // Update axios default Accept-Language header
    api.defaults.headers.common['Accept-Language'] = newLocale;
  }, { immediate: true });
  // Set locale and persist
  function setLocale(lang: string) {
    // If language is different from current language,
    // save it and reload the page to apply changes everywhere
    if (locale.value !== lang) {
      locale.value = lang;
      localStorage.setItem('locale', lang);

      // Update axios default Accept-Language header immediately
      api.defaults.headers.common['Accept-Language'] = lang;

      // Update HTML lang attribute for proper font loading
      document.documentElement.lang = lang;
      document.documentElement.classList.remove('lang-en-US', 'lang-ar', 'lang-ckb');
      document.documentElement.classList.add(`lang-${lang}`);

      // Set the dir attribute for RTL support
      document.documentElement.dir = ['ar', 'ckb'].includes(lang) ? 'rtl' : 'ltr';

      // Option 1: Force page reload
      window.location.reload();

      /*
      // Option 2: Show loading overlay while applying language changes
      $q.loading.show({
        message: 'Changing language...'
      });

      // Small delay to allow the loading overlay to show
      setTimeout(() => {
        window.location.reload();
      }, 300);
      */
    }
  }

  return {
    locale,
    setLocale
  };
}
