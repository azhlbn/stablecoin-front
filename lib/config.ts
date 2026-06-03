import { http } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Replace with your actual contract address after deployment
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

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
