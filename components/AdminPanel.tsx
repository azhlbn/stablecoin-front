"use client";

import { useState } from "react";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TxStatusBadge } from "./TxStatus";
import { isAddress } from "viem";

type AdminAction = "issue" | "mint" | "burn" | "setMaxDeviation";

interface Props {
  action: AdminAction;
  symbol?: string;
  decimals?: number;
  onSuccess?: () => void;
}

const DESCRIPTIONS: Record<AdminAction, string> = {
  issue: "Transfer tokens from the contract's own balance to an address. Requires SUPER_ADMIN.",
  mint: "Mint new tokens to an address. Affects peg deviation. Requires SUPER_ADMIN.",
  burn: "Burn tokens from an address. Affects peg deviation. Requires SUPER_ADMIN.",
  setMaxDeviation: "Set the maximum allowed peg deviation. Requires SUPER_ADMIN.",
};

const BUTTON_LABELS: Record<AdminAction, string> = {
  issue: "Issue Tokens",
  mint: "Mint Tokens",
  burn: "Burn Tokens",
  setMaxDeviation: "Set Max Deviation",
};

const FIELD_LABELS: Record<AdminAction, string> = {
  issue: "Amount",
  mint: "Amount",
  burn: "Amount",
  setMaxDeviation: "Max Deviation",
};

export function AdminPanel({ action, symbol = "Token", decimals = 6, onSuccess }: Props) {
  const [targetAddress, setTargetAddress] = useState("");
  const [amount, setAmount] = useState("");

  const { issue, mint, burn, setMaxDeviation, status, txHash, error, reset } =
    useContractWrite();

  const needsAddress = action !== "setMaxDeviation";
  const isValidAddress = targetAddress === "" || isAddress(targetAddress);
  const isSubmitting = status === "pending" || status === "approving";

  const isDisabled =
    !amount ||
    (needsAddress && !isAddress(targetAddress)) ||
    isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsAddress && !isAddress(targetAddress)) return;
    if (!amount) return;

    switch (action) {
      case "issue":
        await issue(targetAddress as `0x${string}`, amount, decimals);
        break;
      case "mint":
        await mint(targetAddress as `0x${string}`, amount, decimals);
        break;
      case "burn":
        await burn(targetAddress as `0x${string}`, amount, decimals);
        break;
      case "setMaxDeviation":
        await setMaxDeviation(amount, decimals);
        break;
    }
    if (onSuccess) onSuccess();
  };

  // Reset fields when action changes
  // (handled via key prop in parent)

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">{DESCRIPTIONS[action]}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {needsAddress && (
          <div>
            <label className="label">Target Address</label>
            <input
              type="text"
              className={`input-field ${!isValidAddress ? "border-red-600" : ""}`}
              placeholder="0x..."
              value={targetAddress}
              onChange={(e) => { setTargetAddress(e.target.value); reset(); }}
            />
            {!isValidAddress && (
              <p className="text-red-400 text-xs mt-1">Invalid address</p>
            )}
          </div>
        )}

        <div>
          <label className="label">
            {FIELD_LABELS[action]}{" "}
            <span className="text-gray-600">({symbol})</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            className="input-field"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); reset(); }}
          />
        </div>

        <button
          type="submit"
          className={action === "burn" ? "btn-danger" : "btn-primary"}
          disabled={isDisabled}
        >
          {isSubmitting ? "Confirming..." : BUTTON_LABELS[action]}
        </button>

        <TxStatusBadge status={status} txHash={txHash} error={error} />
      </form>
    </div>
  );
}
