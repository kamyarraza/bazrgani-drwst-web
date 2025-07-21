import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function useRTL() {
  const { locale } = useI18n();

  // Check if current locale is RTL
  const isRTL = computed(() => {
    return locale.value === 'ar' || locale.value === 'ckb';
  });

  // Get appropriate back arrow icon based on RTL direction
  const backIcon = computed(() => {
    return isRTL.value ? 'arrow_forward' : 'arrow_back';
  });

  // Get appropriate forward arrow icon based on RTL direction
  const forwardIcon = computed(() => {
    return isRTL.value ? 'arrow_back' : 'arrow_forward';
  });

  // Get appropriate navigation icons
  const navIcons = computed(() => ({
    back: isRTL.value ? 'arrow_forward' : 'arrow_back',
    forward: isRTL.value ? 'arrow_back' : 'arrow_forward',
    previous: isRTL.value ? 'chevron_right' : 'chevron_left',
    next: isRTL.value ? 'chevron_left' : 'chevron_right'
  }));

  return {
    isRTL,
    backIcon,
    forwardIcon,
    navIcons
  };
}
