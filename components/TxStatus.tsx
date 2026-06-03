"use client";

import { type TxStatus } from "@/hooks/useContractWrite";
import { formatTxHash } from "@/lib/utils";
import { ARBITRUM_EXPLORER } from "@/lib/config";

interface Props {
  status: TxStatus;
  txHash?: `0x${string}`;
  error?: string;
}

export function TxStatusBadge({ status, txHash, error }: Props) {
  if (status === "idle") return null;

  return (
    <div className="mt-3 text-xs">
      {status === "approving" && (
        <div className="flex items-center gap-2 text-yellow-400">
          <span className="animate-spin inline-block">⏳</span>
          <span>Approving token...</span>
        </div>
      )}
      {status === "pending" && (
        <div className="flex items-center gap-2 text-blue-400">
          <span className="animate-spin inline-block">⏳</span>
          <span>Transaction pending...</span>
        </div>
      )}
      {status === "success" && (
        <div className="space-y-1">
          <span className="badge-success">✓ Success</span>
          {txHash && (
            <div>
              <a
                href={`${ARBITRUM_EXPLORER}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                {formatTxHash(txHash)}
              </a>
            </div>
          )}
        </div>
      )}
      {status === "error" && (
        <div className="space-y-1">
          <span className="badge-error">✗ Error</span>
          {error && (
            <p className="text-red-400 text-xs break-words max-w-xs">
              {error.slice(0, 200)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
