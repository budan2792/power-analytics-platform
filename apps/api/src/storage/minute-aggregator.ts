import { prisma } from "../database/prisma.js";

type MarketMetricRow = {
  symbol: string;
  price: number;
  buyValueUSDT: number;
  sellValueUSDT: number;
  totalValueUSDT: number;
  diffUSDT: number;
  imbalancePercent: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
  depthZones: unknown;
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

  lastState: MarketMetricRow;
};

export class MinuteAggregator {
  private buckets = new Map<string, MinuteBucket>();

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
    bucket.lastState = row;
  }

  async flushCompletedBuckets() {
    const currentMinute = this.getMinuteStart(new Date());

    for (const [key, bucket] of this.buckets.entries()) {
      // Поточну хвилину ще не записуємо, бо вона ще збирається
      if (bucket.minute.getTime() >= currentMinute.getTime()) {
        continue;
      }

      await this.saveBucket(bucket);
      this.buckets.delete(key);
    }
  }

  private async saveBucket(bucket: MinuteBucket) {
    const prices = bucket.prices;

    await prisma.marketMinuteSnapshot.upsert({
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

        samplesCount: prices.length,

        depthZones: bucket.lastState.depthZones as object,
        lastState: bucket.lastState as object,
      },
    });

    console.log(
      `Saved minute snapshot: ${bucket.exchange} ${bucket.symbol} ${bucket.minute.toISOString()}`
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