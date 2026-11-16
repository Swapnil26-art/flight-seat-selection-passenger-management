const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹350 / ₹0 formatting used across the app. */
export function formatPrice(amount) {
  return inr.format(amount);
}
