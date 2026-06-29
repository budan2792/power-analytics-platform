"use client";

import { useOrderBookMetrics } from "../hooks/useOrderBookMetrics";
import { OrderBookTable } from "../components/dashboard/OrderBookTable";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { ImbalanceChart } from "../components/dashboard/ImbalanceChart";

export default function HomePage() {
  const { rows, connected, imbalanceHistory } = useOrderBookMetrics();

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

        <ImbalanceChart data={imbalanceHistory} />

        <OrderBookTable rows={rows} />
      </section>
    </main>
  );
}