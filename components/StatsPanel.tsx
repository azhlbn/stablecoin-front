"use client";

import { formatAmount, formatSignedAmount, shortenAddress } from "@/lib/utils";
import { ARBITRUM_EXPLORER } from "@/lib/config";

interface Props {
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: bigint;
  deviation?: bigint;
  maxDeviation?: bigint;
  maxSlippage?: bigint;
  currentPeg?: bigint;
  owner?: string;
  tokenAAddress?: string;
  tokenBAddress?: string;
  pairAddress?: string;
  tokenASymbol?: string;
  tokenBSymbol?: string;
  userBalance?: bigint;
  tokenABalance?: bigint;
  tokenBBalance?: bigint;
  lpBalance?: bigint;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  isLoading?: boolean;
}

function StatItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="stat-value truncate" title={value}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
      <div className="stat-label">{label}</div>
    </div>
  );
}

function AddressRow({
  label,
  address,
}: {
  label: string;
  address: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <a
        href={`${ARBITRUM_EXPLORER}/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-gray-400 hover:text-blue-400 transition-colors"
        title={address}
      >
        {shortenAddress(address)}
      </a>
    </div>
  );
}

export function StatsPanel({
  name,
  symbol,
  decimals = 18,
  totalSupply,
  deviation,
  maxDeviation,
  maxSlippage,
  currentPeg,
  owner,
  tokenAAddress,
  tokenBAddress,
  pairAddress,
  tokenASymbol,
  tokenBSymbol,
  userBalance,
  tokenABalance,
  tokenBBalance,
  lpBalance,
  isSuperAdmin,
  isAdmin,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-12 bg-gray-800 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Current peg: PEG_PRECISION = 1e18, so divide by 1e18
  const pegDisplay = currentPeg !== undefined
    ? (Number(currentPeg) / 1e18).toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      })
    : "N/A";

  // Slippage is stored as basis points out of 10000 (e.g. 50 = 0.5%)
  const slippageDisplay = maxSlippage !== undefined
    ? `${(Number(maxSlippage) / 100).toFixed(2)}%`
    : "—";

  const tokenADec = decimals;
  const tokenBDec = decimals;

  return (
    <div className="space-y-4">
      {/* Contract info */}
      <div className="card">
        <h2 className="section-title">
          <span>📋</span> Contract Info
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <StatItem label="Token Name" value={name ?? "—"} />
          <StatItem label="Symbol" value={symbol ?? "—"} />
          <StatItem
            label="Total Supply"
            value={
              totalSupply !== undefined
                ? formatAmount(totalSupply, decimals, 2)
                : "—"
            }
            sub={symbol}
          />
          <StatItem label="Decimals" value={String(decimals)} />
          <StatItem label="Current Peg" value={pegDisplay} />
          <StatItem label="Max Slippage" value={slippageDisplay} />
        </div>
      </div>

      {/* Peg deviation */}
      <div className="card">
        <h2 className="section-title">
          <span>📊</span> Peg Deviation
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <StatItem
            label="Deviation"
            value={
              deviation !== undefined
                ? formatSignedAmount(deviation, decimals, 4)
                : "—"
            }
            sub={symbol}
          />
          <StatItem
            label="Max Deviation"
            value={
              maxDeviation !== undefined
                ? formatAmount(maxDeviation, decimals, 2)
                : "—"
            }
            sub={symbol}
          />
        </div>
      </div>

      {/* Addresses */}
      <div className="card">
        <h2 className="section-title">
          <span>🔗</span> Addresses
        </h2>
        <div className="space-y-2.5">
          {owner && <AddressRow label="Owner" address={owner} />}
          {tokenAAddress && (
            <AddressRow label={tokenASymbol ?? "Token A"} address={tokenAAddress} />
          )}
          {tokenBAddress && (
            <AddressRow label={tokenBSymbol ?? "Token B"} address={tokenBAddress} />
          )}
          {pairAddress && <AddressRow label="LP Pair" address={pairAddress} />}
        </div>
      </div>

      {/* User balances */}
      {(userBalance !== undefined ||
        tokenABalance !== undefined ||
        tokenBBalance !== undefined ||
        lpBalance !== undefined) && (
        <div className="card">
          <h2 className="section-title">
            <span>💰</span> Your Balances
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {userBalance !== undefined && (
              <StatItem
                label={symbol ?? "Token"}
                value={formatAmount(userBalance, decimals, 4)}
              />
            )}
            {tokenABalance !== undefined && (
              <StatItem
                label={tokenASymbol ?? "Token A"}
                value={formatAmount(tokenABalance, tokenADec, 4)}
              />
            )}
            {tokenBBalance !== undefined && (
              <StatItem
                label={tokenBSymbol ?? "Token B"}
                value={formatAmount(tokenBBalance, tokenBDec, 4)}
              />
            )}
            {lpBalance !== undefined && (
              <StatItem
                label="LP Tokens"
                value={formatAmount(lpBalance, 18, 6)}
              />
            )}
          </div>

          {(isSuperAdmin || isAdmin) && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {isSuperAdmin && (
                <span className="px-2 py-1 text-xs rounded bg-purple-900 text-purple-300 font-medium">
                  SUPER ADMIN
                </span>
              )}
              {isAdmin && !isSuperAdmin && (
                <span className="px-2 py-1 text-xs rounded bg-blue-900 text-blue-300 font-medium">
                  ADMIN
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
