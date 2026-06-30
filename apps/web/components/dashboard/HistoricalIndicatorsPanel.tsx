"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange,
  type LineData,
} from "lightweight-charts";
import type { MarketHistoryPoint } from "../../hooks/useMarketHistory";
import type { MarketAnalyticsPoint } from "../../hooks/useMarketAnalytics";
import type {
  HistoricalIndicator,
  HistoryTimeframe,
} from "../../types/chart";
import {
  aggregateAnalyticsByTimeframe,
  aggregateHistoryByTimeframe,
} from "../../lib/chart/history-aggregation";

type Props = {
  historyData: MarketHistoryPoint[];
  analyticsData: MarketAnalyticsPoint[];
  indicators: HistoricalIndicator[];
  timeframe: HistoryTimeframe;
  visibleRange: LogicalRange | null;
  onVisibleRangeChange: (range: LogicalRange | null) => void;
};

type IndicatorChartProps = {
  title: string;
  description: string;
  lines: {
    name: string;
    data: LineData[];
    color: string;
  }[];
  visibleRange: LogicalRange | null;
  onVisibleRangeChange: (range: LogicalRange | null) => void;
};

function IndicatorChart({
  title,
  description,
  lines,
  visibleRange,
  onVisibleRangeChange,
}: IndicatorChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<"Line">[]>([]);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    seriesRefs.current = [];

    const chart = createChart(container, {
      height: 220,
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    for (const line of lines) {
      const series = chart.addSeries(LineSeries, {
        color: line.color,
        lineWidth: 2,
        title: line.name,
      });

      series.setData(line.data);
      seriesRefs.current.push(series);
    }

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (isSyncingRef.current) return;
      onVisibleRangeChange(range);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      chart.applyOptions({
        width: entry.contentRect.width,
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRefs.current = [];
    };
  }, [lines, onVisibleRangeChange]);

  useEffect(() => {
    if (!chartRef.current || !visibleRange) return;

    isSyncingRef.current = true;
    chartRef.current.timeScale().setVisibleLogicalRange(visibleRange);

    queueMicrotask(() => {
      isSyncingRef.current = false;
    });
  }, [visibleRange]);

  useEffect(() => {
    if (!chartRef.current || visibleRange) return;
    chartRef.current.timeScale().fitContent();
  }, [visibleRange, lines]);

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div ref={containerRef} className="h-[220px] w-full" />
    </div>
  );
}

export function HistoricalIndicatorsPanel({
  historyData,
  analyticsData,
  indicators,
  timeframe,
  visibleRange,
  onVisibleRangeChange,
}: Props) {
  const history = useMemo(
    () => aggregateHistoryByTimeframe(historyData, timeframe),
    [historyData, timeframe]
  );

  const analytics = useMemo(
    () => aggregateAnalyticsByTimeframe(analyticsData, timeframe),
    [analyticsData, timeframe]
  );

  if (indicators.length === 0) {
    return (
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 text-sm text-slate-400">
        No indicators selected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {indicators.includes("orders") && (
        <IndicatorChart
          title="Orders Indicator"
          description={`Buy/Sell orders aggregated to ${timeframe.toUpperCase()}`}
          visibleRange={visibleRange}
          onVisibleRangeChange={onVisibleRangeChange}
          lines={[
            {
              name: "Buy orders",
              color: "#22c55e",
              data: history.map((row) => ({
                time: row.time,
                value: row.buyValue,
              })),
            },
            {
              name: "Sell orders",
              color: "#ef4444",
              data: history.map((row) => ({
                time: row.time,
                value: row.sellValue,
              })),
            },
          ]}
        />
      )}

      {indicators.includes("depth") && (
        <IndicatorChart
          title="Depth Indicator"
          description={`Depth zones aggregated to ${timeframe.toUpperCase()}`}
          visibleRange={visibleRange}
          onVisibleRangeChange={onVisibleRangeChange}
          lines={[
            {
              name: "0-1%",
              color: "#22d3ee",
              data: history.map((row) => ({
                time: row.time,
                value: row.depth1,
              })),
            },
            {
              name: "1-3%",
              color: "#3b82f6",
              data: history.map((row) => ({
                time: row.time,
                value: row.depth3,
              })),
            },
            {
              name: "3-5%",
              color: "#a855f7",
              data: history.map((row) => ({
                time: row.time,
                value: row.depth5,
              })),
            },
            {
              name: "5-10%",
              color: "#f59e0b",
              data: history.map((row) => ({
                time: row.time,
                value: row.depth10,
              })),
            },
            {
              name: "10-30%",
              color: "#f97316",
              data: history.map((row) => ({
                time: row.time,
                value: row.depth30,
              })),
            },
          ]}
        />
      )}

      {indicators.includes("imbalance") && (
        <IndicatorChart
          title="Imbalance Indicator"
          description={`Buy/Sell imbalance aggregated to ${timeframe.toUpperCase()}`}
          visibleRange={visibleRange}
          onVisibleRangeChange={onVisibleRangeChange}
          lines={[
            {
              name: "Imbalance",
              color: "#22d3ee",
              data: history.map((row) => ({
                time: row.time,
                value: row.imbalance,
              })),
            },
          ]}
        />
      )}

      {indicators.includes("liquidityDelta") && (
        <IndicatorChart
          title="Liquidity Delta Indicator"
          description={`Liquidity flow aggregated to ${timeframe.toUpperCase()}`}
          visibleRange={visibleRange}
          onVisibleRangeChange={onVisibleRangeChange}
          lines={[
            {
              name: "Buy delta",
              color: "#22c55e",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.buyLiquidityChangeUSDT,
              })),
            },
            {
              name: "Sell delta",
              color: "#ef4444",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.sellLiquidityChangeUSDT,
              })),
            },
            {
              name: "Total delta",
              color: "#22d3ee",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.totalLiquidityChangeUSDT,
              })),
            },
          ]}
        />
      )}

      {indicators.includes("wallDelta") && (
        <IndicatorChart
          title="Wall Delta Indicator"
          description={`Largest wall changes aggregated to ${timeframe.toUpperCase()}`}
          visibleRange={visibleRange}
          onVisibleRangeChange={onVisibleRangeChange}
          lines={[
            {
              name: "Buy wall delta",
              color: "#22c55e",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.largestBuyWallChangeUSDT,
              })),
            },
            {
              name: "Sell wall delta",
              color: "#ef4444",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.largestSellWallChangeUSDT,
              })),
            },
          ]}
        />
      )}

      {indicators.includes("scores") && (
        <IndicatorChart
          title="Scores Indicator"
          description={`Scores averaged to ${timeframe.toUpperCase()}`}
          visibleRange={visibleRange}
          onVisibleRangeChange={onVisibleRangeChange}
          lines={[
            {
              name: "Buy pressure",
              color: "#22c55e",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.buyPressureScore,
              })),
            },
            {
              name: "Sell pressure",
              color: "#ef4444",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.sellPressureScore,
              })),
            },
            {
              name: "Liquidity flow",
              color: "#22d3ee",
              data: analytics.map((row) => ({
                time: row.time,
                value: row.liquidityFlowScore,
              })),
            },
          ]}
        />
      )}
    </div>
  );
}