"use client";

import { useCallback, useState } from "react";
import type { LogicalRange } from "lightweight-charts";
import type { MarketHistoryPoint } from "../../hooks/useMarketHistory";
import type { MarketAnalyticsPoint } from "../../hooks/useMarketAnalytics";
import type {
  HistoricalIndicator,
  HistoryChartType,
  HistoryTimeframe,
} from "../../types/chart";
import { HistoryChartToolbar } from "./HistoryChartToolbar";
import { HistoricalMainChart } from "./HistoricalMainChart";
import { HistoryIndicatorSelector } from "./HistoryIndicatorSelector";
import { HistoricalIndicatorsPanel } from "./HistoricalIndicatorsPanel";

type Props = {
  symbol: string | null;
  historyData: MarketHistoryPoint[];
  analyticsData: MarketAnalyticsPoint[];
  historyLoading: boolean;
  analyticsLoading: boolean;
};

export function HistoricalDashboardCharts({
  symbol,
  historyData,
  analyticsData,
  historyLoading,
  analyticsLoading,
}: Props) {
  const [timeframe, setTimeframe] = useState<HistoryTimeframe>("1m");
  const [chartType, setChartType] = useState<HistoryChartType>("candles");
  const [visibleRange, setVisibleRange] = useState<LogicalRange | null>(null);

  const [indicators, setIndicators] = useState<HistoricalIndicator[]>([
    "orders",
    "depth",
    "imbalance",
  ]);

  const loading = historyLoading || analyticsLoading;

  const handleVisibleRangeChange = useCallback((range: LogicalRange | null) => {
    setVisibleRange(range);
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Historical Chart Terminal
            </h2>
            <p className="text-sm text-slate-400">
              Main price chart with synchronized timeframe indicators
            </p>
          </div>

          <HistoryChartToolbar
            timeframe={timeframe}
            chartType={chartType}
            onTimeframeChange={(nextTimeframe) => {
              setVisibleRange(null);
              setTimeframe(nextTimeframe);
            }}
            onChartTypeChange={setChartType}
          />
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <HistoryIndicatorSelector
            selected={indicators}
            onChange={setIndicators}
          />
        </div>
      </div>

      <HistoricalMainChart
        symbol={symbol}
        data={historyData}
        loading={loading}
        timeframe={timeframe}
        chartType={chartType}
        visibleRange={visibleRange}
        onVisibleRangeChange={handleVisibleRangeChange}
      />

      <HistoricalIndicatorsPanel
        historyData={historyData}
        analyticsData={analyticsData}
        indicators={indicators}
        timeframe={timeframe}
        visibleRange={visibleRange}
        onVisibleRangeChange={handleVisibleRangeChange}
      />
    </div>
  );
}