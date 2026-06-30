import { prisma } from "../database/prisma.js";
import { MarketAnalyticsEngine } from "../analytics/engine/market-analytics.engine.js";

type DepthZoneMetric = {
  percent: number;
  bidLevels: number;
  askLevels: number;
  buyVolume: number;
  sellVolume: number;
  buyValue: number;
  sellValue: number;
  totalValue: number;
  diffValue: number;
  imbalancePercent: number;
};

type MarketMetricRow = {
  symbol: string;
  price: number;

  bidLevels: number;
  askLevels: number;

  buyValueUSDT: number;
  sellValueUSDT: number;
  totalValueUSDT: number;
  diffUSDT: number;

  imbalancePercent: number;
  spread: number;

  bestBid: number;
  bestAsk: number;

  largestBuyWallValueUSDT: number;
  largestBuyWallPrice: number;
  largestBuyWallDistancePct: number;

  largestSellWallValueUSDT: number;
  largestSellWallPrice: number;
  largestSellWallDistancePct: number;

  depthZones: DepthZoneMetric[];
};

type MinuteBucket = {
  exchange: string;
  symbol: string;
  minute: Date;

  prices: number[];
  buyValues: number[];
  sellValues: number[];
  totalValues: number[];
  diffValues: number[];
  imbalances: number[];
  spreads: number[];

  bidLevels: number[];
  askLevels: number[];

  largestBuyWallValues: number[];
  largestSellWallValues: number[];

  lastState: MarketMetricRow;
};

export class MinuteAggregator {
  private buckets = new Map<string, MinuteBucket>();
  private analyticsEngine = new MarketAnalyticsEngine();

  addSample(exchange: string, row: MarketMetricRow) {
    const minute = this.getMinuteStart(new Date());
    const key = `${exchange}:${row.symbol}:${minute.toISOString()}`;

    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        exchange,
        symbol: row.symbol,
        minute,

        prices: [],
        buyValues: [],
        sellValues: [],
        totalValues: [],
        diffValues: [],
        imbalances: [],
        spreads: [],

        bidLevels: [],
        askLevels: [],

        largestBuyWallValues: [],
        largestSellWallValues: [],

        lastState: row,
      };

      this.buckets.set(key, bucket);
    }

    bucket.prices.push(row.price);
    bucket.buyValues.push(row.buyValueUSDT);
    bucket.sellValues.push(row.sellValueUSDT);
    bucket.totalValues.push(row.totalValueUSDT);
    bucket.diffValues.push(row.diffUSDT);
    bucket.imbalances.push(row.imbalancePercent);
    bucket.spreads.push(row.spread);

    bucket.bidLevels.push(row.bidLevels);
    bucket.askLevels.push(row.askLevels);

    bucket.largestBuyWallValues.push(row.largestBuyWallValueUSDT);
    bucket.largestSellWallValues.push(row.largestSellWallValueUSDT);

    bucket.lastState = row;
  }

  async flushCompletedBuckets() {
    const currentMinute = this.getMinuteStart(new Date());

    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.minute.getTime() >= currentMinute.getTime()) {
        continue;
      }

      await this.saveBucket(bucket);
      this.buckets.delete(key);
    }
  }

  private async saveBucket(bucket: MinuteBucket) {
    const prices = bucket.prices;
    const last = bucket.lastState;

    const snapshot = await prisma.marketMinuteSnapshot.upsert({
      where: {
        exchange_symbol_minute: {
          exchange: bucket.exchange,
          symbol: bucket.symbol,
          minute: bucket.minute,
        },
      },
      update: {},
      create: {
        exchange: bucket.exchange,
        symbol: bucket.symbol,
        minute: bucket.minute,

        openPrice: prices[0],
        highPrice: Math.max(...prices),
        lowPrice: Math.min(...prices),
        closePrice: prices[prices.length - 1],
        avgPrice: this.avg(prices),

        avgBuyValueUSDT: this.avg(bucket.buyValues),
        avgSellValueUSDT: this.avg(bucket.sellValues),
        avgTotalValueUSDT: this.avg(bucket.totalValues),
        avgDiffUSDT: this.avg(bucket.diffValues),
        avgImbalancePercent: this.avg(bucket.imbalances),
        avgSpread: this.avg(bucket.spreads),

        minImbalancePercent: Math.min(...bucket.imbalances),
        maxImbalancePercent: Math.max(...bucket.imbalances),

        largestBuyWallValueUSDT: Math.max(...bucket.largestBuyWallValues),
        largestBuyWallPrice: last.largestBuyWallPrice,
        largestBuyWallDistancePct: last.largestBuyWallDistancePct,

        largestSellWallValueUSDT: Math.max(...bucket.largestSellWallValues),
        largestSellWallPrice: last.largestSellWallPrice,
        largestSellWallDistancePct: last.largestSellWallDistancePct,

        avgBidLevels: Math.round(this.avg(bucket.bidLevels)),
        avgAskLevels: Math.round(this.avg(bucket.askLevels)),

        samplesCount: prices.length,

        depthZones: last.depthZones as object,
        lastState: last as object,
      },
    });


   await this.analyticsEngine.calculateForSnapshot(snapshot);



    console.log(
      `[DB] Saved ${bucket.exchange} ${bucket.symbol} ${bucket.minute.toISOString()} (${bucket.prices.length} samples)`
    );
  }

  private getMinuteStart(date: Date) {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }

  private avg(values: number[]) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}