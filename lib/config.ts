import { http } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Replace with your actual contract address after deployment
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// Uniswap V2 LP pair address (USDC/USDT)
export const LP_TOKEN_ADDRESS: `0x${string}` = "0xDeae1ff5282D83AAdd42f85c57F6e69a037bf7Cd";

export const ARBITRUM_EXPLORER = "https://arbiscan.io";

export const wagmiConfig = getDefaultConfig({
  appName: "PeggedAsset",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
  },
  ssr: true,
});
