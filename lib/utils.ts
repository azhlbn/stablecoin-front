import { formatUnits, parseUnits } from "viem";

/**
 * Format a bigint token amount into a human-readable string.
 * - Trims trailing zeros after decimal point
 * - Adds thousands separators
 * - Caps displayed decimals at `maxDecimals` (default 4)
 */
export function formatAmount(
  value: bigint,
  decimals: number = 18,
  maxDecimals: number = 4
): string {
  const raw = formatUnits(value, decimals);
  const num = parseFloat(raw);

  if (isNaN(num)) return "—";

  // For very small non-zero values show more precision
  if (num > 0 && num < 0.0001) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
  }

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Format a signed bigint (like deviation) — preserves sign display.
 */
export function formatSignedAmount(
  value: bigint,
  decimals: number = 18,
  maxDecimals: number = 4
): string {
  const isNeg = value < 0n;
  const abs = isNeg ? -value : value;
  const formatted = formatAmount(abs, decimals, maxDecimals);
  return isNeg ? `−${formatted}` : `+${formatted}`;
}

export function parseAmount(value: string, decimals: number = 18): bigint {
  try {
    return parseUnits(value, decimals);
  } catch {
    return 0n;
  }
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
