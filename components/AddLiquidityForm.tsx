"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TxStatusBadge } from "./TxStatus";
import { formatAmount } from "@/lib/utils";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { PEGGED_ASSET_ABI } from "@/lib/abi";

interface Props {
  tokenAAddress?: `0x${string}`;
  tokenBAddress?: `0x${string}`;
  tokenASymbol?: string;
  tokenBSymbol?: string;
  tokenABalance?: bigint;
  tokenBBalance?: bigint;
  decimals?: number;
  userAddress?: `0x${string}`;
  onSuccess?: () => void;
}

export function AddLiquidityForm({
  tokenAAddress,
  tokenBAddress,
  tokenASymbol = "USDC",
  tokenBSymbol = "USDT",
  tokenABalance,
  tokenBBalance,
  decimals = 6,
  userAddress,
  onSuccess,
}: Props) {
  const [usdtAmount, setUsdtAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const { addLiquidity, status, txHash, error, reset } = useContractWrite();

  // Debounce input by 400ms to avoid spamming RPC
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAmount(usdtAmount), 400);
    return () => clearTimeout(t);
  }, [usdtAmount]);

  // Parse debounced amount for contract call
  const parsedUsdt = (() => {
    try {
      if (!debouncedAmount || parseFloat(debouncedAmount) <= 0) return undefined;
      return parseUnits(debouncedAmount, decimals);
    } catch {
      return undefined;
    }
  })();

  // Read required USDC amount from contract
  const { data: usdcRequired, isFetching: isCalculating } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PEGGED_ASSET_ABI,
    functionName: "getAmountTokenB",
    args: [parsedUsdt!],
    query: {
      enabled: parsedUsdt !== undefined && parsedUsdt > 0n,
    },
  });

  const isDisabled =
    !usdtAmount ||
    !userAddress ||
    !tokenAAddress ||
    !tokenBAddress ||
    status === "pending" ||
    status === "approving";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenAAddress || !tokenBAddress || !userAddress) return;
    await addLiquidity(usdtAmount, tokenBAddress, tokenAAddress, userAddress, decimals, decimals);
    if (onSuccess) onSuccess();
  };

  const maxAmount = tokenBBalance !== undefined
    ? formatAmount(tokenBBalance, decimals, decimals)
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* USDT input */}
      <div>
        <label className="label">{tokenBSymbol} Amount</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            className="input-field pr-16"
            placeholder="0.00"
            value={usdtAmount}
            onChange={(e) => { setUsdtAmount(e.target.value); reset(); }}
          />
          {maxAmount !== undefined && (
            <button
              type="button"
              onClick={() => setUsdtAmount(maxAmount)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
            >
              MAX
            </button>
          )}
        </div>
        {tokenBBalance !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            Balance: {formatAmount(tokenBBalance, decimals, 4)} {tokenBSymbol}
          </p>
        )}
      </div>

      {/* USDC preview */}
      <div className="bg-gray-800/60 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{tokenASymbol} required</p>
          <p className="text-sm font-semibold text-white">
            {!debouncedAmount || parseFloat(debouncedAmount) <= 0
              ? "—"
              : isCalculating
              ? "…"
              : usdcRequired !== undefined
              ? formatAmount(usdcRequired as bigint, decimals, 4)
              : "N/A (no pool)"}
          </p>
        </div>
        {tokenABalance !== undefined && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Your balance</p>
            <p className="text-xs text-gray-400">
              {formatAmount(tokenABalance, decimals, 4)} {tokenASymbol}
            </p>
          </div>
        )}
      </div>

      {/* Insufficient balance warning */}
      {usdcRequired !== undefined &&
        tokenABalance !== undefined &&
        (usdcRequired as bigint) > tokenABalance && (
          <p className="text-xs text-red-400">
            Insufficient {tokenASymbol} balance
          </p>
        )}

      <button type="submit" className="btn-primary" disabled={isDisabled}>
        {status === "approving"
          ? "Approving..."
          : status === "pending"
          ? "Adding..."
          : "Add Liquidity"}
      </button>
      <TxStatusBadge status={status} txHash={txHash} error={error} />
    </form>
  );
}
