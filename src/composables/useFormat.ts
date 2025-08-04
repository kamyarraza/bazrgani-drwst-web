// src/composables/useFormat.ts

export function formatCurrency(value: number | string, currencySign: string = '$'): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  // IQD (Iraqi Dinar) should not have decimal places
  const isIQD = currencySign.toLowerCase().includes('iqd') || currencySign === 'د.ع';

  if (isIQD) {
    return Math.round(num).toLocaleString('en-US') + currencySign;
  }

  // Other currencies (USD, EUR, etc.) show 2 decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + currencySign;
}

// Enhanced currency formatter that can detect currency type automatically
export function formatPrice(value: number | string, currency?: 'USD' | 'IQD' | 'EUR'): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  switch (currency) {
    case 'IQD':
      return Math.round(num).toLocaleString('en-US') + ' د.ع';
    case 'EUR':
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '€';
    case 'USD':
    default:
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '$';
  }
}
