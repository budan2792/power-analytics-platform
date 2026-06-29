"use client";

import { useMemo, useState } from "react";
import { useOrderBookMetrics } from "../hooks/useOrderBookMetrics";
import { OrderBookTable } from "../components/dashboard/OrderBookTable";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { ImbalanceChart } from "../components/dashboard/ImbalanceChart";
import { LiquidityBarChart } from "../components/dashboard/LiquidityBarChart";
import { SymbolDetailsPanel } from "../components/dashboard/SymbolDetailsPanel";
import { SymbolImbalanceChart } from "../components/dashboard/SymbolImbalanceChart";

export default function HomePage() {
  const { rows, connected, imbalanceHistory, symbolHistory } =
    useOrderBookMetrics();

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (!selectedSymbol) return rows[0] ?? null;
    return rows.find((row) => row.symbol === selectedSymbol) ?? null;
  }, [rows, selectedSymbol]);

  const selectedHistory = selected ? symbolHistory[selected.symbol] ?? [] : [];

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Power Analytics Platform
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Live CEX liquidity and order book analytics
            </p>
          </div>

          <div className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm">
            {connected ? "🟢 Live connected" : "🔴 Disconnected"}
          </div>
        </div>

        <DashboardStats rows={rows} />

        <SymbolDetailsPanel selected={selected} />

        <div className="grid gap-6 xl:grid-cols-2">
          <ImbalanceChart data={imbalanceHistory} />

          <SymbolImbalanceChart
            symbol={selected?.symbol ?? null}
            data={selectedHistory}
          />
        </div>

        <LiquidityBarChart rows={rows} />

        <OrderBookTable
          rows={rows}
          selectedSymbol={selected?.symbol ?? null}
          onSelectSymbol={setSelectedSymbol}
        />
      </section>
    </main>
  );
}