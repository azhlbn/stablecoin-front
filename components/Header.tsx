"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Taint Reduction"
            width={32}
            height={32}
            className="rounded-full ring-1 ring-gray-600"
          />
          <div>
            <h1 className="text-sm font-bold text-white">Taint Reduction</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
        <ConnectButton
          accountStatus="avatar"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
}
