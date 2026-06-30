"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { MarketHistoryPoint } from "../../hooks/useMarketHistory";
import type { HistoryChartType, HistoryTimeframe } from "../../types/chart";
import { HISTORY_TIMEFRAMES } from "../../types/chart";

type Props = {
  symbol: string | null;
  data: MarketHistoryPoint[];
  loading: boolean;
  timeframe: HistoryTimeframe;
  chartType: HistoryChartType;
};

type AggregatedCandle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  buyValue: number;
  sellValue: number;
  totalValue: number;
};

function getTimeframeMinutes(timeframe: HistoryTimeframe) {
  return (
    HISTORY_TIMEFRAMES.find((option) => option.value === timeframe)?.minutes ??
    1
  );
}

function toBucketStartMs(dateMs: number, timeframeMinutes: number) {
  const bucketMs = timeframeMinutes * 60 * 1000;
  return Math.floor(dateMs / bucketMs) * bucketMs;
}

function aggregateHistory(
  data: MarketHistoryPoint[],
  timeframe: HistoryTimeframe
): AggregatedCandle[] {
  const timeframeMinutes = getTimeframeMinutes(timeframe);
  const buckets = new Map<number, AggregatedCandle>();

  for (const row of data) {
    const dateMs = new Date(row.minute).getTime();
    const bucketStartMs = toBucketStartMs(dateMs, timeframeMinutes);
    const bucketTime = Math.floor(bucketStartMs / 1000) as UTCTimestamp;

    const existing = buckets.get(bucketStartMs);

    if (!existing) {
      buckets.set(bucketStartMs, {
        time: bucketTime,
        open: row.openPrice,
        high: row.highPrice,
        low: row.lowPrice,
        close: row.closePrice,
        buyValue: row.avgBuyValueUSDT,
        sellValue: row.avgSellValueUSDT,
        totalValue: row.avgTotalValueUSDT,
      });

      continue;
    }

    existing.high = Math.max(existing.high, row.highPrice);
    existing.low = Math.min(existing.low, row.lowPrice);
    existing.close = row.closePrice;
    existing.buyValue += row.avgBuyValueUSDT;
    existing.sellValue += row.avgSellValueUSDT;
    existing.totalValue += row.avgTotalValueUSDT;
  }

  return [...buckets.values()].sort((a, b) => Number(a.time) - Number(b.time));
}

export function HistoricalMainChart({
  symbol,
  data,
  loading,
  timeframe,
  chartType,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null>(
    null
  );
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const candles = useMemo(
    () => aggregateHistory(data, timeframe),
    [data, timeframe]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const chart = createChart(container, {
      height: 460,
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
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;

    if (chartType === "candles") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });

      mainSeriesRef.current = series;
    } else {
      const series = chart.addSeries(LineSeries, {
        color: "#facc15",
        lineWidth: 2,
      });

      mainSeriesRef.current = series;
    }

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "rgba(34, 211, 238, 0.45)",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

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
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [chartType]);

  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current || !chartRef.current) {
      return;
    }

    if (chartType === "candles") {
      const series = mainSeriesRef.current as ISeriesApi<"Candlestick">;

      series.setData(
        candles.map((candle) => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }))
      );
    } else {
      const series = mainSeriesRef.current as ISeriesApi<"Line">;

      series.setData(
        candles.map((candle) => ({
          time: candle.time,
          value: candle.close,
        }))
      );
    }

    volumeSeriesRef.current.setData(
      candles.map((candle) => ({
        time: candle.time,
        value: candle.totalValue,
        color:
          candle.close >= candle.open
            ? "rgba(34, 197, 94, 0.45)"
            : "rgba(239, 68, 68, 0.45)",
      }))
    );

    chartRef.current.timeScale().fitContent();
  }, [candles, chartType]);

  const latest = candles[candles.length - 1];

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {symbol ? `${symbol} Price Chart` : "Price Chart"}
          </h2>

          <p className="text-sm text-slate-400">
            {chartType === "candles" ? "Japanese candles" : "Line chart"} ·{" "}
            {timeframe.toUpperCase()} · aggregated from minute snapshots
          </p>
        </div>

        <div className="text-right text-sm">
          {loading ? (
            <span className="text-slate-400">Loading...</span>
          ) : latest ? (
            <>
              <div className="text-slate-400">Close</div>
              <div className="text-lg font-semibold text-cyan-300">
                ${latest.close.toLocaleString()}
              </div>
            </>
          ) : (
            <span className="text-slate-400">No data</span>
          )}
        </div>
      </div>

      <div ref={containerRef} className="h-[460px] w-full" />
    </div>
  );
}