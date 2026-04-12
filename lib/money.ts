export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function retailPriceToCents(price: string): number {
  const n = Number.parseFloat(price);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}
