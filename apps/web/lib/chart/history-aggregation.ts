import type { UTCTimestamp } from "lightweight-charts";
import type { MarketHistoryPoint } from "../../hooks/useMarketHistory";
import type { MarketAnalyticsPoint } from "../../hooks/useMarketAnalytics";
import type { HistoryTimeframe } from "../../types/chart";
import { HISTORY_TIMEFRAMES } from "../../types/chart";

export type AggregatedHistoryPoint = {
  time: UTCTimestamp;

  open: number;
  high: number;
  low: number;
  close: number;

  buyValue: number;
  sellValue: number;
  totalValue: number;

  depth1: number;
  depth3: number;
  depth5: number;
  depth10: number;
  depth30: number;

  imbalance: number;
  samples: number;
};

export type AggregatedAnalyticsPoint = {
  time: UTCTimestamp;

  buyLiquidityChangeUSDT: number;
  sellLiquidityChangeUSDT: number;
  totalLiquidityChangeUSDT: number;

  largestBuyWallChangeUSDT: number;
  largestSellWallChangeUSDT: number;

  buyPressureScore: number;
  sellPressureScore: number;
  liquidityFlowScore: number;

  samples: number;
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

function getDepthValue(row: MarketHistoryPoint, percent: number) {
  return row.depthZones?.find((zone) => zone.percent === percent)?.totalValue ?? 0;
}

export function aggregateHistoryByTimeframe(
  data: MarketHistoryPoint[],
  timeframe: HistoryTimeframe
): AggregatedHistoryPoint[] {
  const timeframeMinutes = getTimeframeMinutes(timeframe);
  const buckets = new Map<number, AggregatedHistoryPoint>();

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

        depth1: getDepthValue(row, 1),
        depth3: getDepthValue(row, 3),
        depth5: getDepthValue(row, 5),
        depth10: getDepthValue(row, 10),
        depth30: getDepthValue(row, 30),

        imbalance: row.avgImbalancePercent,
        samples: 1,
      });

      continue;
    }

    existing.high = Math.max(existing.high, row.highPrice);
    existing.low = Math.min(existing.low, row.lowPrice);
    existing.close = row.closePrice;

    existing.buyValue += row.avgBuyValueUSDT;
    existing.sellValue += row.avgSellValueUSDT;
    existing.totalValue += row.avgTotalValueUSDT;

    existing.depth1 += getDepthValue(row, 1);
    existing.depth3 += getDepthValue(row, 3);
    existing.depth5 += getDepthValue(row, 5);
    existing.depth10 += getDepthValue(row, 10);
    existing.depth30 += getDepthValue(row, 30);

    existing.imbalance += row.avgImbalancePercent;
    existing.samples += 1;
  }

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      buyValue: bucket.buyValue / bucket.samples,
      sellValue: bucket.sellValue / bucket.samples,
      totalValue: bucket.totalValue / bucket.samples,
      depth1: bucket.depth1 / bucket.samples,
      depth3: bucket.depth3 / bucket.samples,
      depth5: bucket.depth5 / bucket.samples,
      depth10: bucket.depth10 / bucket.samples,
      depth30: bucket.depth30 / bucket.samples,
      imbalance: bucket.imbalance / bucket.samples,
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

export function aggregateAnalyticsByTimeframe(
  data: MarketAnalyticsPoint[],
  timeframe: HistoryTimeframe
): AggregatedAnalyticsPoint[] {
  const timeframeMinutes = getTimeframeMinutes(timeframe);
  const buckets = new Map<number, AggregatedAnalyticsPoint>();

  for (const row of data) {
    const dateMs = new Date(row.minute).getTime();
    const bucketStartMs = toBucketStartMs(dateMs, timeframeMinutes);
    const bucketTime = Math.floor(bucketStartMs / 1000) as UTCTimestamp;

    const existing = buckets.get(bucketStartMs);

    if (!existing) {
      buckets.set(bucketStartMs, {
        time: bucketTime,

        buyLiquidityChangeUSDT: row.buyLiquidityChangeUSDT,
        sellLiquidityChangeUSDT: row.sellLiquidityChangeUSDT,
        totalLiquidityChangeUSDT: row.totalLiquidityChangeUSDT,

        largestBuyWallChangeUSDT: row.largestBuyWallChangeUSDT,
        largestSellWallChangeUSDT: row.largestSellWallChangeUSDT,

        buyPressureScore: row.buyPressureScore,
        sellPressureScore: row.sellPressureScore,
        liquidityFlowScore: row.liquidityFlowScore,

        samples: 1,
      });

      continue;
    }

    existing.buyLiquidityChangeUSDT += row.buyLiquidityChangeUSDT;
    existing.sellLiquidityChangeUSDT += row.sellLiquidityChangeUSDT;
    existing.totalLiquidityChangeUSDT += row.totalLiquidityChangeUSDT;

    existing.largestBuyWallChangeUSDT += row.largestBuyWallChangeUSDT;
    existing.largestSellWallChangeUSDT += row.largestSellWallChangeUSDT;

    existing.buyPressureScore += row.buyPressureScore;
    existing.sellPressureScore += row.sellPressureScore;
    existing.liquidityFlowScore += row.liquidityFlowScore;

    existing.samples += 1;
  }

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,

      // Дельти за більший таймфрейм сумуємо
      buyLiquidityChangeUSDT: bucket.buyLiquidityChangeUSDT,
      sellLiquidityChangeUSDT: bucket.sellLiquidityChangeUSDT,
      totalLiquidityChangeUSDT: bucket.totalLiquidityChangeUSDT,

      largestBuyWallChangeUSDT: bucket.largestBuyWallChangeUSDT,
      largestSellWallChangeUSDT: bucket.largestSellWallChangeUSDT,

      // Scores усереднюємо
      buyPressureScore: bucket.buyPressureScore / bucket.samples,
      sellPressureScore: bucket.sellPressureScore / bucket.samples,
      liquidityFlowScore: bucket.liquidityFlowScore / bucket.samples,
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}