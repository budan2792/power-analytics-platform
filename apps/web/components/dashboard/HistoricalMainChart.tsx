"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange,
} from "lightweight-charts";
import type { MarketHistoryPoint } from "../../hooks/useMarketHistory";
import type { HistoryChartType, HistoryTimeframe } from "../../types/chart";
import { aggregateHistoryByTimeframe } from "../../lib/chart/history-aggregation";

type Props = {
  symbol: string | null;
  data: MarketHistoryPoint[];
  loading: boolean;
  timeframe: HistoryTimeframe;
  chartType: HistoryChartType;
  visibleRange: LogicalRange | null;
  onVisibleRangeChange: (range: LogicalRange | null) => void;
};

export function HistoricalMainChart({
  symbol,
  data,
  loading,
  timeframe,
  chartType,
  visibleRange,
  onVisibleRangeChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null
  >(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const isSyncingRef = useRef(false);

  const candles = useMemo(
    () => aggregateHistoryByTimeframe(data, timeframe),
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
    });

    chartRef.current = chart;

    if (chartType === "candles") {
      mainSeriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
    } else {
      mainSeriesRef.current = chart.addSeries(LineSeries, {
        color: "#facc15",
        lineWidth: 2,
      });
    }

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

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
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [chartType, onVisibleRangeChange]);

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

    if (!visibleRange) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, chartType, visibleRange]);

  useEffect(() => {
    if (!chartRef.current || !visibleRange) return;

    isSyncingRef.current = true;
    chartRef.current.timeScale().setVisibleLogicalRange(visibleRange);

    queueMicrotask(() => {
      isSyncingRef.current = false;
    });
  }, [visibleRange]);

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
            {timeframe.toUpperCase()} · synchronized indicators
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