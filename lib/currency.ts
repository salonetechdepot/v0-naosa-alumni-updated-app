// Currency conversion utilities for Sierra Leone
// Old Leone to New Leone conversion (remove 3 zeros)
// 50000 Old Leone = 50 New Leone

export const CURRENCY = {
  NEW_LEONE: "SLE",
  OLD_LEONE: "SLL",
  CONVERSION_FACTOR: 1000, // 1000 Old Leone = 1 New Leone
  MAX_NEW_AMOUNT: 1000, // Maximum expected in New Leone
  MIN_NEW_AMOUNT: 10, // Minimum expected in New Leone
} as const;

/**
 * Detect if amount is in Old Leone format (large numbers)
 */
export function isOldLeoneFormat(amount: number): boolean {
  // If amount is > 1000, it's likely in Old Leone
  return amount > CURRENCY.MAX_NEW_AMOUNT;
}

/**
 * Convert Old Leone to New Leone
 */
export function convertToNewLeone(amount: number): number {
  if (isOldLeoneFormat(amount)) {
    return amount / CURRENCY.CONVERSION_FACTOR;
  }
  return amount;
}

/**
 * Format amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "SLE",
): string {
  return new Intl.NumberFormat("en-SL", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate amount is reasonable for New Leone
 */
export function isValidNewLeoneAmount(amount: number): boolean {
  return amount >= CURRENCY.MIN_NEW_AMOUNT && amount <= CURRENCY.MAX_NEW_AMOUNT;
}

/**
 * Parse and standardize amount from input
 */
export function standardizeAmount(input: number | string): number {
  let amount = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(amount)) return 0;

  // Convert to New Leone if needed
  return convertToNewLeone(amount);
}
