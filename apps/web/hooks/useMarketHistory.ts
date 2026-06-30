"use client";

import { useEffect, useState } from "react";

export type HistoricalDepthZone = {
  percent: number;

  buyValue: number;
  sellValue: number;
  totalValue: number;

  diffValue: number;
  imbalancePercent: number;

  bidLevels: number;
  askLevels: number;
};

export type MarketHistoryPoint = {
  id: string;

  exchange: string;
  symbol: string;

  minute: string;

  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  avgPrice: number;

  avgBuyValueUSDT: number;
  avgSellValueUSDT: number;
  avgTotalValueUSDT: number;
  avgDiffUSDT: number;

  avgImbalancePercent: number;
  avgSpread: number;

  minImbalancePercent: number;
  maxImbalancePercent: number;

  samplesCount: number;

  depthZones: HistoricalDepthZone[];

  lastState: unknown;
};

export function useMarketHistory(
  symbol: string | null,
  limit = 300
) {
  const [data, setData] = useState<MarketHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setData([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:4000/history/${symbol}?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to load history");
        }

        const rows =
          (await response.json()) as MarketHistoryPoint[];

        if (!cancelled) {
          setData(rows);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [symbol, limit]);

  return {
    data,
    loading,
  };
}