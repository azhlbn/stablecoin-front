"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS, LP_TOKEN_ADDRESS } from "@/lib/config";
import { PEGGED_ASSET_ABI, ERC20_ABI } from "@/lib/abi";
import { keccak256, toHex, zeroAddress } from "viem";

const SUPER_ADMIN = keccak256(toHex("SUPER_ADMIN"));
const ADMIN = keccak256(toHex("ADMIN"));

export function useContractData(address?: `0x${string}`) {
  const contract = { address: CONTRACT_ADDRESS, abi: PEGGED_ASSET_ABI };

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: "name" },
      { ...contract, functionName: "symbol" },
      { ...contract, functionName: "decimals" },
      { ...contract, functionName: "totalSupply" },
      { ...contract, functionName: "deviation" },
      { ...contract, functionName: "maxDeviation" },
      { ...contract, functionName: "maxSlippage" },
      { ...contract, functionName: "owner" },
      { ...contract, functionName: "tokenA" },
      { ...contract, functionName: "tokenB" },
      { ...contract, functionName: "pair" },
    ],
  });

  const { data: pegData } = useReadContract({
    ...contract,
    functionName: "currentPeg",
    query: { retry: false },
  });

  const { data: userBalance } = useReadContract({
    ...contract,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: { enabled: !!address },
  });

  const { data: isSuperAdmin } = useReadContract({
    ...contract,
    functionName: "hasRole",
    args: [SUPER_ADMIN, address ?? zeroAddress],
    query: { enabled: !!address },
  });

  const { data: isAdmin } = useReadContract({
    ...contract,
    functionName: "hasRole",
    args: [ADMIN, address ?? zeroAddress],
    query: { enabled: !!address },
  });

  const tokenAAddress = data?.[8]?.result as `0x${string}` | undefined;
  const tokenBAddress = data?.[9]?.result as `0x${string}` | undefined;
  // pairAddress from contract may be zero before first addLiquidity call,
  // so we always use the known LP_TOKEN_ADDRESS for balances and approvals
  const pairAddressFromContract = data?.[10]?.result as `0x${string}` | undefined;
  const pairAddress = LP_TOKEN_ADDRESS;

  const { data: tokenABalance } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: { enabled: !!address && !!tokenAAddress && tokenAAddress !== zeroAddress },
  });

  const { data: tokenBBalance } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: { enabled: !!address && !!tokenBAddress && tokenBAddress !== zeroAddress },
  });

  // LP balance always uses the known LP token address
  const { data: lpBalance } = useReadContract({
    address: LP_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: { enabled: !!address },
  });

  // This LP token uses 6 decimals (same as the stablecoins in the pool)
  const lpDecimals = 6;

  const { data: tokenASymbol } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!tokenAAddress && tokenAAddress !== zeroAddress },
  });

  const { data: tokenBSymbol } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!tokenBAddress && tokenBAddress !== zeroAddress },
  });

  return {
    name: data?.[0]?.result as string | undefined,
    symbol: data?.[1]?.result as string | undefined,
    decimals: data?.[2]?.result as number | undefined,
    totalSupply: data?.[3]?.result as bigint | undefined,
    deviation: data?.[4]?.result as bigint | undefined,
    maxDeviation: data?.[5]?.result as bigint | undefined,
    maxSlippage: data?.[6]?.result as bigint | undefined,
    owner: data?.[7]?.result as `0x${string}` | undefined,
    tokenAAddress,
    tokenBAddress,
    pairAddress,              // always LP_TOKEN_ADDRESS
    pairAddressFromContract,  // what the contract currently stores (may be zero)
    currentPeg: pegData as bigint | undefined,
    userBalance: userBalance as bigint | undefined,
    tokenABalance: tokenABalance as bigint | undefined,
    tokenBBalance: tokenBBalance as bigint | undefined,
    lpBalance: lpBalance as bigint | undefined,
    lpDecimals: 6,
    tokenASymbol: tokenASymbol as string | undefined,
    tokenBSymbol: tokenBSymbol as string | undefined,
    isSuperAdmin: isSuperAdmin as boolean | undefined,
    isAdmin: isAdmin as boolean | undefined,
    isLoading,
    refetch,
  };
}
