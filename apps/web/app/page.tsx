"use client";

import { useMemo, useState } from "react";
import type { DashboardMode } from "../types/dashboard";
import { useOrderBookMetrics } from "../hooks/useOrderBookMetrics";
import { useMarketHistory } from "../hooks/useMarketHistory";
import { useMarketAnalytics } from "../hooks/useMarketAnalytics";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { ImbalanceChart } from "../components/dashboard/ImbalanceChart";
import { LiquidityBarChart } from "../components/dashboard/LiquidityBarChart";
import { SymbolDetailsPanel } from "../components/dashboard/SymbolDetailsPanel";
import { SymbolImbalanceChart } from "../components/dashboard/SymbolImbalanceChart";
import { DepthZonesPanel } from "../components/dashboard/DepthZonesPanel";
import { DepthZonesChart } from "../components/dashboard/DepthZonesChart";
import { OrderBookTable } from "../components/dashboard/OrderBookTable";
import { WatchlistPanel } from "../components/dashboard/WatchlistPanel";
import { DashboardModeTabs } from "../components/dashboard/DashboardModeTabs";
import { HistoricalDashboardCharts } from "../components/dashboard/HistoricalDashboardCharts";
import { HistoryRangeSelector } from "../components/dashboard/HistoryRangeSelector";
import { HistoricalAnalyticsPanel } from "../components/dashboard/HistoricalAnalyticsPanel";

export default function HomePage() {
  const { rows, connected, imbalanceHistory, symbolHistory } =
    useOrderBookMetrics();

  const [mode, setMode] = useState<DashboardMode>("live");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(300);

  const selected = useMemo(() => {
    if (!selectedSymbol) return rows[0] ?? null;
    return rows.find((row) => row.symbol === selectedSymbol) ?? null;
  }, [rows, selectedSymbol]);

  const selectedHistory = selected ? symbolHistory[selected.symbol] ?? [] : [];

  const { data: historyData, loading: historyLoading } = useMarketHistory(
    selected?.symbol ?? null,
    historyLimit
  );

  const { data: analyticsData, loading: analyticsLoading } = useMarketAnalytics(
    selected?.symbol ?? null,
    historyLimit
  );

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-cyan-400/20 bg-black/30 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Power Analytics Platform
              </h1>
              <p className="text-sm text-slate-400">
                Live and historical CEX liquidity analytics terminal
              </p>
            </div>

            <div className="flex items-center gap-3">
              <DashboardModeTabs mode={mode} onChange={setMode} />

              {mode === "history" && (
                <HistoryRangeSelector
                  limit={historyLimit}
                  onChange={setHistoryLimit}
                />
              )}

              <div className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm">
                Binance Spot
              </div>

              <div className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm">
                {connected ? "🟢 Live connected" : "🔴 Disconnected"}
              </div>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <WatchlistPanel
            rows={rows}
            selectedSymbol={selected?.symbol ?? null}
            onSelectSymbol={setSelectedSymbol}
          />

          <div className="min-w-0 space-y-4">
            {mode === "live" ? (
              <>
                <DashboardStats rows={rows} />

                <div className="grid gap-4 2xl:grid-cols-2">
                  <ImbalanceChart data={imbalanceHistory} />

                  <SymbolImbalanceChart
                    symbol={selected?.symbol ?? null}
                    data={selectedHistory}
                  />
                </div>

                <div className="grid gap-4 2xl:grid-cols-2">
                  <LiquidityBarChart rows={rows} />
                  <DepthZonesChart zones={selected?.depthZones ?? []} />
                </div>
              </>
            ) : (
              <>
                <HistoricalDashboardCharts
                  symbol={selected?.symbol ?? null}
                  data={historyData}
                  loading={historyLoading}
                />

                <HistoricalAnalyticsPanel
                  symbol={selected?.symbol ?? null}
                  data={analyticsData}
                  loading={analyticsLoading}
                />
              </>
            )}
          </div>
        </section>

        {mode === "live" && (
          <>
            <section className="grid gap-4 p-4 pt-0 xl:grid-cols-2">
              <SymbolDetailsPanel selected={selected} />

              <DepthZonesPanel
                zones={selected?.depthZones ?? []}
                selectedDepth={selectedDepth}
                onSelectDepth={setSelectedDepth}
              />
            </section>

            <section className="p-4 pt-0">
              <OrderBookTable
                rows={rows}
                selectedSymbol={selected?.symbol ?? null}
                onSelectSymbol={setSelectedSymbol}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}