import { formatUnits, parseUnits } from "viem";

/**
 * Format a bigint token amount into a human-readable string.
 * - Uses viem's formatUnits for precision (no float rounding loss)
 * - Trims trailing zeros
 * - Adds thousands separators via Intl
 * - Shows up to `maxDecimals` decimal places, but never rounds to zero
 */
export function formatAmount(
  value: bigint,
  decimals: number = 18,
  maxDecimals: number = 4
): string {
  if (value === 0n) return "0";

  // Use viem for accurate string conversion (no float precision loss)
  const raw = formatUnits(value, decimals); // e.g. "0.000123456789012345"

  // Split integer and fractional parts
  const [intPart, fracPart = ""] = raw.split(".");

  // Format integer part with thousands separators
  const intFormatted = BigInt(intPart).toLocaleString("en-US");

  if (!fracPart || fracPart === "0".repeat(fracPart.length)) {
    return intFormatted;
  }

  // Trim trailing zeros from fractional part
  const fracTrimmed = fracPart.replace(/0+$/, "");

  // Find first non-zero digit position to never show "0.000...0"
  const firstNonZero = fracTrimmed.search(/[1-9]/);

  // How many decimals to show: at least enough to show first significant digit
  const minDecimals = firstNonZero === -1 ? 1 : firstNonZero + 1;
  const showDecimals = Math.max(minDecimals, Math.min(maxDecimals, fracTrimmed.length));

  const fracDisplay = fracTrimmed.slice(0, showDecimals);

  return `${intFormatted}.${fracDisplay}`;
}

/**
 * Format a signed bigint (like deviation) — preserves sign display.
 */
export function formatSignedAmount(
  value: bigint,
  decimals: number = 18,
  maxDecimals: number = 4
): string {
  if (value === 0n) return "0";
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
