// src/composables/useFormat.ts

export function formatCurrency(value: number | string, currencySign: string = '$'): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString() + currencySign;
} 