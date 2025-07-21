import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';
import { api } from './axios';

import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default defineBoot(({ app }) => {
  // Check localStorage for saved locale, fallback to ckb
  const savedLocale = localStorage.getItem('locale') || 'ckb';
  const i18n = createI18n<MessageSchema, MessageLanguages>({
    locale: savedLocale,
    legacy: false,

    messages,
  });

  // Set initial Accept-Language header for axios
  api.defaults.headers.common['Accept-Language'] = savedLocale;

  // Set HTML lang attribute and class for proper font loading
  document.documentElement.lang = savedLocale;
  document.documentElement.classList.add(`lang-${savedLocale}`);

  // Set HTML dir attribute for RTL support
  document.documentElement.dir = ['ar', 'ckb'].includes(savedLocale) ? 'rtl' : 'ltr';

  // Set i18n instance on app
  app.use(i18n);
});
