"use client";

import { useState } from "react";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TxStatusBadge } from "./TxStatus";
import { formatAmount } from "@/lib/utils";

interface Props {
  userBalance?: bigint;
  symbol?: string;
  decimals?: number;
  onSuccess?: () => void;
}

export function RemoveLiquidityForm({
  userBalance,
  symbol = "Token",
  decimals = 18,
  onSuccess,
}: Props) {
  const [burnAmount, setBurnAmount] = useState("");
  const { removeLiquidity, status, txHash, error, reset } = useContractWrite();

  const isDisabled =
    !burnAmount || status === "pending" || status === "approving";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await removeLiquidity(burnAmount, decimals);
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">{symbol} Amount to Burn</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            className="input-field pr-20"
            placeholder="0.00"
            value={burnAmount}
            onChange={(e) => { setBurnAmount(e.target.value); reset(); }}
          />
          {userBalance !== undefined && (
            <button
              type="button"
              onClick={() => setBurnAmount(formatAmount(userBalance, decimals))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
            >
              MAX
            </button>
          )}
        </div>
        {userBalance !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            Balance: {formatAmount(userBalance, decimals)} {symbol}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Burns {symbol} tokens and removes LP from the pool. Half of burn amount = LP removed.
      </p>
      <button type="submit" className="btn-danger" disabled={isDisabled}>
        {status === "pending" ? "Removing..." : "Remove Liquidity"}
      </button>
      <TxStatusBadge status={status} txHash={txHash} error={error} />
    </form>
  );
}
