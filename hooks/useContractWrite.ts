"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { PEGGED_ASSET_ABI, ERC20_ABI } from "@/lib/abi";
import { parseUnits, maxUint256 } from "viem";

export type TxStatus = "idle" | "approving" | "pending" | "success" | "error";

export function useContractWrite() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const reset = () => {
    setStatus("idle");
    setTxHash(undefined);
    setError(undefined);
  };

  /**
   * Check allowance and approve if needed.
   * Does NOT change status itself — caller controls status flow.
   */
  async function ensureApproval(
    tokenAddress: `0x${string}`,
    ownerAddress: `0x${string}`,
    amount: bigint
  ): Promise<void> {
    if (!publicClient) throw new Error("No public client");

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [ownerAddress, CONTRACT_ADDRESS],
    });

    if (allowance < amount) {
      setStatus("approving");
      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, maxUint256],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      // Back to pending after approval
      setStatus("pending");
    }
  }

  /**
   * addLiquidity(uint256 usdtAmount)
   *
   * The contract takes usdtAmount (tokenB, 6 decimals) and calculates
   * tokenA amount from pool reserves internally. Both tokens must be
   * approved before the call.
   *
   * Flow:
   *  1. Parse usdtAmount with 6 decimals (USDT)
   *  2. Approve tokenB for exact parsed amount (if needed)
   *  3. Approve tokenA for maxUint256 (contract calculates the exact
   *     amount from reserves — we don't know it upfront)
   *  4. Call addLiquidity(parsedUsdtAmount)
   */
  async function addLiquidity(
    usdtAmount: string,
    tokenBAddress: `0x${string}`,  // USDT
    tokenAAddress: `0x${string}`,  // USDC
    userAddress: `0x${string}`,
    decimalsB: number = 6,
    decimalsA: number = 6
  ) {
    try {
      reset();
      setStatus("pending");

      const parsedB = parseUnits(usdtAmount, decimalsB);

      // Step 1: approve USDT (tokenB) for the exact amount
      await ensureApproval(tokenBAddress, userAddress, parsedB);

      // Step 2: approve USDC (tokenA) — amount is unknown until contract
      // reads reserves, so we approve maxUint256 once
      await ensureApproval(tokenAAddress, userAddress, maxUint256);

      setStatus("pending");

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "addLiquidity",
        args: [parsedB],
      });

      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  /**
   * removeLiquidity(uint256 burnAmount)
   * burnAmount is in pegged token decimals (same as contract decimals).
   * No approval needed — burns msg.sender's own pegged tokens.
   */
  async function removeLiquidity(burnAmount: string, decimals: number = 6) {
    try {
      reset();
      setStatus("pending");

      const parsed = parseUnits(burnAmount, decimals);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "removeLiquidity",
        args: [parsed],
      });

      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  /**
   * addLP(uint256 liquidity)
   * Deposits existing Uniswap V2 LP tokens (18 decimals).
   * Must approve LP token transfer to contract first.
   */
  async function addLP(
    liquidity: string,
    pairAddress: `0x${string}`,
    userAddress: `0x${string}`,
    decimals: number = 6
  ) {
    try {
      reset();
      setStatus("pending");

      const parsed = parseUnits(liquidity, decimals);

      // LP token approval
      await ensureApproval(pairAddress, userAddress, parsed);

      setStatus("pending");

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "addLP",
        args: [parsed],
      });

      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function issue(to: `0x${string}`, value: string, decimals: number = 6) {
    try {
      reset();
      setStatus("pending");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "issue",
        args: [to, parseUnits(value, decimals)],
      });
      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function mint(who: `0x${string}`, amount: string, decimals: number = 6) {
    try {
      reset();
      setStatus("pending");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "mint",
        args: [who, parseUnits(amount, decimals)],
      });
      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function burn(who: `0x${string}`, amount: string, decimals: number = 6) {
    try {
      reset();
      setStatus("pending");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "burn",
        args: [who, parseUnits(amount, decimals)],
      });
      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function setMaxDeviation(value: string, decimals: number = 6) {
    try {
      reset();
      setStatus("pending");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: PEGGED_ASSET_ABI,
        functionName: "setMaxDeviation",
        args: [parseUnits(value, decimals)],
      });
      setTxHash(hash);
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return {
    status,
    txHash,
    error,
    reset,
    addLiquidity,
    removeLiquidity,
    addLP,
    issue,
    mint,
    burn,
    setMaxDeviation,
  };
}
