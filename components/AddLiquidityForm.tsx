"use client";

import { useState } from "react";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TxStatusBadge } from "./TxStatus";
import { formatAmount } from "@/lib/utils";

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
  tokenASymbol = "Token A",
  tokenBSymbol = "Token B",
  tokenABalance,
  tokenBBalance,
  decimals = 6,
  userAddress,
  onSuccess,
}: Props) {
  const [usdtAmount, setUsdtAmount] = useState("");
  const { addLiquidity, status, txHash, error, reset } = useContractWrite();

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
      <p className="text-xs text-gray-500">
        {tokenASymbol} amount will be calculated automatically from pool reserves.
      </p>
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
