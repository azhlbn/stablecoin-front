"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { StatsPanel } from "@/components/StatsPanel";
import { AddLiquidityForm } from "@/components/AddLiquidityForm";
import { RemoveLiquidityForm } from "@/components/RemoveLiquidityForm";
import { AddLPForm } from "@/components/AddLPForm";
import { AdminPanel } from "@/components/AdminPanel";
import { useContractData } from "@/hooks/useContractData";
import { CONTRACT_ADDRESS, ARBITRUM_EXPLORER } from "@/lib/config";
import { shortenAddress } from "@/lib/utils";

type ActiveTab =
  | "addLiquidity"
  | "removeLiquidity"
  | "addLP"
  | "issue"
  | "mint"
  | "burn"
  | "setMaxDeviation";

const TABS: { id: ActiveTab; label: string; icon: string; adminOnly: boolean }[] = [
  { id: "addLiquidity",    label: "Add Liquidity",    icon: "➕", adminOnly: false },
  { id: "removeLiquidity", label: "Remove Liquidity", icon: "➖", adminOnly: false },
  { id: "addLP",           label: "Add LP",           icon: "🔁", adminOnly: false },
  { id: "issue",           label: "Issue",            icon: "📤", adminOnly: true  },
  { id: "mint",            label: "Mint",             icon: "🪙", adminOnly: true  },
  { id: "burn",            label: "Burn",             icon: "🔥", adminOnly: true  },
  { id: "setMaxDeviation", label: "Max Deviation",    icon: "⚖️", adminOnly: true  },
];

// Map individual admin tabs to the sub-tab inside AdminPanel
const ADMIN_TAB_MAP: Record<string, "issue" | "mint" | "burn" | "setMaxDeviation"> = {
  issue: "issue",
  mint: "mint",
  burn: "burn",
  setMaxDeviation: "setMaxDeviation",
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<ActiveTab>("addLiquidity");

  const data = useContractData(address);
  const { refetch } = data;

  const handleSuccess = useCallback(() => {
    setTimeout(() => refetch(), 2000);
  }, [refetch]);

  const isAdminTab = TABS.find((t) => t.id === activeTab)?.adminOnly ?? false;
  const hasAdminAccess = data.isSuperAdmin;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Contract address */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <span>Contract:</span>
          <a
            href={`${ARBITRUM_EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-gray-400 hover:text-gray-300 transition-colors"
          >
            {CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
              ? "⚠️  Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local"
              : shortenAddress(CONTRACT_ADDRESS)}
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left — stats */}
          <div>
            <StatsPanel {...data} />
          </div>

          {/* Right — actions */}
          <div>
            {!isConnected ? (
              <div className="card flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">🔗</div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Connect your wallet
                </h2>
                <p className="text-sm text-gray-500">
                  Connect to interact with the PeggedAsset contract
                </p>
              </div>
            ) : (
              <div className="card">
                {/* Tab bar — split into public and admin groups */}
                <div className="space-y-2 mb-6">
                  {/* Public tabs */}
                  <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
                    {TABS.filter((t) => !t.adminOnly).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${
                          activeTab === t.id
                            ? "bg-gray-700 text-white"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Admin tabs */}
                  <div className="flex gap-1 bg-gray-800/30 rounded-lg p-1 border border-gray-800">
                    <span className="flex items-center px-2 text-xs text-gray-600 font-medium shrink-0">
                      🔑
                    </span>
                    {TABS.filter((t) => t.adminOnly).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-colors ${
                          activeTab === t.id
                            ? "bg-gray-700 text-white"
                            : hasAdminAccess
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-700 cursor-not-allowed"
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}

                {activeTab === "addLiquidity" && (
                  <>
                    <h3 className="section-title">
                      <span>➕</span> Add Liquidity
                    </h3>
                    <AddLiquidityForm
                      tokenAAddress={data.tokenAAddress}
                      tokenBAddress={data.tokenBAddress}
                      tokenASymbol={data.tokenASymbol}
                      tokenBSymbol={data.tokenBSymbol}
                      tokenABalance={data.tokenABalance}
                      tokenBBalance={data.tokenBBalance}
                      decimals={data.decimals}
                      userAddress={address}
                      onSuccess={handleSuccess}
                    />
                  </>
                )}

                {activeTab === "removeLiquidity" && (
                  <>
                    <h3 className="section-title">
                      <span>➖</span> Remove Liquidity
                    </h3>
                    <RemoveLiquidityForm
                      userBalance={data.userBalance}
                      symbol={data.symbol}
                      decimals={data.decimals}
                      onSuccess={handleSuccess}
                    />
                  </>
                )}

                {activeTab === "addLP" && (
                  <>
                    <h3 className="section-title">
                      <span>🔁</span> Add LP Tokens
                    </h3>
                    <AddLPForm
                      pairAddress={data.pairAddress}
                      lpBalance={data.lpBalance}
                      userAddress={address}
                      onSuccess={handleSuccess}
                    />
                  </>
                )}

                {isAdminTab && !hasAdminAccess && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-3xl mb-3">🔒</div>
                    <p className="text-sm font-medium text-gray-400">SUPER_ADMIN role required</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your wallet does not have permission to use this function.
                    </p>
                  </div>
                )}

                {isAdminTab && hasAdminAccess && (
                  <>
                    <h3 className="section-title">
                      <span>
                        {TABS.find((t) => t.id === activeTab)?.icon}
                      </span>{" "}
                      {TABS.find((t) => t.id === activeTab)?.label}
                    </h3>
                    <AdminPanel
                      key={activeTab}
                      initialTab={ADMIN_TAB_MAP[activeTab]}
                      symbol={data.symbol}
                      decimals={data.decimals}
                      onSuccess={handleSuccess}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
