"use client";

import { useState } from "react";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TxStatusBadge } from "./TxStatus";
import { formatAmount } from "@/lib/utils";

interface Props {
  pairAddress?: `0x${string}`;
  lpBalance?: bigint;
  lpDecimals?: number;
  userAddress?: `0x${string}`;
  onSuccess?: () => void;
}

export function AddLPForm({
  pairAddress,
  lpBalance,
  lpDecimals = 6,
  userAddress,
  onSuccess,
}: Props) {
  const [liquidity, setLiquidity] = useState("");
  const { addLP, status, txHash, error, reset } = useContractWrite();

  const isDisabled =
    !liquidity || !userAddress || !pairAddress || status === "pending" || status === "approving";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairAddress || !userAddress) return;
    await addLP(liquidity, pairAddress, userAddress, lpDecimals);
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">LP Token Amount</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            className="input-field pr-20"
            placeholder="0.00"
            value={liquidity}
            onChange={(e) => { setLiquidity(e.target.value); reset(); }}
          />
          {lpBalance !== undefined && (
            <button
              type="button"
              onClick={() => setLiquidity(formatAmount(lpBalance, lpDecimals))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
            >
              MAX
            </button>
          )}
        </div>
        {lpBalance !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            LP Balance: {formatAmount(lpBalance, lpDecimals)}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Deposits existing LP tokens and mints 2× in pegged tokens (no new pool liquidity).
      </p>
      <button type="submit" className="btn-primary" disabled={isDisabled}>
        {status === "approving"
          ? "Approving LP..."
          : status === "pending"
          ? "Depositing..."
          : "Add LP"}
      </button>
      <TxStatusBadge status={status} txHash={txHash} error={error} />
    </form>
  );
}
