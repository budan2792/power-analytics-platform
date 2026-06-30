"use client";

import { useEffect, useState } from "react";

export type MarketAnalyticsPoint = {
  id: string;

  snapshotId: string;

  exchange: string;
  symbol: string;
  minute: string;

  priceChangeUSDT: number;
  priceChangePct: number;

  buyLiquidityChangeUSDT: number;
  buyLiquidityChangePct: number;

  sellLiquidityChangeUSDT: number;
  sellLiquidityChangePct: number;

  totalLiquidityChangeUSDT: number;
  totalLiquidityChangePct: number;

  imbalanceChangePct: number;

  spreadChangeUSDT: number;
  spreadChangePct: number;

  largestBuyWallChangeUSDT: number;
  largestBuyWallChangePct: number;

  largestSellWallChangeUSDT: number;
  largestSellWallChangePct: number;

  depth1ChangeUSDT: number;
  depth3ChangeUSDT: number;
  depth5ChangeUSDT: number;
  depth10ChangeUSDT: number;
  depth30ChangeUSDT: number;

  buyPressureScore: number;
  sellPressureScore: number;
  liquidityFlowScore: number;
  volatilityScore: number;
  wallActivityScore: number;

  summary: unknown;

  createdAt: string;
};

export function useMarketAnalytics(symbol: string | null, limit = 300) {
  const [data, setData] = useState<MarketAnalyticsPoint[]>([]);
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
          `http://localhost:4000/analytics/${symbol}?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }

        const rows = (await response.json()) as MarketAnalyticsPoint[];

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