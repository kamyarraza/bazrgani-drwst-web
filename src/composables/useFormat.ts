// src/composables/useFormat.ts

export function formatCurrency(
  value: number | string,
  currencySign: string = "$"
): string {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "string") {
    value = value.replace(/[^\d.-]/g, "");
    value = parseFloat(value);
  }
  if (isNaN(value)) return "";

  // IQD (Iraqi Dinar) should show decimal places properly
  const isIQD =
    currencySign.toLowerCase().includes("iqd") || currencySign === "د.ع";

  if (isIQD) {
    return (
      value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + currencySign
    );
  }

  // Other currencies (USD, EUR, etc.) show 2 decimal places
  return (
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace(/[.]00$/, "") + currencySign
  );
}

// Enhanced currency formatter that can detect currency type automatically
export function formatPrice(
  value: number | string,
  currency?: "USD" | "IQD" | "EUR"
): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";

  switch (currency) {
    case "IQD":
      return (
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " د.ع"
      );
    case "EUR":
      return (
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "€"
      );
    case "USD":
    default:
      return (
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "$"
      );
  }
}

export function formatNumber(value: any): string {
  // const num = typeof val === 'string' || typeof val === 'number' ? Number(val) : 0;
  if (typeof value === "string") {
    value = value.replace(/[^\d.-]/g, "");
    value = parseFloat(value);
  }
  return (isNaN(value) ? 0 : value).toLocaleString();
}
